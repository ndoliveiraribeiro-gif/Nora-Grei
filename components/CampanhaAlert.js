"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: { copiar: "Copiar código", copiado: "Copiado! ✓", ver: "Ver agora", fechar: "Fechar", sorte: "É o teu dia de sorte!", novidade: "Novidade na Nora Grei" },
  fr: { copiar: "Copier le code", copiado: "Copié! ✓", ver: "Voir maintenant", fechar: "Fermer", sorte: "C'est ton jour de chance!", novidade: "Nouveauté Nora Grei" },
  lt: { copiar: "Kopijuoti kodą", copiado: "Nukopijuota! ✓", ver: "Žiūrėti dabar", fechar: "Uždaryti", sorte: "Tavo laimės diena!", novidade: "Naujiena Nora Grei" },
};

export default function CampanhaAlert({ lang = "pt" }) {
  const [campanha, setCampanha] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const i = t[lang] || t.pt;

  useEffect(() => {
    verificarCampanha();
  }, []);

  const verificarCampanha = async () => {
    // Verificar última vez que foi mostrado (não mostrar mais de 1x por hora)
    const ultimaVez = localStorage.getItem("ng_campanha_ultima");
    if (ultimaVez && Date.now() - parseInt(ultimaVez) < 3600000) return;

    // Buscar campanhas ativas
    const { data } = await supabase
      .from("campanhas")
      .select("*")
      .eq("ativa", true)
      .or("validade.is.null,validade.gt." + new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) return;

    // Sortear se aparece campanha (baseado na probabilidade)
    const sorteio = Math.random() * 100;
    
    // Escolher campanha aleatória
    const campanhaAleatoria = data[Math.floor(Math.random() * data.length)];
    
    if (sorteio <= campanhaAleatoria.probabilidade) {
      setTimeout(() => {
        setCampanha(campanhaAleatoria);
        setVisivel(true);
        localStorage.setItem("ng_campanha_ultima", Date.now().toString());
      }, 2000);
    }
  };

  const fechar = () => setVisivel(false);

  const copiar = () => {
    if (campanha?.codigo) {
      navigator.clipboard.writeText(campanha.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  if (!visivel || !campanha) return null;

  const isCupao = campanha.tipo === "cupao";
  const isNovidade = campanha.tipo === "novidade";

  return (
    <>
      <style>{`
        .ca-overlay { position:fixed; inset:0; background:rgba(8,8,8,0.5); z-index:500; display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .ca-modal { background:#f8f7f5; max-width:480px; width:100%; animation:slideUp 0.4s ease; position:relative; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .ca-header { background:#080808; padding:1.5rem 2rem; position:relative; }
        .ca-header-tag { font-size:0.6rem; letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,0.5); font-family:'Jost',sans-serif; margin-bottom:0.5rem; }
        .ca-header-titulo { font-family:'Cormorant',serif; font-size:1.8rem; font-weight:300; color:#f8f7f5; line-height:1.2; }
        .ca-fechar { position:absolute; top:1rem; right:1rem; background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:1.1rem; padding:0.25rem; transition:color 0.2s; }
        .ca-fechar:hover { color:#f8f7f5; }
        .ca-body { padding:2rem; }
        .ca-mensagem { font-family:'Cormorant',serif; font-size:1.2rem; font-weight:300; color:#1a1a18; line-height:1.7; margin-bottom:1.5rem; font-style:italic; }
        .ca-codigo-wrap { background:#f0eeeb; border:2px dashed #c4748a; padding:1.25rem; text-align:center; margin-bottom:1.5rem; }
        .ca-codigo-label { font-size:0.6rem; letter-spacing:0.25em; text-transform:uppercase; color:#c4748a; font-family:'Jost',sans-serif; margin-bottom:0.4rem; }
        .ca-codigo { font-family:'Jost',monospace; font-size:1.6rem; font-weight:600; color:#080808; letter-spacing:0.25em; }
        .ca-desconto { font-size:0.8rem; color:#5a5855; margin-top:0.3rem; }
        .ca-btns { display:flex; gap:0.75rem; }
        .ca-btn-copiar { flex:1; padding:0.9rem; border:none; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; font-family:'Jost',sans-serif; font-weight:500; cursor:pointer; transition:background 0.2s; background:#c4748a; color:#fff; }
        .ca-btn-copiar.copied { background:#27ae60; }
        .ca-btn-ver { flex:1; padding:0.9rem; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; font-family:'Jost',sans-serif; font-weight:500; text-decoration:none; text-align:center; background:#080808; color:#fff; transition:background 0.2s; }
        .ca-btn-ver:hover { background:#2a2926; }
        .ca-footer { padding:0.75rem 2rem 1.25rem; text-align:center; }
        .ca-btn-fechar { font-size:0.68rem; color:#aaa89f; background:none; border:none; cursor:pointer; font-family:'Jost',sans-serif; text-decoration:underline; }
        @media (max-width:480px) {
          .ca-btns { flex-direction:column; }
          .ca-header-titulo { font-size:1.5rem; }
        }
      `}</style>

      <div className="ca-overlay" onClick={fechar}>
        <div className="ca-modal" onClick={e => e.stopPropagation()}>
          <div className="ca-header">
            <p className="ca-header-tag">{isCupao ? i.sorte : i.novidade}</p>
            <h2 className="ca-header-titulo">{campanha.titulo}</h2>
            <button className="ca-fechar" onClick={fechar}>✕</button>
          </div>
          <div className="ca-body">
            <p className="ca-mensagem">{campanha.mensagem}</p>
            {campanha.codigo && (
              <div className="ca-codigo-wrap">
                <p className="ca-codigo-label">Código de desconto</p>
                <p className="ca-codigo">{campanha.codigo}</p>
                {campanha.desconto && <p className="ca-desconto">{campanha.desconto}</p>}
              </div>
            )}
            <div className="ca-btns">
              {campanha.codigo && (
                <button className={`ca-btn-copiar${copiado ? " copied" : ""}`} onClick={copiar}>
                  {copiado ? i.copiado : i.copiar}
                </button>
              )}
              <a href={campanha.url_destino || "https://www.noragrei.com"} target="_blank" rel="noopener noreferrer" className="ca-btn-ver">
                {i.ver} ↗
              </a>
            </div>
          </div>
          <div className="ca-footer">
            <button className="ca-btn-fechar" onClick={fechar}>{i.fechar}</button>
          </div>
        </div>
      </div>
    </>
  );
}