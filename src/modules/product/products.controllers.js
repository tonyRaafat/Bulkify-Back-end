import { Product } from "../../../database/models/product.model.js";
import { throwError } from "../../utils/throwerror.js";
import cloudinary from "../../utils/cloudinary.js";
import { ApiFeatures } from "../../utils/apiFeatuers.js";
import Purchase from "../../../database/models/purchase.model.js";
import { Category } from "../../../database/models/category.model.js";


const haversineDistance = (coords1, coords2) => {


  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coords2[1] - coords1[1]); // Latitude difference
  const dLon = toRad(coords2[0] - coords1[0]); // Longitude difference
  const lat1 = toRad(coords1[1]); // Latitude 1
  const lat2 = toRad(coords2[1]); // Latitude 2

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};


/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - quantity
 *               - bulkThreshold
 *               - categoryId
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               quantity:
 *                 type: number
 *                 description: Available quantity
 *               bulkThreshold:
 *                 type: number
 *                 description: Minimum quantity required for bulk purchase
 *               categoryId:
 *                 type: string
 *                 description: Product category ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (maximum 5)
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Product already exists
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
    }    // Create product with description
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

    // Update the category by adding this product to its products array
    await Category.findByIdAndUpdate(
      categoryId,
      { $push: { products: product._id } }
    );

    res.status(201).json({
      message: "Product created successfully, waiting for admin approval",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               bulkThreshold:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
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
    }    // Set approval status based on user type
    if (req.userType === "supplier") {
      updates.isApproved = false; // Require re-approval for supplier updates
    }

    // Check if category is being updated
    if (updates.categoryId && updates.categoryId !== product.categoryId.toString()) {
      const { Category } = await import("../../../database/models/category.model.js");
      
      // Remove product from old category
      await Category.findByIdAndUpdate(
        product.categoryId,
        { $pull: { products: product._id } }
      );
      
      // Add product to new category
      await Category.findByIdAndUpdate(
        updates.categoryId,
        { $push: { products: product._id } }
      );
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
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field and order (e.g., price,-createdAt)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   description: Regular products with no active nearby purchases
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 nearbyProducts:
 *                   type: array
 *                   description: Products with active purchases nearby (within 2km)
 *                   items:
 *                     type: object
 *                     properties:
 *                       $ref: '#/components/schemas/Product'
 *                       purchaseDetails:
 *                         type: object
 *                         properties:
 *                           purchaseId:
 *                             type: string
 *                             description: ID of the purchase
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                             description: When the purchase was started
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                             description: When the purchase will expire
 *                           totalQuantity:
 *                             type: number
 *                             description: Total quantity goal for the purchase
 *                           committedQuantity:
 *                             type: number
 *                             description: Current quantity committed by customers
 *                           progress:
 *                             type: number
 *                             description: Progress percentage toward target quantity (0-100)
 *                           remainingQuantity:
 *                             type: number
 *                             description: How many more items needed to reach the goal
 *                           distance:
 *                             type: number
 *                             description: Distance in kilometers from the user
 *                           hasParticipated:
 *                             type: boolean
 *                             description: Whether current user has participated in this purchase
 */
export const getProducts = async (req, res, next) => {
  try {
    let query = Product.find();    // Base query conditions
    const baseConditions = {};

    // If customer, only show approved products
    if (!req.user || req.userType === "customer" || req.userType === "anonymous") {
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

    // For customers, separate products into normal products and nearby purchases
    if (req.user && req.userType === "customer" && req.user.coordinates) {
      // Get user coordinates
      const userCoords = [req.user.coordinates[0], req.user.coordinates[1]]; // [longitude, latitude]
      
      // Find all active purchases in the system
      const activePurchases = await Purchase.find({
        status: "Started" // Only get purchases that have been started but not completed
      }).populate("productId");
      
      // Filter purchases to those within 2km of the user
      const nearbyPurchasesList = activePurchases.filter(purchase => {
        const distance = haversineDistance(userCoords, purchase.userLocation);
        return distance <= 2; // 2km radius
      });
      
      // Get product IDs with nearby purchases
      const productsWithNearbyPurchases = new Set(nearbyPurchasesList.map(purchase => 
        purchase.productId._id.toString()
      ));
        // Separate products into normal and nearby with additional purchase details
      const normalProducts = [];
      const nearbyProducts = [];
      
      // Import necessary models
      const { CustomerPurchase } = await import("../../../database/models/customerPurchase.model.js");
      
      // For each product, check if it has nearby purchases and add purchase details
      for (const product of products) {
        if (productsWithNearbyPurchases.has(product._id.toString())) {
          // Find related nearby purchases for this product
          const productPurchases = nearbyPurchasesList.filter(purchase => 
            purchase.productId._id.toString() === product._id.toString()
          );
          
          // Enhance product with purchase details from the closest purchase
          const productWithPurchaseDetails = await Promise.all(productPurchases.map(async purchase => {
            // Calculate current committed quantity
            const customerPurchases = await CustomerPurchase.find({ 
              purchaseId: purchase._id,
              status: { $in: ["Pending", "Completed"] }
            });
            
            const committedQuantity = customerPurchases.reduce((total, cp) => total + cp.purchaseQuantity, 0);
            
            // Check if current user has already voted/participated in this purchase
            const hasUserParticipated = await CustomerPurchase.exists({
              purchaseId: purchase._id,
              customerId: req.user._id
            });
            
            // Calculate distance
            const distance = haversineDistance(userCoords, purchase.userLocation);
            
            // Create enhanced product object with purchase details
            return {
              ...product.toObject(),
              purchaseDetails: {
                purchaseId: purchase._id,
                startDate: purchase.startDate,
                endDate: purchase.endDate,
                totalQuantity: purchase.quantity,
                committedQuantity,
                progress: Math.round((committedQuantity / purchase.quantity) * 100),
                remainingQuantity: Math.max(0, purchase.quantity - committedQuantity),
                distance: parseFloat(distance.toFixed(2)),
                hasParticipated: !!hasUserParticipated
              }
            };
          }));
          
          // Sort by closest distance if multiple purchases are available
          productWithPurchaseDetails.sort((a, b) => 
            a.purchaseDetails.distance - b.purchaseDetails.distance
          );
          
          // Add to nearby products array (take the closest one only)
          nearbyProducts.push(productWithPurchaseDetails[0]);
        } else {
          normalProducts.push(product);
        }
      }
      
      res.status(200).json({
        message: "Products retrieved successfully",
        currentPage: apiFeatures.page,
        totalPages: Math.ceil(total / apiFeatures.limit),
        total,
        products: normalProducts,
        nearbyProducts
      });
    } else {
      // For non-customers or customers without coordinates, return all products normally
      res.status(200).json({
        message: "Products retrieved successfully",
        currentPage: apiFeatures.page,
        totalPages: Math.ceil(total / apiFeatures.limit),
        total,
        products,
        nearbyProducts: [] // Empty array for non-customers
      });
    }
  } catch (error) {
    next(error);
  }
};
// export const getProductsForUser = async (req, res, next) => {
//   try {
//     let query = Product.find();

//     const userCoords = [req.user.coordinates[0], req.user.coordinates[1]]; // [longitude, latitude]

//     const allPurchases = await Purchase.find().populate("productId");

//     const nearby = allPurchases.filter(p => {
//       const distance = haversineDistance(userCoords, p.userLocation);
//       return distance <= 2;
//     });

//     // Base query conditions
//     const baseConditions = {};

//     // If customer, only show approved products
//     if (!req.user || req.userType === "customer") {
//       baseConditions.isApproved = true;
//     }

//     // If supplier, only show their products
//     if (req.userType === "supplier") {
//       baseConditions.supplierId = req.user._id;
//     }

//     // Advanced search options
//     if (req.query.minPrice) {
//       baseConditions.price = { $gte: parseFloat(req.query.minPrice) };
//     }
//     if (req.query.maxPrice) {
//       baseConditions.price = {
//         ...baseConditions.price,
//         $lte: parseFloat(req.query.maxPrice),
//       };
//     }
//     if (req.query.category) {
//       baseConditions.categoryId = req.query.category;
//     }

//     query = Product.find(baseConditions);

//     // Apply API features
//     const apiFeatures = new ApiFeatures(query, req.query)
//       .pagination()
//       .filter()
//       .sort()
//       .search(["name"])
//       .select();

//     const products = await apiFeatures.query.populate([
//       { path: "supplierId", select: "fullName supplierRate" },
//       { path: "categoryId", select: "name" },
//     ]);

//     const total = await Product.countDocuments(baseConditions);

//     res.status(200).json({
//       message: "Products retrieved successfully",
//       currentPage: apiFeatures.page,
//       totalPages: Math.ceil(total / apiFeatures.limit),
//       total,
//       products,
//       nearby

//     });
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 nearbyPurchases:
 *                   type: array
 *                   description: For customers, shows nearby started purchases within 2km that they can vote on
 *                   items:
 *                     type: object
 *                     properties:
 *                       purchaseId:
 *                         type: string
 *                         description: ID of the purchase
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         description: When the purchase was started
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         description: When the purchase will expire
 *                       totalQuantity:
 *                         type: number
 *                         description: Total quantity goal for the purchase
 *                       committedQuantity:
 *                         type: number
 *                         description: Current quantity already committed by customers
 *                       progress:
 *                         type: number
 *                         description: Progress percentage toward target quantity (0-100)
 *                       remainingQuantity:
 *                         type: number
 *                         description: How many more items needed to reach the goal
 *                       distance:
 *                         type: number
 *                         description: Distance in kilometers from the user
 *                       hasVoted:
 *                         type: boolean
 *                         description: Whether the current user has already voted on this purchase
 *       404:
 *         description: Product not found
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
    }    let nearbyPurchases = null;

    // Check for nearby purchases if the user is a customer
    if (req.user && req.userType === "customer" && req.user.coordinates) {
      const userCoords = [req.user.coordinates[0], req.user.coordinates[1]]; // [longitude, latitude]
      
      // Find active purchases for this product
      const activePurchases = await Purchase.find({
        productId: id,
        status: "Started" // Only get purchases that have been started but not completed
      });      // Filter purchases within 2km of the user
      const nearbyPurchasesList = activePurchases.filter(purchase => {
        const distance = haversineDistance(userCoords, purchase.userLocation);
        return distance <= 2; // 2km radius
      });

      // Get customer purchase data for each nearby purchase
      const { CustomerPurchase } = await import("../../../database/models/customerPurchase.model.js");
      
      nearbyPurchases = await Promise.all(nearbyPurchasesList.map(async purchase => {
        // Calculate current committed quantity
        const customerPurchases = await CustomerPurchase.find({ 
          purchaseId: purchase._id,
          status: { $in: ["Pending", "Completed"] }
        });
        
        const committedQuantity = customerPurchases.reduce((total, cp) => total + cp.purchaseQuantity, 0);
          // Check if current user has already voted on this purchase
        const hasUserVoted = req.user ? await CustomerPurchase.exists({
          purchaseId: purchase._id,
          customerId: req.user._id
        }) : false;

        return {
          purchaseId: purchase._id,
          startDate: purchase.startDate,
          endDate: purchase.endDate,
          totalQuantity: purchase.quantity, // Target quantity
          committedQuantity, // Current committed quantity
          progress: Math.round((committedQuantity / purchase.quantity) * 100), // Progress percentage
          remainingQuantity: Math.max(0, purchase.quantity - committedQuantity),
          distance: parseFloat(haversineDistance(userCoords, purchase.userLocation).toFixed(2)),
          hasVoted: !!hasUserVoted
        };
      }));
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product,
      nearbyPurchases: nearbyPurchases || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or unauthorized
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
    if (product.imageSource && Array.isArray(product.imageSource)) {
      for (const imageUrl of product.imageSource) {
        try {
          const urlParts = imageUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `Bulkify/products/${product.supplierId}/${publicIdWithExtension.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Failed to delete image from cloudinary: ${error.message}`);
        }
      }
    }

    // Remove product from category's products array
    if (product.categoryId) {
      const { Category } = await import("../../../database/models/category.model.js");
      await Category.findByIdAndUpdate(
        product.categoryId,
        { $pull: { products: product._id } }
      );
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}/approve:
 *   patch:
 *     summary: Approve or reject a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 description: Approval status
 *     responses:
 *       200:
 *         description: Product approval status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
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

// Helper function - no need for Swagger documentation
export const deleteSupplierProducts = async (supplierId) => {
  try {
    // Find all products by this supplier
    const products = await Product.find({ supplierId });
    const { Category } = await import("../../../database/models/category.model.js");

    // Delete each product's images from cloudinary and remove from categories
    for (const product of products) {
      // Remove product from category's products array
      if (product.categoryId) {
        await Category.findByIdAndUpdate(
          product.categoryId,
          { $pull: { products: product._id } }
        );
      }

      // Delete images from cloudinary
      if (product.imageSource && product.imageSource.length > 0) {
        for (const imageUrl of product.imageSource) {
          try {
            // Extract the public ID from the URL
            const urlParts = imageUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `Bulkify/products/${supplierId}/${publicIdWithExtension.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error(`Failed to delete image from cloudinary: ${error.message}`);
          }
        }
      }
    }

    // Delete all products by this supplier
    const result = await Product.deleteMany({ supplierId });
    return result;
  } catch (error) {
    console.error(`Error deleting supplier products: ${error.message}`);
    throw error;
  }
};

/**
 * @swagger
 * /products/{id}/rate:
 *   post:
 *     summary: Rate a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *             properties:
 *               rate:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *     responses:
 *       200:
 *         description: Product rated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rating:
 *                   type: object
 *                 averageRating:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only rate purchased products
 *       404:
 *         description: Product not found
 */
export const rateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate, comment } = req.body;

    // Check if product exists and is approved
    const product = await Product.findOne({ _id: id, isApproved: true });
    if (!product) {
      throw throwError("Product not found", 404);
    }

    // Check if customer has purchased this product
    const { CustomerPurchase } = await import("../../../database/models/customerPurchase.model.js");
    const hasPurchased = await CustomerPurchase.findOne({
      customerId: req.user._id,
      productId: id,
      status: "Completed"
    });

    // For development purposes, temporarily allow rating without purchase
    // In production, uncomment this check
    /*
    if (!hasPurchased) {
      throw throwError("You can only rate products you have purchased", 403);
    }
    */

    // Check if customer has already rated this product
    const { ProductRate } = await import("../../../database/models/productRate.model.js");
    let productRate = await ProductRate.findOne({
      customerId: req.user._id,
      productId: id
    });

    if (productRate) {
      // Update existing rating
      productRate.rate = rate;
      if (comment !== undefined) productRate.comment = comment;
      productRate.timestamp = Date.now();
      await productRate.save();
    } else {
      // Create new rating
      productRate = await ProductRate.create({
        rate,
        comment,
        customerId: req.user._id,
        productId: id
      });

      // Add rating to product's productRates array
      await Product.findByIdAndUpdate(
        id,
        { $push: { productRates: productRate._id } }
      );

      // Add rating to customer's productRates array
      const { Customer } = await import("../../../database/models/customer.model.js");
      await Customer.findByIdAndUpdate(
        req.user._id,
        { $push: { productRates: productRate._id } }
      );
    }

    // Calculate average product rating
    const avgRating = await calculateProductAverageRating(id);

    res.status(200).json({
      message: "Product rated successfully",
      rating: productRate,
      averageRating: avgRating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}/ratings:
 *   get:
 *     summary: Get all ratings for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field and order (e.g., -createdAt)
 *     responses:
 *       200:
 *         description: Product ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 averageRating:
 *                   type: number
 *                 ratingsCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 ratings:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Product not found
 */
export const getProductRatings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw throwError("Product not found", 404);
    }

    // Get all ratings for this product
    const { ProductRate } = await import("../../../database/models/productRate.model.js");

    // Apply pagination and other API features
    let query = ProductRate.find({ productId: id });
    const apiFeatures = new ApiFeatures(query, req.query)
      .pagination()
      .sort()
      .select();

    const ratings = await apiFeatures.query.populate("customerId", "firstName lastName");

    // Get total count of ratings for pagination info
    const total = await ProductRate.countDocuments({ productId: id });

    // Calculate average rating
    const avgRating = await calculateProductAverageRating(id);

    res.status(200).json({
      message: "Product ratings retrieved successfully",
      averageRating: avgRating,
      ratingsCount: total,
      currentPage: apiFeatures.page,
      totalPages: Math.ceil(total / apiFeatures.limit),
      ratings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}/ratings/{ratingId}:
 *   delete:
 *     summary: Delete a product rating
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     responses:
 *       200:
 *         description: Product rating deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 averageRating:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product or rating not found
 */
export const deleteProductRating = async (req, res, next) => {
  try {
    const { id, ratingId } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw throwError("Product not found", 404);
    }

    // Check if rating exists and belongs to the customer
    const { ProductRate } = await import("../../../database/models/productRate.model.js");
    const rating = await ProductRate.findOne({
      _id: ratingId,
      productId: id,
      customerId: req.user._id
    });

    if (!rating) {
      throw throwError("Rating not found or not authorized to delete", 404);
    }

    // Remove rating from product's productRates array
    await Product.findByIdAndUpdate(
      id,
      { $pull: { productRates: ratingId } }
    );

    // Remove rating from customer's productRates array
    const { Customer } = await import("../../../database/models/customer.model.js");
    await Customer.findByIdAndUpdate(
      req.user._id,
      { $pull: { productRates: ratingId } }
    );

    // Delete the rating
    await rating.deleteOne();

    // Recalculate average product rating
    const avgRating = await calculateProductAverageRating(id);

    res.status(200).json({
      message: "Product rating deleted successfully",
      averageRating: avgRating
    });
  } catch (error) {
    next(error);
  }
};

// Helper function - no need for Swagger documentation
const calculateProductAverageRating = async (productId) => {
  const { ProductRate } = await import("../../../database/models/productRate.model.js");
  const ratings = await ProductRate.find({ productId });

  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((total, rating) => total + rating.rate, 0);
  return +(sum / ratings.length).toFixed(1); // Round to 1 decimal place
};
