'use client';

import { Poppins } from 'next/font/google';
import { FaDiscord, FaTelegram, FaTwitter, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa';

const display = Poppins({
	subsets: ['latin'],
	weight: ['600', '700'],
});

const socialLinks = [
	{ name: 'Discord', icon: FaDiscord, url: '#', color: '#5865F2' },
	{ name: 'Telegram', icon: FaTelegram, url: '#', color: '#0088cc' },
	{ name: 'Twitter', icon: FaTwitter, url: '#', color: '#1DA1F2' },
	{ name: 'YouTube', icon: FaYoutube, url: '#', color: '#FF0000' },
	{ name: 'Instagram', icon: FaInstagram, url: '#', color: '#E4405F' },
	{ name: 'LinkedIn', icon: FaLinkedin, url: '#', color: '#0077B5' },
];

export default function Community() {
	return (
		<section id="community" className="relative overflow-hidden bg-white py-20 md:py-24">
			<div className="mx-auto max-w-7xl px-6 md:px-10">
				{/* Header */}
				<div className="mb-12 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border-2 border-black/10 bg-black/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black/70 mb-6">
						Community
					</div>
					<h2 className={`${display.className} text-4xl font-bold text-black md:text-5xl lg:text-6xl mb-4`}>
						Join Our Community
					</h2>
					<p className="mx-auto max-w-3xl text-lg font-semibold text-black/70 md:text-xl">
						Connect with thousands of traders, share strategies, and stay updated with the latest news and insights.
					</p>
				</div>

				{/* Social Icons Row */}
				<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
					{socialLinks.map((social) => {
						const IconComponent = social.icon;
						return (
							<a
								key={social.name}
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group transition hover:scale-110"
								aria-label={social.name}
							>
								<IconComponent 
									className="h-12 w-12 md:h-16 md:w-16 transition hover:opacity-80" 
									style={{ color: social.color }}
								/>
							</a>
						);
					})}
				</div>
			</div>
		</section>
	);
}
