const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const User = require('./models/User');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('Middleware initialized');

// Static files
app.use('/uploads', express.static('uploads'));
console.log('Serving static files from uploads directory');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
console.log('Routes initialized');

// Database connection (MongoDB Atlas via mongoose)
console.log('Attempting to connect to MongoDB Atlas via mongoose');
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ALAMER_DB',
  })
  .then(async () => {
    console.log('MongoDB Atlas connected (ALAMER_DB)');

    try {
      let admin = await User.findOne({ name: 'alamer', role: 'admin' });
      if (!admin) {
        console.log('Admin user not found, creating default admin user...');
        admin = new User({
          name: 'alamer',
          email: 'admin@alamer.com',
          password: 'alamer135@#$%',
          role: 'admin',
        });
        await admin.save();
        console.log('Default admin user created');
      } else {
        console.log('Admin user already exists');
      }
    } catch (err) {
      console.error('Error ensuring admin user exists:', err);
    }

    const PORT = process.env.PORT || 5000;
    console.log(`Server attempting to start on port ${PORT}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(`MongoDB connection error: ${err}`));