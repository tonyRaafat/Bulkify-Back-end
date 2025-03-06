import express from "express";
import { initApp } from "./src/initApp.js";
import { findAvailablePort } from "./src/utils/portFinder.js";
// 
const app = express();
const startServer = async () => {
  try {
    const preferredPort = process.env.PORT || 3000;
    const availablePort = await findAvailablePort(preferredPort);

    if (preferredPort !== availablePort) {
      console.log(
        `Port ${preferredPort} was in use, using port ${availablePort} instead`
      );
    }

    initApp(app);

    app.listen(availablePort, () => {
      console.log(`Server is running on port ${availablePort}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
