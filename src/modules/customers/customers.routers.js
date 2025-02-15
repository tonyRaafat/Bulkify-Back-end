import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import * as customerController from "./customers.controllers.js";
import {
  updateCustomerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerValidation,
  loginSchema,
} from "./customers.validations.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validate(registerValidation),
  customerController.register
);
router.post("/login", validate(loginSchema), customerController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  customerController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  customerController.resetPassword
);

// Email verification routes
router.get("/verifyEmail/:token", customerController.verifyEmail);
router.get("/refreshtoken/:rftoken", customerController.refreshToken);

// Protected routes
router.get(
  "/profile",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  customerController.getProfile
);

router.put(
  "/profile",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  validate(updateCustomerSchema),
  customerController.updateProfile
);

export default router;
