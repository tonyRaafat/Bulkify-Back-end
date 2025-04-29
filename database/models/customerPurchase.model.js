import mongoose from "mongoose";

const customerPurchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    purchaseQuantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled", "Waiting payment"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Cash", "Paypal"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomerPurchase = mongoose.model(
  "CustomerPurchase",
  customerPurchaseSchema
);
