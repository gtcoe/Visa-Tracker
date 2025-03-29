import { ValidationSchema } from "../interface/request";
import { EMAIL_TYPE } from "../../../models/Email/sendEmailRequest";

const send: ValidationSchema = {
  body: {
    email_id: {
      type: "string",
      required: true,
    },
    type: {
      type: "number",
      required: true,
      minValue: EMAIL_TYPE.WELCOME,
      maxValue: EMAIL_TYPE.NOTIFICATION,
    }
  },
};

export default send;
