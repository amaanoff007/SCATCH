const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmail = async () => {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***hidden***' : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    
    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Scatch',
      html: '<h1>Test Email</h1><p>If you receive this, email is working correctly!</p>'
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Fix suggestions:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Update EMAIL_USER and EMAIL_PASS in .env file');
      console.log('4. Make sure there are no spaces in the app password');
    }
  }
};

testEmail();
