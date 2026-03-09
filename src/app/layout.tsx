import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumi Question Editor",
  description: "Drag & drop editor for Lumi onboarding questions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
