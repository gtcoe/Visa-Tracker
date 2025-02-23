const controller = require("../controllers/application")();
const roleAuthMiddleware = require("../middleware/roleAuthMiddleware").init();
const { express, app } = require('../app');
const userRequestValidationConfig  = require('../config/request/user');
const requestValidator = require("../middleware/requestValidatorMiddleware");
const constants = require("../config/constants")

let router = () => {

  let applicationRouter = express.Router();


  applicationRouter.route('/initiate').post((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER];
    next();
}, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.add), controller.create);

  applicationRouter.route('/addDetails').post((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER];
    next();
    }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.addDetails), controller.addDetails);

  applicationRouter.route('/status').post((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER];
    next();
    }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.updateStatus), controller.updateStatus);

  applicationRouter.route('/upload').post((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER];
    next();
    }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.uploadDocuments), controller.uploadDocuments);

  applicationRouter.route('/search').post((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER, constants.USER_TABLE.TYPE.CLIENT];
    next();
    }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.search), controller.search);

  applicationRouter.route('/:id').get((req, res, next) => {
    req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER, constants.USER_TABLE.TYPE.CLIENT];
    next();
    }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.uploadDocuments), controller.getById);
  
  return applicationRouter;
};

module.exports = router;


// module.exports = function(app) {
//   app.use(function(req, res, next) {
//     res.header(
//       "Access-Control-Allow-Headers",
//       "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
//   });

//   app.get("/api/test/all", controller.allAccess);
// 
//   app.post("/api/user",(req, res, next) => {
//     req.hasPermissionData = {permission: "battery", op: ["VIEW"]};
//     next();
// }, authMiddleware.hasPermission, controller.userBoard );

// };




