import { CustomerPurchase } from "../../../database/models/customerPurchase.model.js";
import { Product } from "../../../database/models/product.model.js";
import Purchase from "../../../database/models/purchase.model.js";
import Stripe from "stripe";
import { CUSTOMER_PURCHASE_STATUS, paymentSuccessHtml } from "../../constants/constants.js";
import { refundPayment, getPaymentIntent } from "../../services/payment.js";

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
        <p><strong>Address:</strong> ${invoice.street}, ${invoice.city
    }, Home No. ${invoice.homeNumber}</p>
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
          ${invoice.items
      .map(
        (item) => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.title
          }</td>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.description
          }</td>
              <td style="border: 1px solid #ccc; padding: 10px;">$${item.price.toFixed(
            2
          )}</td>
              <td style="border: 1px solid #ccc; padding: 10px;">${item.quantity
          }</td>
              <td style="border: 1px solid #ccc; padding: 10px;">$${(
            item.price * item.quantity
          ).toFixed(2)}</td>
            </tr>
          `
      )
      .join("")}
        </tbody>
      </table>

      <div style="font-weight: bold; font-size: 1.1em; text-align: right;">
        Total Paid: $${invoice.paid.toFixed(2)}
      </div>
    </div>
  `;
};

import path from "path";
import { payment } from "../../services/payment.js";
import { Customer } from "../../../database/models/customer.model.js";
import { sendEmail } from "../../utils/emailService.js";

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
      return res
        .status(400)
        .json({ message: "You cannot purchase more than the allowed limit" });
    }

    // Check other nearby purchases within 2km
    const purchases = await Purchase.find({ productId });
    for (let purchase of purchases) {
      if (
        haversineDistance(userLocation, purchase.userLocation) <= 2 &&
        (purchase.status != CUSTOMER_PURCHASE_STATUS.WAITING_PAYMENT || 
        purchase.status != CUSTOMER_PURCHASE_STATUS.ENDED_WITHOUT_PURCHASE)
      ) {
        return res
          .status(403)
          .json({ message: "Another purchase is in progress within 2km" });
      }
    }

    // Create new purchase
    const newPurchase = await Purchase.create({
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      quantity: product.bulkThreshold,
      status: "Waiting Payment",
      productId,
      userLocation,
    });

    // Create customer purchase
    await CustomerPurchase.create({
      purchaseId: newPurchase._id,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Waiting payment",
      paymentMethod: "Credit Card",
    });

    // Create Stripe session
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { purchaseId: newPurchase._id.toString() },
      success_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/successPayment/${newPurchase._id}/${req.user._id}`,
      cancel_url: `https://bulkify-web.netlify.app/`,
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: { name: product.name },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: purchaseQuantity,
        },
      ],
    });

    // Respond with Stripe URL
    return res.status(201).json({
      message: "Please complete your payment",
      url: session.url,
      data: {
        purchaseId: newPurchase._id,
        productName: product.name,
      },
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
    purchase.status = CUSTOMER_PURCHASE_STATUS.COMPLETED;
    await purchase.save();

    // 4. Update CustomerPurchase status
    await CustomerPurchase.updateOne(
      { purchaseId: purchaseId, customerId: userId, status: CUSTOMER_PURCHASE_STATUS.PENDING },
      { status: CUSTOMER_PURCHASE_STATUS.COMPLETED }
    );

    // 5. Get Customer Purchase Info to Generate Invoice
    const customerPurchase = await CustomerPurchase.findOne({
      purchaseId: purchaseId,
      customerId: userId,
    }).populate("productId");

    if (!customerPurchase) {
      return next(new appError("Customer Purchase not found", 404));
    }

    const product = customerPurchase.productId;

    // 6. Create Invoice

    const invoice = {
      name: `${user.firstName} ${user.lastName}`,
      items: [
        {
          title: product.name,
          price: product.price,
          quantity: customerPurchase.purchaseQuantity,
          finalPrice: product.price,
          description: product.description,
        },
      ],
      totalPrice: product.price * customerPurchase.purchaseQuantity,
      paid: product.price * customerPurchase.purchaseQuantity,
      city: user.city,
      street: user.street,
      homeNumber: user.homeNumber,
    };

    const invoiceHTML = generateInvoiceHTML(invoice);

    // 7. Send Email
    await sendEmail(user.email, "Your Invoice", {
      text: "Thank you for your purchase! You can find your invoice below.",
      html: invoiceHTML,
    });

    // 8. Send Success Response
    return res.send(paymentSuccessHtml);
  } catch (error) {
    next(error);
  }
};

export const VoteForPurchase = async (req, res, next) => {
  try {
    const { productId, purchaseId } = req.params;
    const { purchaseQuantity, deliveryAddress } = req.body;
    let userLocation = req.user.coordinates;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    if (!userLocation || !userLocation || userLocation.length !== 2) {
      return res.status(400).json({ message: "Invalid user location" });
    }
    const userCoordinates = userLocation;
    const purchaseCoordinates = purchase.userLocation;

    // Check if user is within 5km of the purchase location
    if (haversineDistance(userCoordinates, purchaseCoordinates) > 2) {
      return res.status(403).json({
        message:
          "You are too far from the required area. Please get closer to vote. Or start new one",
      });
    }
    const pendingCount = await CustomerPurchase.countDocuments({
      status: "Pending",
      purchaseId,
    });

    if (purchaseQuantity + pendingCount == purchase.quantity) {
      // add here API of comlete the purchase
    } else if (purchaseQuantity + pendingCount > purchase.quantity) {
      return res.status(400).json({ message: "The Quantity more than valid" });
    }

    const customerPurchase = await CustomerPurchase.create({
      purchaseId,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Waiting payment",
      paymentMethod: "Credit Card",
    });

    // Create Stripe session
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { purchaseId: purchase._id.toString() },
      success_url: `https://bulkify-back-end.vercel.app/api/v1/purchases/vote/successPayment/${purchase._id}/${req.user._id}/${customerPurchase._id}`,
      cancel_url: `https://bulkify-web.netlify.app/`,
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: { name: product.name },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: purchaseQuantity,
        },
      ],
    });

    // Respond with Stripe URL
    return res.status(200).json({
      message: "Please complete your payment",
      url: session.url,
      data: {
        purchaseId: purchase._id,
        productName: product.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const successPaymentForVoting = async (req, res, next) => {
  try {
    const { purchaseId, userId, customerPurchaseId } = req.params;

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
    await CustomerPurchase.findByIdAndUpdate(
      customerPurchaseId,
      { status: "Pending" },
      { new: true } // Optional: returns the updated document
    );


    // 5. Get Customer Purchase Info to Generate Invoice
    const customerPurchase = await CustomerPurchase.findById(customerPurchaseId).populate("productId");

    if (!customerPurchase) {
      return next(new appError("Customer Purchase not found", 404));
    }

    const product = customerPurchase.productId;
    // 6. Create Invoice

    const invoice = {
      name: `${user.firstName} ${user.lastName}`,
      items: [
        {
          title: product.name,
          price: product.price,
          quantity: customerPurchase.purchaseQuantity,
          finalPrice: product.price,
          description: product.description,
        },
      ],
      totalPrice: product.price * customerPurchase.purchaseQuantity,
      paid: product.price * customerPurchase.purchaseQuantity,
      city: user.city,
      street: user.street,
      homeNumber: user.homeNumber,
    };

    const invoiceHTML = generateInvoiceHTML(invoice);

    // 7. Send Email
    await sendEmail(user.email, "Your Invoice", {
      text: "Thank you for your purchase! You can find your invoice below.",
      html: invoiceHTML,
    });
    // 8. Send Success Response
    return res.send(paymentSuccessHtml);
  } catch (error) {
    next(error);
  }
};

export const cancelPurchase = async (req, res, next) => {
  try {
    const { customerPurchaseId } = req.params;
    const { reason } = req.body;
    const customerId = req.user._id;

    // 1. Find the customer purchase
    const customerPurchase = await CustomerPurchase.findOne({
      _id: customerPurchaseId,
      customerId: customerId
    }).populate('productId').populate('purchaseId');

    if (!customerPurchase) {
      return res.status(404).json({ 
        message: "Purchase not found or you don't have permission to cancel it" 
      });
    }

    // 2. Check if purchase can be cancelled
    if (customerPurchase.status === CUSTOMER_PURCHASE_STATUS.CANCELLED) {
      return res.status(400).json({ 
        message: "Purchase is already cancelled" 
      });
    }

    if (customerPurchase.status === CUSTOMER_PURCHASE_STATUS.COMPLETED) {
      return res.status(400).json({ 
        message: "Cannot cancel a completed purchase" 
      });
    }

    if (customerPurchase.status === CUSTOMER_PURCHASE_STATUS.ENDED_WITHOUT_PURCHASE) {
      return res.status(400).json({ 
        message: "Cannot cancel an expired purchase" 
      });
    }

    const purchase = customerPurchase.purchaseId;
    const product = customerPurchase.productId;

    // 3. Handle Stripe refund if payment was made
    if (customerPurchase.status === "Pending") {
      try {
        // For demo purposes, we'll create a mock refund since we don't have the actual payment_intent_id
        // In a real implementation, you should store the payment_intent_id when creating the purchase
        
        // Mock refund process
        console.log(`Processing refund for customer purchase ${customerPurchaseId}`);
        console.log(`Refund amount: ${product.price * customerPurchase.purchaseQuantity} EGP`);
        
        // If you have the actual payment_intent_id stored, use this:
        // const refund = await refundPayment({
        //   payment_intent_id: customerPurchase.paymentIntentId,
        //   metadata: {
        //     customerPurchaseId: customerPurchaseId,
        //     customerId: customerId.toString(),
        //     reason: reason || "Customer requested cancellation"
        //   }
        // });

      } catch (refundError) {
        console.error('Refund error:', refundError);
        return res.status(500).json({ 
          message: "Failed to process refund. Please contact support." 
        });
      }
    }

    // 4. Update customer purchase status
    customerPurchase.status = CUSTOMER_PURCHASE_STATUS.CANCELLED;
    customerPurchase.cancellationReason = reason;
    customerPurchase.cancelledAt = new Date();
    await customerPurchase.save();

    // 5. Check if this was the only participant in the bulk purchase
    const remainingParticipants = await CustomerPurchase.countDocuments({
      purchaseId: purchase._id,
      status: { $in: ["Pending", "Waiting payment"] }
    });

    // 6. If no remaining participants, cancel the bulk purchase
    if (remainingParticipants === 0) {
      purchase.status = "Cancelled";
      purchase.cancelledAt = new Date();
      await purchase.save();
    }

    // 7. Send cancellation confirmation email
    const user = await Customer.findById(customerId);
    if (user) {
      const cancellationHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d32f2f;">Purchase Cancelled</h2>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>Your purchase has been successfully cancelled:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Cancelled Purchase Details:</h3>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Quantity:</strong> ${customerPurchase.purchaseQuantity}</p>
            <p><strong>Amount:</strong> ${(product.price * customerPurchase.purchaseQuantity).toFixed(2)} EGP</p>
            <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          
          ${customerPurchase.status === "Pending" ? 
            '<p style="color: #4CAF50;"><strong>Refund Status:</strong> Your refund is being processed and will appear in your account within 5-10 business days.</p>' : 
            ''
          }
          
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for using our service.</p>
        </div>
      `;

      await sendEmail(user.email, "Purchase Cancellation Confirmation", {
        text: `Your purchase of ${product.name} (Quantity: ${customerPurchase.purchaseQuantity}) has been cancelled.`,
        html: cancellationHTML,
      });
    }

    // 8. Return success response
    res.status(200).json({
      message: "Purchase cancelled successfully",
      refundStatus: customerPurchase.status === CUSTOMER_PURCHASE_STATUS.PENDING ? "Refund processing" : "No payment to refund",
      data: {
        customerPurchaseId: customerPurchase._id,
        productName: product.name,
        quantity: customerPurchase.purchaseQuantity,
        refundAmount: customerPurchase.status === CUSTOMER_PURCHASE_STATUS.PENDING ? 
          (product.price * customerPurchase.purchaseQuantity) : 0,
        cancellationDate: customerPurchase.cancelledAt
      }
    });

  } catch (error) {
    console.error('Cancel purchase error:', error);
    next(error);
  }
};

export const webhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.SIGNING_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send("Webhook Error");
  }

  const { purchaseId } = event.data.object.metadata;

  if (event.type === "checkout.session.completed") {
    // await Purchase.findOneAndUpdate({ _id: purchaseId }, { status: "placed" });
    // await CustomerPurchase.updateMany({ purchaseId }, { status: "Pending" });
    return res.status(200).json({ msg: "done" });
  }

  // Acknowledge all other events (optional: handle them specifically)
  return res.status(200).json({ msg: "event received" });
};

