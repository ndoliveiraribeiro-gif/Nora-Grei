"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { t, traduzCat } from "@/lib/i18n";

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
      <span style={{fontFamily:"'Jost',sans-serif",fontSize:'0.72rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.9)'}}>{labels[lang]||labels.pt} <strong>{tempo}</strong></span>
    </div>
  );
}

export default function PecaCard({ peca, lang = "pt" }) {
  const l = t(lang);
  const disponivel = peca.estado === "disponivel";

  const [naWishlist, setNaWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const uid = data.session.user.id;
      setUserId(uid);
      supabase.from("wishlist").select("id").eq("cliente_id", uid).eq("peca_id", peca.id).maybeSingle()
        .then(({ data: w }) => { if (w) setNaWishlist(true); });
    });
  }, [peca.id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { window.location.href = "/entrar"; return; }
    setWishlistLoading(true);
    if (naWishlist) {
      await supabase.from("wishlist").delete().eq("cliente_id", userId).eq("peca_id", peca.id);
      setNaWishlist(false);
    } else {
      await supabase.from("wishlist").insert({ cliente_id: userId, peca_id: peca.id });
      setNaWishlist(true);
    }
    setWishlistLoading(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',background:'#f8f7f5',position:'relative',borderRadius:'2px',overflow:'hidden'}}>
      <style>{`@keyframes pcpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* IMAGEM — toca e vai direto ao detalhe */}
      <a href={`/catalogo/${peca.id}`} style={{textDecoration:'none',color:'inherit',display:'block',position:'relative'}}>
        <div style={{aspectRatio:'2/3',background:'#e8e5e0',overflow:'hidden',position:'relative'}}>
          {peca.fotos && peca.fotos[0] ? (
            <img
              src={peca.fotos[0]}
              alt={peca.nome}
              style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',display:'block'}}
            />
          ) : (
            <div style={{width:'100%',height:'100%',background:'linear-gradient(160deg,#e8e4e0,#d5d0c8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontFamily:"'Cormorant',serif",fontSize:'2.5rem',fontWeight:300,color:'rgba(0,0,0,0.06)',fontStyle:'italic'}}>NG</span>
            </div>
          )}

          {/* Botão wishlist — canto superior esquerdo */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            style={{
              position:'absolute', top:'0.5rem', left:'0.5rem', zIndex:4,
              background: naWishlist ? 'rgba(196,116,138,0.92)' : 'rgba(248,247,245,0.85)',
              border:'none', borderRadius:'50%',
              width:'32px', height:'32px',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', backdropFilter:'blur(4px)',
              transition:'background 0.2s, transform 0.15s',
              transform: wishlistLoading ? 'scale(0.9)' : 'scale(1)',
            }}
            aria-label={naWishlist ? l.removerGuardado : l.guardar}
          >
            <svg viewBox="0 0 24 24" width="15" height="15"
              fill={naWishlist ? "#fff" : "none"}
              stroke={naWishlist ? "#fff" : "#5a5855"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>

          {/* Badge disponibilidade — canto superior direito, discreto */}
          {!disponivel && (
            <div style={{position:'absolute',top:'0.6rem',right:'0.6rem',fontSize:'0.68rem',letterSpacing:'0.14em',textTransform:'uppercase',background:'rgba(248,247,245,0.92)',color:'#5a5855',padding:'0.28rem 0.6rem',fontFamily:"'Jost',sans-serif",fontWeight:400,zIndex:2}}>
              {l.indisponivel}
            </div>
          )}

          {/* Timer */}
          {!disponivel && peca.data_fim && <Timer dataFim={peca.data_fim} lang={lang} />}
        </div>

        {/* INFO */}
        <div style={{padding:'0.7rem 0.75rem 0.4rem'}}>
          {peca.categoria && (
            <p style={{fontSize:'0.72rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'#8a8783',fontFamily:"'Jost',sans-serif",marginBottom:'0.18rem',fontWeight:400}}>{traduzCat(peca.categoria, lang)}</p>
          )}
          {/* Nome: peso 500 para ser bem legível */}
          <h3 style={{fontFamily:"'Jost',sans-serif",fontSize:'0.92rem',fontWeight:500,lineHeight:1.25,marginBottom:'0.35rem',color:'#111',letterSpacing:'0.01em'}}>{peca.nome}</h3>

          {/* Tamanhos disponíveis */}
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap',marginBottom:'0.4rem'}}>
              {peca.tamanhos.slice(0,5).map(t => (
                <span key={t} style={{fontSize:'0.72rem',letterSpacing:'0.03em',border:'1px solid #d0cdc8',padding:'0.16rem 0.45rem',color:'#4a4845',fontFamily:"'Jost',sans-serif",fontWeight:400,background:'#f2f0ed'}}>{t}</span>
              ))}
              {peca.tamanhos.length > 5 && <span style={{fontSize:'0.72rem',color:'#8a8783',fontFamily:"'Jost',sans-serif",alignSelf:'center'}}>+{peca.tamanhos.length-5}</span>}
            </div>
          )}

          {/* Preço — grande e a negrito */}
          <div style={{display:'flex',alignItems:'baseline',gap:'0.25rem',paddingTop:'0.4rem',borderTop:'1px solid #e8e5e0'}}>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:'1.15rem',fontWeight:600,color:'#111'}}>{peca.preco_aluguer_dia}€</span>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:'0.72rem',color:'#8a8783',fontWeight:400}}>/dia</span>
          </div>
        </div>
      </a>

      {/* CTA — apenas para indisponível (reservar). Disponível: card inteiro é clicável */}
      {!disponivel && (
        <a
          href={`/reserva?peca=${peca.id}`}
          style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            margin:'0 0.6rem 0.6rem',
            padding:'0.55rem',
            fontSize:'0.78rem',
            letterSpacing:'0.1em',
            textTransform:'uppercase',
            background:'transparent',
            color:'#7a7875',
            border:'1px solid #d5d2cd',
            textAlign:'center',
            textDecoration:'none',
            fontFamily:"'Jost',sans-serif",
            fontWeight:400,
          }}
        >
          {l.reservar}
        </a>
      )}
    </div>
  );
}
