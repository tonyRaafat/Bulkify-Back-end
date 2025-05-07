/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - quantity
 *         - bulkThreshold
 *         - categoryId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         quantity:
 *           type: number
 *           description: Available quantity
 *         bulkThreshold:
 *           type: number
 *           description: Minimum quantity required for bulk purchase
 *         imageSource:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product image URLs
 *         supplierId:
 *           type: string
 *           description: ID of supplier who created the product
 *         categoryId:
 *           type: string
 *           description: Product category ID
 *         isApproved:
 *           type: boolean
 *           description: Whether the product has been approved by admin
 *         averageRating:
 *           type: number
 *           description: Average product rating
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         createdBy:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: string
 *
 *     Customer:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - birthDate
 *         - gender
 *         - city
 *         - street
 *         - homeNumber
 *         - coordinates
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         firstName:
 *           type: string
 *           description: Customer's first name
 *         lastName:
 *           type: string
 *           description: Customer's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email address (unique)
 *         password:
 *           type: string
 *           format: password
 *           description: Customer's password (hashed, not returned in responses)
 *         phoneNumber:
 *           type: string
 *           description: Customer's phone number
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Customer's birth date (MM-DD-YYYY)
 *         gender:
 *           type: string
 *           enum: [Male, Female]
 *           description: Customer's gender
 *         isVerified:
 *           type: boolean
 *           description: Whether the customer's email has been verified
 *           default: false
 *         city:
 *           type: string
 *           description: Customer's city
 *         street:
 *           type: string
 *           description: Customer's street
 *         homeNumber:
 *           type: string
 *           description: Customer's home or building number
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           description: Longitude and latitude coordinates
 *           example: [31.2357, 30.0444]
 *         customerPurchases:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of customer purchase IDs
 *         productRates:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product rating IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Account last update timestamp
 *     
 *     CustomerPurchase:
 *       type: object
 *       required:
 *         - purchaseId
 *         - customerId
 *         - productId
 *         - purchaseQuantity
 *         - status
 *         - paymentMethod
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         purchaseId:
 *           type: string
 *           description: Reference to the bulk purchase
 *         customerId:
 *           type: string
 *           description: Reference to the customer
 *         productId:
 *           type: string
 *           description: Reference to the product
 *         purchaseQuantity:
 *           type: number
 *           description: Quantity being purchased
 *         status:
 *           type: string
 *           enum: [Pending, Completed, Cancelled, Waiting payment]
 *           description: Status of the purchase
 *         paymentMethod:
 *           type: string
 *           enum: [Credit Card, Cash, Paypal]
 *           description: Payment method used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Purchase creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Purchase last update timestamp
 *
 *     ProductRate:
 *       type: object
 *       required:
 *         - rate
 *         - customerId
 *         - productId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         rate:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value (1-5)
 *         comment:
 *           type: string
 *           description: Optional review comment
 *         customerId:
 *           type: string
 *           description: Reference to the customer who left the rating
 *         productId:
 *           type: string
 *           description: Reference to the rated product
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the rating was created or updated
 *
 *     Supplier:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         commercialRegister:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         supplierRate:
 *           type: number
 *         supplierAddress:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             street:
 *               type: string
 *             homeNumber:
 *               type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */