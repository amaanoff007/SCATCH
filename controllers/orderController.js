const Order = require('../models/order-model');
const Product = require('../models/product-model');
const userModel = require('../models/user-model');
const ownerModel = require('../models/owner-models');
const EmailQueueService = require('../services/emailQueueService');
const DatabaseCartService = require('../services/databaseCartService');
const ProductCacheService = require('../services/productCacheService');

// Ensure User model is registered for population
const User = require('../models/user-model');

// Process purchase from cart
const processPurchase = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get cart from database
    const cartItems = await DatabaseCartService.getCart(userId);
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const itemTotal = parseFloat(cartItem.productPrice) * parseInt(cartItem.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        product: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.productPrice
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount
    });

    await order.save();

    // Clear the cart after successful purchase
    await DatabaseCartService.clearCart(userId);

    // Populate order with product details for email
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user');

    // Get owner details for the first product (assuming all products are from same owner for simplicity)
    // In a real scenario, you might want to handle multiple owners
    const firstProduct = await Product.findById(orderItems[0].product).populate('owner');
    const owner = firstProduct.owner;

    // Queue emails for sending
    try {
      await EmailQueueService.queuePurchaseEmails(populatedOrder, req.user, owner);
    } catch (emailError) {
      console.error('Email queuing failed:', emailError);
      // Don't fail the order if email queuing fails
    }

    // Cart is already cleared above using Redis

    res.json({ 
      success: true, 
      message: 'Purchase successful! Check your email for confirmation.',
      orderNumber: order.orderNumber 
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Error processing purchase' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ orderDate: -1 });

    res.render('orders', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error loading orders');
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('user');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled. 24-hour deadline has passed.' 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Get owner details
    const firstProduct = await Product.findById(order.items[0].product).populate('owner');
    const owner = firstProduct.owner;

    // Queue cancellation emails
    try {
      await EmailQueueService.queueCancellationEmails(order, order.user, owner);
    } catch (emailError) {
      console.error('Email queuing failed:', emailError);
      // Don't fail the cancellation if email queuing fails
    }

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully. Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Error cancelling order' });
  }
};

// Get order details (for AJAX calls)
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('user');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Error fetching order details' });
  }
};

module.exports = {
  processPurchase,
  getUserOrders,
  cancelOrder,
  getOrderDetails
};
