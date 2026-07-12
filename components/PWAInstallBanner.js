"use client";
import { useState, useEffect } from "react";

const T = {
  pt: {
    titulo: "Instala a app Nora Grei",
    desc: "Acede mais rápido, recebe notificações e usa sem browser.",
    ios: "No Safari, clica em",
    iosStep2: "e depois em \"Adicionar ao ecrã inicial\"",
    instalar: "Instalar app",
    agora: "Agora não",
    nunca: "Não mostrar mais",
  },
  fr: {
    titulo: "Installe l'app Nora Grei",
    desc: "Accès plus rapide, notifications et utilisation sans navigateur.",
    ios: "Dans Safari, appuie sur",
    iosStep2: "puis \"Sur l'écran d'accueil\"",
    instalar: "Installer l'app",
    agora: "Pas maintenant",
    nunca: "Ne plus afficher",
  },
  lt: {
    titulo: "Įdiek Nora Grei programėlę",
    desc: "Greitesnė prieiga, pranešimai ir naudojimas be naršyklės.",
    ios: "Safari spustelėk",
    iosStep2: "tada \"Pridėti prie pradžios ekrano\"",
    instalar: "Įdiegti programėlę",
    agora: "Ne dabar",
    nunca: "Neberoдyti",
  },
};

export default function PWAInstallBanner({ lang = "pt" }) {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const t = T[lang] || T.pt;

  useEffect(() => {
    // Não mostrar se já está instalado como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Não mostrar se o utilizador disse "nunca"
    if (localStorage.getItem("ng_pwa_nunca")) return;
    // Não mostrar se adiado há menos de 7 dias
    const adiado = localStorage.getItem("ng_pwa_adiado");
    if (adiado && Date.now() - parseInt(adiado) < 7 * 24 * 60 * 60 * 1000) return;

    // Contar visitas
    const visitas = parseInt(localStorage.getItem("ng_pwa_visitas") || "0") + 1;
    localStorage.setItem("ng_pwa_visitas", visitas);

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const android = /Android/.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

    // Capturar evento Android
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    // Mostrar após 3 visitas e 10 segundos
    if (visitas >= 3 && (ios || android)) {
      const timer = setTimeout(() => setShow(true), 10000);
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") { localStorage.setItem("ng_pwa_nunca", "1"); }
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const adiar = () => {
    localStorage.setItem("ng_pwa_adiado", Date.now().toString());
    setShow(false);
  };

  const nunca = () => {
    localStorage.setItem("ng_pwa_nunca", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position:"fixed", bottom: 80, left:"1rem", right:"1rem", zIndex:500,
      background:"#080808", color:"#fff", padding:"1.25rem 1.5rem",
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
      animation:"slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{width:44,height:44,background:"#2a2826",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <img src="/icons/icon-192x192.png" alt="NG" style={{width:36,height:36,borderRadius:8}} />
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.1rem",fontWeight:300,marginBottom:"0.25rem"}}>{t.titulo}</div>
          <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginBottom:"1rem"}}>{t.desc}</div>

          {isIOS && (
            <div style={{background:"rgba(255,255,255,0.08)",padding:"0.75rem",marginBottom:"1rem",fontSize:"0.78rem",color:"rgba(255,255,255,0.8)",lineHeight:1.6}}>
              {t.ios} <span style={{background:"rgba(255,255,255,0.15)",padding:"0.1rem 0.4rem",borderRadius:4}}>⎙</span> {t.iosStep2}
            </div>
          )}

          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {isAndroid && deferredPrompt && (
              <button onClick={instalar} style={{
                background:"#c4748a",color:"#fff",border:"none",
                padding:"0.6rem 1.25rem",fontSize:"0.65rem",
                letterSpacing:"0.15em",textTransform:"uppercase",
                cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500,
              }}>{t.instalar}</button>
            )}
            <button onClick={adiar} style={{
              background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"none",
              padding:"0.6rem 1rem",fontSize:"0.65rem",
              letterSpacing:"0.12em",textTransform:"uppercase",
              cursor:"pointer",fontFamily:"'Jost',sans-serif",
            }}>{t.agora}</button>
            <button onClick={nunca} style={{
              background:"none",color:"rgba(255,255,255,0.35)",border:"none",
              padding:"0.6rem 0.5rem",fontSize:"0.6rem",
              cursor:"pointer",fontFamily:"'Jost',sans-serif",textDecoration:"underline",
            }}>{t.nunca}</button>
          </div>
        </div>
      </div>
    </div>
  );
}