import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createAdminSchema = {
  body: Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
  }),
  headers: generalField.headers,
};

export const updateAdminSchema = {
  body: Joi.object({
    fullName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),
  }),
  // params: Joi.object({
  //   id: Joi.string().hex().required(),
  // }),
  headers: generalField.headers,
};
