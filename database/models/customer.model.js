import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    homeNumber: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true, // [Long, Lat]
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      createdAt: Date,
      expiresAt: Date,
    },
    passwordChanged: Date,
  },
  {
    timestamps: true,
  }
);

// Change the model name to match your collection name
export const Customer = mongoose.model("Customer", customerSchema); // This will create a 'customers' collection
