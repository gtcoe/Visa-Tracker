import { ValidationSchema } from "../interface/request";

// todo add min max value check

const step3: ValidationSchema = {
  body: {
    token_user_id: {
      type: "number",
      required: true,
    },
    passengers: {
      type: "object",
      required: true,
    },
    visa_requests: {
      type: "object",
      required: true,
    },
    travel_details: {
      type: "object",
      required: true,
    },
    olvt_number: {
      type: "string",
      required: true,
    },
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
