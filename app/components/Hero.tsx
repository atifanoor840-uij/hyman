import Link from "next/link";
import { SiVisa, SiMastercard, SiStripe, SiLinux, SiApple, SiAndroid } from "react-icons/si";
import { TbBrandWindows } from "react-icons/tb";
import HeroStats from "./HeroStats";
import Hyperspeed from "./Hyperspeed";
import Navbar from "./Navbar";
export default function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-[#050406]" />
			<div className="pointer-events-none absolute inset-0 -translate-y-12">
				<Hyperspeed />
			</div>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.25)_100%)]" />

			{/* Navbar full width - attached to top and sides */}
			<div className="w-full left-0 right-0 top-0 px-0">
				<Navbar variant="hero" />
			</div>

			<div className="relative mx-auto max-w-7xl px-6 py-12 md:px-10 lg:py-20">
				{/* Left: heading + subheading + payment icons + Start trading | Right: platform + vertical press logos */}
				<div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
					{/* Left: heading, subheading, payment icons below subheading */}
					<div className="flex flex-1 flex-col items-start justify-center text-left pl-4 md:pl-8 lg:pl-12">
						<h2 className="whitespace-nowrap font-sans text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
							<span className="text-[#7270ff]">GENZ</span> Don&apos;t Wait ,They Win.
						</h2>
						<p className="mt-4 font-sans text-lg leading-relaxed text-white/90 md:text-xl">
							No delays. No limits. Just funded trading.
							<br className="hidden sm:block" />
							FXgenz is the forex firm for rule-breakers.
						</p>
						{/* Payment icons + platform icons below subheading (horizontal) */}
						<div className="mt-4 flex flex-wrap items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
								<SiVisa className="h-5 w-5 text-[#1a1f71]" />
							</div>
							<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
								<SiMastercard className="h-5 w-5 text-[#eb001b]" />
							</div>
							<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5">
								<SiStripe className="h-5 w-5 text-[#635bff]" />
							</div>
							{/* Windows, Linux, Android, iOS — horizontal line */}
							<div className="flex items-center gap-2">
								<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10" title="Windows">
									<TbBrandWindows className="h-5 w-5 text-[#0078d4]" />
								</div>
								<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10" title="Linux">
									<SiLinux className="h-5 w-5 text-white" />
								</div>
								<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10" title="Android">
									<SiAndroid className="h-5 w-5 text-[#3ddc84]" />
								</div>
								<div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 transition hover:bg-white/10" title="iOS">
									<SiApple className="h-5 w-5 text-white" />
								</div>
							</div>
						</div>
						{/* Start trading button below heading block */}
						<Link
							href="/dashboard/buys"
							className="mt-6 font-sans inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 focus:outline-none md:text-base"
						>
							Start trading
						</Link>
					</div>

					{/* Right: press logos vertical, larger */}
					<div className="flex flex-1 flex-col items-start gap-4 sm:items-end">
						{/* Press logos: vertical stack, larger size */}
						<div className="flex flex-col gap-2 border-t border-white/10 pt-4">
							<div className="flex flex-col gap-3 opacity-90">
								<a href="https://www.yahoo.com" target="_blank" rel="noopener noreferrer" className="flex h-12 items-center hover:opacity-100" aria-label="Yahoo">
									<img src="https://instantfunding.com/nitropack_static/ZUQLaUVQlrAfuQGzHfcxriUNmmesdFBw/assets/images/optimized/rev-f7e5ffc/instantfunding.com/wp-content/uploads/2024/06/yahoo-vector.svg" alt="Yahoo" className="h-12 w-auto object-contain" />
								</a>
								<a href="https://www.businessinsider.com" target="_blank" rel="noopener noreferrer" className="flex h-12 items-center hover:opacity-100" aria-label="Business Insider">
									<img src="https://instantfunding.com/nitropack_static/ZUQLaUVQlrAfuQGzHfcxriUNmmesdFBw/assets/images/optimized/rev-f7e5ffc/instantfunding.com/wp-content/uploads/2024/06/business-insider-vector.svg" alt="Business Insider" className="h-12 w-auto object-contain" />
								</a>
								<a href="https://www.bloomberg.com" target="_blank" rel="noopener noreferrer" className="flex h-12 items-center hover:opacity-100" aria-label="Bloomberg">
									<img src="https://instantfunding.com/nitropack_static/ZUQLaUVQlrAfuQGzHfcxriUNmmesdFBw/assets/images/optimized/rev-f7e5ffc/instantfunding.com/wp-content/uploads/2024/06/bloomberg-vector.svg" alt="Bloomberg" className="h-12 w-auto object-contain" />
								</a>
							</div>
						</div>
					</div>
				</div>

				<HeroStats />
			</div>

			{/* Infinite scrolling image */}
			<div className="relative h-48 w-full overflow-hidden bg-black/50 backdrop-blur-sm">
				<div className="flex animate-infinite-scroll gap-2">
					{/* First set */}
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					{/* Duplicate set for seamless loop */}
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
					<img src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769769389/Black_and_Red_Neon_Black_Friday_Sale_Instagram_Post_lawtrd.png" alt="Trading" className="h-40 w-auto shrink-0 border-2 border-white/20 object-contain rounded-lg" />
				</div>
			</div>
		</section>
	);
}
