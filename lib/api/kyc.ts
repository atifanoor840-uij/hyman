import { apiRequest, ApiClientError } from './client';

export interface KycEligibilityResponse {
  is_eligible: boolean;
  has_kyc_submission: boolean;
  kyc_status: string | null;
  message: string;
}

export interface KycSessionResponse {
  url: string;
  session_id: string;
  message: string;
}

const DEFAULT_CALLBACK_URL = 'https://propakd.vercel.app/kyc/webhook';

/**
 * GET /kyc/eligibility - Check if user is eligible to submit KYC.
 * If is_eligible is true, user can start KYC (create session and redirect).
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

/**
 * GET /kyc/session?callback_url=... - Create a KYC session and get verification URL.
 * Redirect the user to the returned url to complete verification.
 */
export async function createKycSession(callbackUrl: string = DEFAULT_CALLBACK_URL): Promise<KycSessionResponse> {
  try {
    const params = new URLSearchParams({ callback_url: callbackUrl });
    const data = await apiRequest<KycSessionResponse>(`/kyc/session?${params.toString()}`, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError('Failed to start KYC verification. Please try again.');
  }
}
