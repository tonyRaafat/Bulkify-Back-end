import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI_ONLINE, {
      dbName: "Bulkify",
      serverSelectionTimeoutMS: 40000, // Increase timeout to 40 seconds
      socketTimeoutMS: 55000, // Increase socket timeout to 55 seconds
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      console.log("Attempting to reconnect to MongoDB...");

      setTimeout(async () => {
        try {
          await mongoose.disconnect();
          await mongoose.connect(process.env.MONGODB_URI_ONLINE, {
            dbName: "Bulkify",
            serverSelectionTimeoutMS: 300000,
            socketTimeoutMS: 450000,
            family: 4,
          });
          console.log("MongoDB reconnected successfully");
        } catch (reconnectError) {
          console.error("Failed to reconnect to MongoDB:", reconnectError);
        }
      }, 5000);
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
