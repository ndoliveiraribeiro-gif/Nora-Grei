"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function CampanhaAlert({ lang = "pt" }) {
  const [campanha, setCampanha] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [progresso, setProgresso] = useState(100);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const DURACAO = 7000;

  useEffect(() => {
    init();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const init = async () => {
    const jaMostrou = sessionStorage.getItem("ng_campanha_mostrada");
    if (jaMostrou) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: campanhas } = await supabase
      .from("campanhas")
      .select("*")
      .eq("ativa", true)
      .or(`validade.is.null,validade.gt.${new Date().toISOString()}`);

    if (!campanhas || campanhas.length === 0) {
      sessionStorage.setItem("ng_campanha_mostrada", "1");
      return;
    }

    const sorteada = campanhas.find(c => Math.random() * 100 < (c.probabilidade || 0));
    sessionStorage.setItem("ng_campanha_mostrada", "1");

    if (!sorteada) return;

    setCampanha(sorteada);
    setVisivel(true);
    setProgresso(100);

    // Barra de progresso decrescente
    const inicio = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - inicio;
      const restante = Math.max(0, 100 - (elapsed / DURACAO) * 100);
      setProgresso(restante);
      if (restante === 0) clearInterval(intervalRef.current);
    }, 50);

    timeoutRef.current = setTimeout(() => {
      setVisivel(false);
      clearInterval(intervalRef.current);
    }, DURACAO);
  };

  const copiar = () => {
    if (!campanha?.codigo) return;
    navigator.clipboard.writeText(campanha.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const fechar = () => {
    setVisivel(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (!campanha || !visivel) return null;

  return (
    <>
      <style>{`
        @keyframes ngSlideIn {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .ng-campanha {
          position: fixed;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: min(420px, 92vw);
          background: #080808;
          color: #f8f7f5;
          font-family: 'Jost', sans-serif;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          animation: ngSlideIn 0.4s ease;
          overflow: hidden;
        }
        .ng-campanha-inner {
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ng-campanha-info { flex: 1; min-width: 0; }
        .ng-campanha-surpresa {
          font-size: 0.55rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #c4748a;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .ng-campanha-titulo {
          font-size: 0.92rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
          line-height: 1.3;
        }
        .ng-campanha-msg {
          font-size: 0.75rem;
          color: rgba(248,247,245,0.65);
          margin-bottom: 0.3rem;
          line-height: 1.4;
        }
        .ng-campanha-codigo {
          font-family: 'Cormorant', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: #c4748a;
        }
        .ng-campanha-acoes { display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end; flex-shrink: 0; }
        .ng-campanha-copiar {
          padding: 0.45rem 0.9rem;
          background: #c4748a;
          color: #fff;
          border: none;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          white-space: nowrap;
        }
        .ng-campanha-copiar.ok { background: #27ae60; }
        .ng-campanha-fechar {
          background: none;
          border: none;
          color: rgba(248,247,245,0.4);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
          font-family: sans-serif;
        }
        .ng-campanha-fechar:hover { color: rgba(248,247,245,0.8); }
        .ng-campanha-barra {
          height: 2px;
          background: rgba(196, 116, 138, 0.3);
        }
        .ng-campanha-barra-fill {
          height: 100%;
          background: #c4748a;
          transition: width 0.05s linear;
        }
        @media (max-width: 480px) {
          .ng-campanha-inner { padding: 1rem; gap: 0.75rem; }
          .ng-campanha-titulo { font-size: 0.88rem; }
          .ng-campanha-codigo { font-size: 1.2rem; }
        }
      `}</style>

      <div className="ng-campanha">
        <div className="ng-campanha-inner">
          <div className="ng-campanha-info">
            <div className="ng-campanha-surpresa">
              {lang === "fr" ? "Surprise pour vous" : lang === "lt" ? "Staigmena jums" : "Surpresa para si"}
            </div>
            <div className="ng-campanha-titulo">{campanha.titulo}</div>
            {campanha.mensagem && (
              <div className="ng-campanha-msg">{campanha.mensagem}</div>
            )}
            {campanha.codigo && (
              <div className="ng-campanha-codigo">{campanha.codigo}</div>
            )}
            {campanha.desconto && (
              <div style={{ fontSize: "0.7rem", color: "rgba(248,247,245,0.5)", marginTop: "0.15rem" }}>
                {campanha.desconto}
              </div>
            )}
          </div>
          <div className="ng-campanha-acoes">
            {campanha.codigo && (
              <button className={`ng-campanha-copiar${copiado ? " ok" : ""}`} onClick={copiar}>
                {copiado ? "✓ Copiado" : "Copiar código"}
              </button>
            )}
            {campanha.url_destino && (
              <a
                href={campanha.url_destino}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.6rem", color: "rgba(248,247,245,0.4)", textDecoration: "none", letterSpacing: "0.05em" }}
              >
                Ver loja ↗
              </a>
            )}
            <button className="ng-campanha-fechar" onClick={fechar} aria-label="Fechar">✕</button>
          </div>
        </div>
        <div className="ng-campanha-barra">
          <div className="ng-campanha-barra-fill" style={{ width: `${progresso}%` }} />
        </div>
      </div>
    </>
  );
}