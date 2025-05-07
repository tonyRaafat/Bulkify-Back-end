import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import { createAdminSchema, getAllProductsSchema, updateAdminSchema } from "./admin.validations.js";
import * as adminController from "./admin.controllers.js";
import { loginSchema } from "../customers/customers.validations.js";

const router = express.Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate as an administrator
 *     tags: [Admin]
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
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin password
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
 *                 admin:
 *                   type: object
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginSchema), adminController.login);

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     description: Create a new administrator account (Admin only)
 *     tags: [Admin]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin's password
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       409:
 *         description: Email already exists
 */
router.post(
  "/create",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(createAdminSchema),
  adminController.createAdmin
);

/**
 * @swagger
 * /admin/getPendingProducts:
 *   get:
 *     summary: Get pending products
 *     description: Retrieve products awaiting approval (Admin only)
 *     tags: [Admin, Products]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of pending products
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 */
router.get(
  "/getPendingProducts",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getProducts
);

/**
 * @swagger
 * /admin/getAll:
 *   get:
 *     summary: Get all admins
 *     description: Retrieve a list of all administrators (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of administrators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 */
router.get(
  "/getAll",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getAll
);

/**
 * @swagger
 * /admin/getAllCustomers:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve a list of all customers (Admin only)
 *     tags: [Admin, Customers]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 */
router.get(
  "/getAllCustomers",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getAllCustomers
);

/**
 * @swagger
 * /admin/getAllSuppliers:
 *   get:
 *     summary: Get all suppliers
 *     description: Retrieve a list of all suppliers (Admin only)
 *     tags: [Admin, Suppliers]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 suppliers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 */
router.get(
  "/getAllSuppliers",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getAllSuppliers
);

/**
 * @swagger
 * /admin/update:
 *   put:
 *     summary: Update admin profile
 *     description: Update an administrator's details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Admin's password
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email already exists
 */
router.put(
  "/update",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(updateAdminSchema),
  adminController.updateAdmin
);

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Delete an admin
 *     description: Remove an administrator account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID to delete
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Admin not found
 */
router.delete(
  "/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  adminController.deleteAdmin
);

/**
 * @swagger
 * /admin/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     description: Remove a customer account (Admin only)
 *     tags: [Admin, Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully
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
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Customer not found
 */
router.delete(
  "/customers/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  adminController.deleteCustomer
);

/**
 * @swagger
 * /admin/suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     description: Remove a supplier account (Admin only)
 *     tags: [Admin, Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID to delete
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
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
 *       403:
 *         description: Forbidden - admin privileges required
 *       404:
 *         description: Supplier not found
 */
router.delete(
  "/suppliers/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  adminController.deleteSupplier
);

export default router;
