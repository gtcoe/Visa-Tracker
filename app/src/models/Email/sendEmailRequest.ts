/**
 * Type definition for the email request
 */
export enum EMAIL_TYPE {
  WELCOME = 1,
  PASSWORD_RESET = 2,
  APPLICATION_STATUS = 3,
  NOTIFICATION = 4
}

export interface SendEmailRequest {
  email_id: string;
  type: EMAIL_TYPE;
  data?: Record<string, any>; // Optional data for email templates
}

/**
 * Convert the Express request to our SendEmailRequest model
 */
export const convertRequestToSendEmailRequest = (
  requestBody: any
): SendEmailRequest => {
  return {
    email_id: requestBody.email_id,
    type: requestBody.type,
    data: requestBody.data || {}
  };
}; 