"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    label: "Marketplace",
    titulo: "Lojistas.",
    sub: "Curadoras que partilham as suas peças na plataforma Nora Grei.",
    voltar: "← Início",
    verLoja: "Ver loja",
    semLojas: "Nenhuma lojista registada ainda.",
    pesquisar: "Pesquisar lojistas...",
    pecas: "peças",
  },
  fr: {
    label: "Marketplace",
    titulo: "Boutiques.",
    sub: "Des curatrices qui partagent leurs pièces sur la plateforme Nora Grei.",
    voltar: "← Accueil",
    verLoja: "Voir la boutique",
    semLojas: "Aucune boutique enregistrée pour l'instant.",
    pesquisar: "Rechercher des boutiques...",
    pecas: "pièces",
  },
  lt: {
    label: "Marketplace",
    titulo: "Parduotuvės.",
    sub: "Kuratorės, dalinančios savo drabužius Nora Grei platformoje.",
    voltar: "← Pradžia",
    verLoja: "Žiūrėti parduotuvę",
    semLojas: "Kol kas nėra užregistruotų parduotuvių.",
    pesquisar: "Ieškoti parduotuvių...",
    pecas: "drabužiai",
  },
};

export default function Lojas() {
  const [lang, setLang] = useState("pt");
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    carregar();
  }, []);

  const carregar = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, codigo_cliente, cidade, pais, avatar_url, descricao")
      .eq("modo_lojista", true)
      .order("nome");
    setLojas(data || []);
    setLoading(false);
  };

  const t = T[lang] || T.pt;
  const lojasFiltradas = filtro.trim().length > 0
    ? lojas.filter(l => l.nome?.toLowerCase().includes(filtro.toLowerCase()) || l.cidade?.toLowerCase().includes(filtro.toLowerCase()))
    : lojas;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--cream:#f8f7f5;--white:#fff;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--ink:#1a1816;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        html,body{overflow-x:hidden;background:var(--cream);color:var(--ink);font-family:var(--sans)}

        .pg-header{padding:2rem 1.5rem 1.5rem;border-bottom:1px solid var(--g2);background:var(--cream)}
        .pg-voltar{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g4);text-decoration:none;font-family:var(--sans);display:inline-block;margin-bottom:1.25rem}
        .pg-voltar:hover{color:var(--rosa)}
        .pg-label{font-size:0.62rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);margin-bottom:0.5rem}
        .pg-titulo{font-family:var(--serif);font-size:clamp(2rem,6vw,3.5rem);font-weight:300;line-height:1.1;color:var(--ink)}
        .pg-sub{font-size:0.82rem;color:var(--g4);margin-top:0.6rem;line-height:1.6;max-width:480px}

        .pg-filtro{padding:1rem 1.5rem;border-bottom:1px solid var(--g2);background:var(--cream)}
        .filtro-input{width:100%;border:1px solid var(--g2);background:var(--white);padding:0.75rem 1rem;font-size:0.82rem;font-family:var(--sans);color:var(--ink);outline:none;transition:border-color 0.2s}
        .filtro-input:focus{border-color:var(--rosa)}
        .filtro-input::placeholder{color:var(--g4)}

        .pg-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2);padding:1px}
        .loja-card{background:var(--cream);padding:1.5rem 1.25rem;display:flex;flex-direction:column;gap:0.75rem;text-decoration:none;transition:background 0.18s}
        .loja-card:hover{background:var(--white)}
        .loja-avatar{width:52px;height:52px;border-radius:50%;background:var(--g1);overflow:hidden;border:1.5px solid var(--g2);flex-shrink:0}
        .loja-avatar img{width:100%;height:100%;object-fit:cover}
        .loja-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.3rem;font-weight:300;color:var(--rosa)}
        .loja-nome{font-family:var(--serif);font-size:1.15rem;font-weight:400;color:var(--ink);line-height:1.2}
        .loja-local{font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);font-family:var(--sans)}
        .loja-desc{font-size:0.76rem;color:var(--g4);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .loja-cta{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);margin-top:auto}

        .pg-vazio{padding:4rem 1.5rem;text-align:center;color:var(--g4);font-family:var(--serif);font-size:1.1rem;font-weight:300}
        .pg-loading{padding:4rem 1.5rem;text-align:center;color:var(--g4);font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans)}

        @media(min-width:600px){.pg-grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:900px){
          .pg-header{padding:3rem 4rem 2rem}
          .pg-filtro{padding:1rem 4rem}
          .pg-grid{grid-template-columns:repeat(4,1fr)}
          .loja-card{padding:2rem}
        }
      `}</style>

      <div className="pg-header">
        <a href="/" className="pg-voltar">{t.voltar}</a>
        <p className="pg-label">{t.label}</p>
        <h1 className="pg-titulo">{t.titulo}</h1>
        <p className="pg-sub">{t.sub}</p>
      </div>

      <div className="pg-filtro">
        <input
          className="filtro-input"
          placeholder={t.pesquisar}
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="pg-loading">···</div>
      ) : lojasFiltradas.length === 0 ? (
        <div className="pg-vazio">{t.semLojas}</div>
      ) : (
        <div className="pg-grid">
          {lojasFiltradas.map(loja => {
            const initials = loja.nome ? loja.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "NG";
            return (
              <a key={loja.id} href={`/loja/${loja.codigo_cliente}`} className="loja-card">
                <div className="loja-avatar">
                  {loja.avatar_url
                    ? <img src={loja.avatar_url} alt={loja.nome} />
                    : <div className="loja-initials">{initials}</div>
                  }
                </div>
                <div className="loja-nome">{loja.nome}</div>
                {(loja.cidade || loja.pais) && (
                  <div className="loja-local">{[loja.cidade, loja.pais].filter(Boolean).join(", ")}</div>
                )}
                {loja.descricao && <div className="loja-desc">{loja.descricao}</div>}
                <div className="loja-cta">{t.verLoja} →</div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
