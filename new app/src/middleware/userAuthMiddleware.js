// const jwt = require("jsonwebtoken");
// const config = require("../config/auth.js");
// const MySql = require("../database/mySqlConnection.js")
// const asyncHooks = require('../hooks/asyncHooks');

// const userAuthMiddleware = {};
// userAuthMiddleware.init = () => {

//   let verifyToken = (req, res, next) => {
// 		if (!req.headers.languagecode)
// 			req.headers.languagecode = "en";

// 		if (!req.headers['accept-version']) {
// 			req.headers['accept-version'] = '1.0.0';
// 		}

	
// 			let token = req.body.token || req.query.token || req.headers['auth_token'];
// 			if (token) {
// 				// verifies secret and checks exp
// 				jwt.verify(token, app.get('jwtSecret').app, (err, decoded) => {
// 					if (err) {
// 						return res.json({ status: false, message: 'Failed to authenticate token.' });

// 					} else {
// 						let query = `SELECT *
// 									FROM users
// 									WHERE id = ? and status = 1`;
// 						let params = [decoded.user_id];
// 						MySql.query(query, params)
// 							.then(async (queryRes) => {
// 								if (queryRes.data.length) {
// 									if (queryRes.data[0].last_login_at === "") {
// 										res.status(401).json({ status: false, message: 'Session Expired. Please Login Again.' });
// 									}else {
// 										const lastLoginDate = moment(queryRes.data[0].last_login_at);
// 										const currentDate = moment();
// 										if (currentDate.isAfter(lastLoginDate.add(30, 'days'))){
// 											res.status(401).json({ status: false, message: 'This account is currently inactive. Please contact Admin.' });
// 										}
// 									}
// 									req.body.user_id = queryRes.data[0].id;
// 									req.body.type = queryRes.data[0].type;
// 									req.body.name = queryRes.data[0].name;
// 									req.body.email = queryRes.data[0].email;
// 									req.body.phone = queryRes.data[0].phone;
// 									req.body.name = queryRes.data[0].name;

// 									/** Get request context and set user_id and user_type in context */
// 									const reqContext = asyncHooks.getRequestContext();
// 									asyncHooks.setRequestContext({
// 										...reqContext,
// 										user_id:  queryRes.data[0].id,
// 										type:  queryRes.data[0].type
// 									});
// 									next();
// 								}
// 								else {
// 									res.status(401).json({ status: false, message: 'Failed to authenticate token.' });
// 								}
// 							})
// 							.catch((e) => {
// 								console.log(e);
// 								res.status(500).send(e);

// 							});
// 					}
// 				});
// 			} else {
// 				return res.status(401).send({
// 					status: false,
// 					message: 'No token provided.'
// 				});
// 			}
		
// 	}

// 	return {
//     	verifyToken,
// 	};
// }

// module.exports = userAuthMiddleware;

