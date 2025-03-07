import { ValidationSchema } from "../interface/request";

const search: ValidationSchema = {
  body: {
    reference_number: {
      type: "string",
      required: false,
    },
    customer_type: {
      type: "number",
      required: false,
    },
    customer: {
      type: "string",
      required: false,
    },
    name: {
      type: "string",
      required: false,
    },
    passport_number: {
      type: "string",
      required: false,
    },
    visa_branch: {
      type: "number",
      required: false,
    },
    entry_generation_branch: {
      type: "string",
      required: false,
    },
    from_date: {
      type: "string",
      required: false,
    },
    to_date: {
      type: "string",
      required: false,
    },
    queue: {
      type: "number",
      required: false,
    },
    status: {
      type: "number",
      required: false,
    },
    country: {
      type: "string",
      required: false,
    },
    billing_to_company: {
      type: "string",
      required: false,
    },
  },
};

export default search;
