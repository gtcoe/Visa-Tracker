const { logger } = require("../logging")
const moment = require('moment');
const { constant } = require("underscore");
const Response = require("../models/response");
let applicationController = () => {

    const { generateError, convertFareInRupee , convertFareInPaise} = require("../services/util")();
    const applicationService = require("../services/application")();

    const getById = async (req, res) => {
        let response = new Response(false);
        try {
            
            if (req.params.id) {
                // return err
            }
            const resp = await applicationService.getById();
            if (req.params.id && resp.data) {
                resp.data = !!resp.data[0] ? resp.data[0] : {};
                delete resp.total_pages;
            }
            response.setStatus(true);
            res.send({ ...response, ...resp });
        }
        catch (e) {
            logger.error(`error in applicationController.getById - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    //done
    // const fetchClients = async (req, res) => {
    //     let response = new Response(false);
    //     try {
            
    //         const resp = await applicationService.fetchClients();
    //         response.setStatus(true);
    //         res.send({ ...response, ...resp });
    //     }
    //     catch (e) {
    //         logger.error(`error in applicationController.fetchClients - ${ generateError(e) }`);
    //         response.message = e.message;
    //         res.send(response);
    //     }
    // };

    const create = async (req, res) => {
        let response = new Response(false);
        try {
            // todo clear body
            const requestData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status,
                last_updated_by: req.body.application_id,
                type: req.body.type,
                superpass: req.body.superpass,
                address: req.body.address,
                poc: req.body.poc
            };

            const resp = await applicationService.create(requestData);
            if (resp !== null){
                response.set(approveResponse);
                response.setStatusCode(401);
            }else {
                response.setStatus(true);
            }
            res.send(response);
        } catch (e) {
            logger.error(`error in applicationController.create - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    const addDetails = async (req, res) => {
        let response = new Response(false);
        try {
            // todo clear body
            const requestData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status,
                last_updated_by: req.body.application_id,
                type: req.body.type,
                superpass: req.body.superpass,
                address: req.body.address,
                poc: req.body.poc
            };

            const resp = await applicationService.addDetails(requestData);
            if (resp !== null){
                response.set(approveResponse);
                response.setStatusCode(401);
            }else {
                response.setStatus(true);
            }
            res.send(response);
        } catch (e) {
            logger.error(`error in applicationController.addDetails - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    //done
    const updateStatus = async (req, res) => {
        let response = new Response(false);
        try {
            const data = {
                remarks: req.body.remarks,
                queue: req.body.queue,
                status: req.body.status,
            };

            await applicationService.updateStatus(data);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`error in applicationController.updateStatus - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

    const uploadDocuments = async (req, res) => {
        let response = new Response(false);
        try {
            const data = {
                remarks: req.body.remarks,
                queue: req.body.queue,
                status: req.body.status,
            };

            await applicationService.uploadDocuments(data);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`error in applicationController.uploadDocuments - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };

     //done
     const search = async (req, res) => {
        let response = new Response(false);
        try {
            
            await applicationService.search(req.body.text);
            response.setStatus(true);
            res.send(response);
        } catch (e) {
            logger.error(`error in applicationController.search - ${ generateError(e) }`);
            response.message = e.message;
            res.send(response);
        }
    };


    return {
        getById,
        addDetails,
        updateStatus,
        create,
        search,
        uploadDocuments
    };
};
module.exports = applicationController;
