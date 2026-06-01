const express = require('express');
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Only admin users can view the user list
router.get('/', authenticateJWT, authorizeRoles('admin'), userController.getAllUsers);

module.exports = router;
