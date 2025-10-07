import Stripe from "stripe";
import Subscription from "../Models/Subscription.js";
import User from "../Models/User.js";
import UserSubscription from "../Models/UserSubscription.js";
import Badge from "../Models/Badge.js";
import { sendSubscriptionChangeEmail, sendTrialEndingEmail } from "../Utils/emailService.js";
import { logEvent } from "../Utils/log-event.js";

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

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    });
    
    if (existingSubscription) {
      await logEvent({
      userId,
      userType: 'user',
      eventName: "subscription_attempt_with_active_plan",
      eventData: {
        subscriptionId,
        subscriptionName: subscription.name,
      },
    });

      return res.status(400).json({
        error:
          "You already have an active subscription. Please cancel it before purchasing a new one.",
      });
    }

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

    await logEvent({
      userId,
      userType: 'user',
      eventName: "subscription_checkout_started",
      eventData: {
        subscriptionId: subscription._id,
        subscriptionName: subscription.name,
        priceType: subscription.priceType,
        amount: subscription.price,
      },
    });

    if (subscription.priceType === "monthly") {
      // Monthly subscription with trial
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
          trial_period_days: 7 // 7-day trial
        },
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId,
          dbSubscriptionId: subscription._id.toString()
        }
      });

      res.json({ url: session.url });
    } else if (subscription.priceType === "yearly") {
      // Yearly subscription with trial
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
                interval: "year",
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 7 // 7-day trial
        },
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId,
          dbSubscriptionId: subscription._id.toString()
        }
      });

      res.json({ url: session.url });
    } else if (subscription.priceType === "one-time") {
      // FIXED: Lifetime plan - use payment mode instead of subscription
      const session = await stripe.checkout.sessions.create({
        mode: "payment", // Use payment mode for one-time
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
        // For one-time payments, we'll handle the trial period in our system
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
          userId: userId,
          dbSubscriptionId: subscription._id.toString(),
          isOneTimePayment: "true"
        }
      });

      await logEvent({
        userId,
        userType: 'user',
        eventName: "subscription_checkout_session_created",
        eventData: {
          subscriptionId: subscription._id,
          subscriptionName: subscription.name,
          sessionId: session.id,
          priceType: subscription.priceType,
          amount: subscription.price,
        },
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

    await logEvent({
      userId,
      userType: 'user',
      eventName: "subscription_verification_started",
      eventData: {
        sessionId: session.id,
        subscriptionId: dbSubscription._id,
        subscriptionName: dbSubscription.name,
        paymentStatus: session.payment_status,
      },
    });

    let subscriptionDetails = null;
    let endDate = null;
    let trialEndDate = null;

    // Calculate dates based on subscription type
    if (dbSubscription.priceType === 'monthly') {
      // 7-day trial for all plans
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      endDate = new Date(trialEndDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (dbSubscription.priceType === 'yearly') {
      // 7-day trial for all plans
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      endDate = new Date(trialEndDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (dbSubscription.priceType === 'one-time') {
      // 7-day trial for all plans
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      // For one-time payments, endDate is null (never expires) after trial
      endDate = null;
    }

    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription.id);
      subscriptionDetails = {
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        isOneTimePayment: session.metadata.isOneTimePayment === "true"
      };

      if (subscription.trial_end) {
        trialEndDate = new Date(subscription.trial_end * 1000);
      }
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

      // All subscriptions start with trial status
      existingActiveSubscription.status = 'trial';

      existingActiveSubscription.paymentHistory.push({
        amount: session.amount_total / 100,
        currency: session.currency,
        status: isPaid ? 'paid' : 'failed',
        paymentDate: new Date(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        isTrialPayment: true // All initial payments are trial payments
      });

      await existingActiveSubscription.save();

      if (isPaid) {
        user.subscription = dbSubscription.key;
        user.subscriptionActive = true;
        user.subscriptionExpiresAt = endDate;
        user.isInTrial = true; // All subscriptions start with trial
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
          badges: earnedBadges,
          isTrial: true
        });
      } else {
        res.status(400).json({
          error: "Payment not completed",
          orderStatus: 'failed',
          badges: []
        });
      }
    } else {
      // Create new user subscription with trial status
      const userSubscription = new UserSubscription({
        userId,
        subscriptionId: dbSubscription._id,
        status: 'trial', // All subscriptions start with trial
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
          isTrialPayment: true // All initial payments are trial payments
        }]
      });
      await userSubscription.save();

      if (isPaid) {
        user.subscription = dbSubscription.key;
        user.subscriptionActive = true;
        user.subscriptionExpiresAt = endDate;
        user.isInTrial = true; // All subscriptions start with trial
        user.trialEndDate = trialEndDate;
        
        await assignEarlyAdopterBadge();
        
        await user.save();
      }

      if (isPaid) {
        await logEvent({
          userId,
          userType: 'user',
          eventName: "subscription_verified_success",
          eventData: {
            subscriptionId: dbSubscription._id,
            subscriptionName: dbSubscription.name,
            expiresAt: endDate,
            trialEndDate,
          },
        });

        res.status(200).json({
          message: "Subscription verified and activated successfully",
          subscription: dbSubscription.name,
          expiresAt: endDate,
          trialEndDate: trialEndDate,
          orderStatus: 'paid',
          badges: earnedBadges,
          isTrial: true
        });
      } else {
        
        await logEvent({
          userId,
          userType: 'user',
          eventName: "subscription_verification_failed",
          eventData: {
            subscriptionId: dbSubscription._id,
            subscriptionName: dbSubscription.name,
            paymentStatus: session.payment_status,
          },
        });

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
      case 'customer.subscription.trial_will_end':
        console.log('Handling customer.subscription.trial_will_end event');
        await handleTrialWillEnd(event.data.object);
        break;
      case 'checkout.session.completed':
        console.log('Handling checkout.session.completed event');
        await handleCheckoutSessionCompleted(event.data.object);
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


const convertYearlyToMonthly = async (userSubscription, stripeSubscription) => {
  try {
    // Create a new monthly price in Stripe
    const monthlyPrice = await stripe.prices.create({
      unit_amount: 999, // €9.99 in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      product: stripeSubscription.items.data[0].price.product,
    });

    // Update the subscription to monthly pricing
    await stripe.subscriptions.update(stripeSubscription.id, {
      cancel_at_period_end: false,
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: monthlyPrice.id,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update our database
    userSubscription.yearlyConvertedToMonthly = true;
    userSubscription.originalSubscriptionType = 'yearly';
    userSubscription.conversionDate = new Date();
    
    // Update end date to one month from now
    userSubscription.endDate = new Date();
    userSubscription.endDate.setMonth(userSubscription.endDate.getMonth() + 1);
    
    await userSubscription.save();

    // Update user document
    const user = await User.findById(userSubscription.userId);
    if (user) {
      user.subscriptionExpiresAt = userSubscription.endDate;
      await user.save();
    }

    console.log(`Converted yearly subscription to monthly for user ${userSubscription.userId}`);
    
    // Send notification to user about the change
    if (user.email) {
      await sendSubscriptionChangeEmail(
        user.email, 
        user.name, 
        "Yearly to Monthly", 
        "Your yearly subscription has been converted to a monthly subscription as per regulatory requirements."
      );
    }
  } catch (error) {
    console.error('Error converting yearly to monthly:', error);
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

    if (!userSubscription) {
      return;
    }

    // Check if this is a yearly subscription that needs conversion
    if (userSubscription.subscriptionId.priceType === 'yearly' && 
      userSubscription.yearlyConvertedToMonthly === false) {
    
      // Check if this is the renewal after the first year
      const now = new Date();
      const startDate = new Date(userSubscription.startDate);
      const diffTime = Math.abs(now - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 365) {
        await convertYearlyToMonthly(userSubscription, subscription);
        return;
      }
    }

    // Check if this is the first payment after trial
    const isFirstPaymentAfterTrial = invoice.billing_reason === 'subscription_cycle' &&
      subscription.status === 'active' &&
      !subscription.trial_end;

    userSubscription.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'paid',
      paymentDate: new Date(),
      stripePaymentIntentId: invoice.payment_intent,
      isTrialPayment: false
    });

    // Update end date based on subscription type
    if (userSubscription.subscriptionId.priceType === 'monthly') {
      userSubscription.endDate = new Date();
      userSubscription.endDate.setMonth(userSubscription.endDate.getMonth() + 1);
    } else if (userSubscription.subscriptionId.priceType === 'yearly') {
      userSubscription.endDate = new Date();
      userSubscription.endDate.setFullYear(userSubscription.endDate.getFullYear() + 1);
    }
    // For one-time payments, endDate remains null

    // If this is the first payment after trial, update status
    if (isFirstPaymentAfterTrial) {
      userSubscription.status = 'active';
      userSubscription.trialEndDate = null;
    }

    await userSubscription.save();

    // Update user document
    const user = await User.findById(userSubscription.userId);
    if (user) {
      user.subscriptionExpiresAt = userSubscription.endDate;

      // If this is the first payment after trial, update trial status
      if (isFirstPaymentAfterTrial) {
        user.isInTrial = false;
        user.trialEndDate = null;
      }

      await user.save();
    }

    console.log(`Payment recorded for user ${userSubscription.userId}`);
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

const handleTrialWillEnd = async (subscription) => {
  try {
    const userSubscription = await UserSubscription.findOne({
      'stripeDetails.stripeSubscriptionId': subscription.id
    }).populate('subscriptionId').populate('userId');

    if (!userSubscription) {
      return;
    }

    // Send notification to user about trial ending (3 days before)
    const user = await User.findById(userSubscription.userId);
    if (user && user.email) {
      await sendTrialEndingEmail(
        user.email, 
        user.name, 
        new Date(subscription.trial_end * 1000), 
        userSubscription.subscriptionId.name
      );
    }

    console.log(`Trial will end notification sent for user ${userSubscription.userId}`);

  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}
export const checkTrialStatuses = async () => {
  try {
    const now = new Date();

    // Find trials ending in 3 days
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const endingTrials = await UserSubscription.find({
      status: 'trial',
      trialEndDate: { 
        $lte: threeDaysFromNow,
        $gt: now
      }
    }).populate('subscriptionId').populate('userId');

    for (const subscription of endingTrials) {
      const user = await User.findById(subscription.userId);
      if (user && user.email) {
        await sendTrialEndingEmail(
          user.email, 
          user.name, 
          subscription.trialEndDate, 
          subscription.subscriptionId.name
        );
      }
    }

    // Find all subscriptions that are in trial and have passed their trial end date
    const expiredTrials = await UserSubscription.find({
      status: 'trial',
      trialEndDate: { $lte: now }
    }).populate('subscriptionId');

    for (const subscription of expiredTrials) {
      // For recurring subscriptions, activate them after trial
      if (subscription.subscriptionId.priceType !== 'one-time') {
        subscription.status = 'active';
        
        // Update user
        const user = await User.findById(subscription.userId);
        if (user) {
          user.isInTrial = false;
          user.trialEndDate = null;
          await user.save();
        }
      } else {
        // For one-time payments (lifetime), check if payment was successful
        const hasSuccessfulPayment = subscription.paymentHistory.some(
          payment => payment.status === 'paid'
        );

        if (hasSuccessfulPayment) {
          subscription.status = 'active';
          
          // Update user
          const user = await User.findById(subscription.userId);
          if (user) {
            user.isInTrial = false;
            user.trialEndDate = null;
            user.subscriptionExpiresAt = null; // Never expires
            await user.save();
          }
        } else {
          // If no payment was made, cancel the subscription
          subscription.status = 'expired';

          // Update user
          const user = await User.findById(subscription.userId);
          if (user) {
            user.subscriptionActive = false;
            user.isInTrial = false;
            user.trialEndDate = null;
            user.subscriptionExpiresAt = null;
            await user.save();
          }
        }
      }

      await subscription.save();
      console.log(`Trial ended for user ${subscription.userId}, new status: ${subscription.status}`);
    }
  } catch (error) {
    console.error('Error checking trial statuses:', error);
  }
}
export const checkYearlySubscriptions = async () => {
  try {
    const now = new Date();

    // Find all yearly subscriptions that have expired
    const expiredYearlySubscriptions = await UserSubscription.find({
      status: 'active',
      endDate: { $lte: now },
      'subscriptionId.priceType': 'yearly',
      yearlyConvertedToMonthly: false
    }).populate('subscriptionId');

    for (const subscription of expiredYearlySubscriptions) {
      // Convert to monthly plan
      await convertYearlyToMonthly(subscription);
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
      await logEvent({
        userId,
        userType: "user",
        eventName: "subscription_cancel_failed",
        eventData: { reason: "No active subscription found" },
      });

      return res.status(404).json({ error: "No active subscription found" });
    }

    const subscriptionType = userSubscription.subscriptionId.priceType;
    const isInTrial = userSubscription.status === 'trial';
    const now = new Date();
    const trialEnded = userSubscription.trialEndDate && userSubscription.trialEndDate < now;

    // 1️⃣ Cancel during trial
    if (isInTrial && !trialEnded) {
      if (userSubscription.stripeDetails?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(userSubscription.stripeDetails.stripeSubscriptionId);
        } catch (stripeError) {
          console.error("Error cancelling Stripe subscription:", stripeError);
        }
      }

      userSubscription.status = 'cancelled';
      await userSubscription.save();

      user.subscriptionActive = false;
      user.isInTrial = false;
      user.trialEndDate = null;
      user.subscriptionExpiresAt = null;
      await user.save();

      await logEvent({
        userId,
        userType: "user",
        eventName: "subscription_cancelled_trial",
        eventData: {
          subscriptionType,
          message: "User cancelled subscription during trial period",
        },
      });

      return res.status(200).json({
        message: "Subscription cancelled successfully during trial period",
        cancelled: true
      });
    }

    // 2️⃣ Cancel Monthly subscription
    if (subscriptionType === 'monthly') {
      if (userSubscription.stripeDetails?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.update(
            userSubscription.stripeDetails.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );
        } catch (stripeError) {
          console.error("Error updating Stripe subscription:", stripeError);
          return res.status(500).json({ error: "Failed to cancel subscription with payment provider" });
        }
      }

      userSubscription.status = 'cancelling';
      await userSubscription.save();

      await logEvent({
        userId,
        userType: "user",
        eventName: "subscription_cancellation_scheduled",
        eventData: {
          subscriptionType,
          message: "User requested cancellation; will end at billing period end",
          cancelDate: userSubscription.endDate,
        },
      });

      return res.status(200).json({
        message: "Subscription will be cancelled at the end of the billing period",
        cancelDate: userSubscription.endDate
      });
    }

    // 3️⃣ Yearly subscription (cannot cancel after trial)
    if (subscriptionType === 'yearly') {
      await logEvent({
        userId,
        userType: "user",
        eventName: "subscription_cancel_denied",
        eventData: {
          subscriptionType,
          reason: "Yearly subscriptions cannot be cancelled after trial period",
        },
      });

      return res.status(400).json({
        error: "Yearly subscriptions cannot be cancelled after trial period. They will automatically convert to monthly after one year."
      });
    }

    // 4️⃣ Lifetime subscription (cannot cancel after trial)
    if (subscriptionType === 'one-time') {
      await logEvent({
        userId,
        userType: "user",
        eventName: "subscription_cancel_denied",
        eventData: {
          subscriptionType,
          reason: "Lifetime subscriptions cannot be cancelled after trial period",
        },
      });

      return res.status(400).json({
        error: "Lifetime subscriptions cannot be cancelled after trial period."
      });
    }

    // 5️⃣ Unknown type fallback
    await logEvent({
      userId,
      userType: "user",
      eventName: "subscription_cancel_failed",
      eventData: {
        subscriptionType,
        reason: "Unknown subscription type",
      },
    });

    return res.status(400).json({ error: "Unknown subscription type" });

  } catch (error) {
    console.error("Subscription cancellation error:", error);

    await logEvent({
      userId: req.user?.userId,
      userType: "user",
      eventName: "subscription_cancel_error",
      eventData: { error: error.message },
    });

    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

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

const handleCheckoutSessionCompleted = async (session) => {
  try {
    if (session.mode !== 'payment') return; // Only handle one-time payments
    
    const userId = session.metadata.userId;
    const dbSubscriptionId = session.metadata.dbSubscriptionId;
    
    if (!userId || !dbSubscriptionId) return;
    
    const userSubscription = await UserSubscription.findOne({
      userId,
      subscriptionId: dbSubscriptionId
    }).populate('subscriptionId');
    
    if (!userSubscription) return;
    
    // For one-time payments, mark as paid and set trial period
    if (session.payment_status === 'paid') {
      userSubscription.orderStatus = 'paid';
      userSubscription.status = 'trial';
      userSubscription.trialEndDate = new Date();
      userSubscription.trialEndDate.setDate(userSubscription.trialEndDate.getDate() + 7);
      
      await userSubscription.save();
      
      // Update user
      const user = await User.findById(userId);
      if (user) {
        user.subscriptionActive = true;
        user.isInTrial = true;
        user.trialEndDate = userSubscription.trialEndDate;
        user.subscriptionExpiresAt = null; // Lifetime never expires after trial
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}
