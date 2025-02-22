const { logger } = require("../logging")
const moment = require('moment');
const { constant } = require("underscore");
const Response = require("../models/response");
var bcrypt = require("bcryptjs");

let userController = () => {

    const { generateError, convertFareInRupee , convertFareInPaise} = require("../services/util")();
    const userService = require("../services/user")();

    const get = async (req, res) => {
        let response = new Response(false);
        try {
            
            if (req.params.id) {
                // return err
            }
            const resp = await userService.get();
            if (req.params.id && resp.data) {
                resp.data = !!resp.data[0] ? resp.data[0] : {};
                delete resp.total_pages;
            }
            response.setStatus(true);
            res.send({ ...response, ...resp });
        }
        catch (e) {
            logger.error(`error in userController.get - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    //done
    const fetchClients = async (req, res) => {
        let response = new Response(false);
        try {
            
            const resp = await userService.fetchClients();
            response.setStatus(true);
            res.send({ ...response, ...resp });
        }
        catch (e) {
            logger.error(`error in userController.fetchClients - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    const addUser = async (req, res) => {
        let response = new Response(false);
        try {
            // todo clear body
            // const requestData = {
            //     name: req.body.name,
            //     email: req.body.email,
            //     phone: req.body.phone,
            //     status: req.body.status,
            //     last_updated_by: req.body.user_id,
            //     type: req.body.type,
            //     superpass: req.body.superpass,
            //     address: req.body.address,
            //     poc: req.body.poc
            // };

            const requestData = {
                name: req.body.name,
                email: req.body.email,
                status: req.body.status,
                type: req.body.type,
                last_updated_by: req.body.user_id,
                password: bcrypt.hashSync(req.body.password, 12)
            }

            const resp = await userService.addUser(requestData);
            if (resp !== null){
                response.set(approveResponse);
                response.setStatusCode(401);
            }else {
                response.setStatus(true);
            }
            res.send(response);
        } catch (e) {
            logger.error(`error in userController.addUser - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    const addClient = async (req, res) => {
        let response = new Response(false);
        try {
            // todo clear body
            const requestData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status,
                last_updated_by: req.body.user_id,
                type: req.body.type,
                superpass: req.body.superpass,
                address: req.body.address,
                poc: req.body.poc
            };

            const resp = await userService.create(requestData);
            if (resp !== null){
                response.set(approveResponse);
                response.setStatusCode(401);
            }else {
                response.setStatus(true);
            }
            res.send(response);
        } catch (e) {
            logger.error(`error in userController.create - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    //done
    const updateStatus = async (req, res) => {
        let response = new Response(false);
        try {
            const data = {
                last_updated_by: req.body.user_id,
                user_id: req.body.id,
                status: req.body.status,
            };

            await userService.updateStatus(data);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`error in userController.updateStatus - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

     //done
     const search = async (req, res) => {
        let response = new Response(false);
        try {
            
            await userService.search(req.body.text);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`error in userController.search - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };


    return {
        get,
        fetchClients,
        updateStatus,
        addUser,
        addClient,
        search
    };
};
module.exports = userController;
