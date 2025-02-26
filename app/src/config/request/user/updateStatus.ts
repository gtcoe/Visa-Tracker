import constants from "../../constants";
import {ValidationSchema} from '../interface/request'

const validationSchema: ValidationSchema = {
    body: {
      status: {
        type: "number",
        required: true,
        minValue: constants.STATUS.USER.ACTIVE,
        maxValue: constants.STATUS.USER.INACTIVE,
      },
      id: {
        type: "number",
        required: true,
        minValue: 0,
      },
    },
  };
  
  export default validationSchema;