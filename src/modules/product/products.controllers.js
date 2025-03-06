import { Product } from "../../../database/models/product.model.js";
import { throwError } from "../../utils/throwerror.js";
import cloudinary from "../../utils/cloudinary.js";
import { ApiFeatures } from "../../utils/apiFeatuers.js";

/**
 * Create new product
 * Only suppliers can create products
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, quantity, bulkThreshold, categoryId } =
      req.body;
    // Check if product exists
    const existingProduct = await Product.findOne({
      name: name.toLowerCase(),
      supplierId: req.user._id,
    });

    if (existingProduct) {
      throw throwError("Product already exists for this supplier", 409);
    }

    if (!req.files || req.files.length === 0) {
      throw throwError("At least one photo is required", 400);
    }

    if (req.files.length > 5) {
      throw throwError("At most 5 photos", 400);
    } 

    let imageSource = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: `Bulkify/products/${req.user._id}`,
        });
        imageSource.push(secure_url);
      }
    }

    // Create product with description
    const product = await Product.create({
      name: name.toLowerCase(),
      description, // Add description here
      price,
      quantity,
      bulkThreshold,
      imageSource,
      supplierId: req.user._id,
      categoryId,
      isApproved: false, // New products need admin approval
    });

    res.status(201).json({
      message: "Product created successfully, waiting for admin approval",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * Only product owner (supplier) can update their products
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find product with different conditions based on user type
    let product;
    if (req.userType === "admin") {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({
        _id: id,
        supplierId: req.user._id,
      });
    }

    if (!product) {
      throw throwError("Product not found or unauthorized", 404);
    }

    // Handle image update
    if (req.file) {
      if (product.imageSource) {
        const publicId = product.imageSource.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Bulkify/products/${product.supplierId}`,
      });
      updates.imageSource = secure_url;
    }

    // Set approval status based on user type
    if (req.userType === "supplier") {
      updates.isApproved = false; // Require re-approval for supplier updates
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      message:
        req.userType === "supplier"
          ? "Product updated successfully, waiting for admin approval"
          : "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products
 * Customers can only see approved products
 */
export const getProducts = async (req, res, next) => {
  try {
    let query = Product.find();

    // Base query conditions
    const baseConditions = {};

    // If customer, only show approved products
    if (!req.user || req.userType === "customer") {
      baseConditions.isApproved = true;
    }

    // If supplier, only show their products
    if (req.userType === "supplier") {
      baseConditions.supplierId = req.user._id;
    }

    // Advanced search options
    if (req.query.minPrice) {
      baseConditions.price = { $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      baseConditions.price = {
        ...baseConditions.price,
        $lte: parseFloat(req.query.maxPrice),
      };
    }
    if (req.query.category) {
      baseConditions.categoryId = req.query.category;
    }

    query = Product.find(baseConditions);

    // Apply API features
    const apiFeatures = new ApiFeatures(query, req.query)
      .pagination()
      .filter()
      .sort()
      .search(["name"])
      .select();

    const products = await apiFeatures.query.populate([
      { path: "supplierId", select: "fullName supplierRate" },
      { path: "categoryId", select: "name" },
    ]);

    const total = await Product.countDocuments(baseConditions);

    res.status(200).json({
      message: "Products retrieved successfully",
      currentPage: apiFeatures.page,
      totalPages: Math.ceil(total / apiFeatures.limit),
      total,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product
 */
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("supplierId", "fullName supplierRate")
      .populate("categoryId", "name");

    if (!product) {
      throw throwError("Product not found", 404);
    }

    // Check if product is approved for customers
    if (req.userType === "customer" && !product.isApproved) {
      throw throwError("Product not found", 404);
    }

    // Check ownership for suppliers
    if (
      req.userType === "supplier" &&
      product.supplierId._id.toString() !== req.user._id.toString()
    ) {
      throw throwError("Unauthorized access", 403);
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * Only product owner (supplier) can delete their products
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find and delete product with different conditions based on user type
    const product = await Product.findOneAndDelete(
      req.userType === "admin"
        ? { _id: id }
        : { _id: id, supplierId: req.user._id }
    );

    if (!product) {
      throw throwError("Product not found or unauthorized", 404);
    }

    // Delete product image from cloudinary
    if (product.imageSource) {
      const publicId = product.imageSource.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve product
 * Only admins can approve products
 */
export const approveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { isApproved } },
      { new: true }
    );

    if (!product) {
      throw throwError("Product not found", 404);
    }

    res.status(200).json({
      message: `Product ${isApproved ? "approved" : "rejected"} successfully`,
      product,
    });
  } catch (error) {
    next(error);
  }
};
