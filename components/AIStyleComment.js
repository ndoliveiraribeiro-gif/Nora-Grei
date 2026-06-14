"use client";
import { useState, useEffect } from "react";

export default function AIStyleComment({ peca, lang = "pt" }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!peca) return;
    const consultant = localStorage.getItem("ng_consultant");
    const cacheKey = `ng_ai_${peca.id}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setComment(cached); return; }
    gerarComentario(consultant ? JSON.parse(consultant) : {});
  }, [peca, lang]);

  const gerarComentario = async ({ ocasiao, genero }) => {
    setLoading(true);
    try {
      const langNome = { pt: "português europeu", fr: "français", lt: "lietuvių" }[lang] || "português";
      const prompt = `És um stylist de moda de luxo da marca Nora Grei. 
      
O cliente ${genero ? `é ${genero.toLowerCase()} e` : ""} vai ${ocasiao ? `a um(a) ${ocasiao}` : "a um evento"}.
Está a ver esta peça: "${peca.nome}" (${peca.categoria || "roupa"}, ${peca.preco_aluguer_dia}€/dia).
${peca.descricao ? `Descrição: ${peca.descricao}` : ""}

Escreve um comentário de stylist em ${langNome} — elegante, pessoal, inspirador. 
Máximo 2 frases. Sem emoji. Tom sofisticado mas caloroso. 
Fala diretamente com o cliente usando "tu" em PT, "vous" em FR.
Responde APENAS com o comentário, sem aspas nem introdução.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      if (text) {
        setComment(text);
        localStorage.setItem(`ng_ai_${peca.id}_${lang}`, text);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!comment && !loading) return null;

  return (
    <div style={{background:'#f0eeeb',padding:'1.25rem 1.5rem',borderLeft:'3px solid #080808',margin:'1rem 0'}}>
      <p style={{fontSize:'0.6rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'#888580',fontFamily:"'Jost',sans-serif",fontWeight:500,marginBottom:'0.6rem'}}>✦ Nora Grei Stylist</p>
      {loading ? (
        <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontStyle:'italic',color:'#aaa89f',fontWeight:300}}>A preparar a tua sugestão...</p>
      ) : (
        <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontStyle:'italic',color:'#2e2d2b',lineHeight:1.7,fontWeight:300}}>{comment}</p>
      )}
    </div>
  );
}