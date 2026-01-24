import Link from "next/link";
import HeroStats from "./HeroStats";
import Hyperspeed from "./Hyperspeed";
import Navbar from "./Navbar";
import TextSplit from "./TextSplit";
import SaleBanner from "./SaleBanner";
import ForexPricesTicker from "./ForexPricesTicker";
import { Poppins } from "next/font/google";

const display = Poppins({
	subsets: ["latin"],
	weight: ["600", "700", "800"],
});

export default function Hero() {
	return (
		<section className="relative overflow-hidden">
			{/* Sale Banner at the top */}
			<SaleBanner />
			
			{/* Base color matching HeroBG */}
			<div className="absolute inset-0 -z-10 bg-[#050406]" />
			<div className="pointer-events-none absolute inset-0">
				<Hyperspeed />
			</div>
			{/* Subtle vignette for depth - reduced opacity to show base color and animation */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.25)_100%)]" />

			<div className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 lg:py-36">
				<Navbar variant="hero" />
				<div className="mx-auto max-w-4xl space-y-6 text-center">
					{/* Main heading */}
					<h1 className={`${display.className} flex flex-col items-center text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-6xl lg:text-7xl`}>
						<span className="whitespace-nowrap">
							<TextSplit text="Genz Mindset. Real Moves." delay={200} />
						</span>
						<span className="whitespace-nowrap text-[#00ff88]">
							<TextSplit text="Up To $800K" delay={600} />
						</span>
					</h1>
					
					{/* Subheading */}
					<p className="mx-auto max-w-3xl text-base leading-relaxed text-white md:text-lg lg:text-xl">
						<TextSplit 
							text="Trade simulated capital with Fx Genz using fast instant or evaluation models and secure rewards designed for next-gen traders" 
							delay={1000}
							splitBy="word"
						/>
					</p>
					
					{/* CTA Buttons */}
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							href="#programs"
							className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 focus:outline-none md:text-base"
						>
							Get Funded Now
						</Link>
						<Link
							href="/social"
							className="group inline-flex items-center justify-center rounded-full border border-white/30 bg-black/50 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none md:text-base"
						>
							Join Community
						</Link>
					</div>
					
					<HeroStats />
				</div>
			</div>
			
			{/* subtle divider curve */}
			<div className="relative h-14 w-full">
				<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.18),transparent)]" />
			</div>
			
			{/* Forex Prices Ticker at the exact end */}
			<ForexPricesTicker />
		</section>
	);
}


