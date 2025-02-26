// const AWS = require('aws-sdk');
// // const config = require('../../configuration');
// const { generateError } = require('./util')();
// const { logger } = require('../logging');
// const _ = require('underscore');
// const s3stream = require("s3-upload-stream");

// let s3Bucket = () => {
//     const uploadFromStream = (data) => {
//         return new Promise((resolve, reject) => {
//             let params = {Bucket: data.bucket, Key: data.fileName, ContentType: /(?:\.([^.]+))?$/.exec(data.fileName)[1] || 'jpeg'};
//             let stream = s3stream(new AWS.S3());
//             let upload = stream.upload(params);

//             // Handle errors.
//             upload.on('error', function (err) {
//                 logger.error(`error in s3 uploadFromStream: ${generateError(err)}`);
//                 reject(err);
//             });

//             // Handle upload completion.
//             upload.on('uploaded', function (result) {
//                 logger.info(`uploadFromStream res for file:${data.fileName}- ${JSON.stringify(result)}`);
//                 resolve(result);
//             });
//             // Pipe the Readable stream to the s3-upload-stream module.
//             data.stream.pipe(upload);
//         });
//     };


//     const deleteFromS3Bucket = (data) => {
//         /*
//         data = {
//         file_name, bucket
//          */
//         return new Promise((resolve, reject) => {
//             let s3 = new AWS.S3();
//             let params = {Bucket: data.bucket, Key: data.file_name};
//             s3.deleteObject(params, function(err, data){
//                 if (err) {
//                     logger.error(`error in getFileAsBuffer - ${generateError(err)}`);
//                     if(err.statusCode === 404) {
//                         reject('Key/File not found');
//                     } else if (err.code === 'AccessDenied') {
//                         reject('Key/File not-found/access-denied')
//                     } else {
//                         reject(err);
//                     }
//                 }
//                 else {
//                     resolve(data.Body);
//                 }
//             });
//         });
//     };

//     const uploadFileAsBuffer = async (file, bucket, acl=null) => {
//         return new Promise((resolve, reject) => {
//             let s3 = new AWS.S3();
//             let params = {Bucket: bucket, Key: file.name, Body: file.body};
//             if(file.contentType) {
//                 params.ContentType = file.contentType;
//             }
//             s3.putObject(params, function (err, data) {
//                 if (err) {
//                     logger.error(`error in uploadFileAsBuffer - ${generateError(err)}`);
//                     if(err.statusCode === 404) {
//                         reject('err');
//                     } else if (err.code === 'AccessDenied') {
//                         reject('err');
//                     } else {
//                         reject(err);
//                     }
//                 }
//                 else {
//                     //generate url for uploaded file and return that
//                     resolve(data);
//                 }
//             })
//         })
//     };

//     const getFileAsBuffer = (fileName, bucket) => {
//         return new Promise((resolve, reject) => {
//             let s3 = new AWS.S3();
//             let params = {Bucket: bucket, Key: fileName};
//             s3.getObject(params, function(err, data){
//                 if (err) {
//                     logger.error(`error in getFileAsBuffer - ${generateError(err)}`);
//                     if(err.statusCode === 404) {
//                         reject('Key/File not found');
//                     } else if (err.code === 'AccessDenied') {
//                         reject('Key/File not-found/access-denied')
//                     } else {
//                         reject(err);
//                     }
//                 }
//                 else {
//                     resolve(data);
//                 }
//             });
//         });
//     };

//     return {
//         uploadFromStream,
//         deleteFromS3Bucket,
//         uploadFileAsBuffer,
//         getFileAsBuffer
//     }
// };

// module.exports = s3Bucket;
