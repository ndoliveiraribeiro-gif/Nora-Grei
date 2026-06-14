"use client";
import { useState, useEffect } from "react";
import pt from "@/locales/pt";
import fr from "@/locales/fr";
import lt from "@/locales/lt";

const translations = { pt, fr, lt };

const getLang = () => {
  if (typeof window === "undefined") return "pt";
  const saved = localStorage.getItem("ng_lang");
  if (saved && translations[saved]) return saved;
  const browser = navigator.language?.slice(0, 2);
  if (browser === "fr") return "fr";
  if (browser === "lt") return "lt";
  return "pt";
};

export function useTranslation() {
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    setLang(getLang());
  }, []);

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      localStorage.setItem("ng_lang", newLang);
      setLang(newLang);
    }
  };

  return {
    t: translations[lang],
    lang,
    changeLang,
  };
}