// Node.js backend
const express = require('express');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Endpoint to send email
app.post('/send-email', async (req, res) => {

  console.log('Request Body:', req.body); // Log incoming data from the frontend

  const { name, email, message } = req.body;

  // Load and replace placeholders in the MJML template
  const mjmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'email.mjml'), 'utf-8');
  const filledTemplate = mjmlTemplate.replace('{{name}}', name).replace('{{message}}', message);

  console.log('this is mjmlTemplate: ',mjmlTemplate, 'this is filledTemplate: ',filledTemplate);

  // Compile MJML to HTML
  const { html } = mjml(filledTemplate);

  console.log('this is html', html);

  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dhouha.mejerdi.95@gmail.com',       
      pass: 'dwml qdfw miem xiuu'           // Use the generated App Password
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP connection successful:', success);
    }
  });

  console.log('this is transporter', transporter);

  // Send the email
  try {
    await transporter.sendMail({
      from: 'dhouha.mejerdi.95@gmail.com',
      to: email,
      subject: 'A Cool Email for You!',
      html
    });
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
