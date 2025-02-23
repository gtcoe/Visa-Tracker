import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logger } from "../logging";
import AuthService from "../services/auth";
import { generateError } from "../services/util";
import ResponseModel from "../models/response";
import config from "../config/auth";

class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public signIn = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                response.message = "Email and password are required.";
                res.status(400).send(response);
                return;
            }

            const resp = await this.authService.signIn({ email, password });
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in signIn: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public requestNewPassword = async (req: any, res: any): Promise<void> => {
        const response = new ResponseModel(false);
        try {
            const { email } = req.body;

            if (!email) {
                response.message = "Email is required.";
                res.status(400).send(response);
                return;
            }

            const resp = await this.authService.requestNewPassword(email);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`Error in requestNewPassword: ${generateError(e)}`);
            response.message = "Internal Server Error";
            res.status(500).send(response);
        }
    };

    public static generateToken(userId: number): string {
        return jwt.sign({ id: userId }, config.jwtSecret, {
            algorithm: "HS256",
            expiresIn: "24h",
        });
    }
}

export default new AuthController();