import jwt from "jsonwebtoken";
import { throwError } from "../utils/throwerror.js";
import { Admin } from "../../database/models/admin.model.js";
import { Customer } from "../../database/models/customer.model.js";
import { Supplier } from "../../database/models/supplier.model.js";

/**
 * Authentication middleware
 * @param {string[]} userTypes - Array of allowed user types ('admin', 'customer', 'supplier')
 */
export const auth = (userTypes = []) => {
  return async (req, res, next) => {
    try {
      const hasAll = userTypes.includes("all");
      // Get token from either header
      const token =
        req.header("token") ||
        req.header("Authorization")?.replace("Bearer ", "");

      // Check if token exists
      if (!token && !hasAll) {
        throw throwError("Authentication token is required", 401);
      }

      // Verify token
      console.log("Token:", token);

      if (!token && hasAll) {
        // If 'all' is included, we don't need a token
        req.user = 'anonymous';
        req.userType = 'anonymous';
        return next();
      }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.email || !decoded?.userType ) {
          throw throwError("Invalid token payload", 401);
        }

      // Check if user type is allowed
      if (!userTypes.includes(decoded.userType) && !hasAll) {
        throw throwError("Unauthorized access", 403);
      }

      // Find user based on type
      let user;
      switch (decoded.userType) {
        case "admin":
          user = await Admin.findById(decoded._id);
          break;
        case "customer":
          user = await Customer.findById(decoded._id);
          break;
        case "supplier":
          user = await Supplier.findById(decoded._id);
          break;
        default:
          throw throwError("Invalid user type", 400);
      }

      if (!user) {
        throw throwError("User not found", 404);
      }

      // Check if password was changed after token was issued
      if (
        user.passwordChanged &&
        parseInt(user.passwordChanged.getTime() / 1000) > decoded.iat
      ) {
        throw throwError("Token is invalid - password was changed", 401);
      }

      // Add user and type to request object
      req.user = user;
      req.userType = decoded.userType;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 * @param {Object} allowedRoles - Object containing roles for each user type
 */
export const authorize = (allowedRoles = {}) => {
  return (req, res, next) => {
    try {
      const userType = req.userType;
      const user = req.user;

      // Check if user type has any allowed roles
      if (!allowedRoles[userType]) {
        throw throwError("Access forbidden", 403);
      }

      // For admin authorization
      if (userType === "admin") {
        if (!allowedRoles.admin.includes("all")) {
          throw throwError("Unauthorized admin access", 403);
        }
      }

      // For supplier authorization
      else if (userType === "supplier") {
        if (!user.isVerified && allowedRoles.supplier.includes("verified")) {
          throw throwError("Supplier not verified", 403);
        }
      }

      // For customer authorization
      else if (userType === "customer") {
        if (!user.isVerified && allowedRoles.customer.includes("verified")) {
          throw throwError("Customer not verified", 403);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
