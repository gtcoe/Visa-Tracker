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

      case constants.EMAIL_TYPE.CREDENTIALS:
        return {
          subject: `Your Visaistic Portal Access Credentials`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #333;">Subject: Your Visaistic Portal Access Credentials</h2>
              
              <p>Dear ${data?.fullName || 'User'},</p>
              
              <p>Greetings from team Visaistic</p>
              
              <p>We are pleased to provide you with access to the<strong>Visaistic Portal</strong>. Please find your permanent login credentials below:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1e4c94; margin: 20px 0;">
                <p><strong>Portal URL</strong>: ${data?.URL || 'https://portal.visaistic.com'}</p>
                <p><strong>Username</strong>: ${data?.email || '{user@example.com}'}</p>
                <p><strong>Password</strong>: ${data?.password || '{UserPassword}'}</p>
              </div>
              
              <h3 style="color: #1e4c94;">For Your Security</h3>
              <ul style="padding-left: 20px;">
                <li>These are your permanent credentials - please store them securely</li>
                <li>Never share your password with anyone, including support staff</li>
                <li>Always verify you're on our official portal before logging in</li>
              </ul>
              
              <h3 style="color: #1e4c94;">Getting Started</h3>
              <p><strong>Step 1</strong>: Visit the portal using the link above</p>
              <p><strong>Step 2</strong>: Enter your username and password</p>
              <p><strong>Step 3</strong>: Explore the portal dashboard</p>
              
              <div style="margin-top: 30px;">
                <h3 style="color: #1e4c94;">Need Help?</h3>
                <p>Contact our support team:</p>
                <p>📧 support@visaistic.com</p>
                <p>(Mon-Saturday, 10AM-7PM [Time Zone])</p>
              </div>
              
              <p style="font-style: italic; color: #777; margin-top: 30px;">Note: This is an automated message. Please do not reply directly to this email.</p>
              
              <p>Warm regards,<br>The Visaistic Team</p>
            </div>
          `
        };

      case constants.EMAIL_TYPE.DOCUMENT_CHECKLIST:
        return {
          subject: `Visa Document Checklist for ${data?.nationality || '{NATIONALITY}'} Applicants - ${data?.country || '{COUNTRY}'} ${data?.category || '{CATEGORY}'} Visa`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #333;">Subject: Visa Document Checklist for ${data?.nationality || '{NATIONALITY}'} Applicants - ${data?.country || '{COUNTRY}'} ${data?.category || '{CATEGORY}'} Visa</h2>
              
              <p>Dear ${data?.recipientName || '{Recipient Name}'},</p>
              
              <p>We are pleased to provide you with the official document checklist for your upcoming ${data?.country || '{COUNTRY}'} ${data?.category || '{CATEGORY}'} visa application. This checklist has been specifically tailored for applicants of ${data?.nationality || '{NATIONALITY}'} nationality to ensure compliance with all current immigration requirements.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1e4c94; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e4c94;">Attachment:</h3>
                <p>${data?.country || '{COUNTRY}'}_${data?.category || '{CATEGORY}'}_Visa_Checklist_${data?.nationality || '{NATIONALITY}'}_${data?.date || '{YYYYMMDD}'}.pdf</p>
              </div>
              
              <p>Should you require any clarification regarding the documentation requirements or need assistance with your application, our visa specialists are available at ${data?.supportEmail || 'support@visaistic.com'} or ${data?.supportPhone || '[+support phone number]'} during regular business hours.</p>
              
              <p>Please note that this checklist reflects requirements as of ${data?.currentDate || '[current date]'} and is subject to change without prior notice. We recommend verifying all information with the relevant ${data?.country || '{COUNTRY}'} consular authority prior to submission.</p>
              
              <div style="margin-top: 30px;">
                <p>Should you require any clarification or assistance with your application, our visa specialists are available at:</p>
                <p>📧 <a href="mailto:support@visaistic.com" style="color: #1e4c94; text-decoration: none;">support@visaistic.com</a> | (Mon-Saturday, 10AM-7PM [Time Zone])</p>
              </div>
              
              <p>We appreciate your attention to these requirements and wish you success with your ${data?.country || '{COUNTRY}'} visa application.</p>
              
              <p>Warm regards,<br>The Visaistic Team</p>
            </div>
          `
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