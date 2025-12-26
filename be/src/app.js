const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const path = require('path');

// Initialize app
const app = express();

// Enable CORS FIRST - before any other middleware
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cookie', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);


// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP (only in production)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message:
      'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút!',
  });
  app.use('/api', limiter);
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against XSS
app.use(xss());

// Compression middleware
app.use(compression());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// PayOS webhook routes (before /api middleware to avoid conflicts)
const orderController = require('./controllers/order.controller');

// Test route to verify webhook is accessible
app.post('/api/webhook/payos', orderController.handleWebhook);

// Actual webhook routes
// app.post('/api/webhook/payos', orderController.handleWebhook);
app.post('/api/webhooks/payos', orderController.handleWebhook);
app.post('/api/orders/HandleWebhook', orderController.handleWebhook);

// API routes
app.use('/api', routes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Không tìm thấy đường dẫn: ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
