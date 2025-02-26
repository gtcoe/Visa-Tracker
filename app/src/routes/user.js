// const controller = require("../controllers/user")();
// const roleAuthMiddleware = require("../middleware/roleAuthMiddleware").init();
// const { express, app } = require('../../myApp');
// const userRequestValidationConfig  = require('../config/request/user');
// const requestValidator = require("../middleware/requestValidatorMiddleware");
// const constants = require("../config/constants")

// let router = () => {

//   let userRouter = express.Router();

//   userRouter.route(['/', '/:id']).get((req, res, next) => {
//         req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//         next();
//     }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.get), controller.get);

//     //done
//   userRouter.route('/clients').get((req, res, next) => {
//     req.type_required = [constants.USER_TABLE.TYPE.ADMIN, constants.USER_TABLE.TYPE.MANAGER];
//     next();
// }, roleAuthMiddleware.hasPermission, controller.fetchClients);

//   // done -- request body finalisation pending and also update permission accordingly
//   userRouter.route('/addUser').post((req, res, next) => {
//     req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//     next();
//     }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.add), controller.addUser);

//   // done -- request body finalisation pending and also update permission accordingly
//   userRouter.route('/addClient').post((req, res, next) => {
//     req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//     next();
//     }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.add), controller.addClient);

//   // userRouter.route('/').put((req, res, next) => {
//   //   req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//   //   next();
//   //   }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.update), controller.update);

//   // done
//   userRouter.route('/status').post((req, res, next) => {
//     req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//     next();
//     }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.updateStatus), controller.updateStatus);

//   // done
//   userRouter.route('/search').post((req, res, next) => {
//     req.type_required = [constants.USER_TABLE.TYPE.ADMIN];
//     next();
// }, roleAuthMiddleware.hasPermission,requestValidator(userRequestValidationConfig.search), controller.search);

//   return userRouter;
// };




// module.exports = router;


// // module.exports = function(app) {
// //   app.use(function(req, res, next) {
// //     res.header(
// //       "Access-Control-Allow-Headers",
// //       "x-access-token, Origin, Content-Type, Accept"
// //     );
// //     next();
// //   });

// //   app.get("/api/test/all", controller.allAccess);
// // 
// //   app.post("/api/user",(req, res, next) => {
// //     req.hasPermissionData = {permission: "battery", op: ["VIEW"]};
// //     next();
// // }, authMiddleware.hasPermission, controller.userBoard );

// // };




