const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const user = await User.findOne({ name: username, role: 'admin' });

    if (!user) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const isCorrect = await user.correctPassword(password, user.password);

    if (!isCorrect) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// One-time route to seed admin user in DB
router.post('/seed-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ name: 'alamer', role: 'admin' });
    if (existing) {
      return res.json({ success: true, message: 'Admin user already exists', userId: existing._id });
    }

    const admin = new User({
      name: 'alamer',
      email: 'admin@alamer.com',
      password: 'alamer135@#$%',
      role: 'admin'
    });

    await admin.save();

    res.json({ success: true, message: 'Admin user created', userId: admin._id });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ success: false, message: 'فشل إنشاء مستخدم الأدمن' });
  }
});

module.exports = router;
