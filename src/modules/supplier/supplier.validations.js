import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const createSupplierSchema = {
  body: Joi.object({
    fullName: Joi.string().min(3).max(50).required().messages({
      "string.min": "Full name must be at least 3 characters long",
      "string.max": "Full name cannot exceed 50 characters",
      "any.required": "Full name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().pattern(passwordRegex).required().messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      "any.required": "Password is required",
    }),

    phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
    commercialRegister: Joi.string().min(5).max(20).required().messages({
      "string.min": "Commercial register must be at least 5 characters",
      "string.max": "Commercial register cannot exceed 20 characters",
      "any.required": "Commercial register is required",
    }),
    supplierAddress: Joi.object({
      city: Joi.string().required().messages({
        "any.required": "City is required",
      }),
      street: Joi.string().required().messages({
        "any.required": "Street is required",
      }),
      homeNumber: Joi.string().required().messages({
        "any.required": "Home number is required",
      }),
    }).required(),
  }),
};

export const updateSupplierSchema = {
  body: Joi.object({
    fullName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),
    commercialRegister: Joi.string(),
    isVerified: Joi.boolean(),
    supplierRate: Joi.number().min(0).max(5),
    supplierAddress: Joi.object({
      city: Joi.string(),
      street: Joi.string(),
      homeNumber: Joi.string(),
    }),
  }),
  headers: generalField.headers,
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(5).required().messages({
      "string.length": "OTP must be 5 characters long",
      "any.required": "OTP is required",
    }),
    newPassword: Joi.string().pattern(passwordRegex).required().messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      "any.required": "New password is required",
    }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};
