"use client"
import HomeNavbar from '@/components/home/HomeNavbar'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import CtaSection from '@/components/home/CtaSection'
import SiteFooter from '@/components/home/SiteFooter'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <SiteFooter />
    </div>
  )
}

