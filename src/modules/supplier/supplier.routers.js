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
/**
 * @swagger
 * /suppliers/register:
 *   post:
 *     summary: Register a new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phoneNumber
 *               - commercialRegister
 *               - city
 *               - street
 *               - homeNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Supplier's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier's email address (unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Supplier's password
 *               phoneNumber:
 *                 type: string
 *                 description: Supplier's phone number
 *               commercialRegister:
 *                 type: string
 *                 description: Supplier's commercial registration number
 *               city:
 *                 type: string
 *                 description: Supplier's city
 *               street:
 *                 type: string
 *                 description: Supplier's street
 *               homeNumber:
 *                 type: string
 *                 description: Supplier's home/building number
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
router.post(
  "/register",
  validate(createSupplierSchema),
  supplierController.signup
);

/**
 * @swagger
 * /suppliers/login:
 *   post:
 *     summary: Authenticate a supplier and get access token
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Supplier's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 supplier:
 *                   $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account pending verification
 */
router.post("/login", validate(loginSchema), supplierController.login);

/**
 * @swagger
 * /suppliers/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier's email address
 *     responses:
 *       200:
 *         description: OTP sent to supplier's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Supplier not found
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  supplierController.forgotPassword
);

/**
 * @swagger
 * /suppliers/reset-password:
 *   post:
 *     summary: Reset supplier password using OTP
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier's email address
 *               otp:
 *                 type: string
 *                 description: One-time password sent to supplier's email
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Supplier not found
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  supplierController.resetPassword
);

// Email verification routes
/**
 * @swagger
 * /suppliers/verifyEmail/{token}:
 *   get:
 *     summary: Verify supplier email using token
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token or supplier already verified
 *       401:
 *         description: Token expired
 */
router.get("/verifyEmail/:token", supplierController.verifyEmail);

/**
 * @swagger
 * /suppliers/refreshtoken/{rftoken}:
 *   get:
 *     summary: Get new verification email using refresh token
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: rftoken
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid refresh token
 *       401:
 *         description: Refresh token expired
 */
router.get("/refreshtoken/:rftoken", supplierController.refreshToken);

// Protected routes
/**
 * @swagger
 * /suppliers/profile:
 *   get:
 *     summary: Get authenticated supplier's profile
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 supplier:
 *                   $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 */
router.get(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  supplierController.getProfile
);

/**
 * @swagger
 * /suppliers/profile:
 *   put:
 *     summary: Update authenticated supplier's profile
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Supplier's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Supplier's password
 *               phoneNumber:
 *                 type: string
 *                 description: Supplier's phone number
 *               city:
 *                 type: string
 *                 description: Supplier's city
 *               street:
 *                 type: string
 *                 description: Supplier's street
 *               homeNumber:
 *                 type: string
 *                 description: Supplier's home number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 supplier:
 *                   $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 *       409:
 *         description: Email already registered
 */
router.put(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  validate(updateSupplierSchema),
  supplierController.updateProfile
);

// Delete account route
/**
 * @swagger
 * /suppliers/profile:
 *   delete:
 *     summary: Delete authenticated supplier's account
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 */
router.delete(
  "/profile",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  supplierController.deleteAccount
);

export default router;
