const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;
    
    const order = new Order({
      user: req.userId,
      items,
      shippingAddress,
      totalAmount
    });
    
    await order.save();
    await order.populate('items.product');
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// إنشاء طلب لعميل ضيف بدون تسجيل دخول
exports.createPublicOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, total, payment } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'سلة التسوق فارغة' });
    }

    const mappedItems = items.map((item) => ({
      product: item.id,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
    }));

    const order = new Order({
      items: mappedItems,
      totalAmount: Number(total) || 0,
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shipping) || 0,
      shippingAddress: {
        street: customer?.address || '',
        city: customer?.city || '',
        country: 'Egypt',
      },
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      customerEmail: customer?.email || '',
      paymentMethod: payment || 'cash',
    });

    await order.save();
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'غير مصرح' });
    }

    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'غير مصرح' });
    }

    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const aggregate = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = aggregate[0]?.revenue || 0;
    const totalProducts = await Product.countDocuments({ active: true });

    res.json({
      success: true,
      data: {
        totalOrders,
        paidOrders,
        totalRevenue,
        totalProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};