import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db.js";
import app from "./app.js";
import validateEnv from "./utils/validateEnv.js";
import logger from "./utils/logger.js";

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});

validateEnv();

const PORT = process.env.PORT || 8080;

let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  });

function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, 'Error while closing HTTP server');
    }
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (closeErr) {
      logger.error({ err: closeErr }, 'Error closing MongoDB connection');
    }
    process.exit(err ? 1 : 0);
  });

  // Failsafe: force-exit if close() hangs (e.g. a stuck keep-alive connection)
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));