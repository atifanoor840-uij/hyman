'use client';

import { useEffect } from 'react';

declare global {
	interface Window {
		chatwootSDK?: {
			run: (config: { websiteToken: string; baseUrl: string }) => void;
		};
	}
}

export default function ChatwootWidget() {
	useEffect(() => {
		// Check if already loaded
		if (document.querySelector('script[src*="chatwoot"]')) {
			return;
		}

		const BASE_URL = 'https://app.chatwoot.com';
		const script = document.createElement('script');
		script.src = `${BASE_URL}/packs/js/sdk.js`;
		script.async = true;

		script.onload = function () {
			if (window.chatwootSDK) {
				window.chatwootSDK.run({
					websiteToken: 'eM8Kj1TyMeveHSvKeq8bSo4P',
					baseUrl: BASE_URL,
				});
			}
		};

		const firstScript = document.getElementsByTagName('script')[0];
		if (firstScript && firstScript.parentNode) {
			firstScript.parentNode.insertBefore(script, firstScript);
		} else {
			document.head.appendChild(script);
		}

		return () => {
			// Cleanup: remove script on unmount
			const chatwootScript = document.querySelector('script[src*="chatwoot"]');
			if (chatwootScript) {
				chatwootScript.remove();
			}
			// Also remove chatwoot widget container if it exists
			const chatwootContainer = document.getElementById('woot--bubble-holder');
			if (chatwootContainer) {
				chatwootContainer.remove();
			}
		};
	}, []);

	return null;
}

