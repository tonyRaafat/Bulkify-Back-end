import express from "express";
import * as PC from './purchase.controllers.js'
import * as PV from './purchase.validations.js'
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";


const purchaseRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /products/{productId}/purchases/startPurchase/{productId}:
 *   post:
 *     summary: Start a bulk purchase
 *     description: Initiate a new bulk purchase for a product (Customer only)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to purchase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - paymentMethod
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Quantity to purchase (must meet bulk threshold)
 *               paymentMethod:
 *                 type: string
 *                 enum: [Credit Card, Cash, Paypal]
 *                 description: Payment method
 *     responses:
 *       201:
 *         description: Purchase initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   type: object
 *                 paymentUrl:
 *                   type: string
 *                   description: URL for payment processing (if applicable)
 *       400:
 *         description: Invalid input or quantity below bulk threshold
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - account not verified
 *       404:
 *         description: Product not found
 */
purchaseRouter.post('/startPurchase/:productId',
  auth(["customer"]),
  validate(PV.startPurchaseValidation),
  PC.startPurchase
)

/**
 * @swagger
 * /products/{productId}/purchases/{purchaseId}/vote:
 *   post:
 *     summary: Vote for a bulk purchase
 *     description: Join an existing bulk purchase by voting (Customer only)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID to vote for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - paymentMethod
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Quantity to purchase
 *               paymentMethod:
 *                 type: string
 *                 enum: [Credit Card, Cash, Paypal]
 *                 description: Payment method
 *     responses:
 *       200:
 *         description: Vote registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vote:
 *                   type: object
 *                 paymentUrl:
 *                   type: string
 *                   description: URL for payment processing (if applicable)
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - account not verified
 *       404:
 *         description: Purchase or product not found
 *       409:
 *         description: Already voted for this purchase
 */
purchaseRouter.post('/:purchaseId/vote',
  auth(["customer"]),
  validate(PV.voteForPurchaseValidation),
  PC.VoteForPurchase
)

/**
 * @swagger
 * /products/{productId}/purchases/successPayment/{purchaseId}/{userId}:
 *   get:
 *     summary: Payment success callback for initiating purchase
 *     description: Endpoint called after successful payment to confirm a purchase initiation
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   type: object
 *       404:
 *         description: Purchase, product, or user not found
 */
purchaseRouter.get('/successPayment/:purchaseId/:userId',
  PC.successPaymentForStartPurchase
)

/**
 * @swagger
 * /products/{productId}/purchases/vote/successPayment/{purchaseId}/{userId}:
 *   get:
 *     summary: Payment success callback for voting on purchase
 *     description: Endpoint called after successful payment to confirm a vote on a purchase
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Vote payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vote:
 *                   type: object
 *       404:
 *         description: Purchase, product, or user not found
 */
purchaseRouter.get('/vote/successPayment/:purchaseId/:userId',
  PC.successPaymentForVoting
)

// cancel order

export default purchaseRouter;
