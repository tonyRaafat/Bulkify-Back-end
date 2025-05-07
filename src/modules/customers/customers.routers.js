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
/**
 * @swagger
 * /customers/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - birthDate
 *               - gender
 *               - phoneNumber
 *               - city
 *               - street
 *               - homeNumber
 *               - coordinates
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Customer's first name
 *               lastName:
 *                 type: string
 *                 description: Customer's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer's email address (unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Customer's password
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Customer's birth date (MM-DD-YYYY)
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 description: Customer's gender
 *               phoneNumber:
 *                 type: string
 *                 description: Customer's phone number
 *               city:
 *                 type: string
 *                 description: Customer's city
 *               street:
 *                 type: string
 *                 description: Customer's street
 *               homeNumber:
 *                 type: string
 *                 description: Customer's home or building number
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *                 minItems: 2
 *                 maxItems: 2
 *                 description: Longitude and latitude coordinates [longitude, latitude]
 *                 example: [31.2357, 30.0444]
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
  validate(registerValidation),
  customerController.register
);

/**
 * @swagger
 * /customers/login:
 *   post:
 *     summary: Authenticate a customer and get access token
 *     tags: [Customers]
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
 *                 description: Customer's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Customer's password
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
 *                 customer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account pending verification
 */
router.post("/login", validate(loginSchema), customerController.login);

/**
 * @swagger
 * /customers/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Customers]
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
 *                 description: Customer's email address
 *     responses:
 *       200:
 *         description: OTP sent to customer's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Customer not found
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  customerController.forgotPassword
);

/**
 * @swagger
 * /customers/reset-password:
 *   post:
 *     summary: Reset customer password using OTP
 *     tags: [Customers]
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
 *                 description: Customer's email address
 *               otp:
 *                 type: string
 *                 description: One-time password sent to customer's email
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
 *         description: Customer not found
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  customerController.resetPassword
);

// Email verification routes
/**
 * @swagger
 * /customers/verifyEmail/{token}:
 *   get:
 *     summary: Verify customer email using token
 *     tags: [Customers]
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
 *         description: Invalid token or customer already verified
 *       401:
 *         description: Token expired
 */
router.get("/verifyEmail/:token", customerController.verifyEmail);

/**
 * @swagger
 * /customers/refreshtoken/{rftoken}:
 *   get:
 *     summary: Get new verification email using refresh token
 *     tags: [Customers]
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
router.get("/refreshtoken/:rftoken", customerController.refreshToken);

// Protected routes
/**
 * @swagger
 * /customers/profile:
 *   get:
 *     summary: Get authenticated customer's profile
 *     tags: [Customers]
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
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.get(
  "/profile",
  auth(["customer"]),
  authorize({ customer: ["all"] }),
  customerController.getProfile
);

/**
 * @swagger
 * /customers/profile:
 *   put:
 *     summary: Update authenticated customer's profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Customer's first name
 *               lastName:
 *                 type: string
 *                 description: Customer's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Customer's password
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Customer's birth date (MM-DD-YYYY)
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 description: Customer's gender
 *               phoneNumber:
 *                 type: string
 *                 description: Customer's phone number
 *               city:
 *                 type: string
 *                 description: Customer's city
 *               street:
 *                 type: string
 *                 description: Customer's street
 *               homeNumber:
 *                 type: string
 *                 description: Customer's home number
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Longitude and latitude coordinates
 *                 example: [31.2357, 30.0444]
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
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Email already registered
 */
router.put(
  "/profile",
  auth(["customer"]),
  authorize({ customer: ["all"] }),
  validate(updateCustomerSchema),
  customerController.updateProfile
);

/**
 * @swagger
 * /customers/profile:
 *   delete:
 *     summary: Delete authenticated customer's account
 *     tags: [Customers]
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
 *         description: Customer not found
 */
router.delete(
  "/profile",
  auth(["customer"]),
  authorize({ customer: ["all"] }),
  customerController.deleteAccount
);

export default router;
