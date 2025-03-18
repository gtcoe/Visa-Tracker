import { Request, Response } from "express";
import { logger } from "../logging";
import ApplicationService from "../services/application";
import { generateError, validateSearchParams } from "../services/util";
import ResponseModel from "../models/response";
import {
  AddStep1DataRequest,
  convertRequestToAddStep1DataRequest,
} from "../models/Application/addStep1DataRequest";
import {
  AddStep2DataRequest,
  convertRequestToAddStep2DataRequest,
} from "../models/Application/addStep2DataRequest";
import {
  AddStep4DataRequest,
  convertRequestToAddStep4DataRequest,
} from "../models/Application/addStep4DataRequest";

import {
  AddStep3DataRequest,
  convertRequestToAddStep3DataRequest,
} from "../models/Application/addStep3DataRequest";


import {
  SearchPaxRequest,
  convertRequestToSearchPaxRequestt,
} from "../models/Application/searchPax";
import {
  SearchRequest,
  convertRequestToSearchRequestt,
} from "../models/Application/tracker";
import {
  UpdateUserStatusRequest,
  convertRequestToUpdateUserStatusRequest,
} from "../models/User/updateUserStatusRequest";

const applicationService = ApplicationService();

const ApplicationController = () => {
  const addStep1Data = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: AddStep1DataRequest = convertRequestToAddStep1DataRequest(
        req.body
      );

      const resp = await applicationService.addStep1Data(request);
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in addStep1Data: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const addStep2Data = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: AddStep2DataRequest = convertRequestToAddStep2DataRequest(
        req.body
      );

      const resp = await applicationService.addStep2Data(request);
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in addStep2Data: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const searchPax = async (req: Request, res: Response): Promise<void> => {
    const response = new ResponseModel(false);
    try {
      const request: SearchPaxRequest = convertRequestToSearchPaxRequestt(
        req.body
      );

      // if (request.passport_number.length === 0 && request.pax_name.length === 0 && request.reference_number.length === 0) {
      //   response.message = "Search parameters missing";
      //   res.status(400).send(response);
      //   return;
      // }

      const filterAbsent: boolean = validateSearchParams(request);
      if (filterAbsent) {
        response.message = "Search parameters missing";
        res.status(400).send(response);
        return;
      }

      const resp = await applicationService.searchPax(request);
      res.send(resp);
    } catch (e: any) {
      logger.error(`Error in searchPax: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const addStep4Data = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: AddStep4DataRequest = convertRequestToAddStep4DataRequest(
        req.body
      );

      const resp = await applicationService.addStep4Data(request);
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in addStep4Data: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const search = async (req: Request, res: Response): Promise<void> => {
    const response = new ResponseModel(false);
    try {
      const request: SearchRequest = convertRequestToSearchRequestt(req.body);

      const filterAbsent: boolean = validateSearchParams(request);
      if (filterAbsent) {
        response.message = "Search parameters missing";
        res.status(400).send(response);
        return;
      }

      const resp = await applicationService.search(request);
      res.send(resp);
    } catch (e: any) {
      logger.error(`Error in search: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  const addStep3Data = async (req: Request, res: Response): Promise<void> => {
    try {
        const request: AddStep3DataRequest = convertRequestToAddStep3DataRequest(
          req.body
        );
        
        // Add token_user_id to the request
        request.token_user_id = (req as any).token_user_id;

      const resp = await applicationService.addStep3Data(request);
      
      res.send(resp);
    } catch (e: any) {
      const response = new ResponseModel(false);
      logger.error(`Error in addStep3Data: ${generateError(e)}`);
      response.message = "Internal Server Error";
      res.status(500).send(response);
    }
  };

  return {
    addStep1Data,
    addStep2Data,
    searchPax,
    addStep4Data,
    search,
    addStep3Data,
  };
};

export default ApplicationController();
