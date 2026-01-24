import { apiRequest, apiRequestFormData, ApiClientError } from './client';

export interface SignupRequest {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone_no: string;
	referral_code?: string;
}

export interface SignupResponse {
	message?: string;
	user?: {
		id: string;
		email: string;
		first_name: string;
		last_name: string;
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
	user?: {
		id: string;
		email: string;
		first_name?: string;
		last_name?: string;
	};
	[key: string]: any;
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
	try {
		const response = await apiRequest<SignupResponse>('/auth/signup', {
			method: 'POST',
			body: JSON.stringify(data),
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

		const response = await apiRequestFormData<LoginResponse>('/auth/login', formData);
		return response;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to log in. Please try again.');
	}
}

