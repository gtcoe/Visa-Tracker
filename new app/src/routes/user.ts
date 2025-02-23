import express, { Router, Request, Response, NextFunction } from "express";
import controller from "../controllers/user";
import roleAuthMiddleware from "../middleware/roleAuthMiddleware";
import requestValidator from "../middleware/requestValidatorMiddleware";
import userRequestValidationConfig from "../config/request/user";
import constants from "../config/constants";

// Initialize role authentication middleware
const roleAuth = roleAuthMiddleware.init();

// Helper middleware to assign role-based permissions
const withAuth = (roles: int[]) => [
  (req: any, res: any, next: NextFunction) => {
    req.type_required = roles;
    next();
  },
  roleAuth.hasPermission,
];

// Initialize router
const userRouter: Router = express.Router();

// Get user(s)
userRouter.route(["/", "/:id"]).get(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.get),
  controller.get
);

// Fetch clients
userRouter.route("/clients").get(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  controller.fetchClients
);

// Add user
userRouter.route("/addUser").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.addUser), // Renamed for clarity
  controller.addUser
);

// Add client
userRouter.route("/addClient").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.addClient), // Renamed for clarity
  controller.addClient
);

// Update user status
userRouter.route("/status").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.updateStatus),
  controller.updateStatus
);

// Search users
userRouter.route("/search").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.search),
  controller.search
);

export default userRouter;
