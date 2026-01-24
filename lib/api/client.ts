const API_BASE_URL = 'https://genz-34f298f57a04.herokuapp.com';

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
		const message = data?.message || data?.error || `Request failed with status ${response.status}`;
		const errors = data?.errors || undefined;
		throw new ApiClientError(message, response.status, errors);
	}

	return data;
}

export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const config: RequestInit = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, config);
		return await handleResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError(
			error instanceof Error ? error.message : 'Network error occurred',
			0
		);
	}
}

export async function apiRequestFormData<T>(
	endpoint: string,
	formData: FormData,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const config: RequestInit = {
		...options,
		method: 'POST',
		body: formData,
		// Don't set Content-Type header - browser will set it with boundary
		headers: {
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, config);
		return await handleResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError(
			error instanceof Error ? error.message : 'Network error occurred',
			0
		);
	}
}





