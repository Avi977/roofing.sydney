import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroBand } from "@/components/home/HeroBand";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesBand } from "@/components/home/ServicesBand";
import { ProcessBand } from "@/components/home/ProcessBand";
import { TestimonialsBand } from "@/components/home/TestimonialsBand";
import { QuoteBand } from "@/components/home/QuoteBand";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroBand />
        <TrustBar />
        <ServicesBand />
        <ProcessBand />
        <TestimonialsBand />
        <QuoteBand />
      </main>
      <SiteFooter />
    </div>
  );
}
