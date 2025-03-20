import Joi from "joi";

export const startPurchaseValidation = {
  params: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid product ID format",
      "any.required": "Product ID is required"
    })
  }),
  body: Joi.object({
    purchaseQuantity: Joi.number().integer().min(1).required(),
    deliveryAddress: Joi.object({
      city: Joi.string().min(2).max(50).required().messages({
        "string.empty": "City is required",
        "string.min": "City name is too short",
        "string.max": "City name is too long"
      }),
      street: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Street is required",
        "string.min": "Street name is too short",
        "string.max": "Street name is too long"
      }),
      homeNumber: Joi.string().max(10).required().messages({
        "string.empty": "Home number is required",
        "string.max": "Home number is too long"
      })
    }).required().messages({
      "any.required": "Delivery address is required"
    })
  })
};


export const voteForPurchaseValidation = {
  params: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid product ID format",
      "any.required": "Product ID is required"
    }),
    purchaseId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      "string.pattern.base": "Invalid purchase ID format",
      "any.required": "Purchase ID is required"
    })
  }),
  body: Joi.object({
  
    purchaseQuantity: Joi.number().integer().min(1).required(),
    deliveryAddress: Joi.object({
      city: Joi.string().min(2).max(50).required().messages({
        "string.empty": "City is required",
        "string.min": "City name is too short",
        "string.max": "City name is too long"
      }),
      street: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Street is required",
        "string.min": "Street name is too short",
        "string.max": "Street name is too long"
      }),
      homeNumber: Joi.string().max(10).required().messages({
        "string.empty": "Home number is required",
        "string.max": "Home number is too long"
      })
    }).required().messages({
      "any.required": "Delivery address is required"
    })
  })
};
