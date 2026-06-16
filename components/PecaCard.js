"use client";
import { useState, useEffect } from "react";

function Timer({ dataFim, lang }) {
  const [tempo, setTempo] = useState("");
  const labels = {
    pt: "Disponível em",
    fr: "Disponible dans",
    lt: "Prieinama po",
  };

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
    <div style={{position:'absolute',bottom:'0.75rem',left:'0.75rem',right:'0.75rem',background:'rgba(248,247,245,0.95)',padding:'0.5rem 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem',fontFamily:"'Jost',sans-serif",fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#080808',zIndex:3}}>
      <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#e67e22',flexShrink:0,animation:'pulse 2s infinite'}}></div>
      <span>{labels[lang] || labels.pt} {tempo}</span>
    </div>
  );
}

export default function PecaCard({ peca, lang = "pt" }) {
  const labels = {
    pt: { alugar: "Alugar", comprar: "Comprar", reservar: "Reservar quando disponível", disponivel: "Disponível", indisponivel: "Indisponível" },
    fr: { alugar: "Louer", comprar: "Acheter", reservar: "Réserver quand disponible", disponivel: "Disponible", indisponivel: "Indisponible" },
    lt: { alugar: "Nuomoti", comprar: "Pirkti", reservar: "Rezervuoti", disponivel: "Prieinama", indisponivel: "Neprieinama" },
  };
  const l = labels[lang] || labels.pt;
  const disponivel = peca.estado === "disponivel";

  return (
    <div style={{display:'flex',flexDirection:'column',background:'#f8f7f5',position:'relative',transition:'transform 0.25s,box-shadow 0.25s',cursor:'pointer'}}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <a href={`/catalogo/${peca.id}`} style={{textDecoration:'none',color:'inherit'}}>
        {/* IMAGEM */}
        <div style={{aspectRatio:'3/4',background:'#e8e5e0',overflow:'hidden',position:'relative'}}>
          {peca.fotos && peca.fotos[0] ? (
            <img src={peca.fotos[0]} alt={peca.nome} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />
          ) : (
            <div style={{width:'100%',height:'100%',background:'linear-gradient(160deg,#e8e4e0,#d5d0c8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontFamily:"'Cormorant',serif",fontSize:'3rem',fontWeight:300,color:'rgba(0,0,0,0.08)',fontStyle:'italic'}}>NG</span>
            </div>
          )}

          {/* BADGE */}
          <div style={{position:'absolute',top:'0.75rem',left:'0.75rem',fontSize:'0.52rem',letterSpacing:'0.2em',textTransform:'uppercase',background:disponivel?'#080808':'#aaa89f',color:'#f8f7f5',padding:'0.3rem 0.7rem',fontFamily:"'Jost',sans-serif",fontWeight:400,zIndex:2}}>
            {disponivel ? l.disponivel : l.indisponivel}
          </div>

          {/* TIMER */}
          {!disponivel && peca.data_fim && <Timer dataFim={peca.data_fim} lang={lang} />}
        </div>

        {/* INFO */}
        <div style={{padding:'1rem 1rem 0.5rem'}}>
          {peca.categoria && (
            <p style={{fontSize:'0.55rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'#aaa89f',fontFamily:"'Jost',sans-serif",fontWeight:400,marginBottom:'0.3rem'}}>{peca.categoria}</p>
          )}
          <h3 style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.2rem',fontWeight:300,lineHeight:1.2,marginBottom:'0.4rem'}}>{peca.nome}</h3>
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
              {peca.tamanhos.map(t => (
                <span key={t} style={{fontSize:'0.58rem',letterSpacing:'0.1em',border:'1px solid #e2dfda',padding:'0.2rem 0.5rem',color:'#6b6960',fontFamily:"'Jost',sans-serif",fontWeight:400}}>{t}</span>
              ))}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'0.75rem',borderTop:'1px solid #e2dfda'}}>
            <div style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:'1.3rem',fontWeight:300}}>
              {peca.preco_aluguer_dia}€ <span style={{fontFamily:"'Jost',sans-serif",fontSize:'0.65rem',color:'#aaa89f',fontWeight:300}}>/dia</span>
            </div>
          </div>
        </div>
      </a>

      {/* BOTÕES */}
      <div style={{padding:'0.75rem 1rem 1.25rem',display:'flex',gap:'0.5rem'}}>
        {disponivel ? (
          <>
            <a href={`/catalogo/${peca.id}`} style={{flex:1,padding:'0.65rem',fontSize:'0.58rem',letterSpacing:'0.12em',textTransform:'uppercase',background:'#080808',color:'#f8f7f5',textAlign:'center',textDecoration:'none',fontFamily:"'Jost',sans-serif",fontWeight:400,transition:'background 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.background='#2a2926'}
              onMouseLeave={e => e.currentTarget.style.background='#080808'}>
              {l.alugar}
            </a>
            <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer"
              style={{flex:1,padding:'0.65rem',fontSize:'0.58rem',letterSpacing:'0.12em',textTransform:'uppercase',background:'#f8f7f5',color:'#080808',border:'1px solid #e2dfda',textAlign:'center',textDecoration:'none',fontFamily:"'Jost',sans-serif",fontWeight:400,transition:'border-color 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor='#080808'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e2dfda'}>
              {l.comprar} ↗
            </a>
          </>
        ) : (
          <a href={`/reserva?peca=${peca.id}`}
            style={{flex:1,padding:'0.65rem',fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',background:'#f0eeeb',color:'#4a4845',border:'1px solid #e2dfda',textAlign:'center',textDecoration:'none',fontFamily:"'Jost',sans-serif",fontWeight:400}}>
            {l.reservar}
          </a>
        )}
      </div>
    </div>
  );
}