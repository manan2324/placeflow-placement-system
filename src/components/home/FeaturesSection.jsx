"use client";
import { GraduationCap, Building2, BarChart3, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  {
    Icon: GraduationCap,
    title: "For Students",
    description:
      "Browse companies, apply for positions, track applications, and manage your profile all in one place.",
    color: "bg-blue-100",
    delay: "0s",
  },
  {
    Icon: Building2,
    title: "Company Management",
    description:
      "Manage company listings, set eligibility criteria, and streamline the recruitment process.",
    color: "bg-indigo-100",
    delay: "0.1s",
  },
  {
    Icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time insights into placement statistics, application status, and branch-wise data.",
    color: "bg-purple-100",
    delay: "0.2s",
  },
  {
    Icon: CheckCircle2,
    title: "Application Tracking",
    description:
      "Monitor application status from submission to selection with detailed logs and updates.",
    color: "bg-green-100",
    delay: "0.3s",
  },
  {
    Icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Role-based access control, secure authentication, and data protection built-in.",
    color: "bg-yellow-100",
    delay: "0.4s",
  },
  {
    Icon: Zap,
    title: "Fast & Modern",
    description:
      "Built with Next.js for lightning-fast performance and seamless user experience.",
    color: "bg-red-100",
    delay: "0.5s",
  },
];

export default function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
          Everything You Need
        </h2>
        <p className="text-gray-600 text-base sm:text-lg px-4">
          Powerful features designed for efficient placement management
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {FEATURES.map((feature) => {
          const Icon = feature.Icon;
          return (
            <div
              key={feature.title}
              className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scale-in"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`h-12 w-12 sm:h-14 sm:w-14 ${feature.color} rounded-lg flex items-center justify-center mb-4 sm:mb-6`}>
                <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-gray-800" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
