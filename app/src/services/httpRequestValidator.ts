import { validateRegex } from "./util";

interface ValidationRules {
  required?: boolean;
  type?: string;
  length?: number;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: { validations: any };
  // You can extend this interface if additional rules are needed.
  [key: string]: any;
}

interface ErrorResponse {
  type?: string;
  param: string;
  expected_type?: string;
  message?: string;
}

interface ValidationSchema {
  [field: string]: ValidationRules;
}

const skipAble: Record<string, number> = {
  required: 1,
  type: 1,
  length: 1,
  minValue: 1,
  maxValue: 1,
  minLength: 1,
  maxLength: 1,
};

const validate = (method: string, value: any, rule: any): boolean => {
  switch (method) {
    case "required":
      return required(value);
    case "type":
      return validateDataType(value, rule);
    case "length":
      return length(value, rule);
    case "minValue":
      return minValue(value, rule);
    case "maxValue":
      return maxValue(value, rule);
    case "minLength":
      return minLength(value, rule);
    case "maxLength":
      return maxLength(value, rule);
    case "pattern":
      return pattern(value, rule);
    default:
      return true;
  }
};

const validateDataType = (value: any, expected: string): boolean => {
  return typeof value === expected;
};

const length = (value: any, len: number): boolean => {
  return value.toString().length === len;
};

const required = (value: any): boolean => {
  return value !== undefined && value !== null;
};

const pattern = (value: any, validation: { validations: any }): boolean => {
  return validateRegex(value, validation.validations);
};

const minLength = (value: any, len: number = 1): boolean => {
  return value.toString().trim().length >= len;
};

const maxLength = (value: any, len: number = 1): boolean => {
  return value.toString().trim().length <= len;
};

const minValue = (value: any, min: number): boolean => {
  return value >= min;
};

const maxValue = (value: any, max: number): boolean => {
  return value <= max;
};

const multiplePattern = (value: any, validation: { validations: any[] }): boolean => {
  for (let i = 0; i < validation.validations.length; ++i) {
    if (!pattern(value, { validations: validation.validations[i] })) return false;
  }
  return true;
};

const generateErrorResponse = (type: string, requestKey: string, targetType?: any): ErrorResponse => {
  const error: ErrorResponse = {
    type,
    param: requestKey,
  };

  if (type === "type") {
    error.expected_type = targetType;
  } else if (type === "minLength") {
    delete error.type;
    error.message = `Minimum length ${targetType} is required for ${requestKey}`;
  } else if (type === "maxLength") {
    delete error.type;
    error.message = `Maximum length ${targetType} is required for ${requestKey}`;
  } else if (type === "minValue") {
    delete error.type;
    error.message = `Minimum value can be ${targetType} for ${requestKey}`;
  } else if (type === "maxValue") {
    delete error.type;
    error.message = `Maximum value can be ${targetType} for ${requestKey}`;
  }

  return error;
};

const init = (reqData: any, reqValidation: ValidationSchema): ErrorResponse[] => {
  const errors: ErrorResponse[] = [];

  if (!reqValidation) return errors;

  const fieldKeys = Object.keys(reqValidation);
  for (const requestKey of fieldKeys) {
    const rules: ValidationRules = reqValidation[requestKey];

    // If there is no request data at all, return an error immediately.
    if (reqData === undefined || reqData === null) {
      errors.push(generateErrorResponse("required", requestKey));
      continue;
    }

    // Process nested objects if the rule value is an object and not one of the skipAble keys.
    const ruleKeys = Object.keys(rules);
    for (const ruleKey of ruleKeys) {
      if (!skipAble[ruleKey] && typeof rules === "object") {
        // Recursively validate nested data.
        errors.push(...init(reqData[requestKey], rules));
        break;
      } else {
        // If field is missing, push a required error.
        if (reqData[requestKey] === undefined || reqData[requestKey] === null) {
          errors.push(generateErrorResponse("required", requestKey));
          break;
        }
        // Validate the field using the provided rule.
        const isValid = validate(ruleKey, reqData[requestKey], rules[ruleKey]);
        if (!isValid) {
          errors.push(generateErrorResponse(ruleKey, requestKey, rules[ruleKey]));
          break;
        }
      }
    }
  }

  return errors;
};

export default {
  init,
};
