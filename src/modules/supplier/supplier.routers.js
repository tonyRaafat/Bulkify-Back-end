import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import * as supplierController from "./supplier.controllers.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
} from "./supplier.validations.js";

const router = express.Router();

// Public routes

router.post(
  "/register",
  validate(createSupplierSchema),
  supplierController.signup
);

router.post("/login", validate(loginSchema), supplierController.login);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  supplierController.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  supplierController.resetPassword
);

// Email verification routes

router.get("/verifyEmail/:token", supplierController.verifyEmail);

router.get("/refreshtoken/:rftoken", supplierController.refreshToken);

// Protected routes

router.get(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  supplierController.getProfile
);

router.put(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  validate(updateSupplierSchema),
  supplierController.updateProfile
);

// Delete account route

router.delete(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  supplierController.deleteAccount
);
router.get(
  "/allLivePurchases",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  supplierController.allLivePurchases
);


export default router;

