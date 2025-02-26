import express, { Request, Response } from "express";
import routerConfig from "../config/routesConfig";
import verifyToken from "../middleware/userAuthMiddleware";
import userRouter from "./user";
import applicationRouter from "./application";
import authRouter from "./auth";
import { app } from "../app";

// Apply route configurations
app.use(routerConfig.USER_ROUTE, verifyToken, userRouter);
app.use(routerConfig.APPLICATION_ROUTE, verifyToken, applicationRouter);
app.use(routerConfig.AUTH_ROUTE, authRouter);

// Handle 404 errors
app.use((req: any, res: any) => {
  res.status(404).json({
    status: false,
    code: 404,
    message: "RESOURCE_NOT_FOUND",
  });
});

export default app;
