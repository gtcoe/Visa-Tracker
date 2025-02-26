const httpRequestValidator = () => {

    const utilService = require("./util")();

    const API_RESPONSE = {
        FIELD_REQUIRED: ""
    };

    const skipAble = { required: 1, type: 1, length: 1, minValue: 1, maxValue: 1, minLength: 1, maxLength: 1 };


    const validate = (method, value, validation) => {
        switch (method) {
            case "required" :
                return required(value, validation)
            case "type" :
                return validateDataType(value, validation)
            case "length" :
                return length(value, validation)
            case "minValue" :
                return minValue(value, validation)
            case "maxValue" :
                return maxValue(value, validation)
            case "minLength" :
                return minLength(value, validation)
            case "maxLength" :
                return maxLength(value, validation)
            case "pattern" :
                return pattern(value, validation)
            default :
        }
    }

    const validateDataType = (value, expected) => {
        return typeof value === expected;
    }

    const length = (value, len) => {
        return value.toString().length === len;
    }

    const required = (value, validation) => {
        return value !== undefined && value !== null;
    }

    const pattern = (value, validation) => {
        return utilService.validateRegex(value, validation["validations"]);
    }

    const minLength = (value, len = 1) => {
        return value.toString().trim().length > len;

    }

    const maxLength = (value, len = 1) => {
        return value.toString().trim().length < len;
    }

    const minValue = (value, validation) => {
        return value >= validation;
    }

    const maxValue = (value, validation) => {
        return value <= validation;
    }

    const multiplePattern = (value, validation) => {
        for (let i = 0; i < validation["validations"].length; ++i) {
            if (!pattern(value, validation["validations"][i])) return false;
        }
        return true;
    }

    const generateErrorResponse = (type, requestKey, targetType) => {
        const obj = {
            type: type,
            param: requestKey
        };
        if (type === "type") {
            obj.expected_type = targetType;
        }
        else if (type === "minLength") {
            delete obj.type;
            obj.message = `Minimum length ${ targetType } is required for ${ requestKey }`;
        }
        else if (type === "maxLength") {
            delete obj.type;
            obj.message = `Maximum length ${ targetType } is required for ${ requestKey }`;
        }
        else if (type === "minValue") {
            delete obj.type;
            obj.message = `Minimum value can be ${ targetType } for ${ requestKey }`;
        }
        else if (type === "maxValue") {
            delete obj.type;
            obj.message = `Maximum value can be ${ targetType } for ${ requestKey }`;
        }
        return obj;
    };
    const init = (reqData, reqValidation) => {
        if (!reqValidation) return [];
        const error_validations = [], fieldKeys = Object.keys(reqValidation);
        for (let i = 0; i < fieldKeys.length; ++i) {
            let request_key = fieldKeys[i];
            const subKeys = Object.keys(reqValidation[fieldKeys[i]]);

            if (!reqData) {
                error_validations.push(generateErrorResponse("required", request_key));
                return error_validations;
            }
            for (let j = 0; j < subKeys.length; ++j) {
                if (!skipAble[subKeys[j]] && typeof reqValidation[request_key] === "object") {
                    // const _data = Array.isArray(reqData[request_key]) ? reqData[request_key] : [reqData[request_key]];
                    // for (let k = 0; k < _data.length; ++k) {
                    //     error_validations.push(...init(reqData[k][request_key], request_key[fieldKeys[i]]));
                    // }
                    error_validations.push(...init(reqData[request_key], reqValidation[request_key]));
                    break;
                } else {
                    if (reqData[request_key] === null || reqData[request_key] === undefined) {
                        error_validations.push(generateErrorResponse('required', request_key));
                        break;
                    }
                    const isValid = validate(subKeys[j], reqData[request_key], reqValidation[fieldKeys[i]][subKeys[j]])
                    if (!isValid) {
                        error_validations.push(generateErrorResponse(subKeys[j], request_key, reqValidation[fieldKeys[i]][subKeys[j]]));
                        break;
                    }
                }
            }
        }
        return error_validations;
    }
    return {
        init
    };
};

module.exports = httpRequestValidator;
