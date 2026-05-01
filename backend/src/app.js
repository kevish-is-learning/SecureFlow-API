/**
 * Express app composition.
 * Responsible for registering middleware, routes, swagger, and error handlers.
 * Exported without calling listen() so it can be reused in tests.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SecureFlow API',
    data: {
      docs: '/api/docs',
      health: `${env.API_PREFIX}/health`,
      version: '1.0.0',
    },
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

app.use(env.API_PREFIX, apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
