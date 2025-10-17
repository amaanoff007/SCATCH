const Queue = require('bull');
const { sendEmail } = require('./emailService');
const { redisClient } = require('../config/redis-config');

// Create email queue
const emailQueue = new Queue('email queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0
  }
});

class EmailQueueService {
  // Add email to queue
  static async addEmailToQueue(emailData) {
    try {
      const job = await emailQueue.add('send-email', {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        from: emailData.from,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date()
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 10,
        removeOnFail: 5
      });

      console.log(`📧 Email queued with job ID: ${job.id}`);
      return job.id;
    } catch (error) {
      console.error('Error adding email to queue:', error);
      return null;
    }
  }

  // Add purchase confirmation emails to queue
  static async queuePurchaseEmails(order, user, owner) {
    try {
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

      // Queue user confirmation email
      const userEmail = emailTemplates.userPurchaseConfirmation(order, user);
      await this.addEmailToQueue({
        to: user.email,
        subject: userEmail.subject,
        html: userEmail.html
      });

      // Queue owner notification email
      const ownerEmail = emailTemplates.ownerPurchaseNotification(order, user, owner);
      await this.addEmailToQueue({
        to: owner.email,
        subject: ownerEmail.subject,
        html: ownerEmail.html
      });

      console.log('✅ Purchase emails queued successfully');
      return true;
    } catch (error) {
      console.error('Error queuing purchase emails:', error);
      return false;
    }
  }

  // Add cancellation emails to queue
  static async queueCancellationEmails(order, user, owner) {
    try {
      const emailTemplates = {
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

      // Queue user cancellation email
      const userEmail = emailTemplates.userCancellationConfirmation(order, user);
      await this.addEmailToQueue({
        to: user.email,
        subject: userEmail.subject,
        html: userEmail.html
      });

      // Queue owner cancellation notification email
      const ownerEmail = emailTemplates.ownerCancellationNotification(order, user, owner);
      await this.addEmailToQueue({
        to: owner.email,
        subject: ownerEmail.subject,
        html: ownerEmail.html
      });

      console.log('✅ Cancellation emails queued successfully');
      return true;
    } catch (error) {
      console.error('Error queuing cancellation emails:', error);
      return false;
    }
  }

  // Process email queue
  static async processEmailQueue() {
    emailQueue.process('send-email', async (job) => {
      const { to, subject, html, from } = job.data;
      
      try {
        console.log(`📧 Processing email to ${to}...`);
        
        await sendEmail(to, subject, html);
        
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true, to, subject };
      } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        throw error; // This will trigger retry
      }
    });

    // Queue event handlers
    emailQueue.on('completed', (job, result) => {
      console.log(`✅ Email job ${job.id} completed:`, result);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`❌ Email job ${job.id} failed:`, err.message);
    });

    emailQueue.on('stalled', (job) => {
      console.warn(`⚠️ Email job ${job.id} stalled`);
    });

    console.log('🚀 Email queue processor started');
  }

  // Get queue statistics
  static async getQueueStats() {
    try {
      const waiting = await emailQueue.getWaiting();
      const active = await emailQueue.getActive();
      const completed = await emailQueue.getCompleted();
      const failed = await emailQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { waiting: 0, active: 0, completed: 0, failed: 0, total: 0 };
    }
  }

  // Pause queue
  static async pauseQueue() {
    try {
      await emailQueue.pause();
      console.log('⏸️ Email queue paused');
      return true;
    } catch (error) {
      console.error('Error pausing queue:', error);
      return false;
    }
  }

  // Resume queue
  static async resumeQueue() {
    try {
      await emailQueue.resume();
      console.log('▶️ Email queue resumed');
      return true;
    } catch (error) {
      console.error('Error resuming queue:', error);
      return false;
    }
  }

  // Clear queue
  static async clearQueue() {
    try {
      await emailQueue.empty();
      console.log('🗑️ Email queue cleared');
      return true;
    } catch (error) {
      console.error('Error clearing queue:', error);
      return false;
    }
  }

  // Get failed jobs
  static async getFailedJobs() {
    try {
      const failed = await emailQueue.getFailed();
      return failed;
    } catch (error) {
      console.error('Error getting failed jobs:', error);
      return [];
    }
  }

  // Retry failed job
  static async retryFailedJob(jobId) {
    try {
      const job = await emailQueue.getJob(jobId);
      if (job) {
        await job.retry();
        console.log(`🔄 Retrying failed job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error retrying failed job:', error);
      return false;
    }
  }
}

// Start processing emails when module is loaded
EmailQueueService.processEmailQueue();

module.exports = EmailQueueService;





