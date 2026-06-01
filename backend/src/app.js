const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Enable Cross-Origin Resource Sharing (CORS) with standard controls
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parser: Reading data from body into req.body (limited to 10kb to avoid huge payload DOS vectors)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 2) SWAGGER DOCUMENTATION setup
setupSwagger(app);

// 3) API ROUTES
// Version 1 Routing Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// Future Version 2 Routing Mount Placeholder (Satisfies API Versioning Scalability Requirement)
// app.use('/api/v2/auth', authRoutesV2);
// app.use('/api/v2/tasks', taskRoutesV2);

// Health check endpoint (for container or deployment platform health checks)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 4) 404 UNHANDLED ROUTE HANDLER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5) CENTRALIZED ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

module.exports = app;
