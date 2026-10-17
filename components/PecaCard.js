"use client";
import { useState, useEffect } from "react";

function Timer({ dataFim, lang }) {
  const [tempo, setTempo] = useState("");
  const labels = { pt: "Disponível em", fr: "Disponible dans", lt: "Prieinama po" };
  useEffect(() => {
    const calcular = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h`);
      else if (horas > 0) setTempo(`${horas}h ${mins}m`);
      else setTempo(`${mins}m`);
    };
    calcular();
    const i = setInterval(calcular, 60000);
    return () => clearInterval(i);
  }, [dataFim]);
  if (!tempo) return null;
  return (
    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(8,8,8,0.72)',backdropFilter:'blur(4px)',padding:'0.45rem 0.75rem',display:'flex',alignItems:'center',gap:'0.4rem',zIndex:3}}>
      <div style={{width:5,height:5,borderRadius:'50%',background:'#f39c12',flexShrink:0,animation:'pcpulse 2s infinite'}}/>
      <span style={{fontFamily:"'Jost',sans-serif",fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.9)'}}>{labels[lang]||labels.pt} <strong>{tempo}</strong></span>
    </div>
  );
}

export default function PecaCard({ peca, lang = "pt" }) {
  const labels = {
    pt: { alugar: "Alugar", comprar: "Comprar", reservar: "Indisponível — Reservar", disponivel: "Disponível", indisponivel: "Indisponível" },
    fr: { alugar: "Louer", comprar: "Acheter", reservar: "Indisponible — Réserver", disponivel: "Disponible", indisponivel: "Indisponible" },
    lt: { alugar: "Nuomoti", comprar: "Pirkti", reservar: "Neprieinama — Rezervuoti", disponivel: "Prieinama", indisponivel: "Neprieinama" },
  };
  const l = labels[lang] || labels.pt;
  const disponivel = peca.estado === "disponivel";

  return (
    <div style={{display:'flex',flexDirection:'column',background:'#f8f7f5',position:'relative',borderRadius:'2px',overflow:'hidden'}}>
      <style>{`@keyframes pcpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* IMAGEM — toca e vai direto ao detalhe */}
      <a href={`/catalogo/${peca.id}`} style={{textDecoration:'none',color:'inherit',display:'block',position:'relative'}}>
        <div style={{aspectRatio:'3/4',background:'#e8e5e0',overflow:'hidden',position:'relative'}}>
          {peca.fotos && peca.fotos[0] ? (
            <img
              src={peca.fotos[0]}
              alt={peca.nome}
              style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}}
            />
          ) : (
            <div style={{width:'100%',height:'100%',background:'linear-gradient(160deg,#e8e4e0,#d5d0c8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontFamily:"'Cormorant',serif",fontSize:'2.5rem',fontWeight:300,color:'rgba(0,0,0,0.06)',fontStyle:'italic'}}>NG</span>
            </div>
          )}

          {/* Badge disponibilidade — canto superior direito, discreto */}
          {!disponivel && (
            <div style={{position:'absolute',top:'0.6rem',right:'0.6rem',fontSize:'0.48rem',letterSpacing:'0.18em',textTransform:'uppercase',background:'rgba(248,247,245,0.92)',color:'#5a5855',padding:'0.25rem 0.55rem',fontFamily:"'Jost',sans-serif",fontWeight:400,zIndex:2}}>
              {l.indisponivel}
            </div>
          )}

          {/* Timer */}
          {!disponivel && peca.data_fim && <Timer dataFim={peca.data_fim} lang={lang} />}
        </div>

        {/* INFO */}
        <div style={{padding:'0.65rem 0.7rem 0.3rem'}}>
          {peca.categoria && (
            <p style={{fontSize:'0.48rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#b0ada6',fontFamily:"'Jost',sans-serif",marginBottom:'0.15rem'}}>{peca.categoria}</p>
          )}
          <h3 style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1rem',fontWeight:300,lineHeight:1.15,marginBottom:'0.3rem',color:'#080808'}}>{peca.nome}</h3>

          {/* Tamanhos disponíveis */}
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:'flex',gap:'0.25rem',flexWrap:'wrap',marginBottom:'0.3rem'}}>
              {peca.tamanhos.slice(0,5).map(t => (
                <span key={t} style={{fontSize:'0.47rem',letterSpacing:'0.06em',border:'1px solid #dedad4',padding:'0.12rem 0.35rem',color:'#6b6960',fontFamily:"'Jost',sans-serif"}}>{t}</span>
              ))}
              {peca.tamanhos.length > 5 && <span style={{fontSize:'0.47rem',color:'#b0ada6',fontFamily:"'Jost',sans-serif",alignSelf:'center'}}>+{peca.tamanhos.length-5}</span>}
            </div>
          )}

          {/* Preço */}
          <div style={{display:'flex',alignItems:'baseline',gap:'0.3rem',paddingTop:'0.4rem',borderTop:'1px solid #ece9e4'}}>
            <span style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.2rem',fontWeight:300,color:'#080808'}}>{peca.preco_aluguer_dia}€</span>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:'0.55rem',color:'#b0ada6',fontWeight:300}}>/dia</span>
          </div>
        </div>
      </a>

      {/* CTA — único, claro, grande o suficiente para o polegar */}
      {disponivel ? (
        <a
          href={`/catalogo/${peca.id}`}
          style={{
            display:'block',
            margin:'0 0.7rem 0.7rem',
            padding:'0.72rem',
            fontSize:'0.58rem',
            letterSpacing:'0.14em',
            textTransform:'uppercase',
            background:'#080808',
            color:'#f8f7f5',
            textAlign:'center',
            textDecoration:'none',
            fontFamily:"'Jost',sans-serif",
            fontWeight:400,
            minHeight:'44px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
          }}
        >
          {l.alugar}
        </a>
      ) : (
        <a
          href={`/reserva?peca=${peca.id}`}
          style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            margin:'0 0.7rem 0.7rem',
            padding:'0.72rem',
            fontSize:'0.55rem',
            letterSpacing:'0.12em',
            textTransform:'uppercase',
            background:'transparent',
            color:'#5a5855',
            border:'1px solid #dedad4',
            textAlign:'center',
            textDecoration:'none',
            fontFamily:"'Jost',sans-serif",
            fontWeight:400,
            minHeight:'44px',
          }}
        >
          {l.reservar}
        </a>
      )}
    </div>
  );
}
