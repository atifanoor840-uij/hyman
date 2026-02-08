import { apiRequest, ApiClientError } from './client';

export interface KycEligibilityResponse {
  eligible: boolean;
  has_live_order: boolean;
  has_instant_account: boolean;
  has_kyc_submission: boolean;
  live_orders_count: number;
  instant_orders_count: number;
  kyc_status: string | null;
  message: string;
}

/**
 * GET /kyc/eligibility - Check if user is eligible to submit KYC.
 * If eligible is true, show KYC form; otherwise show blurred page with message.
 */
export async function getKycEligibility(): Promise<KycEligibilityResponse> {
  try {
    const data = await apiRequest<KycEligibilityResponse>('/kyc/eligibility', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError('Failed to check KYC eligibility. Please try again.');
  }
}
