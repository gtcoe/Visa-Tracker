import constants from "../config/constants";
import { logger } from "../logging";
import moment from "moment";
import { Request, Response } from "express";
import { generateError, generateRandomString } from "./util";
import {getApplicationByID, ApplicationData, createApplication} from "../repositories/application";
import formidable, { Fields, Files } from "formidable";

// Define interfaces for our application requests/responses if needed
interface ApplicationRequest {
  id?: string;
  status?: string;
  password?: string;
  last_updated_by?: string;
  email?: string;
  // add other fields as needed
}

interface DocumentUploadRequest {
  docLink: string;
  applicationId: string;
  agreementImage: any; // Ideally replace "any" with a more specific type
}

// Factory function to create an instance of applicationRepository

const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      // Handle missing ID error (e.g., throw a custom error or return a response)
      res.status(400).json({ message: "Missing application ID" });
      return;
    }
    // const application: ApplicationData | null = await getApplicationByID(id);
    // if (application) {
    //   resp.data = resp.data.length > 0 ? resp.data[0] : {};
    //   delete resp.total_pages;
    // }
    // res.json(resp);
  } catch (e) {
    logger.error(`error in applicationService.getById - ${generateError(e)}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (request: ApplicationRequest): Promise<any> => {
  try {
    // const resp = await createApplication(request);
    // if (resp !== null) {
    //   // You may want to handle the scenario if the response is not null
    // }
    // // Assuming requestData is the same as request or some transformation of it
    // return await insertapplication(request);
  } catch (e) {
    logger.error(`error in applicationService.create - ${generateError(e)}`);
    throw e;
  }
};

const addDetails = async (request: ApplicationRequest): Promise<any> => {
  try {
    // const existingApplication = await applicationRepository.create(request);
    // if (existingApplication !== null) {
    //   return {
    //     status: false,
    //     message: "application with same email already exists.",
    //   };
    // }
    // // Generate a random password and assign it
    // request.password = generateRandomString(12);
    // // TODO: Send email with password here
    // // Assuming requestData is the same as request or some transformation of it
    // return await applicationRepository.addDetails(request);
  } catch (e) {
    logger.error(`error in applicationService.addDetails - ${generateError(e)}`);
    throw e;
  }
};

const formidablePromise = (req: Request): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

const uploadDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { fields, files } = await formidablePromise(req);

    // Prepare requestData with unique keys
    // const requestData: DocumentUploadRequest = {
    //   docLink: req.body.docLink || "",
    //   applicationId: req.body.applicationId || "",
    //   agreementImage: files.agreementImage,
    // };

    // const result = await applicationRepository.updateDocuments(requestData, req.params.id);
    // res.json(result);
  } catch (e) {
    logger.error(`error in applicationService.uploadDocuments - ${generateError(e)}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStatus = async (request: ApplicationRequest): Promise<any> => {
  try {
    // if (request.status === constants.STATUS.application.ACTIVE) {
    //   request.password = generateRandomString(12);
    //   // TODO: Send email with the new password
    // }
    // return await applicationRepository.updateStatus(
    //   request.status as string,
    //   request.password as string,
    //   request.id as string,
    //   request.last_updated_by as string
    // );
  } catch (e) {
    logger.error(`error in applicationService.updateStatus - ${generateError(e)}`);
    throw e;
  }
};

const search = async (text: string): Promise<any> => {
  try {
    // return await applicationRepository.search(text);
  } catch (e) {
    logger.error(`error in applicationService.search - ${generateError(e)}`);
    throw e;
  }
};

export default {
  getById,
  updateStatus,
  uploadDocuments,
  create,
  search,
  addDetails,
};
