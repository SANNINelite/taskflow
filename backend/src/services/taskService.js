const Task = require('../models/taskModel');
const AppError = require('../utils/appError');

const createTask = async (taskData, userId) => {
  const task = await Task.create({
    ...taskData,
    createdBy: userId,
  });
  return task;
};

const getAllTasks = async (userRole, userId) => {
  // Admins can see all tasks, standard users see only their own
  const query = userRole === 'admin' ? {} : { createdBy: userId };
  
  return await Task.find(query)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });
};

const getTaskById = async (taskId, userRole, userId) => {
  const task = await Task.findById(taskId).populate('createdBy', 'name email role');
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Enforce access control rules: Owner or Admin only
  if (userRole !== 'admin' && task.createdBy._id.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this task', 403);
  }

  return task;
};

const updateTask = async (taskId, updateData, userRole, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Enforce access control rules: Owner or Admin only
  if (userRole !== 'admin' && task.createdBy.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to modify this task', 403);
  }

  // Allow updating only safe fields
  const allowedUpdates = ['title', 'description', 'status'];
  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  await task.save();
  return await task.populate('createdBy', 'name email role');
};

const deleteTask = async (taskId, userRole, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Enforce access control rules: Owner or Admin only
  if (userRole !== 'admin' && task.createdBy.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this task', 403);
  }

  await Task.findByIdAndDelete(taskId);
  return task;
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
