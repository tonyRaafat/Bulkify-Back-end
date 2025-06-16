import { CustomerPurchase } from '../../../database/models/customerPurchase.model.js'
import { Product } from '../../../database/models/product.model.js'
import Purchase from '../../../database/models/purchase.model.js'
import Stripe from "stripe";

const haversineDistance = (coords1, coords2) => {


  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coords2[1] - coords1[1]); // Latitude difference
  const dLon = toRad(coords2[0] - coords1[0]); // Longitude difference
  const lat1 = toRad(coords1[1]); // Latitude 1
  const lat2 = toRad(coords2[1]); // Latitude 2

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

export const generateInvoiceHTML = (invoice) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">Invoice</h1>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Name:</strong> ${invoice.name}</p>
        <p><strong>Address:</strong> ${invoice.street}, ${invoice.city}, Home No. ${invoice.homeNumber}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Title</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Description</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Unit Price</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Final Price</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.title}</td>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.description}</td>
              <td style="border: 1px solid #ccc; padding: 10px;">$${item.price.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.quantity}</td>
              <td style="border: 1px solid #ccc; padding: 10px;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="font-weight: bold; font-size: 1.1em; text-align: right;">
        Total Paid: $${invoice.paid.toFixed(2)}
      </div>
    </div>
  `;
};


import path from "path";
import { payment } from '../../services/payment.js';
import { Customer } from '../../../database/models/customer.model.js';
import { sendEmail } from '../../utils/emailService.js';



export const startPurchase = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { purchaseQuantity, deliveryAddress } = req.body;
    const userLocation = req.user.coordinates;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Validate user location
    if (!userLocation || userLocation.length !== 2) {
      return res.status(400).json({ message: "Invalid user location" });
    }

    // Validate purchase quantity
    if (purchaseQuantity > product.bulkThreshold) {
      return res.status(400).json({ message: "You cannot purchase more than the allowed limit" });
    }

    // Check other nearby purchases within 2km
    const purchases = await Purchase.find({ productId });
    for (let purchase of purchases) {
      if (haversineDistance(userLocation, purchase.userLocation) <= 2 && purchase.status != "Waiting Payment") {
        return res.status(403).json({ message: "Another purchase is in progress within 2km" });
      }
    }

    // Create new purchase
    const newPurchase = await Purchase.create({
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      quantity: product.bulkThreshold,
      status: "Waiting Payment",
      productId,
      userLocation
    });

    // Create customer purchase
    await CustomerPurchase.create({
      purchaseId: newPurchase._id,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Waiting payment",
      paymentMethod: "Credit Card"
    });

    // Create Stripe session
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { purchaseId: newPurchase._id.toString() },
      success_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/successPayment/${newPurchase._id}/${req.user._id}`,
      cancel_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/startPurchase/cancel/${newPurchase._id}`,
      line_items: [{
        price_data: {
          currency: "egp",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100)
        },
        quantity: purchaseQuantity
      }],
    });

    // Respond with Stripe URL
    return res.status(201).json({
      message: "Please complete your payment",
      url: session.url,
      data: {
        purchaseId: newPurchase._id,
        productName: product.name,
      }
    });

  } catch (error) {
    next(error);
  }
};


export const successPaymentForStartPurchase = async (req, res, next) => {
  try {
    const { purchaseId, userId } = req.params;

    // 1. Find the purchase
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return next(new appError("Purchase not found", 404));
    }

    // 2. Find the user
    const user = await Customer.findById(userId);
    if (!user) {
      return next(new appError("User not found", 404));
    }

    // 3. Update Purchase status
    purchase.status = "Started";
    await purchase.save();

    // 4. Update CustomerPurchase status
    await CustomerPurchase.updateOne(
      { purchaseId: purchaseId, customerId: userId },
      { status: "Pending" }
    );

    // 5. Get Customer Purchase Info to Generate Invoice
    const customerPurchase = await CustomerPurchase.findOne({
      purchaseId: purchaseId,
      customerId: userId
    }).populate("productId");

    if (!customerPurchase) {
      return next(new appError("Customer Purchase not found", 404));
    }

    const product = customerPurchase.productId;

    // 6. Create Invoice

    const invoice = {
      name: `${user.firstName} ${user.lastName}`,
      items: [{
        title: product.name,
        price: product.price,
        quantity: customerPurchase.purchaseQuantity,
        finalPrice: product.price,
        description: product.description,
      }],
      totalPrice: product.price * customerPurchase.purchaseQuantity,
      paid: product.price * customerPurchase.purchaseQuantity,
      city: user.city,
      street: user.street,
      homeNumber: user.homeNumber
    };

    const invoiceHTML = generateInvoiceHTML(invoice);

    // 7. Send Email
    await sendEmail(
      user.email,
      "Your Invoice",
      {
        text: "Thank you for your purchase! You can find your invoice below.",
        html: invoiceHTML
      }
    );


    // 8. Send Success Response
    return res.status(200).json({
      message: "Payment successful. Invoice has been sent to your email."
    });

  } catch (error) {
    next(error);
  }
};


export const VoteForPurchase = async (req, res, next) => {
  try {
    const { productId, purchaseId } = req.params
    const { purchaseQuantity, deliveryAddress } = req.body
    let userLocation = req.user.coordinates
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const purchase = await Purchase.findById(purchaseId)
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" })
    }
    if (!userLocation || !userLocation || userLocation.length !== 2) {
      return res.status(400).json({ message: "Invalid user location" })
    }
    const userCoordinates = userLocation
    const purchaseCoordinates = purchase.userLocation

    // Check if user is within 5km of the purchase location
    if (haversineDistance(userCoordinates, purchaseCoordinates) > 2) {
      return res.status(403).json({ message: "You are too far from the required area. Please get closer to vote. Or start new one" })
    }
    const pendingCount = await CustomerPurchase.countDocuments({ status: "Pending", purchaseId })

    if (purchaseQuantity + pendingCount == purchase.quantity) {
      // add here API of comlete the purchase

    }
    else if (purchaseQuantity + pendingCount > purchase.quantity) {
      return res.status(400).json({ message: "The Quantity more than valid" })
    }

    await CustomerPurchase.create({
      purchaseId,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Waiting payment",
      paymentMethod: "Credit Card"
    })

    // Create Stripe session
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { purchaseId: purchase._id.toString() },
      success_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/vote/successPayment/${purchase._id}/${req.user._id}`,
      cancel_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/vote/startPurchase/cancel/${purchase._id}`,
      line_items: [{
        price_data: {
          currency: "egp",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100)
        },
        quantity: purchaseQuantity
      }],
    });

    // Respond with Stripe URL
    return res.status(200).json({
      message: "Please complete your payment",
      url: session.url,
      data: {
        purchaseId: purchase._id,
        productName: product.name,
      }
    });

  } catch (error) {
    next(error)
  }
}

export const successPaymentForVoting = async (req, res, next) => {
  try {
    const { purchaseId, userId } = req.params;

    // 1. Find the purchase
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return next(new appError("Purchase not found", 404));
    }

    // 2. Find the user
    const user = await Customer.findById(userId);
    if (!user) {
      return next(new appError("User not found", 404));
    }

    // 4. Update CustomerPurchase status
    await CustomerPurchase.updateOne(
      { purchaseId: purchaseId, customerId: userId },
      { status: "Pending" }
    );

    // 5. Get Customer Purchase Info to Generate Invoice
    const customerPurchase = await CustomerPurchase.findOne({
      purchaseId: purchaseId,
      customerId: userId
    }).populate("productId");

    if (!customerPurchase) {
      return next(new appError("Customer Purchase not found", 404));
    }

    const product = customerPurchase.productId;
    // 6. create invoice

    // 6. Create Invoice

    const invoice = {
      name: `${user.firstName} ${user.lastName}`,
      items: [{
        title: product.name,
        price: product.price,
        quantity: customerPurchase.purchaseQuantity,
        finalPrice: product.price,
        description: product.description,
      }],
      totalPrice: product.price * customerPurchase.purchaseQuantity,
      paid: product.price * customerPurchase.purchaseQuantity,
      city: user.city,
      street: user.street,
      homeNumber: user.homeNumber
    };

    const invoiceHTML = generateInvoiceHTML(invoice);

    // 7. Send Email
    await sendEmail(
      user.email,
      "Your Invoice",
      {
        text: "Thank you for your purchase! You can find your invoice below.",
        html: invoiceHTML
      }
    );
    // 8. Send Success Response
    return res.status(200).json({
      message: "Payment successful. Invoice has been sent to your email."
    });

  } catch (error) {
    next(error);
  }
};

export const webhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.SIGNING_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send('Webhook Error');
  }

  const { purchaseId } = event.data.object.metadata;

  if (event.type === 'checkout.session.completed') {
    // await Purchase.findOneAndUpdate({ _id: purchaseId }, { status: "placed" });
    // await CustomerPurchase.updateMany({ purchaseId }, { status: "Pending" });
    return res.status(200).json({ msg: "done" });
  }

  // Acknowledge all other events (optional: handle them specifically)
  return res.status(200).json({ msg: "event received" });
};
