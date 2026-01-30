import { apiRequest, apiRequestFormData, ApiClientError } from './client';

export interface SignupRequest {
	name: string;
	email: string;
	password: string;
	country: string;
	referral_code?: string;
	phone_no?: string;
	address?: string;
}

export interface SignupResponse {
	message?: string;
	user?: {
		id: string;
		email: string;
		name: string;
	};
	token?: string;
	[key: string]: any;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	message?: string;
	token?: string;
	access_token?: string;
	user?: {
		id: string;
		email: string;
		name?: string;
	};
	[key: string]: any;
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
	try {
		const payload = {
			email: data.email,
			password: data.password,
			name: data.name,
			phone_no: data.phone_no || '',
			country: data.country,
			address: data.address || '',
			referral_code: data.referral_code || '',
		};

		const response = await apiRequest<SignupResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to sign up. Please try again.');
	}
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
	try {
		const formData = new FormData();
		formData.append('username', data.username);
		formData.append('password', data.password);

		const response = await apiRequestFormData<LoginResponse>('/auth/signin', formData);
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to log in. Please try again.');
	}
}

export interface VerifyEmailRequest {
	email: string;
	code: string;
}

export interface VerifyEmailResponse {
	message?: string;
	success?: boolean;
	[key: string]: any;
}

export interface ResendCodeRequest {
	email: string;
}

export interface ResendCodeResponse {
	message?: string;
	success?: boolean;
	[key: string]: any;
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
	try {
		const response = await apiRequest<VerifyEmailResponse>('/auth/verify-email', {
			method: 'POST',
			body: JSON.stringify(data),
		});
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to verify email. Please try again.');
	}
}

export async function resendVerificationCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
	try {
		const response = await apiRequest<ResendCodeResponse>('/auth/resend-code', {
			method: 'POST',
			body: JSON.stringify(data),
		});
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to resend code. Please try again.');
	}
}

// Orders interfaces
export interface OrderCredentials {
	credential_id: number;
	server: string;
	platform_login: string;
	platform_password: string;
	profit_target?: number;
	session_id?: string;
	terminal_id?: number;
	profit_share?: number;
	status?: string;
}

export interface Order {
	order_id: string;
	username: string;
	status: string;
	account_size: string;
	challenge_type: string;
	created_at: string;
	platform: string;
	payment_method: string;
	payment_status: string;
	oxapay_payment_status: string | null;
	payment_intent_id: string | null;
	checkout_session_id: string | null;
	txid: string;
	checkout_session_url: string;
	image: string | null;
	completed_at: string | null;
	credentials: OrderCredentials | null;
	stage2_created_at: string | null;
	stage2_credentials: OrderCredentials | null;
	live_created_at: string | null;
	live_credentials: OrderCredentials | null;
}

export interface MyAccountResponse {
	user: {
		username: string;
		email: string;
		name: string;
	};
	total_orders: number;
	orders: Order[];
}

export async function getMyAccount(): Promise<MyAccountResponse> {
	try {
		const response = await apiRequest<MyAccountResponse>('/orders/my-account', {
			method: 'GET',
		});
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to fetch orders. Please try again.');
	}
}