import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI_ONLINE, {
      dbName: "Bulkify",
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
