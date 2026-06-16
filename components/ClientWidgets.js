"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const StyleConsultant = dynamic(() => import("@/components/StyleConsultant"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/BottomNav"), { ssr: false });
const CampanhaAlert = dynamic(() => import("@/components/CampanhaAlert"), { ssr: false });

export default function ClientWidgets() {
  const [lang, setLang] = useState("pt");
  const pathname = usePathname();
  
  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
  }, []);

  // Não mostrar widgets no admin
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      <ChatWidget lang={lang} />
      <StyleConsultant lang={lang} />
      <BottomNav />
      <CampanhaAlert lang={lang} />
    </>
  );
}