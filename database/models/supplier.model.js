import mongoose from "mongoose";

const supplierAddressSchema = new mongoose.Schema({
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
});

const supplierSchema = new mongoose.Schema(
  {
    fullName: {
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
    phoneNumber: {
      type: String,
      required: true,
    },
    commercialRegister: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    supplierRate: {
      type: Number,
      default: 0.0,
    },
    supplierAddress: {
      type: supplierAddressSchema, // Embedded address schema
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to Product model
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
