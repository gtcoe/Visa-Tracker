export interface AddStep2DataRequest {
  pax_id: number;
  reference_number: string;
  last_updated_by: number;
}

export const convertRequestToAddStep2DataRequest = (
  request: any
): AddStep2DataRequest => ({
  pax_id: Number(request.pax_id),
  reference_number: String(request.reference_number),
  last_updated_by: Number(request.token_user_id),
});
