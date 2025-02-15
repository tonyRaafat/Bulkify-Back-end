import joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createCategorySchema = {
  body: joi.object({
    name: joi.string().min(3).max(25).required(),
  }),
  headers: generalField.headers,
};

export const updateCategorySchema = {
  body: joi.object({
    name: joi.string().min(3).max(25).required(),
  }),
  params: joi.object({
    id: generalField.id,
  }),
  headers: generalField.headers,
};

export const deleteCategorySchema = {
  params: joi.object({
    id: generalField.id,
  }),
  headers: generalField.headers,
};

export const getCategorySchema = {
  params: joi.object({
    id: generalField.id,
  }),
};
