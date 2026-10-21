import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWidgets from "@/components/ClientWidgets";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  title: "Nora Grei",
  description: "Aluga ou compra peças exclusivas de moda.",
  manifest: "/manifest.json",
  themeColor: "#a8a8ac",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nora Grei",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ClientWidgets />
        {/* Stripe.js — carregado globalmente, só usado quando necessário */}
        <script src="https://js.stripe.com/v3/" async />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').then(reg => {
                reg.addEventListener('updatefound', () => {
                  const newWorker = reg.installing;
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      window.location.reload();
                    }
                  });
                });
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}