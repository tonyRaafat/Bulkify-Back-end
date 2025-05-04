import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../../../database/models/admin.model.js";
import { throwError } from "../../utils/throwerror.js";
import { Product } from "../../../database/models/product.model.js";
import { ApiFeatures } from "../../utils/apiFeatuers.js";
import { Customer } from "../../../database/models/customer.model.js";
import { Supplier } from "../../../database/models/supplier.model.js";

/**
 * Admin login controller
 * Handles authentication and returns JWT token
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw throwError("Invalid email or password", 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      throw throwError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: admin._id,
        email: admin.email,
        userType: "admin", // Important for auth middleware
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response
    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new admin controller
 * Only existing admins can create new admins
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw throwError("Admin already exists with this email", 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    // Return success response
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile
 */
export const updateAdmin = async (req, res, next) => {
  try {
    const updates = req.body;

    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
      updates.passwordChanged = Date.now();
    }

    // Update admin
    const admin = await Admin.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!admin) {
      throw throwError("Admin not found", 404);
    }

    res.status(200).json({
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      throw throwError("Admin not found", 404);
    }

    res.status(200).json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getProducts = async (req, res, next) => {
  try {
    const baseConditions = { isApproved: false };
    let query = Product.find(baseConditions);

    const products = await query.populate([
      { path: "supplierId", select: "fullName supplierRate" },
      { path: "categoryId", select: "name" },
    ]);

    const total = await Product.countDocuments(baseConditions);

    res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};
export const getAll = async (req, res, next) => {
  try {
    let query = Product.find();

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

    const total = await Product.countDocuments();

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
export const getAllCustomers = async (req, res, next) => {
  try {
    let query = Customer.find();

    // Apply API features
    const apiFeatures = new ApiFeatures(query, req.query)
      .pagination()
      .filter()
      .sort()
      .search(["name"])
      .select();

    const customers = await apiFeatures.query.populate([
      { path: "customerPurchases" },
      { path: "productRates" },
    ]);

    const total = await Customer.countDocuments();

    res.status(200).json({
      message: "Customers retrieved successfully",
      currentPage: apiFeatures.page,
      totalPages: Math.ceil(total / apiFeatures.limit),
      total,
      customers,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllSuppliers = async (req, res, next) => {
  try {
    let query = Supplier.find();

    // Apply API features
    const apiFeatures = new ApiFeatures(query, req.query)
      .pagination()
      .filter()
      .sort()
      .search(["name"])
      .select();

    const suppliers = await apiFeatures.query.populate([
      { path: "products" },
    ]);

    const total = await Supplier.countDocuments();

    res.status(200).json({
      message: "Suppliers retrieved successfully",
      currentPage: apiFeatures.page,
      totalPages: Math.ceil(total / apiFeatures.limit),
      total,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

