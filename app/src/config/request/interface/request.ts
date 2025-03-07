export interface FieldConfig {
  type: "number" | "string" | "object";
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface ValidationSchema {
  body?: {
    token_user_id?: FieldConfig;
    text?: FieldConfig;
    status?: FieldConfig;
    id?: FieldConfig;
    email?: FieldConfig;
    password?: FieldConfig;
    name?: FieldConfig;
    type?: FieldConfig;
    user_id?: FieldConfig;
    address?: FieldConfig;
    branches?: FieldConfig;
    gst_number?: FieldConfig;
    owner_name?: FieldConfig;
    owner_phone?: FieldConfig;
    owner_email?: FieldConfig;
    spoke_name?: FieldConfig;
    spoke_phone?: FieldConfig;
    spoke_email?: FieldConfig;
    billing_cycle?: FieldConfig;
    full_name?: FieldConfig;
    pax_type?: FieldConfig;
    country_of_residence?: FieldConfig;
    client_user_id?: FieldConfig;
    state_of_residence?: FieldConfig;
    citizenship?: FieldConfig;
    service_type?: FieldConfig;
    referrer?: FieldConfig;
    file_number?: FieldConfig;
    pax_name?: FieldConfig;
    passport_number?: FieldConfig;
    reference_number?: FieldConfig;
    pax_id?: FieldConfig;
    passengers?: FieldConfig;
    visa_requests?: FieldConfig;
    travel_details?: FieldConfig;
    olvt_number?: FieldConfig;
    dispatch_medium?: FieldConfig;
    dispatch_medium_number?: FieldConfig;
    customer_type?: FieldConfig;
    customer?: FieldConfig;
    visa_branch?: FieldConfig;
    entry_generation_branch?: FieldConfig;
    from_date?: FieldConfig;
    to_date?: FieldConfig;
    remarks?: FieldConfig;
    country?: FieldConfig;
    billing_to_company?: FieldConfig;
    queue?: FieldConfig;
  };
  param?: {
    id?: FieldConfig;
  };
}
