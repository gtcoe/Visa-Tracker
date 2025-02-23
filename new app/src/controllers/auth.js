// var jwt = require("jsonwebtoken");
// var bcrypt = require("bcryptjs");
// const { logger } = require("../logging")
// const Response = require("../models/response");
// const config = require("../config/auth");


// // exports.signin = (req, res) => {
// //   User.findOne({
// //     where: {
// //       username: req.body.username
// //     }
// //   })
// //     .then(user => {
// //       if (!user) {
// //         return res.status(404).send({ message: "User Not found." });
// //       }

// //       var passwordIsValid = bcrypt.compareSync(
// //         req.body.password,
// //         user.password
// //       );

// //       if (!passwordIsValid) {
// //         return res.status(401).send({
// //           accessToken: null,
// //           message: "Invalid Password!"
// //         });
// //       }

// //       const token = jwt.sign({ id: user.id },
// //                               config.secret,
// //                               {
// //                                 algorithm: 'HS256',
// //                                 allowInsecureKeySizes: true,
// //                                 expiresIn: 86400, // 24 hours
// //                               });

// //       var authorities = [];
// //       user.getRoles().then(roles => {
// //         for (let i = 0; i < roles.length; i++) {
// //           authorities.push("ROLE_" + roles[i].name.toUpperCase());
// //         }
// //         res.status(200).send({
// //           id: user.id,
// //           username: user.username,
// //           email: user.email,
// //           roles: authorities,
// //           accessToken: token
// //         });
// //       });
// //     })
// //     .catch(err => {
// //       res.status(500).send({ message: err.message });
// //     });
// // };

// let authController = () => {

//     const { generateError, convertFareInRupee , convertFareInPaise} = require("../services/util")();
//     const authService = require("../services/auth")();

//     // const signUp = async (req, res) => {
//     //     let response = new Response(false);
//     //     try {
//     //         const request = {
//     //           name: req.body.name,
//     //           phone: req.body.phone,
//     //           email: req.body.email,
//     //           password: bcrypt.hashSync(req.body.password, 12),
//     //           address: req.body.address,
//     //           status: req.body.status,
//     //           poc: req.body.poc,
//     //           type: req.body.type,
//     //           lastUpdatedBy: req.body.userId,
//     //         }
//     //         const resp = await authService.signUp(req);
//     //         response.setStatus(true);
//     //         res.send({ ...response, ...resp });
//     //     }
//     //     catch (e) {
//     //         logger.error(`error in authController.signUp - ${ generateError(e) }`);
//     //         response.message = e.message;
//     //         res.send(response);
//     //     }
//     // };

//     const signIn = async (req, res) => {
//       let response = new Response(false);
//       try {
//           const request = {
//             email: req.body.email,
//             password: req.body.password,
//           }
//           const resp = await authService.signIn(request);
//           response.setStatus(true);
//           res.send({ ...response, ...resp });
//       }
//       catch (e) {
//           logger.error(`error in authController.signIn - ${ generateError(e) }`);
//           response.message = e.message;
//           res.send(response);
//       }
//   };

//   const requestNewPassword = async (req, res) => {
//     let response = new Response(false);
//     try {
//         // const request = {
//         //   email: req.body.email,
//         // }
//         const resp = await authService.requestNewPassword(req.body.email);
//         response.setStatus(true);
//         res.send({ ...response, ...resp });
//     }
//     catch (e) {
//         logger.error(`error in authController.requestNewPassword - ${ generateError(e) }`);
//         response.message = e.message;
//         res.send(response);
//     }
// };

//     return {
//       requestNewPassword,
//       signIn,
//     };
// };
// module.exports = authController;

