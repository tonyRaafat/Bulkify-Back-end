import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../../../database/models/admin.model.js";
import { throwError } from "../../utils/throwerror.js";

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
