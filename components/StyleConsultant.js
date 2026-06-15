"use client";
import { useState, useEffect } from "react";

const ocasioesData = {
  pt: {
    ocasioes: ["Férias", "Concerto", "Gala", "Festa", "Casamento", "Trabalho", "Jantar", "Teatro"],
    generos: ["Mulher", "Homem", "Indefinido"],
    saudacao: (nome) => nome ? `Olá, ${nome}!` : "Olá!",
    pergunta: "Onde vais hoje?",
    perguntaGenero: (ocasiao) => `${ocasiao}! Que elegante. És mulher, homem ou preferes não especificar?`,
    sugestao: (ocasiao, genero) => `A tua seleção para ${ocasiao} está pronta — escolhida especialmente para ${genero === "Mulher" ? "ti" : genero === "Homem" ? "ti" : "si"}.`,
    verSugestoes: "Ver sugestões",
    mudar: "Mudar ocasião",
  },
  fr: {
    ocasioes: ["Vacances", "Concert", "Gala", "Fête", "Mariage", "Travail", "Dîner", "Théâtre"],
    generos: ["Femme", "Homme", "Non précisé"],
    saudacao: (nome) => nome ? `Bonjour, ${nome}!` : "Bonjour!",
    pergunta: "Où allez-vous aujourd'hui ?",
    perguntaGenero: (ocasiao) => `${ocasiao} ! Élégant. Vous êtes femme, homme ou préférez ne pas préciser ?`,
    sugestao: (ocasiao, genero) => `Votre sélection pour ${ocasiao} est prête — choisie spécialement pour vous.`,
    verSugestoes: "Voir les suggestions",
    mudar: "Changer l'occasion",
  },
  lt: {
    ocasioes: ["Atostogos", "Koncertas", "Gala", "Vakarėlis", "Vestuvės", "Darbas", "Vakarienė", "Teatras"],
    generos: ["Moteris", "Vyras", "Nenurodyta"],
    saudacao: (nome) => nome ? `Sveiki, ${nome}!` : "Sveiki!",
    pergunta: "Kur šiandien einate?",
    perguntaGenero: (ocasiao) => `${ocasiao}! Elegantiškai. Esate moteris, vyras ar pageidaujate nenurodyti?`,
    sugestao: (ocasiao, genero) => `Jūsų atranka ${ocasiao} paruošta — parinkta specialiai jums.`,
    verSugestoes: "Žiūrėti pasiūlymus",
    mudar: "Keisti progą",
  },
};

export default function StyleConsultant({ lang = "pt", nomeCliente = null }) {
  const [step, setStep] = useState("ocasiao"); // ocasiao | genero | pronto
  const [ocasiao, setOcasiao] = useState(null);
  const [genero, setGenero] = useState(null);
  const [minimizado, setMinimizado] = useState(false);

  const d = ocasioesData[lang] || ocasioesData.pt;

  useEffect(() => {
    const saved = localStorage.getItem("ng_consultant");
    if (saved) {
      const { ocasiao, genero } = JSON.parse(saved);
      if (ocasiao && genero) { setOcasiao(ocasiao); setGenero(genero); setStep("pronto"); }
      else if (ocasiao) { setOcasiao(ocasiao); setStep("genero"); }
    }
  }, []);

  const escolherOcasiao = (o) => {
    setOcasiao(o);
    setStep("genero");
    localStorage.setItem("ng_consultant", JSON.stringify({ ocasiao: o }));
  };

  const escolherGenero = (g) => {
    setGenero(g);
    setStep("pronto");
    localStorage.setItem("ng_consultant", JSON.stringify({ ocasiao, genero: g }));
  };

  const resetar = () => {
    setStep("ocasiao"); setOcasiao(null); setGenero(null);
    localStorage.removeItem("ng_consultant");
    localStorage.removeItem("ng_ai_comment");
  };

  if (minimizado) return (
    <button onClick={() => setMinimizado(false)} style={{position:'fixed',bottom:'calc(80px + env(safe-area-inset-bottom))',right:'1rem',zIndex:150,background:'#080808',color:'#f8f7f5',border:'none',borderRadius:'50%',width:'52px',height:'52px',cursor:'pointer',fontSize:'1.2rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
      ✦
    </button>
  );

  return (
    <>
      <style>{`
        .consultant {
          position: fixed;
          bottom: calc(80px + env(safe-area-inset-bottom));
          left: 1rem; right: 4rem;
          z-index: 149;
          background: #f8f7f5;
          border: 1px solid #e2dfda;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          max-width: 480px;
          margin: 0 auto;
        }
        .consultant-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2dfda;
          background: #080808;
          color: #f8f7f5;
        }
        .consultant-marca {
          font-family: 'Cormorant', serif;
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 300;
        }
        .consultant-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          transition: color 0.2s;
        }
        .consultant-close:hover { color: #f8f7f5; }
        .consultant-body { padding: 1.25rem; }
        .consultant-saudacao {
          font-family: 'Cormorant', serif;
          font-size: 1.4rem;
          font-weight: 400;
          color: #080808;
          margin-bottom: 0.4rem;
        }
        .consultant-pergunta {
          font-size: 0.92rem;
          color: #2e2d2b;
          font-weight: 400;
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }
        .consultant-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .consultant-btn {
          padding: 0.75rem 0.5rem;
          border: 1px solid #e2dfda;
          background: #f8f7f5;
          font-family: 'Cormorant', serif;
          font-size: 1rem;
          font-weight: 300;
          color: #4a4845;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .consultant-btn:hover { background: #080808; color: #f8f7f5; border-color: #080808; }
        .consultant-genero-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .consultant-sugestao {
          font-family: 'Cormorant', serif;
          font-size: 1.1rem;
          font-style: italic;
          font-weight: 300;
          color: #2e2d2b;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .consultant-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .consultant-btn-ver {
          flex: 1;
          padding: 0.85rem;
          background: #080808;
          color: #f8f7f5;
          border: none;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          display: block;
          transition: background 0.2s;
        }
        .consultant-btn-ver:hover { background: #2a2926; }
        .consultant-btn-reset {
          font-size: 0.72rem;
          color: #888580;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          padding: 0;
          text-decoration: underline;
          white-space: nowrap;
        }
        @media (min-width: 769px) {
          .consultant { left: 2rem; right: auto; bottom: 2rem; width: 380px; }
        }
      `}</style>

      <div className="consultant">
        <div className="consultant-header">
          <span className="consultant-marca">✦ Nora Grei Stylist</span>
          <button className="consultant-close" onClick={() => setMinimizado(true)}>✕</button>
        </div>
        <div className="consultant-body">
          {step === "ocasiao" && (
            <>
              <div className="consultant-saudacao">{d.saudacao(nomeCliente)}</div>
              <p className="consultant-pergunta">{d.pergunta}</p>
              <div className="consultant-grid">
                {d.ocasioes.map(o => (
                  <button key={o} className="consultant-btn" onClick={() => escolherOcasiao(o)}>{o}</button>
                ))}
              </div>
            </>
          )}
          {step === "genero" && (
            <>
              <div className="consultant-saudacao">{d.saudacao(nomeCliente)}</div>
              <p className="consultant-pergunta">{d.perguntaGenero(ocasiao)}</p>
              <div className="consultant-genero-grid">
                {d.generos.map(g => (
                  <button key={g} className="consultant-btn" onClick={() => escolherGenero(g)}>{g}</button>
                ))}
              </div>
            </>
          )}
          {step === "pronto" && (
            <>
              <p className="consultant-sugestao">{d.sugestao(ocasiao, genero)}</p>
              <div className="consultant-actions">
                <a href={`/catalogo?ocasiao=${encodeURIComponent(ocasiao)}&genero=${encodeURIComponent(genero)}`} className="consultant-btn-ver">{d.verSugestoes}</a>
                <button className="consultant-btn-reset" onClick={resetar}>{d.mudar}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}