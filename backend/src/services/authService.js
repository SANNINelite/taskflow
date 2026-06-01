const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// Helper to sign JWT payload
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // 1) Prevent duplicate emails
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email address already in use', 400);
  }

  // 2) Save user in database (pre-save hashes password automatically)
  const newUser = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  // 3) Exclude password from the output
  newUser.password = undefined;

  // 4) Generate authentication JWT
  const token = signToken(newUser._id);

  return { token, user: newUser };
};

const loginUser = async (email, password) => {
  // 1) Verify user exists and fetch password explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // 2) Exclude password from return
  user.password = undefined;

  // 3) Generate authentication JWT
  const token = signToken(user._id);

  return { token, user };
};

module.exports = {
  registerUser,
  loginUser,
};
