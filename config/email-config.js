module.exports = {
  // Email configuration
  email: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  },
  
  // Default email settings
  defaultFrom: process.env.EMAIL_USER || 'your-email@gmail.com',
  
  // Email templates configuration
  templates: {
    // You can add more template configurations here
    baseUrl: process.env.BASE_URL || 'http://localhost:4000'
  }
};
