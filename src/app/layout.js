import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

export const metadata = {
  title: "PlaceFlow - Campus Placement Management System",
  description: "Streamline your campus placements with PlaceFlow - A comprehensive platform for managing student placements, company registrations, and application tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="font-arial antialiased"
      >
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
