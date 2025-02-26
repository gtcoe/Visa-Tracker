import moment from "moment";
import bcrypt from "bcrypt";
import { Request, Response as ExpressResponse } from "express";

import constants from "../config/constants";
import { logger } from "../logging";
import Response from "../models/response";
import { generateError, generateRandomString } from "../services/util";
import userRepositoryFactory, {UserData} from "../repositories/user";

interface UserRequest {
  id?: string;
  email?: string;
  password?: string;
  password_valid_till?: string;
  status?: string;
  last_updated_by?: string;
  // Additional fields can be added as needed.
}

const userService = () => {
  const userRepository = userRepositoryFactory();

  /**
   * Retrieves a user by ID.
   * Sends an error response if the required parameter is missing.
   */
  const get = async (userId: number): Promise<Response | void> => {
    const response = new Response(false);
    try {

      if (!userId) {
        // If ID is missing, send an error response.
        response.setStatusCode(400)
        response.setMessage("User ID is required.");
        return;
      }
      const userInfo: UserData | null = await userRepository.getUserByID(userId);
      if (!userInfo) {
        response.setMessage("Invalid User ID");
        return response
      }
      response.setStatus(true);
      response.setData("user_info", userInfo);
      return response
    } catch (e) {
      logger.error(`error in userService.get - ${generateError(e)}`);
      throw e
    }
  };

  /**
   * Retrieves all clients.
   */
  const fetchClients = async (): Promise<any> => {
    try {
      return await userRepository.getUsersByType(constants.USER_TABLE.TYPE.CLIENT);
    } catch (e) {
      logger.error(`error in userService.fetchClients - ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Adds a new user after checking that the email does not already exist.
   * A random password is generated and encrypted.
   */
  const addUser = async (request: UserRequest, req: Request): Promise<any> => {
    try {
      const existingUser = await userRepository.getUserByEmail(request.email!);
      if (existingUser !== null) {
        return {
          status: false,
          message: "User with same email already exists.",
        };
      }

      // Generate a random password.
      const password = generateRandomString(12);
      // Use the provided password from request body if available, otherwise use generated one.
      request.password = bcrypt.hashSync(req.body.password || password, 15);
      request.password_valid_till = moment(new Date())
        .add(30, "days")
        .format("YYYY-MM-DD HH:mm:ss");

      // TODO: Send email with the randomly generated password.

      return await userRepository.insertUser(request);
    } catch (e) {
      logger.error(`error in userService.addUser - ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Updates a user's status and password.
   * If the user is being activated, a new password is generated.
   */
  const updateStatus = async (request: UserRequest): Promise<any> => {
    try {
      if (request.status === constants.STATUS.USER.ACTIVE) {
        request.password = generateRandomString(12);
        // TODO: Send email with the new password.
      }
      return await userRepository.updateStatusAndPassword(
        request.status!,
        request.password!,
        request.id!,
        request.last_updated_by!
      );
    } catch (e) {
      logger.error(`error in userService.updateStatus - ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Searches for users based on a provided text string.
   */
  const search = async (text: string): Promise<any> => {
    try {
      return await userRepository.search(text);
    } catch (e) {
      logger.error(`error in userService.search - ${generateError(e)}`);
      throw e;
    }
  };

  return {
    get,
    fetchClients,
    updateStatus,
    addUser,
    search,
  };
};

export default userService;
