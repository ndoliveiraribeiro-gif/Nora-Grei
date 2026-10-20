"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: {
    inicio: "Início", catalogo: "Colecção", lojas: "Lojistas",
    cesto: "Cesto", perfil: "Perfil", mais: "Mais",
    feed: "Feed", mensagens: "Mensagens", publicar: "Publicar",
    comoFunciona: "Como funciona", fechar: "Fechar",
  },
  fr: {
    inicio: "Accueil", catalogo: "Collection", lojas: "Boutiques",
    cesto: "Panier", perfil: "Profil", mais: "Plus",
    feed: "Feed", mensagens: "Messages", publicar: "Publier",
    comoFunciona: "Comment ça marche", fechar: "Fermer",
  },
  lt: {
    inicio: "Pradžia", catalogo: "Kolekcija", lojas: "Parduotuvės",
    cesto: "Krepšelis", perfil: "Profilis", mais: "Daugiau",
    feed: "Feed", mensagens: "Žinutės", publicar: "Skelbti",
    comoFunciona: "Kaip tai veikia", fechar: "Uždaryti",
  },
};

export default function BottomNav() {
  const [userLogado, setUserLogado] = useState(false);
  const [lang, setLang] = useState("pt");
  const [cestoCont, setCestoCont] = useState(0);
  const [maisAberto, setMaisAberto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && t[saved]) setLang(saved);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserLogado(true);
    });

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

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Links secundários que aparecem no drawer "Mais"
  const maisItems = [
    {
      href: "/feed", label: i.feed,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8M12 17v4"/></svg>
    },
    {
      href: "/mensagens", label: i.mensagens,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    },
    ...(userLogado ? [{
      href: "/publicar", label: i.publicar,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
    }] : []),
  ];

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
          padding: 0.25rem 0.5rem;
          flex: 1;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .bn-item.active { color: #080808; }
        .bn-item.mais-open { color: #c4748a; }
        .bn-label {
          font-size: 0.68rem;
          letter-spacing: 0.1em;
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
          font-size: 0.65rem;
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          width: 17px; height: 17px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }

        /* Overlay drawer "Mais" */
        .bn-mais-overlay {
          position: fixed;
          inset: 0;
          z-index: 199;
          background: rgba(8,8,8,0);
          transition: background 0.25s;
          pointer-events: none;
        }
        .bn-mais-overlay.open {
          background: rgba(8,8,8,0.35);
          pointer-events: all;
        }
        .bn-mais-drawer {
          position: fixed;
          bottom: calc(60px + env(safe-area-inset-bottom, 0px));
          left: 0; right: 0;
          z-index: 300;
          background: rgba(248,247,245,0.98);
          backdrop-filter: blur(24px);
          border-top: 1px solid #e2dfda;
          border-radius: 16px 16px 0 0;
          padding: 1rem 1.5rem 1.25rem;
          transform: translateY(100%);
          transition: transform 0.28s cubic-bezier(0.32,0.72,0,1);
          box-shadow: 0 -8px 32px rgba(8,8,8,0.08);
        }
        .bn-mais-drawer.open {
          transform: translateY(0);
        }
        .bn-mais-handle {
          width: 36px; height: 4px;
          background: #e2dfda;
          border-radius: 2px;
          margin: 0 auto 1rem;
        }
        .bn-mais-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }
        .bn-mais-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: #f0eeeb;
          border-radius: 10px;
          text-decoration: none;
          color: #1a1816;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 400;
          transition: background 0.15s, color 0.15s;
        }
        .bn-mais-link:active { background: #e2dfda; }
        .bn-mais-link.active { color: #c4748a; }
        .bn-mais-link svg { flex-shrink: 0; color: #888580; }
        .bn-mais-link.active svg { color: #c4748a; }

        @media (max-width: 768px) {
          .bn-wrap { display: block; }
        }
      `}</style>

      {/* Overlay escuro ao abrir o drawer */}
      <div
        className={`bn-mais-overlay${maisAberto ? " open" : ""}`}
        onClick={() => setMaisAberto(false)}
      />

      {/* Drawer "Mais" */}
      <div className={`bn-mais-drawer${maisAberto ? " open" : ""}`}>
        <div className="bn-mais-handle" />
        <div className="bn-mais-grid">
          {maisItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className={`bn-mais-link${isActive(item.href) ? " active" : ""}`}
              onClick={() => setMaisAberto(false)}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom nav principal */}
      <nav className="bn-wrap">
        <div className="bn-inner">

          {/* Início */}
          <a href="/" className={`bn-item${isActive("/") ? " active" : ""}`}>
            <div className="bn-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <span className="bn-label">{i.inicio}</span>
            {isActive("/") && <div className="bn-dot"/>}
          </a>

          {/* Colecção */}
          <a href="/catalogo" className={`bn-item${isActive("/catalogo") ? " active" : ""}`}>
            <div className="bn-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <span className="bn-label">{i.catalogo}</span>
            {isActive("/catalogo") && <div className="bn-dot"/>}
          </a>

          {/* Lojistas */}
          <a href="/lojas" className={`bn-item${isActive("/lojas") || isActive("/loja") ? " active" : ""}`}>
            <div className="bn-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M3 9l1.5-6h15L21 9"/>
                <path d="M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9"/>
                <path d="M3 9h18"/>
                <rect x="9" y="13" width="6" height="8" rx="0.5"/>
              </svg>
            </div>
            <span className="bn-label">{i.lojas}</span>
            {(isActive("/lojas") || isActive("/loja")) && <div className="bn-dot"/>}
          </a>

          {/* Cesto */}
          <a href="/cesto" className={`bn-item${isActive("/cesto") ? " active" : ""}`}>
            <div className="bn-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cestoCont > 0 && <span className="bn-badge">{cestoCont > 9 ? "9+" : cestoCont}</span>}
            </div>
            <span className="bn-label">{i.cesto}</span>
            {isActive("/cesto") && <div className="bn-dot"/>}
          </a>

          {/* Mais (≡ hamburguer) */}
          <button
            className={`bn-item${maisAberto ? " mais-open" : ""}`}
            onClick={() => setMaisAberto(v => !v)}
            aria-label="Mais opções"
          >
            <div className="bn-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <span className="bn-label">{i.mais}</span>
          </button>

        </div>
      </nav>
    </>
  );
}
