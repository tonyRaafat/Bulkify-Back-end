import mongoose from "mongoose";
import { CUSTOMER_PURCHASE_STATUS } from "../../src/constants/constants.js";

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
      enum: Object.values(CUSTOMER_PURCHASE_STATUS),
      required: true,
      default: CUSTOMER_PURCHASE_STATUS.WAITING_PAYMENT
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
