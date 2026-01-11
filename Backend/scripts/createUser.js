require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];

    if (!email || !password || !name) {
      console.log('Usage: node scripts/createUser.js <email> <password> <name>');
      process.exit(1);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists');
      process.exit(1);
    }

    const user = await User.create({ email, password, name });
    console.log('User created successfully:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createUser();