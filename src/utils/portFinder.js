import net from "net";

export const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};
