import mongoose from "mongoose";

const customerPurchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase", // Reference to Purchase model
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Reference to Customer model
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to Product model
      required: true,
    },
    purchaseQuantity: {
      type: Number,
      required: true,
    },
    statues: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerPurchase = mongoose.model(
  "CustomerPurchase",
  customerPurchaseSchema
);

export default CustomerPurchase;
