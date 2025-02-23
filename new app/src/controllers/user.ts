import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { logger } from "../logging";
import UserService from "../services/user";
import { generateError } from "../services/util";
import ResponseModel from "../models/response";

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public get = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const resp = await this.userService.get();

            if (req.params.id && resp.data) {
                resp.data = resp.data[0] || {};
                delete resp.total_pages;
            }

            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in get: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public fetchClients = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const resp = await this.userService.fetchClients();
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in fetchClients: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public addUser = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { name, email, status, type, user_id, password } = req.body;

            if (!name || !email || !status || !type || !user_id || !password) {
                response.message = "Missing required fields.";
                res.status(400).send(response);
                return;
            }

            const hashedPassword = bcrypt.hashSync(password, 12);
            const requestData = { name, email, status, type, last_updated_by: user_id, password: hashedPassword };

            const resp = await this.userService.addUser(requestData);
            response.setStatus(resp !== null);
            res.send(response);
        } catch (e) {
            logger.error(`Error in addUser: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public addClient = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { name, email, phone, status, user_id, type, superpass, address, poc } = req.body;

            if (!name || !email || !status || !user_id || !type) {
                response.message = "Missing required fields.";
                res.status(400).send(response);
                return;
            }

            const requestData = { name, email, phone, status, last_updated_by: user_id, type, superpass, address, poc };
            const resp = await this.userService.create(requestData);
            response.setStatus(resp !== null);
            res.send(response);
        } catch (e) {
            logger.error(`Error in addClient: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public updateStatus = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { user_id, id, status } = req.body;

            if (!user_id || !id || !status) {
                response.message = "Missing required fields.";
                res.status(400).send(response);
                return;
            }

            await this.userService.updateStatus({ last_updated_by: user_id, user_id: id, status });
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in updateStatus: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public search = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { text } = req.body;

            if (!text) {
                response.message = "Search text is required.";
                res.status(400).send(response);
                return;
            }

            await this.userService.search(text);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in search: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };
}

export default new UserController();
