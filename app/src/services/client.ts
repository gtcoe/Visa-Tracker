import moment from "moment";
import bcrypt from "bcrypt";

import constants from "../config/constants/constants";
import { logger } from "../logging";
import Response from "../models/response";
import { generateError, generateRandomString } from "./util";
import ClientRepository, {
  GetClientDataDBResponse,
} from "../repositories/client";
import UserRepository, {
  GetUserDataDBResponse,
} from "../repositories/user";
import { AddClientRequest } from "../models/Client/addClientRequest";
import { AddUserRequest } from "../models/User/addUserRequest";

const clientService = () => {
  const clientRepository = ClientRepository();
  const userRepository = UserRepository();

  //Done
  const getAll = async (): Promise<Response | void> => {
    const response = new Response(false);
    try {
      const clientResponse: GetClientDataDBResponse = await clientRepository.getAll();

      // Error Fetching userInfo
      if (!clientResponse || !clientResponse.status) {
        throw new Error("unable to fetch user info");
      }

      response.setStatus(true);
      response.setData("clients_info", clientResponse.data);
      return response;
    } catch (e) {
      logger.error(`error in clientService.get - ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const create = async (request: AddClientRequest): Promise<any> => {
    const response = new Response(false);
    try {
      // Fetch user info using email
      const userResponse: GetUserDataDBResponse | null =
        await userRepository.getUserByEmail(request.owner_email);

      // Error Fetching userInfo
      if (!userResponse || !userResponse.status) {
        throw new Error("Unable to fetch client info");
      }

      // User with this email already exists
      if ((userResponse?.data || []).length > 0) {
        response.setMessage("Client with same email already exists.");
        return response;
      }

      let userRequest: AddUserRequest = {
        name: request.full_name,
        email: request.owner_email,
        status: constants.STATUS.USER.ACTIVE,
        type: constants.USER_TABLE.TYPE.CLIENT,
        last_updated_by: request.last_updated_by,
      }

      // Generate a random password.
      const password = generateRandomString(12);
      userRequest.password = bcrypt.hashSync(password, 15);
      userRequest.password_valid_till = moment(new Date())
        .add(30, "days")
        .format("YYYY-MM-DD HH:mm:ss");

      // TODO: Send email with the randomly generated password.

      // Create User
      let resp: any = await userRepository.insertUser(
        userRequest
      );
      if (!resp.status) {
        throw new Error("Unable to create user");
      }

      request.user_id = resp.data.insertId

      // Create Client
      resp = await clientRepository.insert(
        request
      );
      if (!resp.status) {
        throw new Error("Unable to create client");
      }

      response.setStatus(true);
      response.setMessage("Client created successfully.");
      return response;
    } catch (e) {
      logger.error(`error in clientService.create - ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Get clients by client type
   * @param clientType The type of client to filter by (1=Corporate, 2=Agent, 3=Walk-in)
   * @returns List of clients of the specified type
   */
  const getClientsByType = async (clientType: number) => {
    const response = new Response(false);
    try {
      const clientResponse = await clientRepository.getClientsByType(clientType);
        // Error Fetching userInfo
      if (!clientResponse || !clientResponse.status) {
        throw new Error("unable to fetch user info");
      }
      response.setStatus(true);
      response.setData("clients_info", clientResponse.data);
    } catch (error) {
      console.error("Error in getClientsByType service:", error);
      throw error;
    }
  };

  return {
    getAll,
    create,
    getClientsByType,
  };
};

export default clientService;
