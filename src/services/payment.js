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

export async function refundPayment({
    payment_intent_id,
    amount = null, // null means full refund
    reason = "requested_by_customer",
    metadata = {}
} = {}) {
    const stripe = new Stripe(process.env.stripe_secret, {
        apiVersion: '2022-11-15',
    });
    
    const refund = await stripe.refunds.create({
        payment_intent: payment_intent_id,
        amount, // null for full refund
        reason,
        metadata
    });
    
    return refund;
}

export async function getPaymentIntent(payment_intent_id) {
    const stripe = new Stripe(process.env.stripe_secret, {
        apiVersion: '2022-11-15',
    });
    
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    return paymentIntent;
}


