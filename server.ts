import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// @ts-ignore
import AfricasTalking from 'africastalking';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Send SMS notification using Africa's Talking
  app.post('/api/send-sms', async (req, res) => {
    const { to, message, credentials } = req.body;

    const username = (credentials?.atUsername || '').trim() || process.env.AT_USERNAME || 'sandbox';
    const apiKey = (credentials?.atApiKey || '').trim() || process.env.AT_API_KEY || 'atsk_60e40e7bc707cdb83f18accd452d3d088db5071581db8a3b2c955bc851de172625290db0';
    const senderId = (credentials?.atSenderId || '').trim() || process.env.AT_SENDER_ID; // optional

    if (!username || !apiKey) {
      console.warn('Africa\'s Talking credentials (AT_USERNAME, AT_API_KEY) are not fully configured.');
      return res.status(400).json({
        success: false,
        error: 'Africa\'s Talking credentials missing. Please configure AT_USERNAME and AT_API_KEY in either the System Administration panel or the AI Studio Secrets panel.',
        simulated: true
      });
    }

    try {
      console.log(`Attempting to send real SMS via Africa's Talking to ${to}...`);
      
      // Initialize Africa's Talking
      const at = AfricasTalking({
        apiKey: apiKey,
        username: username
      });

      const sms = at.SMS;
      
      // Ensure number is nicely formatted. Africa's Talking generally expects international format, e.g. +254...
      // Let's do a quick validation
      let formattedNumber = to.trim();
      if (!formattedNumber.startsWith('+')) {
        // Assume default +254 for Kenya if it starts with 0 or 7 and doesn't have + format
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '+254' + formattedNumber.substring(1);
        } else if (formattedNumber.startsWith('7') || formattedNumber.startsWith('1')) {
          formattedNumber = '+254' + formattedNumber;
        }
      }

      console.log(`Target phone formatted to: ${formattedNumber}`);

      const payload: any = {
        to: [formattedNumber],
        message: message,
      };

      if (senderId && senderId.trim() !== '') {
        payload.from = senderId.trim();
      }

      const response = await sms.send(payload);
      console.log('Africa\'s Talking SMS response:', JSON.stringify(response));

      // Extract details from Africa's Talking standard response format:
      // response.SMSMessageData.Recipients is an array containing status and details
      const recipients = response?.SMSMessageData?.Recipients || [];
      const primaryRecipient = recipients[0];
      const deliveryStatus = primaryRecipient?.status || 'Success';
      const messageId = primaryRecipient?.messageId || 'N/A';

      if (deliveryStatus === 'Failed' || deliveryStatus === 'Rejected') {
        throw new Error(primaryRecipient?.failureReason || 'Returned status Failed/Rejected');
      }

      return res.json({
        success: true,
        messageId: messageId,
        status: `Delivered via Africa's Talking (${deliveryStatus})`
      });
    } catch (error: any) {
      const isUnauthorized = 
        error.statusCode === 401 || 
        error.response?.status === 401 || 
        (error.message && error.message.includes('401')) ||
        (error.response?.data && JSON.stringify(error.response.data).includes('401'));

      if (isUnauthorized) {
        console.warn("⚠️ Africa's Talking API returned 401 Unauthorized. Stale credentials detected. Falling back to clean simulation.");
        return res.json({
          success: true,
          simulated: true,
          warning: "Unauthorized (401) - Inactive sandbox credentials. Feel free to supply a live AT Username and API Key in the System Administration panel.",
          status: "Simulated (Due to invalid Africa's Talking API key)"
        });
      }

      console.error('Error sending real SMS through Africa\'s Talking:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Africa\'s Talking transmission failed.'
      });
    }
  });

  // API Route: Send Email notification
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, body, html, credentials } = req.body;

    const smtpHost = (credentials?.smtpHost || '').trim() || process.env.SMTP_HOST;
    const smtpPortRaw = (credentials?.smtpPort || '').trim() || process.env.SMTP_PORT;
    const smtpUser = (credentials?.smtpUser || '').trim() || process.env.SMTP_USER;
    const smtpPass = (credentials?.smtpPass || '').trim() || process.env.SMTP_PASS;
    const smtpFrom = (credentials?.smtpFromEmail || '').trim() || process.env.SMTP_FROM_EMAIL || 'noreply@clinichub.org';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP email credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not fully configured.');
      return res.status(400).json({
        success: false,
        error: 'SMTP credentials missing. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in either the System Administration panel or your environment secrets.',
        simulated: true
      });
    }

    const smtpPort = smtpPortRaw ? parseInt(smtpPortRaw, 10) : 587;
    const secure = credentials?.smtpSecure !== undefined ? credentials.smtpSecure : (process.env.SMTP_SECURE === 'true' || smtpPort === 465);

    try {
      console.log(`Attempting to send real SMTP Email to ${to}...`);
      console.log({
        smtpHost,
        smtpPort,
        secure,
        smtpUser
      });
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: secure,
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.verify();
      console.log("SMTP verification successful");

      const mailOptions = {
        from: smtpFrom,
        to: to,
        subject: subject || 'Vaccination & Immunization Notice',
        text: body,
        html: html || undefined
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`SMTP Email sent successfully. Message ID: ${info.messageId}`);
      return res.json({
        success: true,
        messageId: info.messageId,
        status: 'Sent Successfully via SMTP'
      });
    } catch (error: any) {
      console.error('Error sending real email through Nodemailer SMTP:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'SMTP transmission failed.'
      });
    }
  });

  // Vite integration middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
});
