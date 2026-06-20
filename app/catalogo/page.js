"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PecaCard from "@/components/PecaCard";

const CATEGORIAS_BD = ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias"];

const translations = {
  pt: {
    titulo: "Catálogo", subtitulo: "Roupa e acessórios para cada momento.", todas: "Todas",
    semResultados: "Nenhuma peça encontrada.", loading: "A carregar...",
    categorias: ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias"],
    ordenar: "Ordenar", precoAsc: "Preço: menor primeiro", precoDesc: "Preço: maior primeiro", recentes: "Mais recentes",
  },
  fr: {
    titulo: "Catalogue", subtitulo: "Vêtements et accessoires pour chaque moment.", todas: "Tout",
    semResultados: "Aucune pièce trouvée.", loading: "Chargement...",
    categorias: ["Robes", "Manteaux", "Ensembles", "Accessoires", "Corsets", "Hauts", "Pantalons", "Jupes"],
    ordenar: "Trier", precoAsc: "Prix: croissant", precoDesc: "Prix: décroissant", recentes: "Plus récents",
  },
  lt: {
    titulo: "Katalogas", subtitulo: "Drabužiai ir aksesuarai kiekvienai progai.", todas: "Visi",
    semResultados: "Drabužių nerasta.", loading: "Kraunama...",
    categorias: ["Suknelės", "Paltai", "Komplektai", "Aksesuarai", "Korsetai", "Marškinėliai", "Kelnės", "Sijonai"],
    ordenar: "Rūšiuoti", precoAsc: "Kaina: mažiausia pirma", precoDesc: "Kaina: didžiausia pirma", recentes: "Naujausi",
  },
};

const pecasExemplo = [
  { id: "1", nome: "Vestido Seda Noite", categoria: "Vestidos", preco_aluguer_dia: 35, estado: "disponivel", tamanhos: ["XS", "S", "M"], fotos: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"] },
  { id: "2", nome: "Casaco Tweed Dourado", categoria: "Casacos", preco_aluguer_dia: 28, estado: "disponivel", tamanhos: ["S", "M", "L"], fotos: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80"] },
];

export default function Catalogo() {
  const [pecas, setPecas] = useState(pecasExemplo);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [ordenar, setOrdenar] = useState("recentes");
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && translations[saved]) setLang(saved);
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pecas")
        .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_disponivel, quantidade_total)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: alugueresAtivos } = await supabase
        .from("alugueres")
        .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
        .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

      if (data && data.length > 0) {
        const agora = new Date();
        const formatadas = data.map(p => {
          const temStock = p.stock_tamanhos?.some(s => s.quantidade_disponivel > 0);
          const stockIds = p.stock_tamanhos?.map(s => s.id) || [];

          const aluguerEmCurso = (alugueresAtivos || [])
            .filter(a => stockIds.includes(a.stock_tamanho_id))
            .sort((a, b) => new Date(b.data_fim) - new Date(a.data_fim))[0];

          let dataFimFinal = null;
          let indisponivel = false;

          if (aluguerEmCurso) {
            const dataDisp = aluguerEmCurso.data_disponivel_novamente
              ? new Date(aluguerEmCurso.data_disponivel_novamente)
              : new Date(new Date(aluguerEmCurso.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);

            if (dataDisp > agora) {
              dataFimFinal = dataDisp.toISOString();
              indisponivel = true;
            }
          }

          return {
            ...p,
            categoria: p.categorias?.nome || "",
            tamanhos: p.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0).map(s => s.tamanho) || [],
            data_fim: dataFimFinal,
            estado: (temStock && !indisponivel) ? "disponivel" : "indisponivel",
          };
        });
        setPecas(formatadas);
      }
    } catch (e) {
      console.error("Erro ao carregar peças:", e);
    }
    setLoading(false);
  };

  const t = translations[lang] || translations.pt;

  // Mapeia índice da categoria traduzida -> valor real em PT na BD
  const categoriaTraduzidaParaBD = (catTraduzida) => {
    const idx = t.categorias.indexOf(catTraduzida);
    return idx >= 0 ? CATEGORIAS_BD[idx] : catTraduzida;
  };

  const pecasFiltradas = pecas
    .filter(p => filtroCategoria === "todas" || p.categoria === categoriaTraduzidaParaBD(filtroCategoria))
    .sort((a, b) => {
      if (ordenar === "precoAsc") return a.preco_aluguer_dia - b.preco_aluguer_dia;
      if (ordenar === "precoDesc") return b.preco_aluguer_dia - a.preco_aluguer_dia;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb; --grey-200: #e2dfda; --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif; }
        body { background: var(--white); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
        .cat-nav { position: fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .cat-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .cat-nav-back { font-size:0.78rem; letter-spacing:0.15em; text-transform:uppercase; color:#3a3835; text-decoration:none; font-weight:400; transition:color 0.2s; }
        .cat-nav-back:hover { color:var(--black); }
        .cat-header { padding: 8rem 4rem 3rem; }
        .cat-header-label { font-size:0.75rem; letter-spacing:0.3em; text-transform:uppercase; color:#3a3835; margin-bottom:0.75rem; font-weight:400; }
        .cat-header-title { font-family:var(--serif); font-size:clamp(2.5rem,4vw,4rem); font-weight:300; line-height:1.05; margin-bottom:0.5rem; }
        .cat-filters { padding:0 4rem 2rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap; border-bottom:1px solid var(--grey-200); margin-bottom:3rem; }
        .filter-btn { font-size:0.78rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.6rem 1.25rem; border:1px solid var(--grey-200); background:var(--white); color:#1a1a18; cursor:pointer; font-family:var(--sans); font-weight:400; transition:all 0.2s; }
        .filter-btn:hover { border-color:var(--black); color:var(--black); }
        .filter-btn.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .filter-sep { width:1px; height:20px; background:var(--grey-200); }
        .filter-select { font-size:0.78rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.6rem 1rem; border:1px solid var(--grey-200); background:var(--white); color:#1a1a18; cursor:pointer; font-family:var(--sans); font-weight:400; outline:none; }
        .cat-grid { padding:0 4rem 6rem; display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; }
        .cat-empty { padding:4rem; text-align:center; font-family:var(--serif); font-size:1.5rem; font-weight:300; color:#3a3835; font-style:italic; }
        .cat-loading { padding:4rem; text-align:center; font-size:0.82rem; color:#3a3835; letter-spacing:0.2em; text-transform:uppercase; font-weight:400; }
        @media (max-width:900px) {
          .cat-nav { padding:1rem 1.5rem; }
          .cat-header { padding:6rem 1.5rem 2rem; }
          .cat-header-label { font-size:0.88rem; color:#080808; font-weight:500; }
          .cat-header-title { font-size:clamp(1.8rem,7vw,2.5rem); color:#080808; }
          .cat-filters { padding:0 1.5rem 1.5rem; }
          .filter-btn { font-size:0.82rem; color:#080808; }
          .filter-select { font-size:0.82rem; color:#080808; }
          .cat-grid { padding:0 1.5rem 4rem; grid-template-columns:repeat(2,1fr); gap:1rem; }
          body { font-size:17px; color:#080808; }
        }
        @media (max-width:480px) { .cat-grid { grid-template-columns:1fr; } }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />

      <nav className="cat-nav">
        <a href="/" className="cat-nav-logo">Nora Grei</a>
        <a href="/" className="cat-nav-back">← Início</a>
      </nav>

      <div className="cat-header">
        <p className="cat-header-label">{t.titulo}</p>
        <h1 className="cat-header-title">{t.subtitulo}</h1>
      </div>

      <div className="cat-filters">
        <button className={`filter-btn${filtroCategoria === "todas" ? " active" : ""}`} onClick={() => setFiltroCategoria("todas")}>{t.todas}</button>
        {t.categorias.map(cat => (
          <button key={cat} className={`filter-btn${filtroCategoria === cat ? " active" : ""}`} onClick={() => setFiltroCategoria(cat)}>{cat}</button>
        ))}
        <div className="filter-sep"></div>
        <select className="filter-select" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
          <option value="recentes">{t.recentes}</option>
          <option value="precoAsc">{t.precoAsc}</option>
          <option value="precoDesc">{t.precoDesc}</option>
        </select>
      </div>

      {loading ? (
        <div className="cat-loading">{t.loading}</div>
      ) : pecasFiltradas.length === 0 ? (
        <div className="cat-empty">{t.semResultados}</div>
      ) : (
        <div className="cat-grid">
          {pecasFiltradas.map(peca => (
            <PecaCard key={peca.id} peca={peca} lang={lang} />
          ))}
        </div>
      )}
    </>
  );
}