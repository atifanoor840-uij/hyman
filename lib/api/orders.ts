import { apiRequestFormData, ApiClientError } from './client';

export interface CreateOrderParams {
	challenge_type: string;
	account_size: string;
	platform: string;
	payment_method: string;
	amount: string;
	token_name?: string;
	txid?: string;
	image?: string;
}

export interface CreateOrderResponse {
	id?: number;
	order_id?: string;
	username?: string;
	email?: string;
	amount?: number;
	challenge_type?: string;
	account_size?: string;
	platform?: string;
	payment_method?: string;
	payment_status?: string | null;
	oxapay_payment_status?: string | null;
	payment_intent_id?: string | null;
	txid?: string | null;
	checkout_session_url?: string | null;
	image?: string | null;
	status?: string;
	is_active?: boolean;
	timeline?: Array<{ event_type: string; event_date: string; notes?: string }>;
	completed?: boolean;
	passed?: boolean;
	is_stage2?: boolean;
	is_live?: boolean;
	failed?: boolean;
	has_account_credential?: boolean;
	message?: string;
	payment_required?: boolean;
}

/**
 * Create an order by POSTing form data to /orders/create.
 * Sends: challenge_type, account_size, platform, payment_method, amount, token_name (empty), txid (empty), image (empty).
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
	const formData = new FormData();
	formData.append('challenge_type', params.challenge_type);
	formData.append('account_size', params.account_size);
	formData.append('platform', params.platform);
	formData.append('payment_method', params.payment_method);
	formData.append('amount', params.amount);
	formData.append('token_name', params.token_name ?? '');
	formData.append('txid', params.txid ?? '');
	formData.append('image', params.image ?? '');

	return apiRequestFormData<CreateOrderResponse>('/orders/create', formData);
}

/** Params for crypto (Oxapay) order creation */
export interface CreateOrderWithOxapayParams {
	challenge_type: string;
	account_size: string;
	platform: string;
	amount: string;
	currency: string;
	to_currency: string;
	order_name: string;
	description: string;
	lifetime: number;
	fee_paid_by_payer: number;
	under_paid_coverage: number;
	auto_withdrawal: boolean;
	mixed_payment: boolean;
	return_url: string;
	thanks_message: string;
}

/** Default description and thanks message for Oxapay orders */
export const OXAPAY_ORDER_DESCRIPTION =
	'FxGenz funded trading challenge — secure payment for your evaluation account. Complete your challenge and get funded.';
export const OXAPAY_THANKS_MESSAGE =
	'Thank you for your payment. Your order is being processed. You will receive your account credentials shortly.';

/** Crypto (Oxapay) order endpoint — called when user selects Crypto on Buys checkout. */
const ORDERS_CREATE_WITH_OXAPAY = '/orders/create-with-oxapay';

/**
 * Create a crypto order via Oxapay — POST /orders/create-with-oxapay (FormData).
 * Use when payment method is Crypto on the Buys page. Sends form data to avoid 422 validation issues.
 */
export async function createOrderWithOxapay(
	params: CreateOrderWithOxapayParams
): Promise<CreateOrderResponse> {
	const formData = new FormData();
	formData.append('challenge_type', params.challenge_type);
	formData.append('account_size', params.account_size);
	formData.append('platform', params.platform);
	formData.append('amount', params.amount);
	formData.append('currency', params.currency);
	formData.append('to_currency', params.to_currency);
	formData.append('order_name', params.order_name);
	formData.append('description', params.description);
	formData.append('lifetime', String(params.lifetime));
	formData.append('fee_paid_by_payer', String(params.fee_paid_by_payer));
	formData.append('under_paid_coverage', String(params.under_paid_coverage));
	formData.append('auto_withdrawal', params.auto_withdrawal ? 'true' : 'false');
	formData.append('mixed_payment', params.mixed_payment ? 'true' : 'false');
	formData.append('return_url', params.return_url);
	formData.append('thanks_message', params.thanks_message);
	return apiRequestFormData<CreateOrderResponse>(ORDERS_CREATE_WITH_OXAPAY, formData);
}
