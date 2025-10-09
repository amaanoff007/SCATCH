const nodemailer = require('nodemailer');

// Test email service with console logging
const emailTemplates = {
  userPurchaseConfirmation: (order, user) => {
    return {
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmation</h2>
          <p>Dear ${user.fullname},</p>
          <p>Thank you for your purchase! Your order has been confirmed.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${order.orderDate.toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Items Purchased</h3>
            ${order.items.map(item => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <p><strong>${item.product.name}</strong></p>
                <p>Quantity: ${item.quantity} | Price: $${item.price}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Important:</strong> You can cancel this order within 24 hours of purchase.</p>
            <p>Deadline: ${order.cancellationDeadline.toLocaleString()}</p>
          </div>
          
          <p>Thank you for shopping with us!</p>
          <p>Best regards,<br>Scatch Team</p>
        </div>
      `
    };
  },

  ownerPurchaseNotification: (order, user, owner) => {
    return {
      subject: `New Sale - Product Purchased`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Sale Notification</h2>
          <p>Dear ${owner.fullname},</p>
          <p>Great news! Your product has been purchased.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Sale Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${user.fullname} (${user.email})</p>
            <p><strong>Purchase Date:</strong> ${order.orderDate.toLocaleDateString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Products Sold</h3>
            ${order.items.map(item => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <p><strong>${item.product.name}</strong></p>
                <p>Quantity: ${item.quantity} | Price: $${item.price}</p>
                <p>Total: $${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            `).join('')}
          </div>
          
          <p>Congratulations on your sale!</p>
          <p>Best regards,<br>Scatch Team</p>
        </div>
      `
    };
  }
};

// Console-only email service (for testing)
const sendPurchaseEmails = async (order, user, owner) => {
  try {
    console.log('\n=== EMAIL NOTIFICATION ===');
    console.log('📧 Purchase Confirmation Email:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Order Confirmation - ${order.orderNumber}`);
    console.log(`Order Total: $${order.totalAmount}`);
    console.log(`Items: ${order.items.length} products`);
    
    console.log('\n📧 Owner Notification Email:');
    console.log(`To: ${owner.email}`);
    console.log(`Subject: New Sale - Product Purchased`);
    console.log(`Customer: ${user.fullname} (${user.email})`);
    console.log(`Sale Amount: $${order.totalAmount}`);
    
    console.log('\n✅ Email notifications logged successfully!');
    console.log('=== END EMAIL NOTIFICATION ===\n');
    
    return true;
  } catch (error) {
    console.error('Error logging email notifications:', error);
    return false;
  }
};

const sendCancellationEmails = async (order, user, owner) => {
  try {
    console.log('\n=== CANCELLATION EMAIL NOTIFICATION ===');
    console.log('📧 Cancellation Confirmation Email:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Order Cancelled - ${order.orderNumber}`);
    console.log(`Refund Amount: $${order.totalAmount}`);
    
    console.log('\n📧 Owner Cancellation Notification Email:');
    console.log(`To: ${owner.email}`);
    console.log(`Subject: Order Cancelled - ${order.orderNumber}`);
    console.log(`Customer: ${user.fullname} (${user.email})`);
    
    console.log('\n✅ Cancellation email notifications logged successfully!');
    console.log('=== END CANCELLATION EMAIL NOTIFICATION ===\n');
    
    return true;
  } catch (error) {
    console.error('Error logging cancellation email notifications:', error);
    return false;
  }
};

module.exports = {
  sendPurchaseEmails,
  sendCancellationEmails
};
