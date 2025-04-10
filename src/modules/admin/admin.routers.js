import express from "express";
import { validate } from "../../middlewares/validate.js";
import { auth, authorize } from "../../middlewares/auth.js";
import { createAdminSchema, getAllProductsSchema, updateAdminSchema } from "./admin.validations.js";
import * as adminController from "./admin.controllers.js";
import { loginSchema } from "../customers/customers.validations.js";

const router = express.Router();

router.post("/login", validate(loginSchema), adminController.login);

router.post(
  "/create",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(createAdminSchema),
  adminController.createAdmin
);
router.get(
  "/getPendingProducts",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getProducts
);
router.get(
  "/getAll",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(getAllProductsSchema),
  adminController.getAll
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
