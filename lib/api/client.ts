// The external FastAPI backend this client used to call has been removed.
// These exports are kept only so existing call sites keep typechecking while
// each one is ported to a Supabase-backed route/service during the migration.
// See: C:\Users\LUNAR\.claude\plans\frolicking-mapping-fiddle.md

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

const NOT_MIGRATED_MESSAGE =
	'This feature is being migrated to the new backend and is temporarily unavailable.';

export async function apiRequest<T>(_endpoint: string, _options: RequestInit = {}): Promise<T> {
	throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501);
}

export async function apiRequestFormData<T>(
	_endpoint: string,
	_formData: FormData,
	_options: RequestInit = {}
): Promise<T> {
	throw new ApiClientError(NOT_MIGRATED_MESSAGE, 501);
}
