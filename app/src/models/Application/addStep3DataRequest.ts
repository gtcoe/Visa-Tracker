// export const convertRequestToAddUserRequest = (
//   request: any
// ): AddUserRequest => ({
//   name: String(request.name),
//   email: String(request.email),
//   status: Number(request.status),
//   type: Number(request.type),
//   last_updated_by: Number(request.token_user_id),
// });

export interface PassportDetails {
  passport_number?: string;
  date_of_issue?: string;
  date_of_expiry?: string;
  issue_at?: string;
  no_of_expired_passports?: number;
  expired_passport_number?: string;
}

export interface Address {
  address_line_1?: string;
  address_line_2?: string;
  country?: string;
  city?: string;
  zip?: string;
  occupation?: string;
  position?: string;
}

export interface Passenger {
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  passport_details?: PassportDetails;
  address?: Address;
  processing_branch?: string;
}

export interface VisaRequest {
  visa_country?: string;
  visa_category?: string;
  nationality?: string;
  state?: string;
  entry_type?: string;
  remark?: string;
}

export interface TravelDetails {
  travel_date?: string;
  interview_date?: string;
  file_number?: string;
  is_travel_date_tentative?: boolean;
  priority_submission?: boolean;
}

export interface AddStep3DataRequest {
  passengers?: Passenger[];
  visa_requests?: VisaRequest[];
  travel_details?: TravelDetails;
  olvt_number?: string;
}
