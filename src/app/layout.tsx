import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The BPO Blueprint — Course Dashboard",
  description: "Step-by-step video training course for starting and running a BPO business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
