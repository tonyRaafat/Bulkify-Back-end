import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.min": "Product name must be at least 3 characters long",
      "string.max": "Product name cannot exceed 100 characters",
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 1000 characters",
    }),
    price: Joi.number().positive().required().messages({
      "number.positive": "Price must be a positive number",
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      "number.min": "Quantity cannot be negative",
    }),
    bulkThreshold: Joi.number().integer().min(1).required().messages({
      "number.min": "Bulk threshold must be at least 2",
    }),
    categoryId: Joi.string().hex().length(24).required(),
  }),
  files: Joi.object({
    images: Joi.array().items(
      Joi.object({
        mimetype: Joi.string()
          .valid("image/png", "image/jpeg", "image/jpg", "image/webp")
          .required()
          .messages({
            "any.only": "Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed",
            "any.required": "Product image is required",
          }),
      })
    )
      .min(1)
      .max(5)
      .required()
      .messages({
        "array.min": "At least one product image is required",
        "array.max": "You can upload up to 5 product images",
        "any.required": "Product images are required",
      }),
  }),
  headers: generalField.headers,
};

export const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(1000),
    price: Joi.number().positive(),
    quantity: Joi.number().integer().min(0),
    bulkThreshold: Joi.number().integer().min(2),
    categoryId: Joi.string().hex().length(24),
  }),
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  headers: generalField.headers,
};

export const approveProductSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    isApproved: Joi.boolean().required().messages({
      "any.required": "Approval status is required",
    }),
  }),
  headers: generalField.headers,
};
