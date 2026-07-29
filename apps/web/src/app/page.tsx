import { MarketingNavbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";
import { Benefits } from "@/components/marketing/benefits";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Templates } from "@/components/marketing/templates";
import { BlocksShowcase } from "@/components/marketing/blocks-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingFooter } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <div className="relative overflow-x-clip">
      <MarketingNavbar />
      <main>
        <Hero />
        <InteractiveDemo />
        <Benefits />
        <HowItWorks />
        <Templates />
        <BlocksShowcase />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
