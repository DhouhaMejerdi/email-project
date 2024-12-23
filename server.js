// Node.js backend
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');
const winston = require('winston');


const app = express();
app.use(express.json());
app.use(express.static('public'));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Utility to replace placeholders
function replacePlaceholders(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
}

// Endpoint to send email
app.post('/send-email', async (req, res) => {

  logger.info('Received email request:', req.body); // Logger incoming data from the frontend

  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    logger.error('Validation error: Missing required fields.');
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.error('Validation error: Invalid email format.');
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Load and replace placeholders in the MJML template
 try {
    const mjmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'email.mjml'), 'utf-8');
    const filledTemplate = replacePlaceholders(mjmlTemplate, { name, message });

    // Compile MJML to HTML
    const { html } = mjml(filledTemplate);

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'A Cool Email for You!',
      html
    });

    logger.info(`Email sent successfully to ${email}`);
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    logger.error('Error processing email:', error);
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// Start the server
app.listen(3000, () => {
  logger.info('Server is running on http://localhost:3000');
});
