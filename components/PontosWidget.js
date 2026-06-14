"use client";

export default function PontosWidget({ pontos = 0, totalPecas = 0, lang = "pt" }) {
  const meta = 10;
  const progresso = pontos % meta;
  const percentagem = (progresso / meta) * 100;
  const pecasRestantes = meta - progresso;
  const vouchers = Math.floor(pontos / meta);

  const t = {
    pt: {
      titulo: "Programa de fidelização",
      pontos: "pontos",
      restam: `Faltam ${pecasRestantes} aluguer${pecasRestantes !== 1 ? 'es' : ''} para uma peça grátis`,
      gratis: "🎉 Tens um aluguer gratuito disponível!",
      vouchers: vouchers === 1 ? "1 aluguer gratuito disponível" : `${vouchers} alugueres gratuitos disponíveis`,
      total: `${totalPecas} peças alugadas no total`,
      usar: "Usar na próxima encomenda",
    },
    fr: {
      titulo: "Programme de fidélité",
      pontos: "points",
      restam: `Encore ${pecasRestantes} location${pecasRestantes !== 1 ? 's' : ''} pour une pièce gratuite`,
      gratis: "🎉 Vous avez une location gratuite disponible !",
      vouchers: vouchers === 1 ? "1 location gratuite disponible" : `${vouchers} locations gratuites disponibles`,
      total: `${totalPecas} pièces louées au total`,
      usar: "Utiliser à la prochaine commande",
    },
    lt: {
      titulo: "Lojalumo programa",
      pontos: "taškai",
      restam: `Dar ${pecasRestantes} nuoma${pecasRestantes !== 1 ? 's' : ''} iki nemokamos`,
      gratis: "🎉 Turite nemokamą nuomą!",
      vouchers: vouchers === 1 ? "1 nemokama nuoma" : `${vouchers} nemokamos nuomos`,
      total: `Iš viso ${totalPecas} išsinuomotų drabužių`,
      usar: "Naudoti kitam užsakymui",
    },
  };

  const i = t[lang] || t.pt;

  return (
    <div style={{background:'#080808',color:'#f8f7f5',padding:'2rem 2.5rem'}}>
      <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',fontFamily:"'Jost',sans-serif",fontWeight:500,marginBottom:'1.5rem'}}>{i.titulo}</p>

      {/* PONTOS */}
      <div style={{display:'flex',alignItems:'baseline',gap:'0.5rem',marginBottom:'1rem'}}>
        <span style={{fontFamily:"'Cormorant',serif",fontSize:'3.5rem',fontWeight:300,lineHeight:1}}>{pontos}</span>
        <span style={{fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',fontFamily:"'Jost',sans-serif"}}>{i.pontos}</span>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div style={{marginBottom:'0.75rem'}}>
        <div style={{height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${percentagem}%`,background:'#f8f7f5',transition:'width 0.5s ease',borderRadius:'2px'}}></div>
        </div>
      </div>

      {/* CÍRCULOS */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.25rem'}}>
        {Array.from({length: meta}).map((_, idx) => (
          <div key={idx} style={{
            width:'28px',height:'28px',borderRadius:'50%',
            background: idx < progresso ? '#f8f7f5' : 'rgba(255,255,255,0.1)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'0.6rem',color: idx < progresso ? '#080808' : 'rgba(255,255,255,0.3)',
            fontFamily:"'Jost',sans-serif",fontWeight:500,
            transition:'background 0.3s',
          }}>
            {idx < progresso ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* MENSAGEM */}
      <p style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.7)',fontFamily:"'Jost',sans-serif",fontWeight:400,marginBottom: vouchers > 0 ? '1rem' : '0'}}>
        {progresso === 0 && pontos > 0 ? i.gratis : i.restam}
      </p>

      {/* VOUCHERS DISPONÍVEIS */}
      {vouchers > 0 && (
        <div style={{background:'rgba(255,255,255,0.08)',padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
          <span style={{fontSize:'0.88rem',color:'#f8f7f5',fontFamily:"'Jost',sans-serif",fontWeight:400}}>{i.vouchers}</span>
          <a href="/catalogo" style={{fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#f8f7f5',fontFamily:"'Jost',sans-serif",fontWeight:500,textDecoration:'none',borderBottom:'1px solid rgba(255,255,255,0.4)',paddingBottom:'1px',whiteSpace:'nowrap'}}>
            {i.usar}
          </a>
        </div>
      )}

      {/* TOTAL */}
      <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.3)',fontFamily:"'Jost',sans-serif",fontWeight:400,marginTop:'1rem'}}>{i.total}</p>
    </div>
  );
}