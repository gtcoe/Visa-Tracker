import { Request, Response } from "express";
import { logger } from "../logging";
import ApplicationService from "../../../visa/app/services/application";
import { generateError } from "../../../visa/app/services/util";
import ResponseModel from "../models/response";

class ApplicationController {
    private applicationService: ApplicationService;

    constructor() {
        this.applicationService = new ApplicationService();
    }

    public getById = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            if (!req.params.id) {
                response.message = "Application ID is required.";
                res.status(400).send(response);
                return;
            }

            const resp = await this.applicationService.getById(req.params.id);
            response.setStatus(true);
            response.data = resp?.data?.[0] || {};
            res.send(response);
        } catch (e) {
            logger.error(`Error in getById: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };

    public create = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const requestData = {
                paxType: req.body.pax_type,
                countryOfResidence: req.body.country_of_residence,
                clientUserId: req.body.client_user_id,
                stateOfResidence: req.body.state_of_residence,
                citizenship: req.body.citizenship,
                service: req.body.service,
                referrer: req.body.referrer,
                fileNumber: req.body.file_number,
                updatedById: req.body.user_id
            };

            const resp = await this.applicationService.create(requestData);
            if (resp) {
                response.setStatus(true);
            } else {
                response.setStatus(false);
                response.setStatusCode(401);
            }
            res.send(response);
        } catch (e) {
            logger.error(`Error in create: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };

    public addDetails = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const requestData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status,
                lastUpdatedBy: req.body.application_id,
                type: req.body.type,
                superpass: req.body.superpass,
                address: req.body.address,
                poc: req.body.poc
            };

            const resp = await this.applicationService.addDetails(requestData);
            if (resp) {
                response.setStatus(true);
            } else {
                response.setStatus(false);
                response.setStatusCode(401);
            }
            res.send(response);
        } catch (e) {
            logger.error(`Error in addDetails: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };

    public updateStatus = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const data = {
                remarks: req.body.remarks,
                queue: req.body.queue,
                status: req.body.status,
            };

            await this.applicationService.updateStatus(data);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in updateStatus: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };

    public uploadDocuments = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const data = {
                remarks: req.body.remarks,
                queue: req.body.queue,
                status: req.body.status,
            };

            await this.applicationService.uploadDocuments(data);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in uploadDocuments: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };

    public search = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            if (!req.body.text) {
                response.message = "Search text is required.";
                res.status(400).send(response);
                return;
            }

            await this.applicationService.search(req.body.text);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in search: ${generateError(e)}`);
            response.message = e.message;
            res.status(500).send(response);
        }
    };
}

export default new ApplicationController();