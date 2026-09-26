import type { Metadata } from "next";
import AdSlot from "@/components/ads/AdSlot";
import Hero from "@/components/home/Hero";
import TrustMetrics from "@/components/home/TrustMetrics";
import PopularWebsites from "@/components/home/PopularWebsites";
import AiTeaser from "@/components/home/AiTeaser";
import Categories from "@/components/home/Categories";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedWebsites from "@/components/home/FeaturedWebsites";
import WhyLian from "@/components/home/WhyLian";
import CustomDesignBanner from "@/components/home/CustomDesignBanner";
import DigitalTeaser from "@/components/home/DigitalTeaser";
import DoctorBanner from "@/components/home/DoctorBanner";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "لیان دیزاین | مارکت‌پلیس سایت‌های آماده",
  description: "سایت حرفه‌ای کسب‌وکارتان را پیدا کنید، ببینید، شخصی‌سازی کنید و بخرید",
};

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-6">
        <AdSlot placement="homepage.hero" className="max-w-3xl mx-auto -mt-4 mb-4" />
      </div>
      <TrustMetrics />
      <PopularWebsites />
      <AiTeaser />
      <Categories />
      <HowItWorks />
      <FeaturedWebsites />
      <WhyLian />
      <CustomDesignBanner />
      <DigitalTeaser />
      <DoctorBanner />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
