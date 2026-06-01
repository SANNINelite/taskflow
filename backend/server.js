// 1) Handle Uncaught Exceptions (Before loading any other code)
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception. Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// 2) Connect database
connectDB();

// 3) Listen on Network Port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// 4) Handle Unhandled Promise Rejections (e.g. database disconnects unexpectedly)
process.on('unhandledRejection', (err) => {
  console.error('[CRITICAL] Unhandled Rejection. Shutting down gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
