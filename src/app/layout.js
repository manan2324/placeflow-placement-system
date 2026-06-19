import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PlaceFlow - Campus Placement Management System",
  description:
    "Streamline your campus placements with PlaceFlow - A comprehensive platform for managing student placements, company registrations, and application tracking.",
};

// Explicit viewport export improves mobile rendering and LCP
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-gray-50 text-gray-900">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
