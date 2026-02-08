import { apiRequest, ApiClientError } from './client';

export interface WithdrawalEligibilityResponse {
  is_eligible: boolean;
  reason: string;
  points_balance: number;
  min_points_required: number;
  kyc_verified: boolean;
  account_age_days: number;
  min_account_age_required: number;
}

/**
 * GET /withdrawal/my-eligible - Check if user is eligible to request withdrawals.
 * If is_eligible is true, show withdrawal form; otherwise show blurred page with reason.
 */
export async function getWithdrawalEligibility(): Promise<WithdrawalEligibilityResponse> {
  try {
    const data = await apiRequest<WithdrawalEligibilityResponse>('/withdrawal/my-eligible', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError('Failed to check withdrawal eligibility. Please try again.');
  }
}
