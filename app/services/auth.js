const { logger } = require('../logging');
const moment = require('moment');
const { generateError } = require('../services/util')();
const authConfig = require('../config/auth');
const Response = require('../models/response');
const constants = require('../config/constants');
const bcrypt = require('bcrypt');

const authService = () => {

    const userRepository = require('../repositories/user')();

    // const signUp = async (request) => {
    //     let response = new Response(false)
    //     try {

    //         // check if email already exists
    //         const userInfo = await userRepository.getUserByEmail(request.email);
    //         if (userInfo) {
    //             response.setMessage(`User already exists with provided Email ID.`);
    //             response.setStatus(401);
    //             return response;
    //         }

    //         await userRepository.insertUser(request);
    //         // todo assign role based on type
    //         response.setStatus(true);
    //         response.setMessage("User Registered Successfully.");
    //         return response
    //     }
    //     catch (e) {
    //         logger.error(`Error in authService.signUp ${generateError(e)}`);
    //         throw e;
    //     }
    // }

    const signIn = async (request) => {
        let response = new Response(false)
        try {

            // Sign in Cases:
            // 1. Successfull
            // 2. Incorrect Password
            // 3. Expired - request new password
            // 4. Expired - Already Requested
            // 5. Inactive - done by admin on the portal
            // 6. Email Does not exists

            // fetch user info using email
            const userInfo = await userRepository.getUserByEmail(request.email);

            // email existance
            if (!userInfo) {
                response.set({
                    statusCode: 400,
                    message: constants.SIGN_IN_STATUS_MESSAGE.EMAIL_NOT_FOUND,
                    data: {
                        type: constants.SIGN_IN_STATUS_TYPE.EMAIL_NOT_FOUND
                    }
                })
                return response;
            }

            // valid password check
            var passwordIsValid = bcrypt.compareSync(req.body.password,user.password );
            
            if (!passwordIsValid) {
                response.set({
                    statusCode: 401,
                    message: constants.SIGN_IN_STATUS_MESSAGE.INCORRECT_PASSWORD,
                    data: {
                        type: constants.SIGN_IN_STATUS_TYPE.INCORRECT_PASSWORD
                    }
                })
                return response;
            }

            if (userInfo.type === constants.USER_TABLE.TYPE.CLIENT) {
                // user active check
                if (userInfo.status === constants.STATUS.USER.INACTIVE) {

                    // NEW PASSWORD REQUESTED
                    if (userInfo.password_requested === constants.USER_TABLE.PASSWORD_REQUESTED.YES) {
                        response.set({
                            statusCode: 400,
                            message: constants.SIGN_IN_STATUS_MESSAGE.EXPIRED_REQUEST_INITIATED,
                            data: {
                                type: constants.SIGN_IN_STATUS_TYPE.EXPIRED_REQUEST_INITIATED
                            }
                        })
                    } else {
                        // disabled by admin
                        response.set({
                            statusCode: 400,
                            message: constants.SIGN_IN_STATUS_MESSAGE.INACTIVE_BY_ADMIN,
                            data: {
                                type: constants.SIGN_IN_STATUS_TYPE.INACTIVE_BY_ADMIN
                            }
                        })
                    }
                    return response;
                }

                const currentTime = moment(new Date());
                if (currentTime.isAfter(userInfo.password_valid_till)) {
                    response.set({
                        statusCode: 400,
                        message: constants.SIGN_IN_STATUS_MESSAGE.EXPIRED_REQUEST_NOT_INITIATED,
                        data: {
                            type: constants.SIGN_IN_STATUS_TYPE.EXPIRED_REQUEST_NOT_INITIATED
                        }
                    })
                    return response;
                }
            }

            
            const token = jwt.sign(
                { user_id: userInfo.id },
                authConfig.jwtSecret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 60*60*24*30, // 30 Days
                }
            );

            userRepository.updateAfterSuccessfullLogin(userInfo.id);
            response.setStatus(true);
            response.setData("token", token);
            response.setData("type", constants.SIGN_IN_STATUS_TYPE.SUCCESS);
            return response
        }
        catch (e) {
            logger.error(`Error in authService.signIn ${generateError(e)}`);
            throw e;
        }
    }

    const requestNewPassword = async (email) => {
        let response = new Response(false)
        try {

            // check if email already exists
            const userInfo = await userRepository.getUserByEmail(email);
            if (userInfo) {
                response.setMessage(`Email provided not mapped to any user.`);
                response.setStatus(401);
                return response;
            }

            const currentTime = moment(new Date());
            if (currentTime.isBefore(userInfo.password_valid_till)) {
                response.set({
                    statusCode: 400,
                    message: "Password for the user not expired yet.",
                })
                return response;
            }


            const password = generateRandomString(12);
            const encryptedPassword = bcrypt.hashSync(req.body.password, 15)
            const passwordValidTill = moment(new Date()).add(30, 'days').format('YYYY-MM-DD HH:mm:ss');

            // todo send password on email

            const resp = await userRepository.updateStatusAndPassword(constants.STATUS.USER.ACTIVE, encryptedPassword, userInfo.id, 0, passwordValidTill);
            // todo handle resp
            response.setStatus(true);
            response.setMessage("New password sent fon emial");
            return response
        }
        catch (e) {
            logger.error(`Error in authService.requestNewPassword ${generateError(e)}`);
            throw e;
        }
    }


    return {
        requestNewPassword,
        signIn,
    }
}
module.exports = authService;
