import Image from "next/image";
import { ArrowRight } from "lucide-react";

const STEPS = [
	{
		id: "01",
		title: "Choose your evaluation",
		body: "Select from our trading evaluation programs tailored to your style. Simulated accounts on MT4, MT5, or DXtrade.",
		icon: ProgramIcon,
		image: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766126666/concept_step_1_revised_jupeym.png",
	},
	{
		id: "02",
		title: "Complete the skills assessment",
		body: "Follow clear evaluation targets and risk parameters. Track progress in your dashboard. Educational purposes only — verifiable, skill-based.",
		icon: ChartIcon,
		image: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766126666/concept_level_2_revised_ox73fq.png",
	},
	{
		id: "03",
		title: "Complete the program",
		body: "Meet evaluation targets to demonstrate readiness. Eligible participants may progress to higher-tier programs. Results are verifiable — no profit guarantees.",
		icon: PayoutIcon,
		image: "https://res.cloudinary.com/dejjuhzug/image/upload/v1766126669/concept_funded_account_1_tueypf.png",
	},
];

export default function HowItWorks() {
	return (
		<section id="how-it-works" className="relative overflow-hidden bg-black text-white">
			<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
				{/* Header */}
				<div className="mb-16 text-center">
					<span className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 mb-6">
						Process
					</span>
					<h2 className="font-sans text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
						How Our Skills Assessment Works
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-white/70 md:text-xl">
						Trader development programs for serious learners. Educational evaluations on simulated accounts — clear targets, verifiable results.
					</p>
				</div>

				{/* Steps with Images */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{STEPS.map(({ id, title, body, icon: Icon, image }, index) => {
						const isFirstTwo = index < 2;

						return (
							<article
								key={id}
								className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-sm transition hover:bg-white/10"
							>
								{/* Image Section */}
								<div
									className={`relative mb-6 w-full overflow-hidden rounded-2xl bg-white/5 ${
										isFirstTwo ? "h-40" : "h-48"
									}`}
								>
									{image ? (
										<Image
											src={image}
											alt={title}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, 33vw"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<Icon />
										</div>
									)}
									{/* Overlay gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
									{/* Step number badge */}
									<div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-black/50 backdrop-blur-sm">
										<span className="text-sm font-bold text-white">{id}</span>
									</div>
								</div>

								{/* Content */}
								<div className="relative">
									<div className="mb-4 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
											<Icon />
										</div>
										<h3 className="font-sans text-xl font-bold tracking-tight text-white">{title}</h3>
									</div>
									<p className="mb-6 text-base leading-relaxed text-white/80">{body}</p>
									<div className="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:gap-3">
										Learn more
										<ArrowRight className="h-4 w-4" />
									</div>
								</div>

								{/* Hover effect overlay */}
								<div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function ProgramIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" className="text-white/80" />
			<path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.6" className="text-white/80" />
		</svg>
	);
}

function ChartIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M4 18V6m0 12h16M4 6l4 3 3-4 4 3 5-5"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-white/80"
			/>
		</svg>
	);
}

function PayoutIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="7" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" className="text-white/80" />
			<path d="M7 7V5a5 5 0 1110 0v2" stroke="currentColor" strokeWidth="1.6" className="text-white/80" />
			<path d="M12 12v4m-2-1h4" stroke="currentColor" strokeWidth="1.6" className="text-white/80" strokeLinecap="round" />
		</svg>
	);
}











