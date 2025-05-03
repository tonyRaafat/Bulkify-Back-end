import Stripe from 'stripe';



export async function payment({
    payment_method_types = ["card"],
    mode = "payment",
    customer_email,
    metadata = {},
    success_url,
    cancel_url,
    line_items = [],
    discounts = []
} = {}) {
    const stripe = new Stripe(process.env.stripe_secret, {
        apiVersion: '2022-11-15',
    });
    const session = await stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        customer_email,
        metadata,
        success_url,
        cancel_url,
        line_items,
        discounts
    })
    return session
}

