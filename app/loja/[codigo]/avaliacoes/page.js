"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fmtData } from "@/lib/i18n";

const T = {
  pt: {
    voltar: "← Loja", lojaDeLabel: "Loja de", avaliacoes: "Avaliações", semAvaliacoes: "Ainda sem avaliações.", mediaGlobal: "Média global",
  },
  fr: {
    voltar: "← Boutique", lojaDeLabel: "Boutique de", avaliacoes: "Évaluations", semAvaliacoes: "Pas encore d'évaluations.", mediaGlobal: "Moyenne globale",
  },
  lt: {
    voltar: "← Parduotuvė", lojaDeLabel: "Parduotuvė", avaliacoes: "Atsiliepimai", semAvaliacoes: "Dar nėra atsiliepimų.", mediaGlobal: "Vidurkis",
  },
};

function Estrelas({ nota, size = "1rem" }) {
  return (
    <div style={{ display: "flex", gap: "0.1rem" }}>
      {[1, 2, 3, 4, 5].map(v => (
        <span key={v} style={{ fontSize: size, color: v <= Math.round(nota) ? "#c4748a" : "#e2dfda" }}>★</span>
      ))}
    </div>
  );
}

function formatarData(ts, lang = "pt") {
  return fmtData(ts, lang, { year: "numeric", month: "long", day: "numeric" });
}

export default function AvaliacoesLoja() {
  const { codigo } = useParams();
  const [lang, setLang] = useState("pt");
  const [lojista, setLojista] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    carregar();
  }, [codigo]);

  const carregar = async () => {
    setLoading(true);

    const { data: cli } = await supabase
      .from("clientes")
      .select("id, nome, codigo_cliente, cidade, pais")
      .eq("codigo_cliente", codigo)
      .maybeSingle();

    if (!cli) { setLoading(false); return; }
    setLojista(cli);

    // Avaliações com info do aluguer e nome do cliente
    const { data: avs } = await supabase
      .from("avaliacoes_lojista")
      .select("nota_cliente_lojista, comentario_cliente_lojista, created_at, aluguer_lojista_id, cliente_id")
      .eq("lojista_id", cli.id)
      .not("nota_cliente_lojista", "is", null)
      .order("created_at", { ascending: false });

    if (avs && avs.length > 0) {
      // Buscar nomes dos clientes (só nome, não email)
      const clienteIds = [...new Set(avs.map(a => a.cliente_id).filter(Boolean))];
      let nomesMap = {};
      if (clienteIds.length > 0) {
        const { data: clientes } = await supabase
          .from("clientes")
          .select("id, nome")
          .in("id", clienteIds);
        if (clientes) clientes.forEach(c => { nomesMap[c.id] = c.nome; });
      }

      const avsComNome = avs.map(a => ({ ...a, nomeCliente: nomesMap[a.cliente_id] || "Cliente" }));
      setAvaliacoes(avsComNome);

      const m = avs.reduce((s, a) => s + a.nota_cliente_lojista, 0) / avs.length;
      setMedia(m.toFixed(1));
    }

    setLoading(false);
  };

  const t = T[lang] || T.pt;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", fontSize: "0.8rem", letterSpacing: "0.2em", color: "#888", textTransform: "uppercase" }}>...</div>
  );

  if (!lojista) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", gap: "1rem" }}>
      <p style={{ fontSize: "0.85rem", color: "#888" }}>Loja não encontrada.</p>
      <a href="/catalogo" style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#080808" }}>← Catálogo</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        body{background:var(--white);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;padding-top:max(1rem,env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none}
        .hero{padding:7rem 2rem 3rem;text-align:center;border-bottom:1px solid var(--g2)}
        .titulo{font-family:var(--serif);font-size:clamp(1.8rem,5vw,3rem);font-weight:300;margin-bottom:0.5rem}
        .subtitulo{font-size:0.85rem;color:var(--g4);letter-spacing:0.12em;text-transform:uppercase}
        .media-bloco{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:1.5rem;padding:1.5rem;background:var(--g1);max-width:320px;margin-left:auto;margin-right:auto}
        .media-num{font-family:var(--sans);font-size:3rem;font-weight:700;color:var(--black);line-height:1}
        .media-info{text-align:left}
        .media-label{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g4);margin-top:0.3rem}
        .lista{max-width:720px;margin:0 auto;padding:2rem 1.5rem 5rem}
        .card-av{padding:1.75rem 0;border-bottom:1px solid var(--g1)}
        .card-av:last-child{border-bottom:none}
        .av-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.75rem}
        .av-nome{font-size:0.8rem;font-weight:500;letter-spacing:0.05em}
        .av-data{font-size:0.78rem;color:var(--g4)}
        .av-comentario{font-family:var(--sans);font-size:0.95rem;font-weight:400;color:var(--black);margin-top:0.6rem;line-height:1.6}
        .sem{text-align:center;padding:5rem 2rem;font-size:0.85rem;color:var(--g4)}
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["pt", "fr", "lt"].map(l => (
              <button key={l} onClick={() => { localStorage.setItem("ng_lang", l); setLang(l); }} style={{ fontSize: "0.56rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", color: lang === l ? "var(--black)" : "var(--g4)", fontWeight: lang === l ? 500 : 300 }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href={`/loja/${codigo}`} className="nav-back">{t.voltar}</a>
        </div>
      </nav>

      <div className="hero">
        <h1 className="titulo">{t.avaliacoes}</h1>
        <p className="subtitulo">{t.lojaDeLabel} {lojista.nome}</p>
        {media && (
          <div className="media-bloco">
            <div className="media-num">{media}</div>
            <div className="media-info">
              <Estrelas nota={parseFloat(media)} size="1.1rem" />
              <div className="media-label">{t.mediaGlobal} · {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}</div>
            </div>
          </div>
        )}
      </div>

      <div className="lista">
        {avaliacoes.length === 0 ? (
          <p className="sem">{t.semAvaliacoes}</p>
        ) : (
          avaliacoes.map((av, i) => (
            <div key={i} className="card-av">
              <div className="av-header">
                <div>
                  <div className="av-nome">{av.nomeCliente}</div>
                  <Estrelas nota={av.nota_cliente_lojista} size="0.85rem" />
                </div>
                <div className="av-data">{formatarData(av.created_at, lang)}</div>
              </div>
              {av.comentario_cliente_lojista && (
                <p className="av-comentario">"{av.comentario_cliente_lojista}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
