/**
 * Process entrypoint. Boots the HTTP server and wires graceful shutdown so
 * Prisma/DB connections close cleanly on SIGINT / SIGTERM.
 */
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/prisma');

const server = app.listen(env.PORT, () => {
  logger.info(`SecureFlow API listening on :${env.PORT} (${env.NODE_ENV})`);
  logger.info(`Swagger UI: http://localhost:${env.PORT}/api/docs`);
});

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      logger.error('Error disconnecting Prisma', err);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  shutdown('uncaughtException');
});
