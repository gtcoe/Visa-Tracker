import { ValidationSchema } from "../interface/request";

// todo add min max value check

const step3: ValidationSchema = {
  body: {
    token_user_id: {
      type: "number",
      required: true,
    },
    personal_info: {
      type: "object",
      required: true,
      properties: {
        first_name: {
          type: "string",
          required: true,
        },
        last_name: {
          type: "string",
          required: true,
        },
        email_id: {
          type: "string",
          required: true,
        },
        date_of_birth: {
          type: "string",
          required: true,
        },
        processing_branch: {
          type: "number",
          required: true,
        }
      }
    },
    passport_info: {
      type: "object",
      required: true,
      properties: {
        passport_number: {
          type: "string",
          required: true,
        },
        date_of_issue: {
          type: "string",
          required: true,
        },
        date_of_expiry: {
          type: "string",
          required: true,
        },
        issue_at: {
          type: "string",
          required: true,
        },
        no_of_expired_passport: {
          type: "number",
          required: true,
        },
        expired_passport_number: {
          type: "string",
          required: true,
        }
      }
    },
    travel_info: {
      type: "object",
      required: true,
      properties: {
        travel_date: {
          type: "string",
          required: true,
        },
        interview_date: {
          type: "string",
          required: true,
        },
        file_no: {
          type: "string",
          required: true,
        },
        is_travel_date_tentative: {
          type: "number",
          required: true,
        },
        priority_submission: {
          type: "number",
          required: true,
        }
      }
    },
    visa_requests: {
      type: "array",
      required: true,
      items: {
        type: "object",
        properties: {
          visa_country: {
            type: "number",
            required: true,
          },
          visa_category: {
            type: "number",
            required: true,
          },
          nationality: {
            type: "number",
            required: true,
          },
          state: {
            type: "number",
            required: true,
          },
          entry_type: {
            type: "number",
            required: true,
          },
          remark: {
            type: "string",
            required: false,
          }
        }
      }
    },
    address_info: {
      type: "object",
      required: true,
      properties: {
        address_line1: {
          type: "string",
          required: true,
        },
        address_line2: {
          type: "string",
          required: false,
        },
        country: {
          type: "number",
          required: true,
        },
        state: {
          type: "number",
          required: true,
        },
        city: {
          type: "number",
          required: true,
        },
        zip: {
          type: "string",
          required: true,
        },
        occupation: {
          type: "string",
          required: true,
        },
        position: {
          type: "string",
          required: true,
        }
      }
    },
    mi_fields: {
      type: "object",
      required: false,
    },
    application_id: {
      type: "number",
      required: true,
    }
  },
};

export default step3;

const a = {
  passengers: [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      date_of_birth: "1990-01-01",
      processing_branch: "Mumbai",
      passport_details: {
        passport_number: "A12345678",
        date_of_issue: "2015-06-15",
        date_of_expiry: "2025-06-14",
        issue_at: "Delhi",
        no_of_expired_passports: 1,
        expired_passport_number: "X98765432",
      },
      address: {
        address_line_1: "123 Street",
        address_line_2: "Apt 456",
        country: "India",
        state: "Haryana",
        city: "Mumbai",
        zip: "400001",
        occupation: "Engineer",
        position: "Senior Developer",
      },
    },
  ],
  visa_requests: [
    {
      visa_country: 2,
      visa_category: 3,
      nationality: 1,
      state: 6,
      entry_type: 9,
      remark: "Urgent processing",
    },
  ],
  travel_details: {
    travel_date: "2025-02-25",
    interview_date: "2025-03-01",
    file_number: "XYZ123",
    date_fixed: true,
    priority_submission: false,
  },
  olvt_number: "GCJWHNBJ25735",
};
