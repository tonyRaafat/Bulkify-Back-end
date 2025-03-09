import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";
import {
  passwordRegex,
  phoneRegex,
  nameRegex,
  emailRegex,
  cityRegex,
  streetRegex,
} from "../../constants/constants.js";

export const createSupplierSchema = {
  body: Joi.object({
    fullName: Joi.string()
      .pattern(nameRegex)
      .min(3)
      .max(50)
      .required()
      .messages({
        "string.pattern.base": "Full name must contain only valid characters",
        "string.min": "Full name must be at least 3 characters long",
        "string.max": "Full name cannot exceed 50 characters",
        "any.required": "Full name is required",
      }),
    email: Joi.string().pattern(emailRegex).required().messages({
      "string.pattern.base": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).pattern(passwordRegex).required().messages({
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
      city: Joi.string().pattern(cityRegex).required().messages({
        "string.pattern.base": "City name must be valid",
        "any.required": "City is required",
      }),
      street: Joi.string().pattern(streetRegex).required().messages({
        "string.pattern.base": "Street name must be valid",
        "any.required": "Street is required",
      }),
      homeNumber: Joi.number().required().messages({
        "any.number": "Home number must be number",
        "any.required": "Home number is required",
      }),
    }).required(),
  }),
};

export const updateSupplierSchema = {
  body: Joi.object({
    fullName: Joi.string().pattern(nameRegex).min(3).max(50).messages({
      "string.pattern.base": "Full name must contain only valid characters",
      "string.min": "Full name must be at least 3 characters long",
      "string.max": "Full name cannot exceed 50 characters",
    }),
    email: Joi.string().pattern(emailRegex).messages({
      "string.pattern.base": "Please provide a valid email address",
    }),
    password: Joi.string().min(8).pattern(passwordRegex).messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    }),
    phoneNumber: Joi.string().pattern(phoneRegex).messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
    commercialRegister: Joi.string().min(5).max(20).messages({
      "string.min": "Commercial register must be at least 5 characters",
      "string.max": "Commercial register cannot exceed 20 characters",
    }),
    isVerified: Joi.boolean(),
    supplierRate: Joi.number().min(0).max(5).messages({
      "number.min": "Supplier rate cannot be less than 0",
      "number.max": "Supplier rate cannot exceed 5",
    }),
    supplierAddress: Joi.object({
      city: Joi.string().pattern(cityRegex).messages({
        "string.pattern.base": "City name must be valid",
      }),
      street: Joi.string().pattern(streetRegex).messages({
        "string.pattern.base": "Street name must be valid",
      }),
      homeNumber: Joi.number().messages({
        "string.pattern.base": "Home number must be valid",
      }),
    }),
  }),
  headers: generalField.headers,
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().pattern(emailRegex).required().messages({
      "string.pattern.base": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().pattern(emailRegex).required().messages({
      "string.pattern.base": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
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
    email: Joi.string().pattern(emailRegex).required().messages({
      "string.pattern.base": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};
