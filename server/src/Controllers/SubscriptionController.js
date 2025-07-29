import Subscription from "../Models/Subscription.js";

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.status(200).json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
}

export const createCheckoutSession = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { plan } = req.body;

  const priceMap = {
    proefreis: '9.95',
    jaaravontuur: '99.95',
    eeuwigsterk: '199.95',
  };

  const priceId = priceMap[plan];
  if (!priceId) return res.status(400).json({ error: "Invalid plan selected." });

  const session = await stripe.checkout.sessions.create({
    mode: plan === 'eeuwigsterk' ? 'payment' : 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      userId,
      plan
    }
  });

  res.json({ url: session.url });
};