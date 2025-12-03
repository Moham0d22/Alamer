const express = require('express');
const path = require('path');
const multer = require('multer');
const { getAllProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Public product routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin-protected routes
router.use(protect);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;