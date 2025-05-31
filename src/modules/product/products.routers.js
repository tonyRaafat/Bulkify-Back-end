import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import { multerHost, validExtension } from "../../middlewares/multer.js";
import * as productController from "./products.controllers.js";
import purchaseRouter from "../purchase/purchase.routers.js";
import {
  createProductSchema,
  updateProductSchema,
  approveProductSchema,
  rateProductSchema,
  deleteRatingSchema,
  getProductsForUserSchema,
} from "./products.validations.js";

const router = express.Router({ mergeParams: true });

// Mount purchase router on product routes
router.use("/:productId/purchases", purchaseRouter);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Get a list of all products with optional filtering, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by fields (e.g., "name,price,-createdAt")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Select specific fields to return (e.g., "name,price,category")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: approved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */
router.get("/", auth(["all", "customer","supplier","admin"]), productController.getProducts);


// router.get("/u",
//   auth(["customer"]),
//   authorize({ customer: ["verified"] }),
//   validate(getProductsForUserSchema),
//   productController.getProductsForUser);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a specific product by ID
 *     description: Get detailed information about a specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Detailed product information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product (Supplier only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - quantity
 *               - bulkThreshold
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price per unit
 *               quantity:
 *                 type: integer
 *                 description: Available quantity
 *               bulkThreshold:
 *                 type: integer
 *                 description: Minimum quantity for bulk purchase
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (up to 5)
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - account not verified
 */
router.post(
  "/",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  multerHost(validExtension.image).array("images"),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product (Supplier only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price per unit
 *               quantity:
 *                 type: integer
 *                 description: Available quantity
 *               bulkThreshold:
 *                 type: integer
 *                 description: Minimum quantity for bulk purchase
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not product owner or account not verified
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  multerHost(validExtension.image).single("image"),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete an existing product (Supplier only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not product owner or account not verified
 *       404:
 *         description: Product not found
 */
router.delete(
  "/:id",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  productController.deleteProduct
);

/**
 * @swagger
 * /products/{id}/rate:
 *   post:
 *     summary: Rate a product
 *     description: Add a rating and optional review to a product (Customer only)
 *     tags: [Products, Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *             properties:
 *               rate:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *               comment:
 *                 type: string
 *                 description: Review comment (optional)
 *     responses:
 *       201:
 *         description: Rating added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rating:
 *                   $ref: '#/components/schemas/ProductRate'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - account not verified
 *       404:
 *         description: Product not found
 */
router.post(
  "/:id/rate",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  validate(rateProductSchema),
  productController.rateProduct
);

/**
 * @swagger
 * /products/{id}/ratings:
 *   get:
 *     summary: Get product ratings
 *     description: Retrieve all ratings for a specific product
 *     tags: [Products, Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductRate'
 *       404:
 *         description: Product not found
 */
router.get("/:id/ratings", productController.getProductRatings);

/**
 * @swagger
 * /products/{id}/ratings/{ratingId}:
 *   delete:
 *     summary: Delete a product rating
 *     description: Remove a rating for a product (Customer only, own ratings)
 *     tags: [Products, Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rating:
 *                   $ref: '#/components/schemas/ProductRate'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not rating owner
 *       404:
 *         description: Product or rating not found
 */
router.delete(
  "/:id/ratings/:ratingId",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  validate(deleteRatingSchema),
  productController.deleteProductRating
);

/**
 * @swagger
 * /products/{id}/approve:
 *   patch:
 *     summary: Approve or reject a product
 *     description: Change a product's approval status (Admin only)
 *     tags: [Products, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 description: Approval status (true/false)
 *     responses:
 *       200:
 *         description: Product approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Product not found
 */
router.patch(
  "/:id/approve",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(approveProductSchema),
  productController.approveProduct
);

/**
 * @swagger
 * /products/admin/{id}:
 *   put:
 *     summary: Update a product (Admin)
 *     description: Update any product regardless of owner (Admin only)
 *     tags: [Products, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price per unit
 *               quantity:
 *                 type: integer
 *                 description: Available quantity
 *               bulkThreshold:
 *                 type: integer
 *                 description: Minimum quantity for bulk purchase
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Product not found
 */
router.put(
  "/admin/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  multerHost(validExtension.image).single("image"),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /products/admin/{id}:
 *   delete:
 *     summary: Delete a product (Admin)
 *     description: Delete any product regardless of owner (Admin only)
 *     tags: [Products, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Product not found
 */
router.delete(
  "/admin/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  productController.deleteProduct
);

export default router;
