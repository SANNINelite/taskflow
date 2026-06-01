const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  next();
};

const validateMongoId = (fieldName) => {
  return param(fieldName)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid identifier format for ${fieldName}`);
};

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Task title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be either pending, in-progress, or completed'),
  validateResult,
];

const updateTaskValidator = [
  validateMongoId('id'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Task title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be either pending, in-progress, or completed'),
  validateResult,
];

const taskIdValidator = [
  validateMongoId('id'),
  validateResult,
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
};
