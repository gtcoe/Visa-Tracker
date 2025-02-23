import express, { Request, Response } from "express";
import routerConfig from "../config/routesConfig";
import userAuthMiddleware from "../middleware/userAuthMiddleware";
import userRouter from "./user";
import applicationRouter from "./application";
import authRouter from "./auth";
import { app } from "../../myApp";

// Initialize middleware
const authMiddleware = userAuthMiddleware.init(app);

// Create a router instance
const routes = express.Router();

// Apply route configurations
routes.use(routerConfig.USER_ROUTE, authMiddleware.verifyToken, userRouter);
routes.use(routerConfig.APPLICATION_ROUTE, authMiddleware.verifyToken, applicationRouter);
routes.use(routerConfig.AUTH_ROUTE, authRouter);

// Handle 404 errors
routes.use((req: any, res: any) => {
  res.status(404).json({
    status: false,
    code: 404,
    message: "RESOURCE_NOT_FOUND",
  });
});

export default routes;
