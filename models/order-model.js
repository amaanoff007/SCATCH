const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  cancellationDeadline: {
    type: Date
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate unique order number and set cancellation deadline
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique order number
    if (!this.orderNumber) {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    }
    
    // Set cancellation deadline to 24 hours from now
    if (!this.cancellationDeadline) {
      this.cancellationDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
  next();
});

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return this.status === 'confirmed' && new Date() < this.cancellationDeadline;
};

module.exports = mongoose.model('Order', orderSchema);
