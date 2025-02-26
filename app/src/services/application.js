// const constants = require("../config/constants");
// const { logger } = require("../logging")
// const moment = require('moment');
// const { constant } = require("underscore");
// const Response = require("../models/response");
// let applicationService = () => {

//     const { generateError, generateRandomString} = require("./util")();
//     const applicationRepository = require("../repositories/application")();

//     const getById = async (req, res) => {
//         try {
            
//             if (req.params.id) {
//                 // return err
//             }
//             const resp = await applicationRepository.getApplicationByID(req.params.id);
//             if (req.params.id && resp.data) {
//                 resp.data = !!resp.data[0] ? resp.data[0] : {};
//                 delete resp.total_pages;
//             }

//         }
//         catch (e) {
//             logger.error(`error in applicationService.getById - ${ generateError(e) }`);
//             throw e;
//         }
//     };

//     const create = async (request) => {
//         try {

//             const resp = await applicationRepository.create(request);

//             if (resp !== null) {
                
//             }

//             return await applicationRepository.insertapplication(requestData);
            
//         } catch (e) {
//             logger.error(`error in applicationService.create - ${ generateError(e) }`);
//             throw e;
//         }
//     };

//     const addDetails = async (request) => {
//         try {

//             const resp = await applicationRepository.create(request);

//             if (resp !== null) {
//                 return {
//                     status: false,
//                     message: "application with same email already exists."
//                 }
//             }

//             request.password = generateRandomString(12);

//             // todo: send email with password

//             return await applicationRepository.addDetails(requestData);
            
//         } catch (e) {
//             logger.error(`error in applicationService.create - ${ generateError(e) }`);
//             throw e;
//         }
//     };

//     const uploadDocuments = async (req, res) => {
//         try {
//             let form = await formidablePromise(req);

//             const requestData = {
//                 docLink: req.body.docLink,
//                 applicationId: req.body.applicationId,
//                 applicationId: req.body.applicationId,
//                 agreementImage: form.files.agreementImage,

//             };

//             // upload doc and return cdn link

//             return await applicationRepository.updateDocuments(requestData, req.params.id);
            
//         } catch (e) {
//             logger.error(`error in applicationService.uploadDocuments - ${ generateError(e) }`);
//             throw e;
//         }
//     };

//     const updateStatus = async (request) => {
//         try {
//             if (request.status == constants.STATUS.application.ACTIVE){
//                 request.password = generateRandomString(12);
//                 // todo: send email with password
//             }

//             return await applicationRepository.updateStatus(request.status, request.password, request.id, request.last_updated_by);
            
//         } catch (e) {
//             logger.error(`error in applicationService.updateStatus - ${ generateError(e) }`);
//             throw e;
//         }
//     };

//     const search = async (text) => {
//         try {
 
//             return await applicationRepository.search(text);
            
//         } catch (e) {
//             logger.error(`error in applicationService.search - ${ generateError(e) }`);
//             throw e;
//         }
//     };


//     return {
//         getById,
//         updateStatus,
//         uploadDocuments,
//         create,
//         search,
//         addDetails
//     };
// };
// module.exports = applicationService;
