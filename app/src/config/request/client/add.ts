import { ValidationSchema } from "../interface/request";

const add: ValidationSchema = {
  body: {
    token_user_id: {
      type: "number",
      required: true,
    },
    full_name: {
      type: "string",
      required: true,
    },
    address: {
      type: "string",
      required: true,
    },
    branches: {
      type: "string",
      required: true,
    },
    gst_number: {
      type: "string",
      required: true,
    },
    owner_name: {
      type: "string",
      required: true,
    },
    owner_phone: {
      type: "string",
      required: true,
    },
    owner_email: {
      type: "string",
      required: true,
    },
    spoke_name: {
      type: "string",
      required: true,
    },
    spoke_phone: {
      type: "string",
      required: true,
    },
    spoke_email: {
      type: "string",
      required: true,
    },
    billing_cycle: {
      type: "string",
      required: true,
    },
  },
};

export default add;
