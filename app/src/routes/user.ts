import express, { Router, Request, Response, NextFunction } from "express";
import {get, fetchClients, addUser, addClient, search, updateStatus} from "../controllers/user";
import hasPermission from "../middleware/roleAuthMiddleware";
import requestValidator from "../middleware/requestValidatorMiddleware";
import userRequestValidationConfig from "../config/request/user";
import constants from "../config/constants";

// Initialize role authentication middleware

// Helper middleware to assign role-based permissions
const withAuth = (roles: number[]) => [
  (req: any, res: any, next: NextFunction) => {
    req.type_required = roles;
    next();
  },
  hasPermission,
];

// Initialize router
const userRouter: Router = express.Router();

// Get user(s)
userRouter.route(["/", "/:id"]).get(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.get),
  get
);

// Fetch clients
userRouter.route("/clients").get(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  fetchClients
);

// Add user
userRouter.route("/addUser").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  // requestValidator(userRequestValidationConfig.addUser), // Renamed for clarity
  addUser
);

// Add client
userRouter.route("/addClient").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  // requestValidator(userRequestValidationConfig.addClient), // Renamed for clarity
  addClient
);

// Update user status
userRouter.route("/status").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.updateStatus),
  updateStatus
);

// Search users
userRouter.route("/search").post(
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN]),
  requestValidator(userRequestValidationConfig.search),
  search
);

export default userRouter;
