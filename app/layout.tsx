import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "../components/ToastProvider";
import WelcomeToast from "../components/WelcomeToast";

export const metadata: Metadata = {
  title: "Uncle Brew POS",
  description: "Milk Tea Shop Point of Sale System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>
          <WelcomeToast />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
