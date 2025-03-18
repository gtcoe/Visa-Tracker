interface PersonalInfo {
  first_name: string;
  last_name: string;
  email_id: string;
  date_of_birth: string;
  processing_branch: number;
}

interface PassportInfo {
  passport_number: string;
  date_of_issue: string;
  date_of_expiry: string;
  issue_at: string;
  no_of_expired_passport: number;
  expired_passport_number: string;
}

interface TravelInfo {
  travel_date: string;
  interview_date: string;
  file_no: string;
  is_travel_date_tentative: number;
  priority_submission: number;
}

interface VisaRequest {
  visa_country: number;
  visa_category: number;
  nationality: number;
  state: number;
  entry_type: number;
  remark?: string;
}

interface AddressInfo {
  address_line1: string;
  address_line2?: string;
  country: number;
  state: number;
  city: number;
  zip: string;
  occupation: string;
  position: string;
}

interface MIFields {
  olvt_number: string;
}

export interface AddStep3DataRequest {
  personal_info: PersonalInfo;
  passport_info: PassportInfo;
  travel_info: TravelInfo;
  visa_requests: VisaRequest[];
  address_info: AddressInfo;
  mi_fields?: MIFields;
  application_id: number;
  token_user_id?: number;
}

export function convertRequestToAddStep3DataRequest(requestBody: any): AddStep3DataRequest {
  return {
    personal_info: requestBody.personal_info,
    passport_info: requestBody.passport_info,
    travel_info: requestBody.travel_info,
    visa_requests: requestBody.visa_requests,
    address_info: requestBody.address_info,
    mi_fields: requestBody.mi_fields,
    application_id: requestBody.application_id,
    token_user_id: requestBody.token_user_id
  };
}
