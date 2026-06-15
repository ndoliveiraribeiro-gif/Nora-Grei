"use client";
import { useState, useEffect } from "react";

const ROSA = "#c4748a";
const ROSA_DARK = "#a85c72";
const ROSA_LIGHT = "#f9eef1";

const t = {
  pt: {
    ajuda: "Posso ajudar-te a escolher?",
    sim: "Sim, quero ajuda!",
    nao: "Não, obrigada",
    evento: "Que evento é este?",
    eventos: ["Férias","Concerto","Gala","Festa","Casamento","Trabalho","Jantar","Teatro"],
    sexo: "Como te identificas?",
    sexos: ["Mulher","Homem","Não especifico"],
    idade: "Qual a tua faixa etária?",
    idades: ["18-25","26-35","36-45","46+"],
    ver: "Ver sugestões para mim",
    mudar: "Recomeçar",
    pronto: (evento, sexo) => `Perfeito! Selecionei looks de ${evento} para ${sexo === "Mulher" ? "ti" : sexo === "Homem" ? "ti" : "si"}.`,
    titulo: "✦ Stylist Nora Grei",
  },
  fr: {
    ajuda: "Puis-je vous aider à choisir ?",
    sim: "Oui, j'aide-moi !",
    nao: "Non, merci",
    evento: "Quel est cet événement ?",
    eventos: ["Vacances","Concert","Gala","Fête","Mariage","Travail","Dîner","Théâtre"],
    sexo: "Comment vous identifiez-vous ?",
    sexos: ["Femme","Homme","Non précisé"],
    idade: "Quelle est votre tranche d'âge ?",
    idades: ["18-25","26-35","36-45","46+"],
    ver: "Voir mes suggestions",
    mudar: "Recommencer",
    pronto: (evento, sexo) => `Parfait ! J'ai sélectionné des looks ${evento} pour vous.`,
    titulo: "✦ Stylist Nora Grei",
  },
  lt: {
    ajuda: "Ar galiu padėti pasirinkti?",
    sim: "Taip, padėk man!",
    nao: "Ne, ačiū",
    evento: "Kokia tai proga?",
    eventos: ["Atostogos","Koncertas","Gala","Vakarėlis","Vestuvės","Darbas","Vakarienė","Teatras"],
    sexo: "Kaip save identifikuojate?",
    sexos: ["Moteris","Vyras","Nenurodyti"],
    idade: "Koks jūsų amžiaus grupė?",
    idades: ["18-25","26-35","36-45","46+"],
    ver: "Žiūrėti pasiūlymus",
    mudar: "Pradėti iš naujo",
    pronto: (evento, sexo) => `Puiku! Parinkau looks ${evento} jums.`,
    titulo: "✦ Stylist Nora Grei",
  },
};

export default function StyleConsultant({ lang = "pt" }) {
  const [step, setStep] = useState(null); // null=escondido, ask=pergunta, evento, sexo, idade, pronto
  const [evento, setEvento] = useState(null);
  const [sexo, setSexo] = useState(null);
  const [idade, setIdade] = useState(null);

  const i = t[lang] || t.pt;

  useEffect(() => {
    // Só aparece no catálogo
    if (typeof window === "undefined") return;
    if (!window.location.pathname.startsWith("/catalogo")) return;
    
    const saved = localStorage.getItem("ng_consultant_v2");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.done) return; // já preencheu, não mostrar
      setStep("ask");
    } else {
      // Primeira visita ao catálogo - mostrar após 2 segundos
      setTimeout(() => setStep("ask"), 2000);
    }
  }, []);

  const recusar = () => {
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ done: true }));
    setStep(null);
  };

  const escolherEvento = (e) => { setEvento(e); setStep("sexo"); };
  const escolherSexo = (s) => { setSexo(s); setStep("idade"); };
  const escolherIdade = (i) => {
    setIdade(i);
    setStep("pronto");
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ evento, sexo, idade: i, done: false }));
  };

  const resetar = () => {
    localStorage.removeItem("ng_consultant_v2");
    setEvento(null); setSexo(null); setIdade(null);
    setStep("ask");
  };

  const verSugestoes = () => {
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ evento, sexo, idade, done: true }));
    window.location.href = `/catalogo?evento=${encodeURIComponent(evento)}&sexo=${encodeURIComponent(sexo)}&idade=${encodeURIComponent(idade)}`;
  };

  if (!step) return null;

  return (
    <>
      <style>{\`
        .sc-wrap {
          position: fixed;
          bottom: calc(80px + env(safe-area-inset-bottom));
          left: 1rem; right: 1rem;
          z-index: 149;
          background: #fff;
          border: 1.5px solid \${ROSA};
          box-shadow: 0 8px 32px rgba(196,116,138,0.15);
          max-width: 420px;
          animation: scUp 0.3s ease;
        }
        @keyframes scUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sc-header {
          background: \${ROSA};
          color: #fff;
          padding: 0.85rem 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Jost', sans-serif; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
        }
        .sc-close { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 1rem; padding: 0; }
        .sc-body { padding: 1.25rem; font-family: 'Jost', sans-serif; }
        .sc-question { font-family: 'Cormorant', serif; font-size: 1.25rem; font-weight: 400; color: #1a1a18; margin-bottom: 1rem; line-height: 1.4; }
        .sc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; }
        .sc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .sc-btn { padding: 0.65rem 0.5rem; border: 1.5px solid #e2dfda; background: #fff; color: #1a1a18; font-family: 'Jost', sans-serif; font-size: 0.82rem; font-weight: 400; cursor: pointer; text-align: center; transition: all 0.2s; }
        .sc-btn:hover { border-color: \${ROSA}; color: \${ROSA}; }
        .sc-btn-sim { background: \${ROSA}; color: #fff; border-color: \${ROSA}; width: 100%; padding: 0.85rem; font-size: 0.82rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .sc-btn-nao { background: none; border: none; color: #aaa89f; font-family: 'Jost', sans-serif; font-size: 0.78rem; cursor: pointer; width: 100%; text-align: center; padding: 0.3rem; text-decoration: underline; }
        .sc-btn-ver { background: \${ROSA}; color: #fff; border: none; width: 100%; padding: 0.9rem; font-family: 'Jost', sans-serif; font-size: 0.82rem; letter-spacing: 0.1em; font-weight: 500; cursor: pointer; margin-bottom: 0.5rem; }
        .sc-pronto { font-family: 'Cormorant', serif; font-size: 1.15rem; font-style: italic; color: #1a1a18; margin-bottom: 1rem; line-height: 1.5; }
        .sc-btn-reset { background: none; border: none; color: #aaa89f; font-family: 'Jost', sans-serif; font-size: 0.75rem; cursor: pointer; width: 100%; text-align: center; text-decoration: underline; }
        @media (min-width: 769px) {
          .sc-wrap { left: auto; right: 2rem; bottom: 2rem; }
        }
      \`}</style>

      <div className="sc-wrap">
        <div className="sc-header">
          <span>{i.titulo}</span>
          <button className="sc-close" onClick={recusar}>✕</button>
        </div>
        <div className="sc-body">
          {step === "ask" && (
            <>
              <p className="sc-question">{i.ajuda}</p>
              <button className="sc-btn sc-btn-sim" onClick={() => setStep("evento")}>{i.sim}</button>
              <button className="sc-btn-nao" onClick={recusar}>{i.nao}</button>
            </>
          )}
          {step === "evento" && (
            <>
              <p className="sc-question">{i.evento}</p>
              <div className="sc-grid">
                {i.eventos.map(e => <button key={e} className="sc-btn" onClick={() => escolherEvento(e)}>{e}</button>)}
              </div>
            </>
          )}
          {step === "sexo" && (
            <>
              <p className="sc-question">{i.sexo}</p>
              <div className="sc-grid">
                {i.sexos.map(s => <button key={s} className="sc-btn" onClick={() => escolherSexo(s)}>{s}</button>)}
              </div>
            </>
          )}
          {step === "idade" && (
            <>
              <p className="sc-question">{i.idade}</p>
              <div className="sc-grid-4">
                {i.idades.map(id => <button key={id} className="sc-btn" onClick={() => escolherIdade(id)}>{id}</button>)}
              </div>
            </>
          )}
          {step === "pronto" && (
            <>
              <p className="sc-pronto">{i.pronto(evento, sexo)}</p>
              <button className="sc-btn-ver" onClick={verSugestoes}>{i.ver}</button>
              <button className="sc-btn-reset" onClick={resetar}>{i.mudar}</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}