export type AddClientRequest = {
  user_id?: number;
  type: number;
  address: string;
  full_name: string;
  branches: string;
  gst_number: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  spoke_name: string;
  spoke_phone: string;
  spoke_email: string;
  billing_cycle: string;
  last_updated_by: number;
};

export const convertRequestToAddClientRequest = (
  request: any
): AddClientRequest => ({
  type: Number(request.type),
  address: String(request.address),
  full_name: String(request.full_name),
  branches: String(request.branches),
  gst_number: String(request.gst_number),
  owner_name: String(request.owner_name),
  owner_phone: String(request.owner_phone),
  owner_email: String(request.owner_email),
  spoke_name: String(request.spoke_name),
  spoke_phone: String(request.spoke_phone),
  spoke_email: String(request.spoke_email),
  billing_cycle: String(request.billing_cycle),
  last_updated_by: Number(request.token_user_id),
});
