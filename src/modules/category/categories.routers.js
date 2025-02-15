import { Router } from "express";
import * as categoryController from "./categories.controllers.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as categoryValidation from "./categories.validations.js";

const router = Router();

// Protected routes (admin only)
router.post(
  "/",
  auth(["admin"]),
  validate(categoryValidation.createCategorySchema),
  categoryController.createCategory
);

router.put(
  "/:id",
  auth(["admin"]),
  validate(categoryValidation.updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  auth(["admin"]),
  validate(categoryValidation.deleteCategorySchema),
  categoryController.deleteCategory
);

// Public routes
router.get("/", categoryController.getAllCategories);

router.get(
  "/:id",
  validate(categoryValidation.getCategorySchema),
  categoryController.getCategoryById
);

export default router;
