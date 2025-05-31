import slugify from "slugify";
import { Category } from "../../../database/models/category.model.js";
import { throwError } from "../../utils/throwerror.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: name.toLowerCase(),
    });
    if (existingCategory) {
      throw throwError("Category already exists", 409);
    }

    const category = await Category.create({
      name,
      slug,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      throw throwError("Category not found", 404);
    }

    // Check if new name already exists
    if (name.toLowerCase() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.toLowerCase(),
      });
      if (existingCategory) {
        throw throwError("Category name already exists", 409);
      }
    }

    category.name = name.toLowerCase();
    category.slug = slugify(name);
    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      throw throwError("Category not found", 404);
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw throwError("Cannot delete category with existing products", 400);
    }

    await category.deleteOne();

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate({
      path: "products",
      // Options to only include approved products for non-admin users
      match: req.userType !== "admin" ? { isApproved: true } : {}
    });
    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate({
      path: "products",
      select: "name description price imageSource bulkThreshold isApproved",
      // Options to only include approved products for non-admin users
      match: req.userType !== "admin" ? { isApproved: true } : {}
    });

    if (!category) {
      throw throwError("Category not found", 404);
    }

    res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// Helper endpoint to sync products with categories (Admin only)
export const syncProductsWithCategories = async (req, res, next) => {
  try {
    const { syncProductsWithCategories } = await import("../../utils/migrateCategoryProducts.js");
    const result = await syncProductsWithCategories();
    
    res.status(200).json({
      message: "Products synced with categories successfully",
      result
    });
  } catch (error) {
    next(error);
  }
};
