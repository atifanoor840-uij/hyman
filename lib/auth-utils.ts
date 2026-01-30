/**
 * Secure authentication utilities
 * Handles token management and user session with security best practices
 */

export interface User {
	id: string;
	email: string;
	name?: string;
	[key: string]: any;
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
	if (!input) return '';
	
	// Remove any HTML tags and trim whitespace
	return input
		.replace(/<[^>]*>/g, '')
		.replace(/[<>\"']/g, '')
		.trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && password.length >= 8;
}

/**
 * Securely store auth token
 */
export function setAuthToken(token: string, remember: boolean = false): void {
	if (typeof window === 'undefined') return;
	
	try {
		if (remember) {
			localStorage.setItem('auth_token', token);
		} else {
			sessionStorage.setItem('auth_token', token);
		}
	} catch (error) {
		console.error('Failed to store auth token:', error);
	}
}

/**
 * Get auth token from storage
 */
export function getAuthToken(): string | null {
	if (typeof window === 'undefined') return null;
	
	try {
		return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
	} catch (error) {
		console.error('Failed to retrieve auth token:', error);
		return null;
	}
}

/**
 * Remove auth token and user data (logout)
 */
export function clearAuth(): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user');
		sessionStorage.removeItem('auth_token');
		sessionStorage.removeItem('user');
	} catch (error) {
		console.error('Failed to clear auth data:', error);
	}
}

/**
 * Store user data securely
 */
export function setUser(user: User, remember: boolean = false): void {
	if (typeof window === 'undefined') return;
	
	try {
		const userData = JSON.stringify(user);
		if (remember) {
			localStorage.setItem('user', userData);
		} else {
			sessionStorage.setItem('user', userData);
		}
	} catch (error) {
		console.error('Failed to store user data:', error);
	}
}

/**
 * Get user data from storage
 */
export function getUser(): User | null {
	if (typeof window === 'undefined') return null;
	
	try {
		const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error('Failed to retrieve user data:', error);
		return null;
	}
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	return !!getAuthToken();
}

/**
 * Validate token format (basic check)
 */
export function isValidToken(token: string): boolean {
	if (!token || typeof token !== 'string') return false;
	
	// Basic validation: token should be reasonably long and not contain spaces
	return token.length > 20 && !token.includes(' ');
}

/**
 * Rate limiting helper - track login attempts
 */
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function trackLoginAttempt(email: string): boolean {
	if (typeof window === 'undefined') return true;
	
	try {
		const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
		const now = Date.now();
		
		if (!attempts[email]) {
			attempts[email] = { count: 1, lastAttempt: now };
		} else {
			// Reset if lockout duration has passed
			if (now - attempts[email].lastAttempt > LOCKOUT_DURATION) {
				attempts[email] = { count: 1, lastAttempt: now };
			} else {
				attempts[email].count++;
				attempts[email].lastAttempt = now;
			}
		}
		
		localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
		
		return attempts[email].count <= MAX_ATTEMPTS;
	} catch (error) {
		console.error('Failed to track login attempt:', error);
		return true; // Allow login if tracking fails
	}
}

export function clearLoginAttempts(email: string): void {
	if (typeof window === 'undefined') return;
	
	try {
		const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
		delete attempts[email];
		localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
	} catch (error) {
		console.error('Failed to clear login attempts:', error);
	}
}

export function getRemainingLockoutTime(email: string): number {
	if (typeof window === 'undefined') return 0;
	
	try {
		const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
		if (!attempts[email] || attempts[email].count < MAX_ATTEMPTS) return 0;
		
		const now = Date.now();
		const timeSinceLastAttempt = now - attempts[email].lastAttempt;
		const remaining = LOCKOUT_DURATION - timeSinceLastAttempt;
		
		return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
	} catch (error) {
		console.error('Failed to get lockout time:', error);
		return 0;
	}
}
