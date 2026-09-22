import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webbly Workspace",
  description: "Mini Workspace Explorer",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full flex flex-col overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
