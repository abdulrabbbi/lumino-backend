import Stripe from "stripe";
import Subscription from "../Models/Subscription.js";
import User from "../Models/User.js";
import UserSubscription from "../Models/UserSubscription.js";
import Badge from "../Models/Badge.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.status(200).json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
}
export const purchaseSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { subscriptionId } = req.body;
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId.toString()
        }
      });
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const productName = `${subscription.name} (${subscription._id})`;

    // Different checkout flow based on subscription type
    if (subscription.priceType === "monthly") {
      // For Proefreis (monthly with trial)
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: subscription.currency,
              product_data: {
                name: productName,
                description: subscription.description,
                metadata: {
                  dbSubscriptionId: subscription._id.toString()
                }
              },
              unit_amount: Math.round(subscription.price * 100),
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: subscription.trialPeriodDays
        },
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId,
          dbSubscriptionId: subscription._id.toString()
        }
      });

      res.json({ url: session.url });
    } else {
      // For yearly and one-time payments (simple payment)
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: subscription.currency,
              product_data: {
                name: productName,
                description: subscription.description,
                metadata: {
                  dbSubscriptionId: subscription._id.toString()
                }
              },
              unit_amount: Math.round(subscription.price * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId,
          dbSubscriptionId: subscription._id.toString()
        }
      });

      res.json({ url: session.url });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
}
export const verifySubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product', 'subscription']
    });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPaid = session.payment_status === 'paid';

    let dbSubscription = null;
    if (session.metadata && session.metadata.dbSubscriptionId) {
      dbSubscription = await Subscription.findById(session.metadata.dbSubscriptionId);
    }

    if (!dbSubscription) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    let subscriptionDetails = null;
    let endDate = null;
    let trialEndDate = null;

    // Calculate dates based on subscription type
    if (dbSubscription.priceType === 'monthly') {
      if (dbSubscription.trialPeriodDays > 0) {
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + dbSubscription.trialPeriodDays);

        endDate = new Date(trialEndDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
      }
    } else if (dbSubscription.priceType === 'yearly') {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (dbSubscription.priceType === 'one-time') {
      endDate = null; // Never expires
    }

    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription.id);
      subscriptionDetails = {
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      };

      if (subscription.trial_end) {
        trialEndDate = new Date(subscription.trial_end * 1000);
      }
    } else if (session.mode === 'payment') {
      subscriptionDetails = {
        stripeSessionId: session.id,
        status: 'paid'
      };
    }

    let earnedBadges = [];

    const existingActiveSubscription = await UserSubscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    });

    const assignEarlyAdopterBadge = async () => {
      if (dbSubscription.key === 'eeuwigsterk' && !user.badges.includes("Early Adopter")) {
        const earlyAdopterBadge = await Badge.findOne({ name: "Early Adopter" });
        if (earlyAdopterBadge) {
          user.badges.push("Early Adopter");
          earnedBadges.push({
            _id: earlyAdopterBadge._id,
            name: earlyAdopterBadge.name,
            description: earlyAdopterBadge.description,
            icon: earlyAdopterBadge.icon,
            category: earlyAdopterBadge.category,
          });
          return true;
        }
      }
      return false;
    };

    if (existingActiveSubscription) {
      existingActiveSubscription.subscriptionId = dbSubscription._id;
      existingActiveSubscription.orderStatus = isPaid ? 'paid' : 'failed';
      existingActiveSubscription.endDate = endDate;
      existingActiveSubscription.trialEndDate = trialEndDate;
      existingActiveSubscription.stripeDetails = subscriptionDetails;

      if (dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate) {
        existingActiveSubscription.status = 'trial';
      } else {
        existingActiveSubscription.status = 'active';
      }

      existingActiveSubscription.paymentHistory.push({
        amount: session.amount_total / 100,
        currency: session.currency,
        status: isPaid ? 'paid' : 'failed',
        paymentDate: new Date(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        isTrialPayment: dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate
      });

      await existingActiveSubscription.save();

      if (isPaid) {
        user.subscription = dbSubscription.key;
        user.subscriptionActive = true;
        user.subscriptionExpiresAt = endDate;
        user.isInTrial = dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate;
        user.trialEndDate = trialEndDate;

        await assignEarlyAdopterBadge();

        await user.save();
      }

      if (isPaid) {
        res.status(200).json({
          message: "Subscription updated successfully",
          subscription: dbSubscription.name,
          expiresAt: endDate,
          trialEndDate: trialEndDate,
          orderStatus: 'paid',
          badges: earnedBadges
        });
      } else {
        res.status(400).json({
          error: "Payment not completed",
          orderStatus: 'failed',
          badges: []
        });
      }
    } else {
      // Create new user subscription
      let status = 'active';
      if (dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate) {
        status = 'trial';
      }

      const userSubscription = new UserSubscription({
        userId,
        subscriptionId: dbSubscription._id,
        status: status,
        orderStatus: isPaid ? 'paid' : 'failed',
        startDate: new Date(),
        endDate: isPaid ? endDate : null,
        trialEndDate: trialEndDate,
        stripeDetails: subscriptionDetails,
        paymentHistory: [{
          amount: session.amount_total / 100,
          currency: session.currency,
          status: isPaid ? 'paid' : 'failed',
          paymentDate: new Date(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          isTrialPayment: dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate
        }]
      });
      await userSubscription.save();

      if (isPaid) {
        user.subscription = dbSubscription.key;
        user.subscriptionActive = true;
        user.subscriptionExpiresAt = endDate;
        user.isInTrial = dbSubscription.priceType === 'monthly' && trialEndDate && new Date() < trialEndDate;
        user.trialEndDate = trialEndDate;
        
        await assignEarlyAdopterBadge();
        
        await user.save();
      }

      if (isPaid) {
        res.status(200).json({
          message: "Subscription verified and activated successfully",
          subscription: dbSubscription.name,
          expiresAt: endDate,
          trialEndDate: trialEndDate,
          orderStatus: 'paid',
          badges: earnedBadges
        });
      } else {
        res.status(400).json({
          error: "Payment not completed",
          orderStatus: 'failed',
          badges: []
        });
      }
    }

  } catch (error) {
    console.error("Subscription verification error:", error);
    res.status(500).json({ error: "Failed to verify subscription" });
  }
}
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userSubscription = await UserSubscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    }).populate('subscriptionId');

    if (!userSubscription) {
      return res.status(404).json({ 
        message: "No active subscription found",
        hasSubscription: false
      });
    }

    res.status(200).json({
      hasSubscription: true,
      subscription: userSubscription.subscriptionId,
      startDate: userSubscription.startDate,
      endDate: userSubscription.endDate,
      trialEndDate: userSubscription.trialEndDate,
      status: userSubscription.status,
      isInTrial: userSubscription.status === 'trial'
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({ error: "Failed to get subscription status" });
  }
}
export const getOrderStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const userSubscription = await UserSubscription.findOne({
      userId,
      'paymentHistory.stripeSessionId': session_id
    }).populate('subscriptionId');

    if (!userSubscription) {
      return res.status(404).json({ 
        error: "Order not found",
        orderStatus: 'unknown'
      });
    }

    res.status(200).json({
      orderStatus: userSubscription.orderStatus,
      paymentStatus: session.payment_status,
      subscription: userSubscription.subscriptionId,
      createdAt: userSubscription.createdAt
    });

  } catch (error) {
    console.error("Order status check error:", error);
    res.status(500).json({ error: "Failed to check order status" });
  }
}

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`Webhook received: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        console.log('Handling invoice.payment_succeeded event');
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.updated':
        console.log('Handling customer.subscription.updated event');
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Handling customer.subscription.deleted event');
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
const handleInvoicePaymentSucceeded = async (invoice) => {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return; 
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const userSubscription = await UserSubscription.findOne({
      'stripeDetails.stripeSubscriptionId': subscriptionId
    }).populate('subscriptionId');
    
    if (!userSubscription || userSubscription.subscriptionId.priceType !== 'monthly') {
      return;
    }
    
    userSubscription.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'paid',
      paymentDate: new Date(),
      stripePaymentIntentId: invoice.payment_intent,
      isTrialPayment: false
    });
    
    // Update end date (extend by 1 month)
    userSubscription.endDate = new Date();
    userSubscription.endDate.setMonth(userSubscription.endDate.getMonth() + 1);
    
    await userSubscription.save();
    
    // Update user document
    const user = await User.findById(userSubscription.userId);
    if (user) {
      user.subscriptionExpiresAt = userSubscription.endDate;
      await user.save();
    }
    
    console.log(`Monthly payment recorded for user ${userSubscription.userId}`);
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const userSubscription = await UserSubscription.findOne({
      'stripeDetails.stripeSubscriptionId': subscription.id
    }).populate('subscriptionId');
    
    if (!userSubscription || userSubscription.subscriptionId.priceType !== 'monthly') {
      return; 
    }
    
    userSubscription.stripeDetails.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    userSubscription.stripeDetails.status = subscription.status;
    
    if (subscription.status === 'active' && subscription.trial_end) {
      userSubscription.trialEndDate = new Date(subscription.trial_end * 1000);
      userSubscription.status = 'trial';
    } else if (subscription.status === 'active') {
      userSubscription.status = 'active';
    }
    
    await userSubscription.save();
    
    // Update user document
    const user = await User.findById(userSubscription.userId);
    if (user) {
      user.subscriptionActive = subscription.status === 'active';
      user.isInTrial = subscription.trial_end && new Date() < new Date(subscription.trial_end * 1000);
      user.trialEndDate = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
      user.subscriptionExpiresAt = new Date(subscription.current_period_end * 1000);
      await user.save();
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}
const handleSubscriptionDeleted = async (subscription) => {
  try {
    const userSubscription = await UserSubscription.findOne({
      'stripeDetails.stripeSubscriptionId': subscription.id
    }).populate('subscriptionId');
    
    if (!userSubscription || userSubscription.subscriptionId.priceType !== 'monthly') {
      return; 
    }

    if (userSubscription) {
      userSubscription.status = 'cancelled';
      userSubscription.stripeDetails.status = subscription.status;
      await userSubscription.save();
      
      const user = await User.findById(userSubscription.userId);
      if (user) {
        user.subscriptionActive = false;
        user.isInTrial = false;
        user.trialEndDate = null;
        user.subscriptionExpiresAt = null;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}
export const checkTrialStatuses = async () => {
  try {
    const now = new Date();
    
    // Find all monthly subscriptions that are in trial and have passed their trial end date
    const expiredTrials = await UserSubscription.find({
      status: 'trial',
      trialEndDate: { $lte: now }
    }).populate('subscriptionId');
    
    for (const subscription of expiredTrials) {
      if (subscription.subscriptionId.priceType === 'monthly') {
        // Update status from trial to active
        subscription.status = 'active';
        await subscription.save();
        
        // Update user document
        const user = await User.findById(subscription.userId);
        if (user) {
          user.isInTrial = false;
          user.trialEndDate = null;
          await user.save();
        }
        
        console.log(`Trial ended for user ${subscription.userId}`);
      }
    }
  } catch (error) {
    console.error('Error checking trial statuses:', error);
  }
}
export const checkYearlySubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find all yearly subscriptions that have expired
    const expiredSubscriptions = await UserSubscription.find({
      status: 'active',
      endDate: { $lte: now }
    }).populate('subscriptionId');
    
    for (const subscription of expiredSubscriptions) {
      if (subscription.subscriptionId.priceType === 'yearly') {
        // Update subscription status to expired
        subscription.status = 'expired';
        await subscription.save();
        
        // Update user document
        const user = await User.findById(subscription.userId);
        if (user) {
          user.subscriptionActive = false;
          user.subscriptionExpiresAt = null;
          await user.save();
        }
        
        console.log(`Yearly subscription expired for user ${subscription.userId}`);
      }
    }
  } catch (error) {
    console.error('Error checking yearly subscriptions:', error);
  }
}
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userSubscription = await UserSubscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    }).populate('subscriptionId');

    if (!userSubscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    if (userSubscription.subscriptionId.priceType !== 'monthly') {
      return res.status(400).json({ 
        error: "Only monthly subscriptions can be cancelled. Yearly and one-time subscriptions cannot be cancelled." 
      });
    }

    if (userSubscription.stripeDetails && userSubscription.stripeDetails.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(userSubscription.stripeDetails.stripeSubscriptionId);
        console.log(`Stripe subscription cancelled: ${userSubscription.stripeDetails.stripeSubscriptionId}`);
      } catch (stripeError) {
        console.error("Error cancelling Stripe subscription:", stripeError);
      }
    }

    user.subscription = null;
    user.subscriptionActive = false;
    user.subscriptionExpiresAt = null;
    user.isInTrial = false;
    user.trialEndDate = null;
    await user.save();

    await UserSubscription.findByIdAndDelete(userSubscription._id);

    res.status(200).json({ 
      message: "Monthly subscription cancelled successfully" 
    });

  } catch (error) {
    console.error("Subscription cancellation error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
}