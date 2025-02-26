// const httpRequestValidator = require("../services/httpRequestValidator")();
// const Response = require("../models/response");
// const errors = require("../config/errors");

// const requestValidator = (fields) => {
//     return (req, res, next) => {
//         let response = new Response(false);

//         const keys = ["query", "params", "body"], _errors = [];
//         for (let i = 0; i < keys.length; ++i) {
//             if (fields && fields[keys[i]] && typeof fields[keys[i]] === "object" && Object.keys(fields[keys[i]]).length) {
//                 _errors.push(...httpRequestValidator.init(req[keys[i]], fields[keys[i]]));
//             }
//         }
//         if (_errors.length) {
//             response.setMessage(errors.INVALID_REQUEST);
//             response.setData("error", _errors);
//             return res.send(response);
//         }
//         next();
//     };
// };

// module.exports = requestValidator;
