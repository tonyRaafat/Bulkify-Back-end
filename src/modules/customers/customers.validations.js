import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";
import {
  emailRegex,
  nameRegex,
  passwordRegex,
  phoneRegex,
} from "../../constants/constants.js";

export const updateCustomerSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(30).pattern(nameRegex).messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 30 characters",
      "string.pattern.base":
        "First name must contain only English or Arabic letters",
    }),

    lastName: Joi.string().min(2).max(30).pattern(nameRegex).messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 30 characters",
      "string.pattern.base":
        "Last name must contain only English or Arabic letters",
    }),

    email: Joi.string().pattern(emailRegex).lowercase().messages({
      "string.pattern.base": "Please provide a valid email address",
    }),

    password: Joi.string().min(8).pattern(passwordRegex).messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    }),

    age: Joi.number().min(18).max(100).messages({
      "number.min": "You must be at least 18 years old",
      "number.max": "Age cannot exceed 100 years",
    }),

    gender: Joi.string().valid("Male", "Female").messages({
      "any.only": "Gender must be either Male, Female",
    }),

    phoneNumber: Joi.string().pattern(phoneRegex).messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

    city: Joi.string().pattern(nameRegex).messages({
      "string.pattern.base": "City must contain only English or Arabic letters",
    }),

    street: Joi.string().pattern(nameRegex).messages({
      "string.pattern.base":
        "Street must contain only English or Arabic letters",
    }),

    homeNumber: Joi.number().messages({
      "any.number": "Home number must be number",
    }),

    coordinates: Joi.array()
      .items(
        Joi.number().min(-180).max(180).messages({
          "number.min": "Longitude must be between -180 and 180",
          "number.max": "Longitude must be between -180 and 180",
        }),
        Joi.number().min(-90).max(90).messages({
          "number.min": "Latitude must be between -90 and 90",
          "number.max": "Latitude must be between -90 and 90",
        })
      )
      .length(2)
      .messages({
        "array.length":
          "Coordinates must contain exactly [longitude, latitude]",
      }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
  headers: generalField.headers,
};

export const registerValidation = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(30)
    .pattern(nameRegex)
    .required()
    .messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 30 characters",
      "string.pattern.base":
        "First name must contain only English or Arabic letters",
      "any.required": "First name is required",
    }),

  lastName: Joi.string().min(2).max(30).pattern(nameRegex).required().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 30 characters",
    "string.pattern.base":
      "Last name must contain only English or Arabic letters",
    "any.required": "Last name is required",
  }),

  email: Joi.string().pattern(emailRegex).lowercase().required().messages({
    "string.pattern.base": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    "any.required": "Password is required",
  }),

  age: Joi.number().min(18).max(100).required().messages({
    "number.min": "You must be at least 18 years old",
    "number.max": "Age cannot exceed 100 years",
    "any.required": "Age is required",
  }),

  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "Gender must be either Male, Female",
    "any.required": "Gender is required",
  }),

  phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base": "Please provide a valid phone number",
    "any.required": "Phone number is required",
  }),

  city: Joi.string().pattern(nameRegex).required().messages({
    "string.pattern.base": "City must contain only English or Arabic letters",
    "any.required": "City is required",
  }),

  street: Joi.string().pattern(nameRegex).required().messages({
    "string.pattern.base": "Street must contain only English or Arabic letters",
    "any.required": "Street is required",
  }),

  homeNumber: Joi.number().required().messages({
    "any.number": "Home number must be number",
    "any.required": "Home number is required",
  }),

  coordinates: Joi.array()
    .items(
      Joi.number().min(-180).max(180).required().messages({
        "number.min": "Longitude must be between -180 and 180",
        "number.max": "Longitude must be between -180 and 180",
      }),
      Joi.number().min(-90).max(90).required().messages({
        "number.min": "Latitude must be between -90 and 90",
        "number.max": "Latitude must be between -90 and 90",
      })
    )
    .length(2)
    .required()
    .messages({
      "array.length": "Coordinates must contain exactly [longitude, latitude]",
      "array.required": "Coordinates are required",
    }),
});

export const otpValidation = Joi.object({
  userId: Joi.string().hex().required(),
  otpCode: Joi.string().length(5).required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().pattern(emailRegex).messages({
    "string.pattern.base": "Please provide a valid email address",
  }),
  password: Joi.string().required(),
});

export const updatePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    "string.pattern.base": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    "string.pattern.base": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  otpCode: Joi.string().length(5).required(),
  password: Joi.string().required(),
});

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
