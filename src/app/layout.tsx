import type { Metadata } from "next";
import { Funnel_Display, Geist, Geist_Mono, Martian_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const funnel = Funnel_Display({ variable: "--font-funnel", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  applicationName: "Formloom",
  openGraph: { siteName: "Formloom", type: "website" },
  title: { default: "Formloom — open-source conversational forms", template: "%s · Formloom" },
  description:
    "Formloom is an open-source, self-hostable alternative to Typeform. Build beautiful one-question-at-a-time forms with logic, themes and analytics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} ${funnel.variable} ${martian.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
