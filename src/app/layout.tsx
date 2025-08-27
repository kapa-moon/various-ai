import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "AI Self-Mapping Tool",
  description: "An experimental AI chatbot for intrapersonal growth and psychological wellbeing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} font-inter antialiased bg-white text-black`}
      >
        {children}
      </body>
    </html>
  );
}