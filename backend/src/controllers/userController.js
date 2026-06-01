const User = require('../models/userModel');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
};
