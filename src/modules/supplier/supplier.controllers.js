import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Supplier } from "../../../database/models/supplier.model.js";
import { throwError } from "../../utils/throwerror.js";
import { sendEmail, sendVerificationEmail } from "../../utils/emailService.js";
import { deleteSupplierProducts } from "../product/products.controllers.js";

const BASE_URL = "https://bulkify-back-end.vercel.app";

/**
 * Supplier signup controller
 */
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let supplier = await Supplier.findOne({ email });
    if (supplier) {
      throw throwError("Email already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    supplier = new Supplier(req.body);

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });
    const verifyLink = `${BASE_URL}/api/v1/suppliers/verifyEmail/${token}`;
    const rftoken = jwt.sign({ email }, process.env.JWT_SECRET + "refresh", {
      expiresIn: "3m",
    });
    const resendLink = `${BASE_URL}/api/v1/suppliers/refreshtoken/${rftoken}`;

    // Send verification email with styled template
    await sendVerificationEmail(email, verifyLink, resendLink);

    await supplier.save();
    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      id: supplier._id,
      email: supplier.email,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Generate refresh token for easy reverification
        const rftoken = jwt.sign(
          { email: err.email },
          process.env.JWT_SECRET + "refresh",
          {
            expiresIn: "3m",
          }
        );
        const rflink = `${BASE_URL}/api/v1/suppliers/refreshtoken/${rftoken}`;

        throw throwError({
          message: "Verification link has expired",
          status: 401,
          solution:
            "Please click the link below to get a new verification email",
          refreshLink: rflink,
        });
      }
      throw throwError("Invalid verification token", 400);
    }

    if (!decoded?.email) throw throwError("Invalid token", 400);

    const supplier = await Supplier.findOneAndUpdate(
      { email: decoded.email, isVerified: false },
      { isVerified: true }
    );

    if (!supplier)
      throw throwError("Supplier not found or already verified", 400);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { rftoken } = req.params;
    let decoded;
    try {
      decoded = jwt.verify(rftoken, process.env.JWT_SECRET + "refresh");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw throwError({
          message: "Refresh token has expired",
          status: 401,
          solution:
            "Please try logging in again to receive a new verification email",
        });
      }
      throw throwError("Invalid refresh token", 400);
    }

    if (!decoded?.email) throw throwError("Invalid token", 400);

    const token = jwt.sign({ email: decoded.email }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });
    const verifyLink = `${BASE_URL}/api/v1/suppliers/verifyEmail/${token}`;

    // Send resend verification email with styled template
    await sendVerificationEmail(decoded.email, verifyLink);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier forgot password controller
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    // Generate OTP
    const otp = `${Math.floor(10000 + Math.random() * 90000)}`;
    const otpSalt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, otpSalt);

    // Save OTP to supplier document
    supplier.otp = {
      code: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    };
    await supplier.save();

    // Send OTP email
    await sendEmail(email, "Password Reset OTP", {
      text: `Your OTP for password reset is: ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier reset password controller
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    if (!supplier.otp) {
      throw throwError("No OTP request found", 400);
    }

    // Verify OTP
    if (supplier.otp.expiresAt < Date.now()) {
      // Clear expired OTP
      supplier.otp = undefined;
      await supplier.save();
      throw throwError("OTP has expired", 400);
    }

    const validOtp = await bcrypt.compare(otp, supplier.otp.code);
    if (!validOtp) {
      throw throwError("Invalid OTP", 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    supplier.password = hashedPassword;
    supplier.passwordChanged = Date.now();
    supplier.otp = undefined;
    await supplier.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier login controller
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if supplier exists
    const supplier = await Supplier.findOne({ email });

    if (!supplier) {
      throw throwError("Invalid email or password", 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, supplier.password);
    if (!validPassword) {
      throw throwError("Invalid email or password", 401);
    }

    // Check if supplier is verified
    if (!supplier.isVerified) {
      // Generate new verification token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "3m",
      });
      const verifyLink = `${BASE_URL}/api/v1/suppliers/verifyEmail/${token}`;
      const rftoken = jwt.sign({ email }, process.env.JWT_SECRET + "refresh", {
        expiresIn: "3m",
      });
      const resendLink = `${BASE_URL}/api/v1/suppliers/refreshtoken/${rftoken}`;

      // Resend verification email
      await sendVerificationEmail(email, verifyLink, resendLink);

      throw throwError({
        message: "Account pending verification",
        status: 403,
        solution:
          "A new verification email has been sent to your email address",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: supplier._id,
        email: supplier.email,
        userType: "supplier",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response
    res.status(200).json({
      message: "Login successful",
      token,
      supplier: {
        id: supplier._id,
        fullName: supplier.fullName,
        email: supplier.email,
        isVerified: supplier.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get supplier profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.user._id)
      .select("-password")
      .populate("products");

    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update supplier profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete supplier account
 * Allows suppliers to delete their own account and all associated products
 */
export const deleteAccount = async (req, res, next) => {
  try {
    // First delete all products by this supplier
    await deleteSupplierProducts(req.user._id);
    
    // Then delete the supplier
    const supplier = await Supplier.findByIdAndDelete(req.user._id);

    if (!supplier) {
      throw throwError("Supplier not found", 404);
    }

    res.status(200).json({
      message: "Account and all associated products deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
