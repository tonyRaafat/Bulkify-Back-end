import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import { createAdminSchema, updateAdminSchema } from "./admin.validations.js";
import * as adminController from "./admin.controllers.js";

const router = express.Router();

// Public route - Admin login
router.post("/login", adminController.login);

// Protected routes - Only accessible by admins
router.post(
  "/create",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(createAdminSchema),
  adminController.createAdmin
);

router.put(
  "/update",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(updateAdminSchema),
  adminController.updateAdmin
);

router.delete(
  "/:id",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  adminController.deleteAdmin
);

export default router;
