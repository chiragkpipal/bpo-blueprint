import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The BPO Blueprint — Student Learning Portal",
  description: "Exclusive step-by-step video training course for starting and running a high-margin BPO business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#050505] text-white min-h-screen antialiased font-sans selection:bg-[#00ff66] selection:text-black">
        {children}
      </body>
    </html>
  );
}
