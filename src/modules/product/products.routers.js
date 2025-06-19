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

router.get("/", auth(["supplier","admin"]), productController.getProducts);

// Special product routes for regular and nearby products
// These must be defined BEFORE the /:id route to prevent Express from treating "regular" and "nearby" as IDs
router.get("/regular", auth(["all", "customer"]), productController.getRegularProducts);
router.get("/nearby", auth(["customer"]), productController.getNearbyPurchaseProducts);

// router.get("/u",
//   auth(["customer"]),
//   authorize({ customer: ["verified"] }),
//   validate(getProductsForUserSchema),
//   productController.getProductsForUser);

router.get("/:id", productController.getProduct);

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

router.post(
  "/:id/rate",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  validate(rateProductSchema),
  productController.rateProduct
);

router.get("/:id/ratings", productController.getProductRatings);

router.delete(
  "/:id/ratings/:ratingId",
  auth(["customer"]),
  authorize({ customer: ["verified"] }),
  validate(deleteRatingSchema),
  productController.deleteProductRating
);

router.patch(
  "/:id/approve",
  auth(["admin"]),
  authorize({ admin: ["all"] }),
  validate(approveProductSchema),
  productController.approveProduct
);

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

