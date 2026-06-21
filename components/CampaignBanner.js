"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function CampaignBanner() {
  const [campanha, setCampanha] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    init();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
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

    if (!campanhas || campanhas.length === 0) return;

    // Sorteio: percorre as campanhas ativas e testa a probabilidade de cada uma
    const sorteada = campanhas.find(c => Math.random() * 100 < (c.probabilidade || 0));
    if (!sorteada) {
      sessionStorage.setItem("ng_campanha_mostrada", "1");
      return;
    }

    sessionStorage.setItem("ng_campanha_mostrada", "1");
    setCampanha(sorteada);
    setVisivel(true);
    timeoutRef.current = setTimeout(() => setVisivel(false), 7000);
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
  };

  if (!campanha) return null;

  return (
    <>
      <style>{`
        @keyframes ngCampanhaIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes ngCampanhaOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-20px); opacity: 0; } }
        .ng-campanha-banner {
          position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
          z-index: 400; max-width: 92vw; width: 380px;
          background: #080808; color: #f8f7f5;
          padding: 1.1rem 1.4rem; display: flex; align-items: center; gap: 1rem;
          font-family: 'Jost', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          animation: ngCampanhaIn 0.4s ease;
        }
        .ng-campanha-banner.saindo { animation: ngCampanhaOut 0.3s ease forwards; }
        .ng-campanha-info { flex: 1; min-width: 0; }
        .ng-campanha-titulo { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.2rem; }
        .ng-campanha-desc { font-size: 0.75rem; color: rgba(248,247,245,0.7); }
        .ng-campanha-codigo { font-family: 'Cormorant', Georgia, serif; font-size: 1.3rem; font-weight: 500; letter-spacing: 0.1em; color: #c4748a; margin-top: 0.25rem; }
        .ng-campanha-btn { flex-shrink: 0; padding: 0.5rem 0.9rem; background: #c4748a; color: #fff; border: none; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: 'Jost', sans-serif; }
        .ng-campanha-fechar { flex-shrink: 0; background: none; border: none; color: rgba(248,247,245,0.5); cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; }
        @media (max-width: 480px) {
          .ng-campanha-banner { width: 94vw; padding: 1rem 1.1rem; gap: 0.75rem; }
          .ng-campanha-titulo { font-size: 0.92rem; }
          .ng-campanha-desc { font-size: 0.8rem; }
        }
      `}</style>
      <div className={`ng-campanha-banner${visivel ? "" : " saindo"}`} style={{ display: visivel ? "flex" : "none" }}>
        <div className="ng-campanha-info">
          <div className="ng-campanha-titulo">{campanha.titulo}</div>
          {campanha.mensagem && <div className="ng-campanha-desc">{campanha.mensagem}</div>}
          {campanha.codigo && <div className="ng-campanha-codigo">{campanha.codigo}</div>}
        </div>
        {campanha.codigo && (
          <button className="ng-campanha-btn" onClick={copiar}>{copiado ? "Copiado!" : "Copiar"}</button>
        )}
        <button className="ng-campanha-fechar" onClick={fechar} aria-label="Fechar">✕</button>
      </div>
    </>
  );
}