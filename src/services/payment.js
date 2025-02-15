import Stripe from "stripe";

export const payment = async ({
  stripe = new Stripe(process.env.stripe_secret),
  payment_method_types = ["card"],
  mode = "payment",
  customer_email,
  metadata = {},
  success_url,
  cancel_url,
  line_items = [],
  discounts = [],
} = {}) => {
  stripe = new Stripe(process.env.stripe_secret);
  const seasion = await stripe.checkout.sessions.create({
    payment_method_types,
    mode,
    customer_email,
    metadata,
    success_url,
    cancel_url,
    line_items,
    discounts,
  });
  return seasion
};

