import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";
import {
  passwordRegex,
  phoneRegex,
  nameRegex,
  emailRegex,
} from "../../constants/constants.js";

export const createAdminSchema = {
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
  }),
  headers: generalField.headers,
};

export const getAllProductsSchema = {
  headers: generalField.headers,
};
export const updateAdminSchema = {
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
  }),
  headers: generalField.headers,
};
