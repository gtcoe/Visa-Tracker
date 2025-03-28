import { Request, Response } from "express";
import { logger } from "../logging";
import ClientService from "../services/client";
import { generateError } from "../services/util";
import ResponseModel from "../models/response";
import {
  AddClientRequest,
  convertRequestToAddClientRequest,
} from "../models/Client/addClientRequest";

const clientService = ClientService();

const ClientController = () => {
  const getAll = async (_: Request, res: Response): Promise<void> => {
    try {
      const resp = await clientService.getAll();
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in ClientController.get: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const create = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: AddClientRequest = convertRequestToAddClientRequest(
        req.body
      );

      const resp = await clientService.create(request);
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in create: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const getByType = async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      if (!type) {
        res.status(400).send({
          status: false,
          message: "Type is required as path parameter",
        });
        return;
      }
      const clientType = parseInt(type);
      
      const resp = await clientService.getClientsByType(clientType);
      res.send(resp);
    } catch (e) {
      const response = new ResponseModel(false);
      logger.error(`Error in ClientController.getByType: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  return {
    getAll,
    create,
    getByType,
  };
};

export default ClientController();
