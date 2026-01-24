'use client';

import { Inter, Poppins } from 'next/font/google';
import Navbar from '../components/Navbar';

const bodyFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const display = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

const blogPosts = [
	{
		title: 'Understanding Risk Management in Prop Trading',
		excerpt: 'Learn the fundamentals of risk management and how to protect your capital while maximizing returns in prop trading.',
		category: 'Trading Tips',
		date: 'December 15, 2024',
		readTime: '5 min read',
		author: 'Sarah Johnson',
		image: '📊',
	},
	{
		title: 'Top 5 Trading Strategies for 2025',
		excerpt: 'Discover the most effective trading strategies that are shaping the markets in 2025 and how to implement them.',
		category: 'Strategies',
		date: 'December 10, 2024',
		readTime: '8 min read',
		author: 'Marcus Rodriguez',
		image: '📈',
	},
	{
		title: 'How to Pass Your Evaluation Challenge',
		excerpt: 'A comprehensive guide to successfully completing your evaluation phase and getting funded.',
		category: 'Education',
		date: 'December 5, 2024',
		readTime: '10 min read',
		author: 'David Kim',
		image: '🎯',
	},
	{
		title: 'Market Analysis: Q1 2025 Outlook',
		excerpt: 'Expert analysis of market trends, opportunities, and risks for the first quarter of 2025.',
		category: 'Market Analysis',
		date: 'November 28, 2024',
		readTime: '7 min read',
		author: 'Alexandra Chen',
		image: '🌍',
	},
	{
		title: 'The Psychology of Trading: Managing Emotions',
		excerpt: 'Understanding the psychological aspects of trading and techniques to maintain discipline and emotional control.',
		category: 'Psychology',
		date: 'November 20, 2024',
		readTime: '6 min read',
		author: 'Sarah Johnson',
		image: '🧠',
	},
	{
		title: 'Platform Comparison: MT4 vs MT5 vs cTrader',
		excerpt: 'A detailed comparison of the most popular trading platforms to help you choose the right one.',
		category: 'Platforms',
		date: 'November 15, 2024',
		readTime: '9 min read',
		author: 'Marcus Rodriguez',
		image: '💻',
	},
];

const categories = ['All', 'Trading Tips', 'Strategies', 'Education', 'Market Analysis', 'Psychology', 'Platforms'];

export default function BlogPage() {
	return (
		<div className={`min-h-screen bg-white ${bodyFont.className}`}>
			{/* Header Section with background */}
			<section className="relative overflow-hidden bg-[#050406]">
				{/* Decorative gradient overlays */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#5235ff]/20 blur-[120px]" />
					<div className="absolute top-1/2 right-0 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#1cf1ff]/10 blur-[140px]" />
					<div className="absolute bottom-[-180px] left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-[60%] bg-[#ff62c2]/15 blur-[160px]" />
				</div>
				{/* Subtle vignette */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
				
				<div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-32">
					<Navbar variant="hero" />
					<div className="mx-auto max-w-4xl space-y-6 text-left mt-16 lg:mt-20">
						<h1 className={`${display.className} text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl`}>
							Blog & News
						</h1>
						<p className="text-lg text-white/70 md:text-xl max-w-2xl">
							Stay updated with the latest trading insights, market analysis, and educational content.
						</p>
					</div>
				</div>
				{/* Subtle divider curve */}
				<div className="relative h-14 w-full">
					<div className="absolute inset-0 -mt-10 h-20 w-full bg-[radial-gradient(100%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />
				</div>
			</section>

			{/* Main content with white background */}
			<main className="bg-white">
				<div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
					{/* Categories */}
					<div className="mb-12 flex flex-wrap gap-3">
						{categories.map((category) => (
							<button
								key={category}
								className="rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-semibold text-[#37353E] transition hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9]"
							>
								{category}
							</button>
						))}
					</div>

					{/* Featured Post */}
					<div className="mb-16 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-lg">
						<div className="grid md:grid-cols-2">
							<div className="flex items-center justify-center bg-gradient-to-br from-[#0ea5e9] to-[#0891d1] p-12 text-6xl">
								{blogPosts[0].image}
							</div>
							<div className="p-8 md:p-12">
								<div className="mb-4 flex items-center gap-4">
									<span className="rounded-full bg-[#f0f9ff] px-3 py-1 text-xs font-semibold text-[#0ea5e9]">
										{blogPosts[0].category}
									</span>
									<span className="text-xs text-[#37353E]/60">{blogPosts[0].date}</span>
								</div>
								<h2 className={`${display.className} text-3xl font-semibold text-[#0b0b0f] mb-4`}>
									{blogPosts[0].title}
								</h2>
								<p className="text-[#37353E]/80 mb-6 leading-relaxed">{blogPosts[0].excerpt}</p>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0891d1] flex items-center justify-center">
											<span className="text-sm font-bold text-white">{blogPosts[0].author.charAt(0)}</span>
										</div>
										<div>
											<p className="text-sm font-medium text-[#0b0b0f]">{blogPosts[0].author}</p>
											<p className="text-xs text-[#37353E]/60">{blogPosts[0].readTime}</p>
										</div>
									</div>
									<a
										href="#"
										className="rounded-full bg-[#0ea5e9] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0891d1]"
									>
										Read More
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Blog Grid */}
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{blogPosts.slice(1).map((post) => (
							<article
								key={post.title}
								className="group overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm transition-all hover:shadow-lg"
							>
								<div className="flex h-48 items-center justify-center bg-gradient-to-br from-[#f0f9ff] to-white text-5xl">
									{post.image}
								</div>
								<div className="p-6">
									<div className="mb-3 flex items-center gap-3">
										<span className="rounded-full bg-[#f0f9ff] px-3 py-1 text-xs font-semibold text-[#0ea5e9]">
											{post.category}
										</span>
										<span className="text-xs text-[#37353E]/60">{post.readTime}</span>
									</div>
									<h3 className={`${display.className} text-xl font-semibold text-[#0b0b0f] mb-2 group-hover:text-[#0ea5e9] transition-colors`}>
										{post.title}
									</h3>
									<p className="mb-4 text-sm text-[#37353E]/80 leading-relaxed line-clamp-2">{post.excerpt}</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0891d1] flex items-center justify-center">
												<span className="text-xs font-bold text-white">{post.author.charAt(0)}</span>
											</div>
											<span className="text-xs text-[#37353E]/60">{post.author}</span>
										</div>
										<span className="text-xs text-[#37353E]/60">{post.date}</span>
									</div>
								</div>
							</article>
						))}
					</div>

					{/* Newsletter */}
					<div className="mt-16 rounded-2xl border border-[#e5e5e5] bg-gradient-to-br from-[#f0f9ff] to-white p-8 text-center">
						<h2 className={`${display.className} text-2xl font-semibold text-[#0b0b0f] mb-4`}>
							Subscribe to Our Newsletter
						</h2>
						<p className="text-[#37353E]/80 mb-6 max-w-2xl mx-auto">
							Get the latest trading insights, market analysis, and educational content delivered to your inbox.
						</p>
						<div className="mx-auto flex max-w-md gap-3">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 rounded-full border border-[#e5e5e5] bg-white px-4 py-3 text-sm focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
							/>
							<button className="rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0891d1]">
								Subscribe
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}





