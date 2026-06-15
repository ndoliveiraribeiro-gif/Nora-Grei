"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const StyleConsultant = dynamic(() => import("@/components/StyleConsultant"), { ssr: false });

export default function ClientWidgets() {
  const [lang, setLang] = useState("pt");
  
  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
  }, []);

  return (
    <>
      <ChatWidget lang={lang} />
      <StyleConsultant lang={lang} />
    </>
  );
}