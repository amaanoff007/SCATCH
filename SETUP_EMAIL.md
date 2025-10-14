# Email Setup Instructions

## Overview
The application now includes email functionality for purchase confirmations and order cancellations, along with Redis caching for improved performance. Follow these steps to set up email notifications and Redis caching.

## Email Configuration

### 1. Gmail Setup (Recommended)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/scatch

# Session Secret
EXPRESS_SESSION_SECRET=your-session-secret-key-here

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Environment
NODE_ENV=development
```

## Redis Setup

### 1. Install Redis
**Windows:**
- Download Redis from https://github.com/microsoftarchive/redis/releases
- Install and start Redis service

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. Verify Redis Installation
```bash
redis-cli ping
# Should return: PONG
```

### 3. Redis Configuration
The application uses Redis for:
- **Session Storage**: Persistent sessions across server restarts
- **Product Caching**: Faster product loading
- **Cart Persistence**: Cart data survives browser refresh
- **Email Queue**: Reliable email delivery with retry logic

### 3. Alternative Email Services
You can modify `config/email-config.js` to use other email services:

#### SendGrid
```javascript
module.exports = {
  email: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  }
};
```

#### Outlook/Hotmail
```javascript
module.exports = {
  email: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
};
```

## Features Implemented

### 1. Buy Functionality
- **Buy Now Button**: Added to cart page
- **Order Processing**: Creates order record with unique order number
- **Cart Clearing**: Automatically clears cart after successful purchase
- **Email Notifications**: Sends confirmation emails to both user and owner

### 2. Order Management
- **Order History**: Users can view all their orders
- **Order Details**: Detailed view with items, prices, and status
- **Order Status**: Tracks confirmed, cancelled states

### 3. Cancellation System
- **24-Hour Window**: Orders can be cancelled within 24 hours
- **Automatic Deadline**: System automatically calculates cancellation deadline
- **Email Notifications**: Sends cancellation emails to both parties
- **Status Updates**: Updates order status to cancelled

### 4. Email Templates
- **User Purchase Confirmation**: Order details, items, total amount
- **Owner Notification**: Customer details, product sold, sale amount
- **Cancellation Emails**: Separate templates for user and owner
- **Professional Design**: HTML emails with proper styling

## Usage

### For Users
1. Add items to cart
2. Click "Buy Now" button
3. Confirm purchase
4. Check email for confirmation
5. View orders in "Orders" section
6. Cancel orders within 24 hours if needed

### For Owners
1. Receive email notifications when products are sold
2. Get notified when orders are cancelled
3. View customer details and sale information

## Testing Email Functionality

### 1. Test Purchase
1. Login as a user
2. Add items to cart
3. Click "Buy Now"
4. Check console for email sending logs
5. Verify emails are received

### 2. Test Cancellation
1. Go to Orders page
2. Click "Cancel Order" on a recent order
3. Confirm cancellation
4. Check emails for cancellation notifications

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail app password is correct
   - Check console for error messages

2. **Authentication failed**
   - Ensure 2FA is enabled on Gmail
   - Use app password, not regular password
   - Check if "Less secure app access" is enabled (if not using app password)

3. **Order not created**
   - Check database connection
   - Verify user is logged in
   - Check console for error messages

### Debug Mode
Enable debug logging by adding to your .env:
```env
DEBUG=email:*
```

## Future Enhancements

1. **Payment Integration**: Add real payment processing
2. **Inventory Management**: Track product stock
3. **Order Tracking**: Add shipping and delivery status
4. **Email Templates**: More sophisticated email designs
5. **SMS Notifications**: Add SMS support
6. **Kafka Integration**: Event-driven architecture for scalability

## Security Notes

1. **Never commit .env file**: Add to .gitignore
2. **Use environment variables**: Don't hardcode credentials
3. **App passwords**: Use app-specific passwords for email
4. **Rate limiting**: Consider adding rate limiting for email sending
5. **Email validation**: Validate email addresses before sending

## Support

If you encounter issues:
1. Check console logs for error messages
2. Verify email configuration
3. Test with a simple email first
4. Check network connectivity
5. Verify Gmail account settings
