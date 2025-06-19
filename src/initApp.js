import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { errorHandler } from "./utils/errorhandler.js";
import { dbConnection } from "../database/dbConnection.js";
import { setupSwagger } from "./utils/swagger.js";

// Import routers
import customerRouter from "./modules/customers/customers.routers.js";
import categoryRouter from "./modules/category/categories.routers.js";
import supplierRouter from "./modules/supplier/supplier.routers.js";
import productRouter from "./modules/product/products.routers.js";
import adminRouter from "./modules/admin/admin.routers.js";
import purchaseRouter from "./modules/purchase/purchase.routers.js";

export const initApp = (app) => {
  dotenv.config();
  dbConnection();

  // Middlewares
  app.use(
    cors({
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
    })
  );
  app.use(express.json());
  
  // Setup Swagger documentation
  setupSwagger(app);

  // Routes
  app.use("/api/v1/admins", adminRouter);
  app.use("/api/v1/customers", customerRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/suppliers", supplierRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/purchases", purchaseRouter);

  app.get("/", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to Bulkify API",
      timestamp: new Date().toISOString(),
    });
  });

  // Not found handler - returns JSON
  app.all("*", (req, res) => {
    res.status(404).json({
      status: "error",
      code: 404,
      message: "Route not found",
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler middleware should be last
  app.use(errorHandler);
};
