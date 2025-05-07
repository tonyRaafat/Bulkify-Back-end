import { Router } from "express";
import * as categoryController from "./categories.controllers.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as categoryValidation from "./categories.validations.js";

const router = Router();

// Protected routes (admin only)
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category (Admin only)
 *     tags: [Categories, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       409:
 *         description: Category already exists
 */
router.post(
  "/",
  auth(["admin"]),
  validate(categoryValidation.createCategorySchema),
  categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     description: Update an existing category (Admin only)
 *     tags: [Categories, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated category name
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 */
router.put(
  "/:id",
  auth(["admin"]),
  validate(categoryValidation.updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Delete an existing category (Admin only)
 *     tags: [Categories, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Cannot delete category with associated products
 */
router.delete(
  "/:id",
  auth(["admin"]),
  validate(categoryValidation.deleteCategorySchema),
  categoryController.deleteCategory
);

// Public routes
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve all categories
 *     description: Get a list of all product categories
 *     tags: [Categories]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
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
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Retrieve a specific category
 *     description: Get a category by ID with its associated products
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details with products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get(
  "/:id",
  validate(categoryValidation.getCategorySchema),
  categoryController.getCategoryById
);

export default router;
