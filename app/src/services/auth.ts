import { Request, Response as ExpressResponse } from 'express';
import moment from 'moment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { logger } from '../logging';
import authConfig from '../config/auth';
import constants from '../config/constants';
import { generateError, generateRandomString } from '../services/util';
import Response from '../models/response';
import userRepositoryFactory, {UserData} from '../repositories/user';

interface SignInRequest {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  password: string;
  type: string;
  status: string;
  password_requested?: string;
  password_valid_till: string;
  // add other properties as needed
}

const authService = () => {
  const userRepository = userRepositoryFactory();

  /**
   * Handles sign in functionality.
   * Validates user credentials, checks status, and returns a token if successful.
   */
  const signIn = async (request: SignInRequest): Promise<Response> => {
    const response = new Response(false);

    try {
      // Fetch user info using email
      const userInfo: UserData | null = await userRepository.getUserByEmail(request.email);

      // Email not found
      if (!userInfo) {
        response.setStatusCode(400)
        response.setMessage(constants.SIGN_IN_STATUS_MESSAGE.EMAIL_NOT_FOUND)
        response.setData("type", constants.SIGN_IN_STATUS_TYPE.EMAIL_NOT_FOUND)
        return response;
      }

      // Validate password
      const passwordIsValid = bcrypt.compareSync(request.password, userInfo.password);
      if (!passwordIsValid) {
        response.setStatusCode(401)
        response.setMessage(constants.SIGN_IN_STATUS_MESSAGE.INCORRECT_PASSWORD)
        response.setData("type", constants.SIGN_IN_STATUS_TYPE.INCORRECT_PASSWORD)
        return response;
      }

      // Additional checks if the user is a CLIENT
      if (userInfo.type === constants.USER_TABLE.TYPE.CLIENT) {
        if (userInfo.status === constants.STATUS.USER.INACTIVE) {
          // Check if a new password has already been requested
          if (userInfo.password_requested === constants.USER_TABLE.PASSWORD_REQUESTED.YES) {
            response.setStatusCode(400)
            response.setMessage(constants.SIGN_IN_STATUS_MESSAGE.EXPIRED_REQUEST_INITIATED)
            response.setData("type", constants.SIGN_IN_STATUS_TYPE.EXPIRED_REQUEST_INITIATED)

          } else {
            // Disabled by admin
            response.setStatusCode(400)
            response.setMessage(constants.SIGN_IN_STATUS_MESSAGE.INACTIVE_BY_ADMIN)
            response.setData("type", constants.SIGN_IN_STATUS_TYPE.INACTIVE_BY_ADMIN)
          }
          return response;
        }

        // Check if the password is expired
        const currentTime = moment();
        if (currentTime.isAfter(moment(userInfo.password_valid_till))) {
          response.setStatusCode(400)
          response.setMessage(constants.SIGN_IN_STATUS_MESSAGE.EXPIRED_REQUEST_NOT_INITIATED)
          response.setData("type", constants.SIGN_IN_STATUS_TYPE.EXPIRED_REQUEST_NOT_INITIATED)
          return response;
        }
      }

      // Generate JWT token on successful authentication
      const token = jwt.sign(
        { user_id: userInfo.id },
        authConfig.jwtSecret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 60 * 60 * 24 * 30, // 30 Days
        }
      );

      // Update last successful login timestamp
      await userRepository.updateAfterSuccessfulLogin(userInfo.id);
      response.setStatus(true);
      response.setData("token", token);
      response.setData("type", constants.SIGN_IN_STATUS_TYPE.SUCCESS);
      return response;
    } catch (e) {
      logger.error(`Error in authService.signIn ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Handles password reset requests.
   * Validates the email and checks if password is expired, then updates with a new password.
   */
  const requestNewPassword = async (email: string, req: Request): Promise<Response> => {
    const response = new Response(false);

    try {
      // Fetch user info using email
      const userInfo: UserData | null = await userRepository.getUserByEmail(email);
      if (!userInfo) {
        response.setMessage(`Email provided is not mapped to any user.`);
        response.setStatusCode(401);
        return response;
      }

      const currentTime = moment();
      if (currentTime.isBefore(moment(userInfo.password_valid_till))) {
        response.setMessage(`Email provided is not mapped to any user.`);
        response.setStatusCode(401);
        return response;
      }

      // Generate new password and encrypt it
      const password = generateRandomString(12);
      const encryptedPassword = bcrypt.hashSync(password, 15);
      const passwordValidTill = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss');

      // TODO: Send password via email

      // Update user status and password in the repository
      await userRepository.updateStatusAndPassword(
        constants.STATUS.USER.ACTIVE,
        encryptedPassword,
        userInfo.id ,
        0,
        passwordValidTill
      );

      response.setStatus(true);
      response.setMessage("New password sent on email.");
      return response;
    } catch (e) {
      logger.error(`Error in authService.requestNewPassword ${generateError(e)}`);
      throw e;
    }
  };

  return {
    signIn,
    requestNewPassword,
  };
};

export default authService;
