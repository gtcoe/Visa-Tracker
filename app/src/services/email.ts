import nodemailer from 'nodemailer';
import { logger } from "../logging";
import Response from "../models/response";
import { generateError } from "./util";
import { SendEmailRequest, EMAIL_TYPE } from "../models/Email/sendEmailRequest";
import constants from "../config/constants/constants";

// Create a nodemailer transporter
const createTransporter = () => {
  // In production, these would come from environment variables
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {

      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const emailService = () => {
  // Get email content based on email type
  const getEmailContent = (type: EMAIL_TYPE, data?: Record<string, any>) => {
    switch (type) {
      case constants.EMAIL_TYPE.WELCOME:
        return {
          subject: 'Welcome to Visa Tracker',
          html: `<h1>Welcome to Visa Tracker</h1>
                <p>Thank you for joining us. Your account has been created successfully.</p>
                <p>Your temporary password is: ${data?.password || 'Contact admin for password'}.</p>
                <p>Please change your password after first login.</p>`
        };
      
      case constants.EMAIL_TYPE.PASSWORD_RESET:
        return {
          subject: 'Password Reset Request',
          html: `<h1>Password Reset</h1>
                <p>Your password has been reset.</p>
                <p>Your new temporary password is: ${data?.password || 'Contact admin for password'}.</p>
                <p>Please change your password after login.</p>`
        };
      
      case constants.EMAIL_TYPE.APPLICATION_STATUS:
        return {
          subject: 'Application Status Update',
          html: `<h1>Application Status Update</h1>
                <p>Your application (${data?.referenceNo || 'Unknown'}) status has been updated to: ${data?.status || 'Unknown'}.</p>
                <p>Please login to your account to view more details.</p>`
        };
      
      case constants.EMAIL_TYPE.CHECKLIST:
        return {
          subject: data?.subject || 'Checklist Is Ready',
          html: data?.content || '<p>You will receive the checklist here soooooooooon!!!</p>'
        };
      
      default:
        return {
          subject: 'Notification from Visa Tracker',
          html: '<p>You have a new notification from Visa Tracker.</p>'
        };
    }
  };

  const sendEmail = async (request: SendEmailRequest): Promise<Response> => {
    const response = new Response(false);
    try {
      const transporter = createTransporter();
      
      // Get email content based on type
      const { subject, html } = getEmailContent(request.type, request.data);
      
      if (!request.emails || request.emails.length === 0) {
        response.setMessage('No email recipients provided');
        return response;
      }

      // Send emails to all recipients
      const results = [];
      for (const email of request.emails) {
        // Define email options
        const mailOptions = {
          from: process.env.SMTP_FROM || 'Visa Tracker <garvittyagicoe@gmail.com>',
          to: email,
          subject,
          html
        };
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        if (info) {
          logger.info(`Email sent successfully to ${email}. Message ID: ${info.messageId}`);
          results.push({
            email,
            messageId: info.messageId,
            status: 'sent'
          });
        } else {
          results.push({
            email,
            status: 'failed'
          });
        }
      }
      
      // Check if any emails were sent successfully
      if (results.length === 0 || results.every(r => r.status === 'failed')) {
        throw new Error('Failed to send all emails');
      }
      
      response.setStatus(true);
      response.setMessage('Emails sent successfully');
      response.setData('email_info', {
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        details: results
      });
      
      return response;
    } catch (e) {
      logger.error(`Error in emailService.sendEmail - ${generateError(e)}`);
      response.setMessage('Failed to send email(s)');
      return response;
    }
  };

  return {
    sendEmail
  };
};

export default emailService; 