/** Small Fx Genz badge used in help center headers (matches rules grid style). */
export function HelpBrandMark({ className = '' }: { className?: string }) {
	return (
		<div
			className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0b0b0f] px-2 py-1.5 text-center shadow-inner ring-1 ring-black/10 ${className}`}
		>
			<span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-[11px] font-extrabold leading-tight text-transparent">
				Fx
			</span>
			<span className="text-[10px] font-bold leading-tight text-white">Genz</span>
		</div>
	);
}
