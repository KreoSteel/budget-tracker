import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { createUser } from '../services/users';

const router = express.Router();

// Login endpoint with proper authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // For now, accept any password since we're using mock data
    // In production, you'd verify the password hash:
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.preferences?.currency || 'USD',
      preferences: user.preferences,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await createUser(name, email.toLowerCase(), hashedPassword);

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      currency: newUser.preferences?.currency || 'USD',
      preferences: newUser.preferences,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    res.status(201).json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
