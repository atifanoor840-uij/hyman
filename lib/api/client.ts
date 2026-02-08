// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://genz-34f298f57a04.herokuapp.com';

export interface ApiError {
	message: string;
	status?: number;
	errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
	status?: number;
	errors?: Record<string, string[]>;

	constructor(message: string, status?: number, errors?: Record<string, string[]>) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
		this.errors = errors;
	}
}

// Sanitize sensitive data from logs
function sanitizeForLog(data: any): any {
	if (!data || typeof data !== 'object') return data;
	
	const sanitized = { ...data };
	const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'secret'];
	
	for (const key of Object.keys(sanitized)) {
		if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
			sanitized[key] = '[REDACTED]';
		}
	}
	
	return sanitized;
}

async function handleResponse<T>(response: Response): Promise<T> {
	const contentType = response.headers.get('content-type');
	const isJson = contentType?.includes('application/json');

	let data: any;
	try {
		data = isJson ? await response.json() : await response.text();
	} catch (error) {
		throw new ApiClientError('Failed to parse response', response.status);
	}

	if (!response.ok) {
		const errors = data?.errors ?? data?.detail ?? undefined;
		let message = data?.message ?? data?.error ?? `Request failed with status ${response.status}`;
		// 422 validation: surface detail or flatten errors so user sees what's wrong
		if (response.status === 422 && errors != null) {
			if (Array.isArray(errors)) {
				message = errors.map((e: any) => e?.msg ?? e?.message ?? String(e)).filter(Boolean).join('; ') || message;
			} else if (typeof errors === 'object' && !Array.isArray(errors)) {
				const parts = Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
				message = parts.length ? parts.join('; ') : message;
			} else if (typeof errors === 'string') {
				message = errors;
			}
		}
		throw new ApiClientError(message, response.status, typeof errors === 'object' && !Array.isArray(errors) ? errors as Record<string, string[]> : undefined);
	}

	return data;
}

export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	// Get auth token from storage if available
	const token = typeof window !== 'undefined' 
		? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
		: null;

	const config: RequestInit = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers,
		},
		// Add credentials for cookie handling
		credentials: 'omit', // Don't send cookies cross-origin for security
	};

	try {
		const response = await fetch(url, config);
		return await handleResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiClientError) {
			// Skip console.error for 401/404 so UI can show friendly message only
			const status = (error as ApiClientError).status;
			if (process.env.NODE_ENV === 'development' && status !== 401 && status !== 404) {
				console.error('API Error:', (error as ApiClientError).message || 'Unknown error', {
					status,
					errors: sanitizeForLog((error as ApiClientError).errors),
				});
			}
			throw error;
		}
		const msg = error instanceof Error ? error.message : 'Network error occurred';
		throw new ApiClientError(msg || 'Request failed', 0);
	}
}

export async function apiRequestFormData<T>(
	endpoint: string,
	formData: FormData,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	// Get auth token from storage if available
	const token = typeof window !== 'undefined' 
		? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
		: null;

	const config: RequestInit = {
		...options,
		method: 'POST',
		body: formData,
		// Don't set Content-Type header - browser will set it with boundary
		headers: {
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers,
		},
		credentials: 'omit', // Don't send cookies cross-origin for security
	};

	try {
		const response = await fetch(url, config);
		return await handleResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiClientError) {
			const status = (error as ApiClientError).status;
			if (process.env.NODE_ENV === 'development' && status !== 401 && status !== 404) {
				console.error('API Error:', (error as ApiClientError).message || 'Unknown error', {
					status,
					errors: sanitizeForLog((error as ApiClientError).errors),
				});
			}
			throw error;
		}
		const msg = error instanceof Error ? error.message : 'Network error occurred';
		throw new ApiClientError(msg || 'Request failed', 0);
	}
}

