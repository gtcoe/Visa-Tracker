// const { createLogger, format, transports } = require('winston');
// const fs = require('fs');
// const path = require('path');
// const logDir = process.env.LOG_DIR || path.join(__dirname, '../logs');
// const asyncHook = require('../hooks/asyncHooks');
// const {generateRandomString} = require('../../../visa/app/services/util');

// // Create the log directory if it does not exist
// if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir);
// }

// const getLogString = (info) => {
//     // get context of request for accessing headers or other info
//     const { requestId=null, userId=null, userType=null } = asyncHook.getRequestContext() || {};
//     const contextInfo = [];

//     if (requestId) contextInfo.push(`[REQUEST_ID: ${requestId}]`);
//     if (userType || userId) contextInfo.push(`[USER: ${userType ? userType : ""}_${userId ? userId : ""}]`);

//     return `${info.timestamp} ${contextInfo.join(" ")} ${info.level}: ${info.message}`;
// };

// const logger = createLogger({
//     level: 'info',
//     format: format.combine(
//         format.timestamp({
//             format: 'YYYY-MM-DD HH:mm:ss'
//         }),
//         // format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
//         format.printf((info) => getLogString(info))
//     ),
//     transports: [
//         new transports.Console({
//             level: 'info',
//             format: format.combine(
//                 format.colorize(),
//                 format.timestamp({
//                     format: 'YYYY-MM-DD HH:mm:ss.SSS'
//                 }),
//                 // format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
//                 format.printf((info) => getLogString(info))
//             )
//         }),
//        /* new transports.File({
//             filename: path.join(logDir, 'error.log'),
//             level: 'error',
//             maxsize: 10000,
//             tailable: true,
//             handleExceptions: true,
//         }),
//         new transports.File({
//             filename: path.join(logDir, 'out.log'),
//             level: 'info',
//             maxsize: 30000,
//             tailable: true,
//             handleExceptions: true,
//         }),*/
//     ],
//     exitOnError: false
// });

// const setContextForLog = ({ requestId = generateRandomString(15), userType = 'NO_TYPE', userId = 'NO_ID' }) => {
//     asyncHook.setRequestContext({ requestId, userType, userId, });
// }

// module.exports = {
//     logger: logger,
//     setContextForLog
// };
