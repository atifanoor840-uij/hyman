'use client';

import { useState, useRef, useEffect } from "react";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

export default function ChatWidget() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMsg[]>([
		{ id: "m1", role: "assistant", text: "Hi! Need help? Ask about pricing, payouts, or rules." },
	]);
	const [input, setInput] = useState("");
	const endRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, open]);

	function send() {
		const text = input.trim();
		if (!text) return;
		const userMsg: ChatMsg = { id: String(Date.now()), role: "user", text };
		setMessages((m) => [...m, userMsg]);
		setInput("");
		// simple demo reply
		setTimeout(() => {
			setMessages((m) => [
				...m,
				{ id: String(Date.now() + 1), role: "assistant", text: "Thanks! A specialist will reply shortly. Meanwhile, check Pricing and FAQ." },
			]);
		}, 500);
	}

	return (
		<>
			{/* Floating button */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label="Open chat"
				className="fixed bottom-5 right-5 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0ea5e9] text-white shadow-[0_10px_30px_rgba(14,165,233,0.45)] transition hover:bg-[#0891d1]"
			>
				<ChatIcon />
			</button>

			{/* Chat panel */}
			<div
				className={`fixed bottom-20 right-5 z-[60] w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] transition-all ${
					open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
				}`}
				role="dialog"
				aria-label="Live chat"
			>
				<div className="flex items-center justify-between gap-3 border-b border-[#e9eef6] bg-[#f6fbff] px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ea5e9] text-white">
							<ChatIcon small />
						</div>
						<div>
							<div className="text-sm font-semibold text-[#0b0b0f]">Support</div>
							<div className="text-xs text-[#2e2e35]/70">Typically replies in minutes</div>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="rounded-full border border-[#e6e9ef] bg-white px-2 py-1 text-xs text-[#0b0b0f] hover:bg-[#f7f9fc]"
						aria-label="Close chat"
					>
						Close
					</button>
				</div>
				<div className="flex h-80 flex-col">
					<div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
						{messages.map((m) => (
							<div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
										m.role === "user"
											? "bg-[#0ea5e9] text-white rounded-br-sm"
											: "bg-[#f2f6fb] text-[#0b0b0f] rounded-bl-sm"
									}`}
								>
									{m.text}
								</div>
							</div>
						))}
						<div ref={endRef} />
					</div>
					<div className="border-t border-[#e9eef6] p-2">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								send();
							}}
							className="flex items-center gap-2"
						>
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Type your message..."
								className="w-full rounded-full border border-[#e6e9ef] bg-white px-3 py-2 text-sm text-[#0b0b0f] placeholder:text-[#2e2e35]/50 outline-none focus:border-[#0ea5e9]"
							/>
							<button
								type="submit"
								className="inline-flex items-center justify-center rounded-full bg-[#0ea5e9] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0891d1]"
							>
								Send
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

function ChatIcon({ small = false }: { small?: boolean }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={small ? "h-4 w-4" : "h-6 w-6"} aria-hidden="true">
			<path d="M4 6a4 4 0 014-4h8a4 4 0 014 4v7a4 4 0 01-4 4h-3l-4 3v-3H8a4 4 0 01-4-4V6z" fill="currentColor" />
			<circle cx="10" cy="9" r="1.2" fill="white" />
			<circle cx="14" cy="9" r="1.2" fill="white" />
			<circle cx="18" cy="9" r="1.2" fill="white" />
		</svg>
	);
}









