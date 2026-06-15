import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWidgets from "@/components/ClientWidgets";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Nora Grei — Rent or Buy",
  description: "Alugue peças únicas da Nora Grei para qualquer ocasião.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ClientWidgets />
      </body>
    </html>
  );
}