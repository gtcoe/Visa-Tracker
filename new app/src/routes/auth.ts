import express, { Request, Response, NextFunction, Router } from "express";
import { verifySignUp } from "../middleware";
import controller from "../controllers/auth"; // Ensure controllers/auth exports an object
import { app } from "../../myApp";

// Middleware to set response headers
const setHeaders = (req: any, res: any, next: NextFunction): void => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
};

const authRouter: Router = express.Router();

// Apply headers middleware globally
app.use(setHeaders);

// Public Routes
authRouter.post("/signin", controller.signIn);
authRouter.post("/requestNewPassword", controller.requestNewPassword);

// Uncomment to enable signup functionality with validation
// authRouter.post("/signup", [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], controller.signUp);

export default authRouter;
