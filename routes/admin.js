const express = require('express');
const router = express.Router();

// Example admin route
router.get('/', (req, res) => {
  res.send('Admin route is working');
});

module.exports = router;
