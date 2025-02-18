const constants = require("../config/constants");
const { logger } = require("../logging")
const moment = require('moment');
const { constant } = require("underscore");
const Response = require("../models/response");
let userService = () => {

    const { generateError, generateRandomString} = require("../services/util")();
    const userRepository = require("../repositories/user")();

    const get = async (req, res) => {
        try {
            
            if (req.params.id) {
                // return err
            }
            const resp = await userRepository.getUserByID(req.params.id);
            if (req.params.id && resp.data) {
                resp.data = !!resp.data[0] ? resp.data[0] : {};
                delete resp.total_pages;
            }

        }
        catch (e) {
            logger.error(`error in userService.get - ${ generateError(e) }`);
            throw e;
        }
    };

    //done
    const fetchClients = async () => {
        try {
            
            return await userRepository.getUsersByType(constants.USER_TABLE.TYPE.CLIENT);
        }
        catch (e) {
            logger.error(`error in userService.fetchClients - ${ generateError(e) }`);
            throw e;
        }
    };

    const create = async (request) => {
        try {
            if (request.type === constants.USER_TABLE.TYPE.ADMIN && request.superpass !== constants.ADMIN_API_SUPERPASS){
                return {
                    status: false,
                    message: "Superpass required to create admin user."
                }
            }
            const resp = await userRepository.getUserByID(request.email);

            if (resp !== null) {
                return {
                    status: false,
                    message: "User with same email already exists."
                }
            }

            request.password = generateRandomString(12);

            // todo: send email with password

            return await userRepository.insertUser(requestData);
            
        } catch (e) {
            logger.error(`error in userService.create - ${ generateError(e) }`);
            throw e;
        }
    };

    //done
    const updateStatus = async (request) => {
        try {
            if (request.status == constants.STATUS.USER.ACTIVE){
                request.password = generateRandomString(12);
                // todo: send email with password
            }

            return await userRepository.updateStatusAndPassword(request.status, request.password, request.id, request.last_updated_by);
            
        } catch (e) {
            logger.error(`error in userService.updateStatus - ${ generateError(e) }`);
            throw e;
        }
    };

    //done
    const search = async (text) => {
        try {
 
            return await userRepository.search(text);
            
        } catch (e) {
            logger.error(`error in userService.search - ${ generateError(e) }`);
            throw e;
        }
    };


    return {
        get,
        fetchClients,
        updateStatus,
        create,
        search
    };
};
module.exports = userService;
