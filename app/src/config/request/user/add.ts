import {ValidationSchema} from '../interface/request'

const add: ValidationSchema = {
    body: {
      updated_by_id: {
        type: "number",
        required: true,
      },
      updated_by: {
        type: "string",
        required: true,
      },
    },
    param: {
      id: {
        type: "number",
        required: true,
      },
    },
  };
  
  export default add;