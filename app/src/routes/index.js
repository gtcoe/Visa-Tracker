// const routerConfig = require("../config/routesConfig");
// const { express, app } = require('../../myApp');
// const userAuthMiddleware = require('../middleware/userAuthMiddleware').init(app);

// let routes = () => {
//     let userRouter = require('./user')();
//     let applicationRouter = require('./application')();
//     let authRouter = require('./auth')();

//     app.use(routerConfig.USER_ROUTE, userAuthMiddleware.verifyToken, userRouter);
//     app.use(routerConfig.APPLICATION_ROUTE, userAuthMiddleware.verifyToken, applicationRouter);
//     app.use(routerConfig.AUTH_ROUTE, authRouter);

//     app.use((req, res) => {
//         res.status(404).send({
//             status: false,
//             code: 404,
//             message: "RESOURCE_NOT_FOUND"
//         });
//     });
// }

// module.exports = routes;

