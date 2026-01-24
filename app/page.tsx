import Hero from "./components/Hero";
import Logos from "./components/Logos";
import Metrics from "./components/Metrics";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import InviteCard from "./components/InviteCard";
import Pricing from "./components/Pricing";
import PayoutCertificates from "./components/PayoutCertificates";
import GlobalPresence from "./components/GlobalPresence";
import PayoutVideos from "./components/PayoutVideos";
import Community from "./components/Community";
import WhyFxGenz from "./components/WhyFxGenz";
import PayoutsPro from "./components/Payouts";
import LoyaltyPrograms from "./components/LoyaltyPrograms";
import Platforms from "./components/Platforms";

export default function Home() {
  return (
    <div className="bg-[#050406]">
      <Hero />
      <Pricing />
      <Logos />
      <WhyFxGenz />
      <Platforms />
      <PayoutsPro />
      <LoyaltyPrograms />
      <GlobalPresence />
      <InviteCard />
      <PayoutCertificates />
      <PayoutVideos />
      <Community />
      <CTA />
      <Footer />
    </div>
  );
}
