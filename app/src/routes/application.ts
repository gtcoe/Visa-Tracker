import express, { Request, Response, NextFunction } from "express";
const controller = require("../controllers/application")();
const roleAuthMiddleware = require("../middleware/roleAuthMiddleware").init();
const userRequestValidationConfig = require("../config/request/user");
const requestValidator = require("../middleware/requestValidatorMiddleware");
const constants = require("../config/constants");

const applicationRouter = express.Router();

/**
 * Middleware to apply role-based authentication.
 * @param {string[]} roles - Allowed roles for the route.
 */

const withAuth = (roles: number[]) => [
  (req: any & { type_required?: number[] }, res: any, next: NextFunction) => {
    req.type_required = roles;
    next();
  },
  roleAuthMiddleware.hasPermission,
];

/**
 * Define application routes
 */

// Initiate application
applicationRouter.post(
  "/initiate",
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  requestValidator(userRequestValidationConfig.add),
  controller.create
);

// Add details to application
applicationRouter.post(
  "/addDetails",
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  requestValidator(userRequestValidationConfig.addDetails),
  controller.addDetails
);

// Update application status
applicationRouter.post(
  "/status",
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  requestValidator(userRequestValidationConfig.updateStatus),
  controller.updateStatus
);

// Upload documents
applicationRouter.post(
  "/upload",
  ...withAuth([constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER]),
  requestValidator(userRequestValidationConfig.uploadDocuments),
  controller.uploadDocuments
);

// Search applications
applicationRouter.post(
  "/search",
  ...withAuth([
    constants.USER_TABLE.TYPE.ADMIN,
    constants.USER_TABLE.TYPE.MANAGER,
    constants.USER_TABLE.TYPE.CLIENT,
  ]),
  requestValidator(userRequestValidationConfig.search),
  controller.search
);

// Get application by ID
applicationRouter.get(
  "/:id",
  ...withAuth([
    constants.USER_TABLE.TYPE.ADMIN,
    constants.USER_TABLE.TYPE.MANAGER,
    constants.USER_TABLE.TYPE.CLIENT,
  ]),
  requestValidator(userRequestValidationConfig.getById),
  controller.getById
);

export default applicationRouter;

