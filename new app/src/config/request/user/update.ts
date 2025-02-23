import {ValidationSchema} from '../interface/request'

const update: ValidationSchema = {
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
  
  export default update;