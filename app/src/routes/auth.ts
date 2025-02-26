import express, { Request, Response, NextFunction, Router } from "express";
import {signIn, requestNewPassword} from "../controllers/auth"; 
import { app } from "../app";

const setHeaders = (req: any, res: any, next: NextFunction): void => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
};

const authRouter: Router = express.Router();

// Apply headers middleware globally
app.use(setHeaders);

// Public Routes
authRouter.post("/signin", signIn);
authRouter.post("/requestNewPassword", requestNewPassword);

export default authRouter;
