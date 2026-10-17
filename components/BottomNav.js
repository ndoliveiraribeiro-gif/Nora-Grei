"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: { inicio: "Início", catalogo: "Catálogo", cesto: "Cesto", pedidos: "Pedidos", perfil: "Perfil" },
  fr: { inicio: "Accueil", catalogo: "Catalogue", cesto: "Panier", pedidos: "Commandes", perfil: "Profil" },
  lt: { inicio: "Pradžia", catalogo: "Katalogas", cesto: "Krepšelis", pedidos: "Užsakymai", perfil: "Profilis" },
};

export default function BottomNav() {
  const [userLogado, setUserLogado] = useState(false);
  const [lang, setLang] = useState("pt");
  const [cestoCont, setCestoCont] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserLogado(true);
    });

    // Ler contador do cesto
    const lerCesto = () => {
      try {
        const c = JSON.parse(localStorage.getItem("ng_cesto") || "[]");
        setCestoCont(c.length);
      } catch (_) { setCestoCont(0); }
    };
    lerCesto();
    window.addEventListener("cesto-atualizado", lerCesto);
    return () => window.removeEventListener("cesto-atualizado", lerCesto);
  }, []);

  const i = t[lang] || t.pt;

  const items = [
    { href: "/", label: i.inicio, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    )},
    { href: "/catalogo", label: i.catalogo, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { href: "/cesto", label: i.cesto, badge: cestoCont, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    )},
    { href: userLogado ? "/pedidos" : "/entrar", label: i.pedidos, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    )},
    { href: userLogado ? "/perfil" : "/entrar", label: i.perfil, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <style>{`
        .bn-wrap {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 200;
          background: rgba(248,247,245,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid #e2dfda;
          padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
        }
        .bn-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .bn-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          text-decoration: none;
          color: #888580;
          padding: 0.25rem 1.5rem;
          transition: color 0.2s;
        }
        .bn-item.active { color: #080808; }
        .bn-label {
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
        }
        .bn-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #080808;
          margin-top: 2px;
        }
        .bn-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bn-badge {
          position: absolute;
          top: -5px; right: -8px;
          background: #c4748a;
          color: #fff;
          font-size: 0.5rem;
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          width: 15px; height: 15px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .bn-wrap { display: block; }
        }
      `}</style>

      <nav className="bn-wrap">
        <div className="bn-inner">
          {items.map((item, idx) => (
            <a key={idx} href={item.href} className={`bn-item${isActive(item.href) ? " active" : ""}`}>
              <div className="bn-icon-wrap">
                {item.icon}
                {item.badge > 0 && <span className="bn-badge">{item.badge > 9 ? "9+" : item.badge}</span>}
              </div>
              <span className="bn-label">{item.label}</span>
              {isActive(item.href) && <div className="bn-dot"></div>}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}