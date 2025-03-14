import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import { multerHost, validExtension } from "../../middlewares/multer.js";
import * as productController from "./products.controllers.js";
import {
  createProductSchema,
  updateProductSchema,
  approveProductSchema,
} from "./products.validations.js";

const router = express.Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Supplier routes
router.post(
  "/",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  multerHost(validExtension.image).array("images"),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  multerHost(validExtension.image).single("image"),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  auth(["supplier"]),
  authorize({ supplier: ["verified"] }),
  productController.deleteProduct
);

// Admin routes
router.patch(
  "/:id/approve",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(approveProductSchema),
  productController.approveProduct
);

// Add these new admin routes
router.put(
  "/admin/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  multerHost(validExtension.image).single("image"),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/admin/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  productController.deleteProduct
);

export default router;
