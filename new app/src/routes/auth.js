const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth")();
const { express, app } = require('../../myApp');

let router = () => {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // for open routes

  // app.post("/api/auth/signup",[verifySignUp.checkDuplicateUsernameOrEmail,verifySignUp.checkRolesExisted],controller.signup);

  // app.post("/api/auth/signin", controller.signin);



  let authRouter = express.Router();


  authRouter.route('/signin').post( controller.signIn);
  authRouter.route('/requestNewPassword').post( controller.requestNewPassword);

  // authRouter.route('/presignin').post( controller.signIn);

  // authRouter.route('/signup').post( controller.signUp);

return authRouter;


};


module.exports = router;
