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
      .select("id, nome, nome_publico, codigo_cliente, cidade, pais, foto_perfil, descricao, is_marca_propria, loja_verificada")
      .eq("modo_lojista", true)
      .order("is_marca_propria", { ascending: false })
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
        .loja-card.marca-propria{background:#100c0a;border:1px solid rgba(196,116,138,0.3)}
        .loja-card.marca-propria:hover{background:#1a1614}
        .loja-card.marca-propria .loja-nome{color:#f8f7f5}
        .loja-card.marca-propria .loja-local{color:rgba(248,247,245,0.45)}
        .loja-card.marca-propria .loja-desc{color:rgba(248,247,245,0.55)}
        .loja-card.marca-propria .loja-cta{color:#c4748a}
        .loja-card.marca-propria .loja-avatar{border-color:rgba(196,116,138,0.4);background:#2a2420}
        .loja-card.marca-propria .loja-initials{color:#c4748a}
        .loja-badge-marca{display:inline-block;font-size:0.52rem;letter-spacing:0.22em;text-transform:uppercase;font-family:var(--sans);color:#c4748a;border:1px solid rgba(196,116,138,0.5);padding:0.18rem 0.5rem;margin-bottom:0.25rem}

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
            const nomeVis = loja.nome_publico || loja.nome;
            const initials = nomeVis ? nomeVis.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "NG";
            return (
              <a key={loja.id} href={`/loja/${loja.codigo_cliente}`} className={`loja-card${loja.is_marca_propria ? " marca-propria" : ""}`}>
                <div className="loja-avatar">
                  {loja.foto_perfil
                    ? <img src={loja.foto_perfil} alt={nomeVis} />
                    : <div className="loja-initials">{initials}</div>
                  }
                </div>
                {loja.is_marca_propria && <span className="loja-badge-marca">Marca Oficial</span>}
                {!loja.is_marca_propria && loja.loja_verificada && <span className="loja-badge-marca" style={{color:"#c4a882",borderColor:"rgba(196,168,130,0.5)"}}>✦ Verificada</span>}
                <div className="loja-nome">{nomeVis}</div>
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
