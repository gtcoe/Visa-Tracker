import { ValidationSchema } from "../interface/request";

const add: ValidationSchema = {
  body: {
    token_user_id: {
      type: "number",
      required: true,
    },
    name: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
    },
    type: {
      type: "number",
      required: true,
    },
  },
};

export default add;
