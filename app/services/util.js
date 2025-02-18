// const { logger } = require('../logging');
const _ = require('underscore');
const moment = require('moment');
const path = require('path');
const formidable = require('formidable')
const s3Bucket = require('./s3BucketService')()

const utilService = () => {
    // const apiConfig = config.apiConfig[process.env.NODE_ENV];
    // const s3Config = config.s3Config[process.env.NODE_ENV];
    // const constants = config.constants;

    const generateRandomString = (length, type = null)=> {
        let i,
            string,
            result = '';
        switch(type) {
            case 'num':
                string = '0123456789';
                break;
            case 'alpha':
                string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'alphanum':
                string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
            default:
                string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        length = length || 16;

        for (i = length; i > 0; --i) {
            result += string[Math.floor(Math.random() * string.length)];
        }
        return result;
    };

    const generateError = (error) => {
        if(error.message && error.stack) {
            error = {message: error.message, stack: error.stack};
        }
        if(typeof(error) === "object") {
            error = JSON.stringify(error);
        }
        return error;
    };

    // const generateMessage = (lang, key, placeholderObj=null) => {
    //     try {
    //         if (!placeholderObj) {
    //             return config.messageLocaleConfig[lang][key];
    //         }
    //         //iterate placeholderObj and replace with valid language value
    //         let ignore = ['DOCUMENT_NUMBER', 'SUPPORT_NUMBER', 'PHONE_NUMBER'];
    //         let temp;
    //         let placeholderObjLocale = placeholderObj;
    //         if (lang !== 'en') {
    //             for (let property in placeholderObj) {
    //                 if (!ignore.includes(property)) {
    //                     temp = placeholderObj[property];
    //                     try {
    //                         placeholderObjLocale[property] = config.messageLocaleConfig[lang].FIELDS[property][temp]
    //                     } catch(e) {
    //                         logger.error(`Error in generateMessage for lang- ${lang}, key- ${key}, placeholder- ${JSON.stringify(placeholderObj)}:  ${ generateError(e) }`);
    //                         lang = config.appConfig.DEFAULT_LANG_CODE;
    //                         placeholderObjLocale = placeholderObj;
    //                         break;
    //                     }
    //                 }
    //             }
    //         }
    //         return replacePlaceholder(config.messageLocaleConfig[lang][key], placeholderObjLocale);
    //     } catch (e) {
    //         logger.error(`Error in generateMessage for lang- ${lang}, key- ${key}, placeholder- ${JSON.stringify(placeholderObj)}:  ${ generateError(e) }`);
    //         return config.errorMessages.ERROR_GETTING_DATA_FROM_DB;
    //     }
    // };

    const getFullName = (firstName, lastName, toTitleCase=false) => {
        let fullName;
        if(!firstName && !lastName) {
            return "";
        }
        if(!firstName) {
            firstName = '';
        }
        if(!lastName) {
            lastName = '';
        }
        fullName = (firstName + ' ' + lastName).trim();
        if(toTitleCase) {
            fullName = toTitleCase(fullName);
        }
        return fullName;
    };

    // const generateImageUrl = async (url) => {
    //     try {
    //         if (!url) {
    //             return '';
    //         }
    //         else{
    //             return (apiConfig.energy.GET_IMAGE + constants.IMAGE_URL_PARAMS + url);
    //         }
    //     } catch (e) {
    //         logger.error(`error in generateImageUrl - ${ generateError(e) }`);
    //         return Promise.reject(e);
    //     }
    // };

    // const decryptImageUri = async (encrypted, userType, userId) => {
    //     let response = {
    //         status: false
    //     };
    //     try {
    //         logger.info(`decryptImageUri called for - userType ${userType}, userId - ${userId}, encryptedUri- ${encrypted}`);
    //         let decrypted = await decrypt(encrypted);
    //         decrypted = decrypted.split(":");
    //         if (decrypted.length !== 4) {
    //             response.message = `Invalid request`;
    //         }
    //         else if (userId !== null && (decrypted[1] !== userType || decrypted[2] != userId)) {
    //             response.message = `Invalid request for this user`;
    //         } else if (parseInt(decrypted[3]) - new Date() <= 0) {
    //             response.message = `Url expired!`;
    //         } else {
    //             response.status = true;
    //             response.image_uri = decrypted[0];
    //         }
    //         return response;
    //     } catch (e) {
    //         logger.error(`error in decryptImageUri - ${ generateError(e) }`);
    //         return Promise.reject(e);
    //     }

    // };

    const getFirstAndLastName = (name) => {
        if (!name) name = "";
        name = name.split(" ");
        let firstName = name[0] || '';
        let lastName = '';
        if (name.length>=2) {
            let temp = name.splice(1);
            lastName = temp.join(" ");
        }
        return {firstName, lastName};
    };

    const snakeToCamelCase = (val) => {
        if (!val) return val;
        return val.replace(/[_][a-z]/gm, val => {
            return val.replace("_", "").toUpperCase();
        });
    };

    const snakeToObjectToCamelCaseObject = (obj) => {
        try {
            if (typeof obj === "string") obj = JSON.parse(obj);
            let res = {}, keys = Object.keys(obj);
            for (let i = 0; i < keys.length; ++i) {
                if (typeof obj[keys[i]] === "object") res[snakeToCamelCase(keys[i])] = snakeToObjectToCamelCaseObject(obj[keys[i]]);
                else res[snakeToCamelCase(keys[i])] = obj[keys[i]];
            }
            return res;
        } catch (ex) {
            return snakeToCamelCase(obj);
        }
    };

    const isSystemUnderMaintenance = () => {
        return (process.env.UNDER_MAINTENANCE && parseInt(process.env.UNDER_MAINTENANCE) === 1);
    };

    const getModule = (path) => {
        let module;
        try {
            module = require(path);
        } catch (err) {
            /*if (err.code === 'MODULE_NOT_FOUND') {
                return null;
            }
            logger.error(`error in get module - ${generateError(err)}`);*/
            throw err;
        }
        return module;
    };

    // const generatePublicS3BucketUrl = (path, fileName) => {
    //     return `${constants.S3_BUCKET_BASE_URL}${path}/${fileName}`;
    // };

    // const isAllowedMediaType = (fileType) => {
    //     return (fileType == constants.fileType.JPG
    //         || fileType == constants.fileType.PNG
    //         || fileType == constants.fileType.JPEG
    //         || fileType == constants.fileType.PDF)
    // }

    let formidablePromise  = async (req) => {
        return new Promise(function (resolve, reject) {
            let uploadDir = path.join(__dirname, '../../uploads');
            let form = new formidable.IncomingForm();
            form.uploadDir = uploadDir;
            form.keepExtensions = true;
            form.maxFileSize = 10 * 1024 * 1024; // 10MB

            form.on('error', function (err) {
                reject(err);
            });

            form.parse(req, function (err, fields, files) {
                if (err) return reject(err);
                resolve({ fields: fields, files: files })
            })
        });
    };

    const uploadDocument = async (requestData) => {
        try {
            let uploadDir = path.join(__dirname, '../../uploads');

            //todo confirm bucket 
            let bucket = s3Config.battery.BUCKET;
            let fileName = `${getUuid()}.${/(?:\.([^.]+))?$/.exec(requestData.uploadedDoc.path)[1]}`;
            let filePath = path.join(uploadDir, fileName);
            await renameFile(requestData.agreementImage.path, filePath);
            let fileData = await readFile(filePath);
            await s3Bucket.uploadFileAsBuffer({
                name: fileName,
                body: fileData,
                contentType: `image/${/(?:\.([^.]+))?$/.exec(fileName)[1] || 'jpeg'}`
            }, bucket, 'public-read');
            await deleteFile(filePath);
            return fileName;
        } catch (e) {
            logger.error(`Error in util.uploadDocument ${ generateError(e) }`);
            throw e;
        }
    };

    const validateRegex = (str, regex) => {
        return new RegExp(regex.substr(1, regex.length - 2)).test(str);
    };

    const isValueAvailableInArray = (obj, value) => {
        if (typeof obj !== "object") return null;
        const ar = Array.isArray(obj) ? obj : Object.values(obj);
        for (let i = 0; i < ar.length; ++i) if (ar[i] === value) return true;
        return false;
    };

    const parseErrorMessage = (obj) => {
        try {
            return JSON.parse(obj);
        } catch (e) {
            return { message: obj };
        }
    };

    const addDays = (days, date = new Date()) => {
        try {
            date.setDate(date.getDate() + days);
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        } catch (e) {
            return new Date();
        }
    };

    const formatAMPM = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    return {
        generateRandomString,
        generateError,
        getFullName,
        getFirstAndLastName,
        snakeToObjectToCamelCaseObject,
        isSystemUnderMaintenance,
        getModule,
        validateRegex,
        isValueAvailableInArray,
        formatAMPM,
        parseErrorMessage,
        addDays,
        formidablePromise
    };
};

module.exports = utilService;
