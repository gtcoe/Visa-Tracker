import routerConfig from "../config/routesConfig";
import verifyToken from "../middleware/userAuthMiddleware";
import userRouter from "./user";
import clientRouter from "./client";
import applicationRouter from "./application";
import authRouter from "./auth";
import { Router } from "express";
const app = Router(); 

// Apply route configurations
app.use(routerConfig.USER_ROUTE, verifyToken, userRouter);
app.use(routerConfig.CLIENT_ROUTE, verifyToken, clientRouter);
app.use(routerConfig.APPLICATION_ROUTE, verifyToken, applicationRouter);
app.use(routerConfig.AUTH_ROUTE, authRouter);

// Handle 404 errors
app.use((_: any, res: any) => {
  res.status(404).json({
    status: false,
    code: 404,
    message: "RESOURCE_NOT_FOUND",
  });
});

export default app;
