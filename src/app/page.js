"use client"
import dynamic from "next/dynamic";
import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";

// Lazy-load below-the-fold sections to reduce initial JS bundle
const FeaturesSection = dynamic(() => import("@/components/home/FeaturesSection"), { ssr: false });
const CtaSection = dynamic(() => import("@/components/home/CtaSection"), { ssr: false });
const SiteFooter = dynamic(() => import("@/components/home/SiteFooter"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <SiteFooter />
    </div>
  );
}

