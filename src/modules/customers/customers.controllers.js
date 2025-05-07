import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../../utils/emailService.js";
import { Customer } from "../../../database/models/customer.model.js";
import { throwError } from "../../utils/throwerror.js";
import { generateOTP } from "../../utils/otpGenerator.js";
import { sendEmail } from "../../utils/emailService.js";
import { CustomerPurchase } from "../../../database/models/customerPurchase.model.js";
import { ProductRate } from "../../../database/models/productRate.model.js";

const BASE_URL = "https://bulkify-back-end.vercel.app";

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    // Generate OTP
    const otp = `${Math.floor(10000 + Math.random() * 90000)}`;
    const otpSalt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, otpSalt);

    // Save OTP to customer document
    customer.otp = {
      code: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    };
    await customer.save();

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

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    if (!customer.otp) {
      throw throwError("No OTP request found", 400);
    }

    // Verify OTP
    if (customer.otp.expiresAt < Date.now()) {
      // Clear expired OTP
      customer.otp = undefined;
      await customer.save();
      throw throwError("OTP has expired", 400);
    }

    const validOtp = await bcrypt.compare(otp, customer.otp.code);
    if (!validOtp) {
      throw throwError("Invalid OTP", 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    customer.password = hashedPassword;
    customer.passwordChanged = Date.now();
    customer.otp = undefined;
    await customer.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let customer = await Customer.findOne({ email });
    if (customer) {
      throw throwError("Email already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    console.log(req.body);
    customer = new Customer(req.body);

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });
    const verifyLink = `${BASE_URL}/api/v1/customers/verifyEmail/${token}`;
    const rftoken = jwt.sign({ email }, process.env.JWT_SECRET + "refresh", {
      expiresIn: "3m",
    });
    const resendLink = `${BASE_URL}/api/v1/customers/refreshtoken/${rftoken}`;

    // Send verification email
    await sendEmail(email, "Verify Your Email", {
      text: `Please verify your email by clicking: ${verifyLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our Platform!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <div style="margin: 20px 0;">
            <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p>If the verification link expires, you can get a new one here:</p>
          <div style="margin: 20px 0;">
            <a href="${resendLink}" style="color: #4CAF50;">Resend Verification Email</a>
          </div>
        </div>
      `,
    });

    await customer.save();
    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      id: customer._id,
      email: customer.email,
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
        const rflink = `${BASE_URL}/api/v1/customers/refreshtoken/${rftoken}`;

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

    const customer = await Customer.findOneAndUpdate(
      { email: decoded.email, isVerified: false },
      { isVerified: true }
    );

    if (!customer)
      throw throwError("Customer not found or already verified", 400);
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

    const token = jwt.sign({ email: decoded.email }, process.env.JWT_SECRET, {
      expiresIn: "3m",
    });
    const link = `${BASE_URL}/api/v1/customers/verifyEmail/${token}`;

    await sendEmail(decoded.email, "Verify Email", {
      text: `Verify your email: ${link}`,
      html: `<a href="${link}">Verify Email</a>`,
    });

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { customerId, otp } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    if (customer.isVerified) {
      throw throwError("Account already verified", 400);
    }

    if (!customer.otp || !customer.otp.code || !customer.otp.expiresAt) {
      throw throwError("No OTP found for this customer", 400);
    }

    if (Date.now() > customer.otp.expiresAt) {
      throw throwError("OTP has expired", 400);
    }

    if (customer.otp.code !== otp) {
      throw throwError("Invalid OTP", 400);
    }

    customer.isVerified = true;
    customer.otp = undefined;
    await customer.save();

    res.status(200).json({
      message: "Account verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw throwError("Invalid email or password", 401);
    }

    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      throw throwError("Invalid email or password", 401);
    }

    // Check if customer is verified
    if (!customer.isVerified) {
      // Generate new verification token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "3m",
      });
      const verifyLink = `${BASE_URL}/api/v1/customers/verifyEmail/${token}`;
      const rftoken = jwt.sign({ email }, process.env.JWT_SECRET + "refresh", {
        expiresIn: "3m",
      });
      const resendLink = `${BASE_URL}/api/v1/customers/refreshtoken/${rftoken}`;

      // Resend verification email
      await sendEmail(email, "Verify Your Email", {
        text: `Please verify your email by clicking: ${verifyLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification Required</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <div style="margin: 20px 0;">
              <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify Email
              </a>
            </div>
            <p>If the verification link expires, you can get a new one here:</p>
            <div style="margin: 20px 0;">
              <a href="${resendLink}" style="color: #4CAF50;">Resend Verification Email</a>
            </div>
          </div>
        `,
      });

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
        _id: customer._id,
        email: customer.email,
        userType: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        isVerified: customer.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .select("-password")
      .populate({
        path: "customerPurchases",
        model: CustomerPurchase,
      })
      .populate({
        path: "productRates",
        model: ProductRate,
      });

    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // If updating email or nationalId, check uniqueness
    if (updates.email || updates.nationalId) {
      const existingCustomer = await Customer.findOne({
        _id: { $ne: req.user._id },
        $or: [{ email: updates.email }, { nationalId: updates.nationalId }],
      });

      if (existingCustomer) {
        if (existingCustomer.email === updates.email) {
          throw throwError("Email already registered", 409);
        }
        throw throwError("National ID already registered", 409);
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!customer) {
      throw throwError("Customer not found", 404);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.user._id);

    if (!customer) {
      throw throwError("Customer not found", 404);
    }
    await CustomerPurchase.deleteMany({ customerId: req.user._id });
    await ProductRate.deleteMany({ customerId: req.user._id });

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
