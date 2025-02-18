const { logger } = require('../logging');
const moment = require('moment');
const { generateError } = require('../services/util')();
const authConfig = require('../config/auth');
const Response = require('../models/response');
const constants = require('../config/constants');
const bcrypt = require('bcrypt');

const authService = () => {

    const userRepository = require('../repositories/user')();

    const signUp = async (request) => {
        let response = new Response(false)
        try {
            // check if email already exists
            const userInfo = await userRepository.getUserByEmail(request.email);
            if (userInfo) {
                response.setMessage(`User already exists with provided Email ID.`);
                response.setStatus(401);
                return response;
            }

            await userRepository.insertUser(request);
            // todo assign role based on type
            response.setStatus(true);
            response.setMessage("User Registered Successfully.");
            return response
        }
        catch (e) {
            logger.error(`Error in authService.signUp ${generateError(e)}`);
            throw e;
        }
    }

    const signIn = async (request) => {
        let response = new Response(false)
        try {
            // fetch user info using email
            const userInfo = await userRepository.getUserByEmail(request.email);
            if (!userInfo) {
                response.setMessage(`Invalid Email ID.`);
                response.setStatus(400);
                return response;
            }

            if (userInfo.status !== constants.STATUS.USER.ACTIVE) {
                response.setMessage(`This account is currently inactive. Please contact Admin.`);
                response.setStatus(400);
                return response;
            }

            var passwordIsValid = bcrypt.compareSync(req.body.password,user.password );
            
            if (!passwordIsValid) {
                response.setMessage(`Invalid Password.`);
                response.setStatusCode(401);
                return response;
            }
            
            const token = jwt.sign(
                { user_id: userInfo.id },
                authConfig.jwtSecret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // 24 hours
                }
            );

            userRepository.updateUserLastLoginAt(userInfo.id);
            response.setStatus(true);
            response.setData("token", token);
            return response
        }
        catch (e) {
            logger.error(`Error in authService.signIn ${generateError(e)}`);
            throw e;
        }
    }


    return {
        signUp,
        signIn,
    }
}
module.exports = authService;
