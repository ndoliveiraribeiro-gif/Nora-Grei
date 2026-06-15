"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
    pronto: (evento) => `Selecionei looks de ${evento} especialmente para ti.`,
    titulo: "✦ Stylist Nora Grei",
  },
  fr: {
    ajuda: "Puis-je vous aider à choisir ?",
    sim: "Oui, aidez-moi !",
    nao: "Non, merci",
    evento: "Quel est cet événement ?",
    eventos: ["Vacances","Concert","Gala","Fête","Mariage","Travail","Dîner","Théâtre"],
    sexo: "Comment vous identifiez-vous ?",
    sexos: ["Femme","Homme","Non précisé"],
    idade: "Quelle est votre tranche d'âge ?",
    idades: ["18-25","26-35","36-45","46+"],
    ver: "Voir mes suggestions",
    mudar: "Recommencer",
    pronto: (evento) => `J'ai sélectionné des looks ${evento} pour vous.`,
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
    pronto: (evento) => `Parinkau looks ${evento} jums.`,
    titulo: "✦ Stylist Nora Grei",
  },
};

export default function StyleConsultant({ lang = "pt" }) {
  const [step, setStep] = useState(null);
  const [evento, setEvento] = useState(null);
  const [sexo, setSexo] = useState(null);
  const [idade, setIdade] = useState(null);
  const pathname = usePathname();
  const i = t[lang] || t.pt;

  useEffect(() => {
    if (!pathname?.startsWith("/catalogo")) return;
    const saved = localStorage.getItem("ng_consultant_v2");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.done) return;
      setStep("ask");
    } else {
      const timer = setTimeout(() => setStep("ask"), 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const recusar = () => {
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ done: true }));
    setStep(null);
  };

  const escolherEvento = (e) => { setEvento(e); setStep("sexo"); };
  const escolherSexo = (s) => { setSexo(s); setStep("idade"); };
  const escolherIdade = (id) => {
    setIdade(id);
    setStep("pronto");
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ evento, sexo, idade: id, done: false }));
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
    <div style={{position:'fixed',bottom:'calc(80px + env(safe-area-inset-bottom))',left:'1rem',right:'1rem',zIndex:149,background:'#fff',border:'1.5px solid #c4748a',boxShadow:'0 8px 32px rgba(196,116,138,0.15)',maxWidth:'420px',fontFamily:"'Jost',Arial,sans-serif",animation:'scUp 0.3s ease'}}>
      <style>{`@keyframes scUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HEADER */}
      <div style={{background:'#c4748a',color:'#fff',padding:'0.85rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500}}>
        <span>{i.titulo}</span>
        <button onClick={recusar} style={{background:'none',border:'none',color:'rgba(255,255,255,0.8)',cursor:'pointer',fontSize:'1rem',padding:0}}>✕</button>
      </div>

      {/* BODY */}
      <div style={{padding:'1.25rem'}}>
        {step === "ask" && (
          <div>
            <p style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.25rem',fontWeight:400,color:'#1a1a18',marginBottom:'1rem',lineHeight:1.4}}>{i.ajuda}</p>
            <button onClick={() => setStep("evento")} style={{background:'#c4748a',color:'#fff',border:'none',width:'100%',padding:'0.9rem',fontSize:'0.85rem',letterSpacing:'0.1em',fontFamily:"'Jost',sans-serif",fontWeight:500,cursor:'pointer',marginBottom:'0.5rem'}}>{i.sim}</button>
            <button onClick={recusar} style={{background:'none',border:'none',color:'#aaa89f',fontFamily:"'Jost',sans-serif",fontSize:'0.82rem',cursor:'pointer',width:'100%',textAlign:'center',padding:'0.3rem',textDecoration:'underline'}}>{i.nao}</button>
          </div>
        )}

        {step === "evento" && (
          <div>
            <p style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.25rem',fontWeight:400,color:'#1a1a18',marginBottom:'1rem',lineHeight:1.4}}>{i.evento}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.5rem'}}>
              {i.eventos.map(e => (
                <button key={e} onClick={() => escolherEvento(e)} style={{padding:'0.65rem 0.5rem',border:'1.5px solid #e2dfda',background:'#fff',color:'#1a1a18',fontFamily:"'Jost',sans-serif",fontSize:'0.85rem',fontWeight:400,cursor:'pointer',textAlign:'center'}}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {step === "sexo" && (
          <div>
            <p style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.25rem',fontWeight:400,color:'#1a1a18',marginBottom:'1rem',lineHeight:1.4}}>{i.sexo}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.5rem'}}>
              {i.sexos.map(s => (
                <button key={s} onClick={() => escolherSexo(s)} style={{padding:'0.65rem 0.5rem',border:'1.5px solid #e2dfda',background:'#fff',color:'#1a1a18',fontFamily:"'Jost',sans-serif",fontSize:'0.85rem',fontWeight:400,cursor:'pointer',textAlign:'center'}}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {step === "idade" && (
          <div>
            <p style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.25rem',fontWeight:400,color:'#1a1a18',marginBottom:'1rem',lineHeight:1.4}}>{i.idade}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem'}}>
              {i.idades.map(id => (
                <button key={id} onClick={() => escolherIdade(id)} style={{padding:'0.65rem 0.25rem',border:'1.5px solid #e2dfda',background:'#fff',color:'#1a1a18',fontFamily:"'Jost',sans-serif",fontSize:'0.82rem',fontWeight:400,cursor:'pointer',textAlign:'center'}}>{id}</button>
              ))}
            </div>
          </div>
        )}

        {step === "pronto" && (
          <div>
            <p style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.2rem',fontStyle:'italic',color:'#1a1a18',marginBottom:'1rem',lineHeight:1.5}}>{i.pronto(evento)}</p>
            <button onClick={verSugestoes} style={{background:'#c4748a',color:'#fff',border:'none',width:'100%',padding:'0.9rem',fontFamily:"'Jost',sans-serif",fontSize:'0.85rem',letterSpacing:'0.1em',fontWeight:500,cursor:'pointer',marginBottom:'0.5rem'}}>{i.ver}</button>
            <button onClick={resetar} style={{background:'none',border:'none',color:'#aaa89f',fontFamily:"'Jost',sans-serif",fontSize:'0.78rem',cursor:'pointer',width:'100%',textAlign:'center',textDecoration:'underline'}}>{i.mudar}</button>
          </div>
        )}
      </div>
    </div>
  );
}