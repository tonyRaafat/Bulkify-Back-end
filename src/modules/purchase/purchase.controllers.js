import { CustomerPurchase } from '../../../database/models/customerPurchase.model.js'
import { Product } from '../../../database/models/product.model.js'
import Purchase from '../../../database/models/purchase.model.js'

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



import path from "path";
import { createInvoice } from '../../services/invoice.js'

const invoicePath = path.join(process.cwd(), "invoices", "invoice.pdf"); // Save inside project



export const startPurchase = async (req, res, next) => {
  try {
    const { productId } = req.params
    const { purchaseQuantity, deliveryAddress } = req.body
    let userLocation = req.user.coordinates

    // console.log(userLocation)
    userLocation = [30.122437325911264, 31.248932655260525]
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Ensure userLocation is provided
    if (!userLocation || !userLocation || userLocation.length !== 2) {
      return res.status(400).json({ message: "Invalid user location" })
    }
    // Ensure quantity

    if (purchaseQuantity > product.bulkThreshold) {
      return res.status(400).json({ message: "You can not Purchase more than limit" })
    }
    if (purchaseQuantity == product.bulkThreshold) {
      // add here API of comlete the purchase 
    }


    // Find all purchases for the same product
    const purchases = await Purchase.find({ productId })

    for (let purchase of purchases) {
      const purchaseCoordinates = purchase.userLocation

      // Check if the user is within 5km of the purchase location
      if (haversineDistance(userLocation, purchaseCoordinates) <= 2) {
        return res.status(403).json({ message: "You are already in a purchase location or There is purchase not completed within 5km" })
      }
    }
    // Pay Money
    const invoice = {
      name: req.user.firstName + " " + req.user.lastName,
      items: [{
        title: product.name,
        price: product.price,
        quantity: purchaseQuantity,
        finalPrice: product.price,
        description: Product.description,
      }],
      totalPrice: (product.price * purchaseQuantity),
      paid: "0",
      city: deliveryAddress.city,
      street: deliveryAddress.street,
      homeNumber: deliveryAddress.homeNumber
    };
    createInvoice(invoice, "invoice.pdf");
    // await sendEmail(order.userId.email, "invoice", "", tempPath);

    const newPurchase = await Purchase.create({
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      quantity: product.bulkThreshold,
      status: "Started",
      productId,
      userLocation
    })

    await CustomerPurchase.create({
      purchaseId: newPurchase._id,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Pending",
      paymentMethod: "Cash" /// Will updated soon
    })

    // will reduce The stock when completed

    res.status(200).json({
      message: "Purchase started successfully",
      Data: {
        PurchaseId: newPurchase._id,
        ProductName: product.name,
        productsLeftToCompLete: newPurchase.quantity - purchaseQuantity
      }
    })

  } catch (error) {
    next(error)
  }
}

export const VoteForPurchase = async (req, res, next) => {
  try {
    const { productId, purchaseId } = req.params
    const { purchaseQuantity, deliveryAddress } = req.body
    let userLocation = req.user.coordinates
    // console.log(userLocation)
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const purchase = await Purchase.findById(purchaseId)
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" })
    }
    if (!userLocation || !userLocation || userLocation.length !== 2) {
      console.log(userLocation).coordinates
      return res.status(400).json({ message: "Invalid user location" })
    }
    const userCoordinates = userLocation
    const purchaseCoordinates = purchase.userLocation

    // Check if user is within 5km of the purchase location
    if (haversineDistance(userCoordinates, purchaseCoordinates) > 2) {
      return res.status(403).json({ message: "You are too far from the required area. Please get closer to vote. Or start new one" })
    }
    const pendingCount = await CustomerPurchase.countDocuments({ status: "Pending", purchaseId })

    if (purchaseQuantity + pendingCount == purchase.quantity) {
      // add here API of comlete the purchase

    }
    else if (purchaseQuantity + pendingCount > purchase.quantity) {
      return res.status(400).json({ message: "The Quantity more than valid" })
    }
    const invoice = {
      name: req.user.firstName + " " + req.user.lastName,
      items: [{
        title: product.name,
        price: product.price,
        quantity: purchaseQuantity,
        finalPrice: product.price,
        description: Product.description,
      }],
      totalPrice: (product.price * purchaseQuantity),
      paid: "0",
      city: deliveryAddress.city,
      street: deliveryAddress.street,
      homeNumber: deliveryAddress.homeNumber
    };
    createInvoice(invoice, "invoice.pdf");
    // await sendEmail(order.userId.email, "invoice", "", tempPath);

    // Vote Done
    await CustomerPurchase.create({
      purchaseId,
      customerId: req.user._id,
      productId,
      purchaseQuantity,
      status: "Pending",
      paymentMethod: "Cash" /// Will updated soon
    })

    return res.status(200).json({
      message: "Vote registered successfully",
      Data: {
        ProductName: product.name,
        productsPending: pendingCount + purchaseQuantity,
        productsLeft: purchase.quantity - pendingCount - purchaseQuantity
      }
    })
  } catch (error) {
    next(error)
  }
}
