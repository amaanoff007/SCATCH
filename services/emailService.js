const nodemailer = require('nodemailer');
const emailConfig = require('../config/email-config');

// Create transporter
const transporter = nodemailer.createTransport(emailConfig.email);


// Email templates
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
  },

  userCancellationConfirmation: (order, user) => {
    return {
      subject: `Order Cancelled - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Order Cancelled</h2>
          <p>Dear ${user.fullname},</p>
          <p>Your order has been successfully cancelled.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Cancelled On:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Refund Amount:</strong> $${order.totalAmount}</p>
          </div>
          
          <p>Your refund will be processed within 3-5 business days.</p>
          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>Scatch Team</p>
        </div>
      `
    };
  },

  ownerCancellationNotification: (order, user, owner) => {
    return {
      subject: `Order Cancelled - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Order Cancelled</h2>
          <p>Dear ${owner.fullname},</p>
          <p>An order containing your product has been cancelled.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${user.fullname} (${user.email})</p>
            <p><strong>Cancelled On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Best regards,<br>Scatch Team</p>
        </div>
      `
    };
  }
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: emailConfig.defaultFrom,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send purchase confirmation emails
const sendPurchaseEmails = async (order, user, owner) => {
  try {
    // Send confirmation to user
    const userEmail = emailTemplates.userPurchaseConfirmation(order, user);
    await sendEmail(user.email, userEmail.subject, userEmail.html);

    // Send notification to owner
    const ownerEmail = emailTemplates.ownerPurchaseNotification(order, user, owner);
    await sendEmail(owner.email, ownerEmail.subject, ownerEmail.html);

    console.log('Purchase emails sent successfully');
  } catch (error) {
    console.error('Error sending purchase emails:', error);
    throw error;
  }
};

// Send cancellation emails
const sendCancellationEmails = async (order, user, owner) => {
  try {
    // Send confirmation to user
    const userEmail = emailTemplates.userCancellationConfirmation(order, user);
    await sendEmail(user.email, userEmail.subject, userEmail.html);

    // Send notification to owner
    const ownerEmail = emailTemplates.ownerCancellationNotification(order, user, owner);
    await sendEmail(owner.email, ownerEmail.subject, ownerEmail.html);

    console.log('Cancellation emails sent successfully');
  } catch (error) {
    console.error('Error sending cancellation emails:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendPurchaseEmails,
  sendCancellationEmails
};
