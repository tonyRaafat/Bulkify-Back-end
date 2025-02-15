import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;

const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const nationalIdRegex = /^\d{14}$/; // Assuming 14-digit national ID

export const createCustomerSchema = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    nationalId: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    homeNumber: Joi.string().required(),
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
        "array.length":
          "Coordinates must contain exactly [longitude, latitude]",
        "array.required": "Coordinates are required",
      }),
  }),
  headers: generalField.headers,
};

export const updateCustomerSchema = {
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    gender: Joi.string().valid("Male", "Female", "Other"),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),
    city: Joi.string(),
    street: Joi.string(),
    homeNumber: Joi.string(),
    nationalId: Joi.string(),
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
        "array.length":
          "Coordinates must contain exactly [longitude, latitude]",
        "array.required": "Coordinates are required",
      }),
  }),
  headers: generalField.headers,
};

export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).max(30).required().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 30 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(2).max(30).required().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 30 characters",
    "any.required": "Last name is required",
  }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    "any.required": "Password is required",
  }),

  age: Joi.number().min(18).max(100).required().messages({
    "number.min": "You must be at least 18 years old",
    "number.max": "Age cannot exceed 100 years",
    "any.required": "Age is required",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").required().messages({
    "any.only": "Gender must be either Male, Female, or Other",
    "any.required": "Gender is required",
  }),

  phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base": "Please provide a valid phone number",
    "any.required": "Phone number is required",
  }),

  nationalId: Joi.string().pattern(nationalIdRegex).required().messages({
    "string.pattern.base": "National ID must be 14 digits",
    "any.required": "National ID is required",
  }),

  city: Joi.string().required().messages({
    "any.required": "City is required",
  }),

  street: Joi.string().required().messages({
    "any.required": "Street is required",
  }),

  homeNumber: Joi.string().required().messages({
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
  email: Joi.string().email(),
  mobileNumber: Joi.string().pattern(/^01[0125][0-9]{8}$/),
  password: Joi.string().required(),
}).xor("email", "mobileNumber");

export const updateUservalidation = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().optional(),
  recoveryEmail: Joi.string().email().optional(),
  mobileNumber: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .optional(),
})
  .unknown(false)
  .min(1);

export const updatePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string().length(5).required(),
  password: Joi.string().required(),
});

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
