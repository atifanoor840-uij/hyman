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
	/** ShowMyTrades graph key or dashboard URL returned by backend */
	graph_link?: string | null;
	session_id?: string;
	terminal_id?: number;
	profit_share?: number;
	status?: string;
}

/** New my-account shape: list of credentials (e.g. Stage 1 / Stage 2) */
export interface CredentialWithStatus {
	credential_id: number;
	account_status?: string;
	status_type?: string;
	platform: string;
	server: string;
	platform_login: string;
	platform_password: string;
	profit_target?: number;
	/** ShowMyTrades dashboard link (preferred key source for stats) */
	graph_link?: string | null;
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
	payment_status: string | null;
	oxapay_payment_status: string | null;
	payment_intent_id: string | null;
	checkout_session_id: string | null;
	txid: string | null;
	checkout_session_url: string | null;
	image: string | null;
	completed_at?: string | null;
	credentials?: OrderCredentials | null;
	stage2_created_at?: string | null;
	stage2_credentials?: OrderCredentials | null;
	live_created_at?: string | null;
	live_credentials?: OrderCredentials | null;
	/** New API: credentials list with platform_login for ShowMyTrades */
	credentials_with_status?: CredentialWithStatus[];
	account_status?: string;
	status_type?: string;
}

export type ResolvedOrderCredentials = {
	platform: string;
	platformLogin: string;
	credential: OrderCredentials;
};

/** Normalize order_id from URL vs API (e.g. OX%2395730891 vs OX#95730891). */
export function normalizeOrderIdForMatch(raw: string): string {
	const t = String(raw ?? "").trim();
	if (!t) return "";
	try {
		return decodeURIComponent(t);
	} catch {
		return t;
	}
}

/** True when two order ids refer to the same order after decode/trim. */
export function orderIdsMatch(a: string, b: string): boolean {
	if (!a || !b) return false;
	return normalizeOrderIdForMatch(a) === normalizeOrderIdForMatch(b);
}

/** Find an order when `selectedOrderId` may be URL-encoded differently than `order_id`. */
export function findOrderById(orders: Order[], rawOrderId: string): Order | undefined {
	if (!orders.length || !rawOrderId) return undefined;
	const trimmed = rawOrderId.trim();
	const direct = orders.find((o) => o.order_id === trimmed);
	if (direct) return direct;
	const q = normalizeOrderIdForMatch(trimmed);
	const byDecoded = orders.find((o) => normalizeOrderIdForMatch(o.order_id) === q);
	if (byDecoded) return byDecoded;
	return orders.find((o) => orderIdsMatch(o.order_id, trimmed));
}

function pickPlatformLoginFromRow(
	c: CredentialWithStatus & { platformLogin?: string }
): string {
	const v = c.platform_login ?? c.platformLogin;
	if (v === null || v === undefined) return "";
	return String(v).trim();
}

function credentialsListFromOrder(order: Order): CredentialWithStatus[] {
	const extended = order as Order & { credentialsWithStatus?: CredentialWithStatus[] };
	const raw = order.credentials_with_status ?? extended.credentialsWithStatus;
	if (!raw) return [];
	if (!Array.isArray(raw)) return [];
	return raw;
}

function pickGraphLinkFromRow(row: unknown): string | null {
	if (!row || typeof row !== "object") return null;
	const r = row as Record<string, unknown>;
	const v = r.graph_link ?? r.graphLink ?? r.graphlink;
	if (v === null || v === undefined) return null;
	const s = String(v).trim();
	return s ? s : null;
}

/**
 * Resolves MT login + platform for ShowMyTrades (`mt5-{platform_login}`).
 * Prefers legacy `credentials` / `stage2_credentials` / `live_credentials`, then `credentials_with_status`
 * (active account first, then first entry with platform_login).
 */
export function getOrderCredentialsForStats(
	order: Order | null | undefined
): ResolvedOrderCredentials | null {
	if (!order) return null;
	const list = credentialsListFromOrder(order);
	const listActive = list.find(
		(c) => String(c.account_status ?? "").toLowerCase().trim() === "active"
	);
	const graphFromList =
		pickGraphLinkFromRow(listActive) ??
		pickGraphLinkFromRow(list.find((c) => pickGraphLinkFromRow(c))) ??
		null;

	const legacy =
		order.credentials ?? order.stage2_credentials ?? order.live_credentials;
	const legacyLogin =
		legacy?.platform_login != null ? String(legacy.platform_login).trim() : "";
	if (legacyLogin.length > 0 && legacy) {
		const platform = (order.platform ?? "mt5").toLowerCase().trim();
		return {
			platform,
			platformLogin: legacyLogin,
			credential: {
				...legacy,
				// Prefer backend-returned graph_link from legacy, else fall back to credentials_with_status list.
				graph_link: legacy.graph_link ?? graphFromList,
			},
		};
	}
	if (list.length === 0) return null;
	const active = list.find(
		(c) =>
			String(c.account_status ?? "").toLowerCase().trim() === "active" &&
			pickPlatformLoginFromRow(c as CredentialWithStatus & { platformLogin?: string })
	);
	const picked =
		active ??
		list.find((c) => pickPlatformLoginFromRow(c as CredentialWithStatus & { platformLogin?: string })) ??
		null;
	const pl = picked
		? pickPlatformLoginFromRow(picked as CredentialWithStatus & { platformLogin?: string })
		: "";
	if (!pl) return null;
	const platform = (picked!.platform ?? order.platform ?? "mt5").toLowerCase().trim();
	return {
		platform,
		platformLogin: pl,
		credential: {
			credential_id: picked!.credential_id,
			server: picked!.server,
			platform_login: pl,
			platform_password: picked!.platform_password,
			profit_target: picked!.profit_target,
			graph_link: picked!.graph_link ?? null,
		},
	};
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

/** Maps this app's `challenge_plans.name` values to the tokens rules-config.ts expects. */
function planNameToChallengeType(name: string | undefined): string {
	const n = (name ?? '').toLowerCase().trim();
	if (n === 'one step') return 'step1';
	if (n === 'two step') return 'step2';
	if (n === 'instant') return 'instant';
	return n;
}

function orderStatusToLegacy(status: string): string {
	switch (status) {
		case 'pending_payment':
			return 'Pending';
		case 'processing':
			return 'Processing';
		case 'passed':
			return 'Passed';
		case 'failed':
			return 'Failed';
		default:
			return 'Active';
	}
}

/**
 * `getMyAccount()` used to hit the external FastAPI backend directly. It now
 * composes /api/orders + /api/accounts (this app's real Supabase-backed
 * routes) and maps them onto the legacy `Order` shape below, so the existing
 * gauge/credentials-dialog UI (Header, dashboard/page.tsx,
 * performance/[order-id]/page.tsx) keeps working unmodified.
 */
export async function getMyAccount(): Promise<MyAccountResponse> {
	const { listMyOrders, listMyAccounts } = await import('./app-client');
	try {
		const [ordersRes, accountsRes] = await Promise.all([listMyOrders(), listMyAccounts()]);
		const accountsByOrder = new Map<string, typeof accountsRes.accounts>();
		for (const acc of accountsRes.accounts) {
			if (!acc.orderId) continue;
			const list = accountsByOrder.get(acc.orderId) ?? [];
			list.push(acc);
			accountsByOrder.set(acc.orderId, list);
		}

		const orders: Order[] = ordersRes.orders.map((o) => {
			const accounts = accountsByOrder.get(o.id) ?? [];
			const toCredential = (a: (typeof accounts)[number]): OrderCredentials => ({
				credential_id: 0,
				server: a.server,
				platform_login: a.login,
				platform_password: a.passwordMaster ?? '',
				profit_target: a.profitTarget,
				graph_link: a.graphLink,
			});
			const toCredentialWithStatus = (a: (typeof accounts)[number]): CredentialWithStatus => ({
				credential_id: 0,
				account_status: a.status,
				status_type: a.phase ?? undefined,
				platform: a.platform,
				server: a.server,
				platform_login: a.login,
				platform_password: a.passwordMaster ?? '',
				profit_target: a.profitTarget,
				graph_link: a.graphLink,
			});

			const phase1 = accounts.find((a) => a.phase === 'phase1');
			const phase2 = accounts.find((a) => a.phase === 'phase2');
			const funded = accounts.find((a) => a.phase === 'funded');

			return {
				order_id: o.id,
				username: '',
				status: orderStatusToLegacy(o.status),
				account_size: String(o.challenge_plans?.size ?? ''),
				challenge_type: planNameToChallengeType(o.challenge_plans?.name),
				created_at: o.createdAt ?? '',
				platform: accounts[0]?.platform ?? o.challenge_plans?.platform ?? '',
				payment_method: o.paymentMethod,
				payment_status: o.status === 'failed' ? 'failed' : o.status === 'pending_payment' ? 'pending' : 'paid',
				oxapay_payment_status: null,
				payment_intent_id: null,
				checkout_session_id: null,
				txid: null,
				checkout_session_url: null,
				image: null,
				credentials: phase1 ? toCredential(phase1) : null,
				stage2_credentials: phase2 ? toCredential(phase2) : null,
				live_credentials: funded ? toCredential(funded) : null,
				credentials_with_status: accounts.map(toCredentialWithStatus),
			};
		});

		return {
			user: { username: '', email: '', name: '' },
			total_orders: orders.length,
			orders,
		};
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}
		throw new ApiClientError('Failed to fetch orders. Please try again.');
	}
}