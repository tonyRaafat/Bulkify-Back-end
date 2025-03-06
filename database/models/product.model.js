import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    imageSource: [
      {
        type: String,
        required: true,
      },
    ],
    bulkThreshold: {
      type: Number,
      required: true,
      min: 1,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", // Reference to Supplier model
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to Category model
      required: true,
    },
    customerPurchases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerPurchase", // Reference to CustomerPurchase model
      },
    ],
    productRates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductRate", // Reference to ProductRate model
      },
    ],
    purchases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase", // Reference to Purchase model
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
