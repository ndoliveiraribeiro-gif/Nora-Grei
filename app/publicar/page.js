"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIAS_VESTUARIO = ["Vestidos","Saias","Calças","Blusas","Casacos","Fatos","Macacões","Conjuntos","Camisas","Kaftans"];
const CATEGORIAS_ACESSORIOS = ["Malas","Anéis","Colares","Pulseiras","Cachecóis","Chapéus","Cintos","Óculos","Luvas","Acessórios"];
const CATEGORIAS_SEM_TAMANHO = ["Acessórios","Malas","Anéis","Colares","Pulseiras","Cachecóis","Relógios","Chapéus","Cintos","Óculos"];
const TAMANHOS = ["XS","S","M","L","XL","XXL","34","36","38","40","42","44","46","48","Único"];
const OCASIOES = ["Casamento","Gala","Cocktail","Festa","Jantar","Trabalho","Dia a dia","Praia","Férias","Praia/Férias"];
const CORES = ["Preto","Branco","Creme","Bege","Castanho","Azul","Azul marinho","Verde","Verde esmeralda","Vermelho","Rosa","Lilás","Roxo","Laranja","Amarelo","Dourado","Prateado","Multicolor","Estampado","Animal print"];

const PECA_VAZIA = {
  nome: "", categoria: "", marca: "", cor: "", condicao: "como_novo",
  tipo: "alugar", descricao: "", material: "",
  preco_aluguer_dia: "", preco_venda: "", valor_peca: "",
  tem_defeito: false, descricao_defeito: "",
  ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }],
  link_compra_externa: "", idade_peca: "1a2",
};

// ── Estimativa de valor de mercado ──────────────────────────────────────────
const MARCAS_PREMIUM = [
  "hermès","hermes","chanel","louis vuitton","lv","gucci","prada","bottega veneta",
  "dior","christian dior","saint laurent","ysl","celine","céline","givenchy",
  "valentino","versace","balenciaga","jacquemus","loewe","loro piana","brunello cucinelli",
  "max mara","tod's","tods","ferragamo","burberry","mulberry","ralph lauren",
];
const MARCAS_ALTA = [
  "zara","mango","&other stories","other stories","cos","arket","massimo dutti",
  "pedro del hierro","escorpion","escorpión","hugo boss","boss","calvin klein","ck",
  "tommy hilfiger","tommy","lacoste","levis","levi's","gant","scotch soda",
  "weekday","monki","stradivarius","bershka","pull&bear","sfera","phase eight",
  "whistles","reiss","allsaints","all saints","ba&sh","bash","sandro","maje","ba&sh",
];

function fatorMarca(marca = "") {
  const m = marca.toLowerCase().trim();
  if (MARCAS_PREMIUM.some(b => m.includes(b))) return { fator: 0.82, tier: "premium" };
  if (MARCAS_ALTA.some(b => m.includes(b))) return { fator: 0.50, tier: "alta" };
  return { fator: 0.32, tier: "massmarket" };
}

const FATOR_ESTADO = { como_novo: 0.92, bom: 0.68, usado: 0.45, com_defeito: 0.25 };
const FATOR_IDADE  = { novo: 1.0, "1a2": 0.85, "2a4": 0.70, "4mais": 0.52 };

// Mapa categoria publicar → rotação mensal (alugueres/mês)
const ROTACAO_CAT = {
  Vestidos: 1.8, Fatos: 1.5, Macacões: 1.4, Conjuntos: 1.3,
  Casacos: 1.0, Saias: 1.2, Calças: 1.1, Blusas: 1.1,
  Camisas: 1.0, Kaftans: 0.9, Malas: 2.0, Acessórios: 1.6,
  _default: 1.2,
};

function calcEstimativa({ valor_peca, marca, condicao, idade_peca, categoria }) {
  const p = parseFloat(valor_peca) || 0;
  if (!p) return null;
  const { fator: fm, tier } = fatorMarca(marca);
  const fe = FATOR_ESTADO[condicao] ?? 0.68;
  const fi = FATOR_IDADE[idade_peca] ?? 0.85;
  const valorMercado = Math.round(p * fm * fe * fi);
  const precoAluguerDia = Math.max(5, Math.round(valorMercado * 0.08 / 5) * 5);
  const precoVendaUsada = Math.max(5, Math.round(valorMercado * 0.75));
  const rotMes = ROTACAO_CAT[categoria] ?? ROTACAO_CAT._default;
  const alugueresMes = rotMes.toFixed(1);
  const ganho12m = Math.round(precoAluguerDia * 4 * rotMes * 12 * 0.9); // ~4 dias/aluguer, 90% ocup, 12 meses
  return { valorMercado, precoAluguerDia, precoVendaUsada, alugueresMes, ganho12m, tier };
}

export default function PublicarPage() {
  const [user, setUser] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passo, setPasso] = useState(1); // 1=fotos, 2=detalhes, 3=preços, 4=sucesso
  const [fotos, setFotos] = useState([]); // { file, url, valida, validando, motivo }
  const [peca, setPeca] = useState(PECA_VAZIA);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");
  const [pecaCriada, setPecaCriada] = useState(null);
  const inputFotoRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      setUser(session.user);
      const { data: cli } = await supabase.from("clientes").select("*").eq("id", session.user.id).single();
      setCliente(cli);
      setLoading(false);
    });
  }, []);

  // Share Target: receber fotos partilhadas de outras apps (câmara, galeria, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const processarFotosPartilhadas = (arquivos) => {
      try {
        const novasFotos = arquivos.map(a => {
          const bytes = atob(a.base64);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
          const file = new File([arr], a.name || "foto.jpg", { type: a.type || "image/jpeg" });
          const url = URL.createObjectURL(file);
          return { file, url, valida: null, validando: false, motivo: "" };
        });
        setFotos(novasFotos);
      } catch (e) { /* ignorar */ }
    };

    // Ouvir postMessage do service worker
    const onMessage = (e) => {
      if (e.data?.type === "NG_SHARE_FOTOS" && e.data.fotos?.length) {
        processarFotosPartilhadas(e.data.fotos);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    // Fallback: verificar cache do SW (para quando a página abre nova)
    const checkShareCache = async () => {
      try {
        const cache = await caches.open("ng-share-target");
        const resp = await cache.match("/_share_fotos");
        if (resp) {
          const fotos = await resp.json();
          await cache.delete("/_share_fotos");
          if (fotos?.length) processarFotosPartilhadas(fotos);
        }
      } catch (e) { /* ignorar */ }
    };
    checkShareCache();

    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, []);

  const validarFotoComIA = async (foto, index) => {
    try {
      // Converter File para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(foto.file);
      });

      const res = await fetch("/api/validar-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: base64, tipo: foto.file.type }),
      });
      const resultado = await res.json();

      setFotos(prev => prev.map((f, i) =>
        i === index
          ? { ...f, validando: false, valida: resultado.valida, motivo: resultado.motivo, categoria_ia: resultado.categoria }
          : f
      ));
    } catch {
      // Em caso de erro de rede, aceitar a foto
      setFotos(prev => prev.map((f, i) =>
        i === index ? { ...f, validando: false, valida: true, motivo: "Validação indisponível" } : f
      ));
    }
  };

  const adicionarFotos = (files) => {
    const arr = Array.from(files).slice(0, 5 - fotos.length);
    setFotos(prev => {
      const base = prev.length;
      const novas = arr.map(f => ({ file: f, url: URL.createObjectURL(f), validando: true, valida: null, motivo: "" }));
      const todas = [...prev, ...novas].slice(0, 5);
      // Lançar validação para cada nova foto
      novas.forEach((f, i) => {
        validarFotoComIA(f, base + i);
      });
      return todas;
    });
  };

  const removerFoto = (i) => setFotos(prev => prev.filter((_, j) => j !== i));

  const setP = (k, v) => setPeca(prev => ({ ...prev, [k]: v }));

  const validarPasso2 = () => {
    if (!peca.nome.trim()) { setErro("O nome da peça é obrigatório."); return false; }
    if (!peca.categoria) { setErro("Seleciona uma categoria."); return false; }
    setErro(""); return true;
  };

  const validarPasso3 = () => {
    const precisaAluguer = peca.tipo === "alugar" || peca.tipo === "ambos";
    const precisaVenda = peca.tipo === "comprar" || peca.tipo === "ambos";
    if (precisaAluguer && !peca.preco_aluguer_dia) { setErro("Indica o preço de aluguer por dia."); return false; }
    if (precisaVenda && !peca.preco_venda) { setErro("Indica o preço de venda."); return false; }
    setErro(""); return true;
  };

  const publicar = async () => {
    if (!validarPasso3()) return;
    setEnviando(true);
    setProgresso("A criar peça...");
    try {
      const pecasExistentes = await supabase.from("pecas_lojista").select("id", { count: "exact" }).eq("cliente_id", user.id);
      const count = pecasExistentes.count || 0;
      const { data: novaPeca, error: pecaErr } = await supabase.from("pecas_lojista").insert({
        cliente_id: user.id,
        nome: peca.nome.trim(),
        descricao: peca.descricao.trim() || null,
        tipo: peca.tipo,
        preco_aluguer_dia: peca.preco_aluguer_dia ? parseFloat(peca.preco_aluguer_dia) : null,
        preco_venda: peca.preco_venda ? parseFloat(peca.preco_venda) : null,
        valor_peca: peca.valor_peca ? parseFloat(peca.valor_peca) : null,
        material: peca.material.trim() || null,
        marca: peca.marca.trim() || null,
        cor: peca.cor.trim() || null,
        categoria: peca.categoria || null,
        condicao: peca.condicao || "como_novo",
        tem_defeito: peca.tem_defeito || false,
        descricao_defeito: peca.tem_defeito ? (peca.descricao_defeito || null) : null,
        ocasioes: peca.ocasioes,
        link_compra_externa: peca.link_compra_externa.trim() || null,
        link_externo_ativo: false,
        estado: "pendente",
        codigo_referencia: `${cliente?.codigo_cliente || "NG"}-${String(count + 1).padStart(3, "0")}`,
      }).select().single();

      if (pecaErr) throw pecaErr;

      // Tamanhos
      for (const t of peca.tamanhos) {
        await supabase.from("stock_lojista").insert({
          peca_id: novaPeca.id,
          tamanho: t.tamanho,
          quantidade_total: t.quantidade,
          quantidade_disponivel: t.quantidade,
        });
      }

      // Upload fotos
      if (fotos.length > 0) {
        const urls = [];
        for (const foto of fotos) {
          const ext = foto.file.name.split(".").pop();
          const path = `${novaPeca.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          setProgresso(`A fazer upload: ${foto.file.name}...`);
          const { error: upErr } = await supabase.storage
            .from("pecas_lojista")
            .upload(path, foto.file, { upsert: true });
          if (!upErr) {
            const { data } = supabase.storage.from("pecas_lojista").getPublicUrl(path);
            urls.push(data.publicUrl);
          }
        }
        if (urls.length > 0) {
          await supabase.from("pecas_lojista").update({ fotos: urls }).eq("id", novaPeca.id);
        }
      }

      setPecaCriada(novaPeca);
      setPasso(4);
    } catch (e) {
      setErro("Erro ao publicar: " + (e.message || "tenta de novo."));
    }
    setEnviando(false);
    setProgresso("");
  };

  const reiniciar = () => {
    setFotos([]);
    setPeca(PECA_VAZIA);
    setPasso(1);
    setErro("");
    setPecaCriada(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", fontSize: "0.8rem", letterSpacing: "0.2em", color: "#888" }}>
      ...
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "'Jost',sans-serif", background: "#f7f5f2" }}>
      <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.2rem", letterSpacing: "0.2em", color: "#1a1a1a" }}>NORA GREI</div>
      <p style={{ fontSize: "0.82rem", color: "#5a5855" }}>Precisas de estar autenticado para publicar uma peça.</p>
      <a href="/entrar" style={{ background: "#1a1a1a", color: "#fff", padding: "0.75rem 2rem", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>Entrar</a>
    </div>
  );

  const isModoLojista = cliente?.candidatura_lojista === "aprovada";
  if (!isModoLojista) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "'Jost',sans-serif", background: "#f7f5f2", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.2rem", letterSpacing: "0.2em", color: "#1a1a1a" }}>NORA GREI</div>
      <p style={{ fontSize: "0.9rem", color: "#5a5855", maxWidth: "360px", lineHeight: 1.6 }}>Esta área é exclusiva para lojistas aprovados. Candidata-te no teu perfil.</p>
      <a href="/perfil" style={{ background: "#1a1a1a", color: "#fff", padding: "0.75rem 2rem", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>Ir para o perfil</a>
    </div>
  );

  const precisaAluguer = peca.tipo === "alugar" || peca.tipo === "ambos";
  const precisaVenda = peca.tipo === "comprar" || peca.tipo === "ambos";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --g1: #f0eeeb; --g2: #e2dfda; --g3: #c8c4bc; --g4: #7a776f; --rosa: #c4748a; --ouro: #c4a882; --sans: 'Jost', Arial, sans-serif; --serif: 'Cormorant', Georgia, serif; }
        body { background: var(--g1); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

        .pub-nav { background: #fff; border-bottom: 1px solid var(--g2); padding: 0.9rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .pub-logo { font-family: var(--serif); font-size: 1.1rem; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; color: var(--black); }
        .pub-voltar { font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--g4); text-decoration: none; }
        .pub-steps { display: flex; align-items: center; gap: 0.3rem; }
        .pub-step { width: 28px; height: 3px; border-radius: 2px; background: var(--g2); transition: background 0.3s; }
        .pub-step.done { background: var(--black); }
        .pub-step.active { background: var(--rosa); }

        .pub-body { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .pub-titulo { font-family: var(--sans); font-size: 1.5rem; font-weight: 600; color: var(--black); margin-bottom: 0.3rem; }
        .pub-subtitulo { font-size: 0.8rem; color: var(--g4); margin-bottom: 2rem; }

        .pub-card { background: #fff; padding: 1.5rem; margin-bottom: 1rem; }
        .pub-card-t { font-size: 0.72rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--g4); font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--g1); }

        .pub-label { display: block; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: #3a3936; font-weight: 600; margin-bottom: 0.4rem; }
        .pub-input { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; transition: border-color 0.2s; }
        .pub-input:focus { border-color: var(--black); }
        .pub-select { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%237a776f' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; }
        .pub-textarea { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; resize: vertical; min-height: 80px; }
        .pub-textarea:focus { border-color: var(--black); }
        .pub-fg { display: flex; flex-direction: column; gap: 0.4rem; }
        .pub-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pub-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
        .pub-full { grid-column: 1 / -1; }

        /* Fotos */
        .fotos-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-bottom: 0.75rem; }
        .foto-thumb { aspect-ratio: 3/4; border-radius: 4px; overflow: hidden; position: relative; background: var(--g1); }
        .foto-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .foto-remove { position: absolute; top: 4px; right: 4px; background: rgba(8,8,8,0.7); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .foto-add { aspect-ratio: 3/4; border-radius: 4px; border: 2px dashed var(--g3); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; gap: 0.4rem; color: var(--g4); font-size: 0.75rem; text-align: center; padding: 0.5rem; transition: border-color 0.15s; }
        .foto-add:hover { border-color: var(--black); color: var(--black); }
        .foto-add svg { opacity: 0.5; }

        /* Tipo btns */
        .tipo-btn { padding: 0.6rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; font-family: var(--sans); border: 1.5px solid var(--g2); background: #fff; color: var(--g4); cursor: pointer; transition: all 0.15s; text-align: center; }
        .tipo-btn.active { background: #c4748a; color: #fff; border-color: #c4748a; }

        /* Tamanhos */
        .tamanho-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
        .tamanho-sel { flex: 1; padding: 0.6rem 0.75rem; border: 1.5px solid var(--g2); font-family: var(--sans); font-size: 0.88rem; background: #fff; outline: none; }
        .tamanho-qty { width: 70px; padding: 0.6rem 0.75rem; border: 1.5px solid var(--g2); font-family: var(--sans); font-size: 0.88rem; text-align: center; }
        .tamanho-rm { background: none; border: none; color: var(--rosa); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0.2rem; }

        /* Ocasiões */
        .ocasiao-btn { padding: 0.35rem 0.6rem; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; font-family: var(--sans); border: 1.5px solid var(--g2); background: #fff; color: var(--g4); cursor: pointer; transition: all 0.15s; }
        .ocasiao-btn.active { background: #c4748a; color: #fff; border-color: #c4748a; }

        /* Upload area */
        .upload-area { border: 2px dashed var(--g2); padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s; background: var(--g1); }
        .upload-area:hover { border-color: var(--rosa); }

        /* Botões */
        .pub-btn { width: 100%; padding: 0.9rem; border: none; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: var(--sans); font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .pub-btn-black { background: #c4748a; color: #fff; }
        .pub-btn-black:hover { background: #b5637a; }
        .pub-btn-black:disabled { opacity: 0.5; cursor: not-allowed; }
        .pub-btn-outline { background: #fff; color: var(--black); border: 1.5px solid var(--g2); }
        .pub-btn-outline:hover { border-color: var(--black); }
        .pub-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .pub-actions .pub-btn { flex: 1; }
        .pub-actions .pub-btn-outline { flex: 0 0 auto; padding: 0.9rem 1.25rem; width: auto; }

        .pub-erro { background: #fff5f5; border-left: 3px solid #e74c3c; padding: 0.75rem 1rem; font-size: 0.8rem; color: #c0392b; margin-top: 0.5rem; }
        .pub-sugestao { font-size: 0.75rem; color: #27ae60; margin-top: 0.25rem; }
        .pub-hint { font-size: 0.75rem; color: var(--g4); margin-top: 0.25rem; }

        .defeito-box { padding: 0.85rem 1rem; border: 1.5px solid var(--g2); background: #fafafa; margin-bottom: 1rem; }
        .defeito-box.ativo { border-color: #e74c3c; background: #fff5f5; }
        .defeito-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; color: var(--g4); }
        .defeito-box.ativo .defeito-label { color: #c0392b; }

        .link-externo-box { padding: 1rem; background: #faf8f5; border: 1.5px solid #e8d5a3; margin-bottom: 1rem; }
        .link-externo-badge { font-size: 0.72rem; background: var(--ouro); color: #fff; padding: 0.1rem 0.4rem; font-weight: 600; letter-spacing: 0.08em; margin-left: 0.4rem; }

        /* Sucesso */
        .sucesso-wrap { text-align: center; padding: 3rem 2rem; }
        .sucesso-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .sucesso-titulo { font-family: var(--sans); font-size: 1.5rem; font-weight: 600; color: var(--black); margin-bottom: 0.5rem; }
        .sucesso-sub { font-size: 0.85rem; color: var(--g4); line-height: 1.6; margin-bottom: 1.5rem; }
        .sucesso-acoes { display: flex; flex-direction: column; gap: 0.75rem; }
        .sucesso-btn { padding: 0.9rem; text-align: center; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: var(--sans); font-weight: 600; text-decoration: none; border: none; cursor: pointer; }

        @media (max-width: 600px) {
          .pub-body { padding: 1.25rem 1rem 6rem; }
          .pub-grid2 { grid-template-columns: 1fr; }
          .pub-grid3 { grid-template-columns: 1fr 1fr; }
          .fotos-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="pub-nav">
        <a href="/perfil" className="pub-logo">Nora Grei</a>
        <div className="pub-steps">
          {[1,2,3].map(s => (
            <div key={s} className={`pub-step${passo > s ? " done" : passo === s ? " active" : ""}`} />
          ))}
        </div>
        <a href="/perfil" className="pub-voltar">← Voltar</a>
      </nav>

      <div className="pub-body">

        {/* ── PASSO 1 — FOTOS ── */}
        {passo === 1 && (
          <>
            <h1 className="pub-titulo">Adicionar peça</h1>
            <p className="pub-subtitulo">Começa pelas fotos — até 5 imagens da peça.</p>

            <div className="pub-card">
              <p className="pub-card-t">Fotos da peça</p>

              {/* Área drag-and-drop */}
              {fotos.length === 0 && (
                <div className="upload-area" onClick={() => inputFotoRef.current?.click()}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="1.2" style={{marginBottom:"0.75rem"}}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <p style={{fontSize:"0.9rem",color:"#5a5855",fontWeight:500,marginBottom:"0.25rem"}}>Toca para adicionar fotos</p>
                  <p style={{fontSize:"0.72rem",color:"#9c9894"}}>JPG, PNG, WEBP — até 5 fotos</p>
                </div>
              )}

              {/* Grid de miniaturas */}
              {fotos.length > 0 && (
                <div className="fotos-grid">
                  {fotos.map((f, i) => (
                    <div key={i} className="foto-thumb">
                      <img src={f.url} alt="" />
                      <button className="foto-remove" onClick={() => removerFoto(i)} title="Remover">✕</button>
                      {/* Badge de validação IA */}
                      {f.validando && (
                        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(8,8,8,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.3rem",gap:"0.3rem"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#f39c12",animation:"pcpulse 1s infinite"}}/>
                          <span style={{fontSize:"0.68rem",color:"#fff",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em"}}>A analisar...</span>
                        </div>
                      )}
                      {!f.validando && f.valida === true && (
                        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(39,174,96,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.3rem",gap:"0.25rem"}}>
                          <span style={{fontSize:"0.68rem",color:"#fff",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em"}}>✓ {f.motivo}</span>
                        </div>
                      )}
                      {!f.validando && f.valida === false && (
                        <div style={{position:"absolute",inset:0,background:"rgba(200,50,50,0.82)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0.4rem",gap:"0.3rem"}}>
                          <span style={{fontSize:"0.72rem",color:"#fff",fontFamily:"'Jost',sans-serif",fontWeight:600,letterSpacing:"0.06em",textAlign:"center"}}>✕ Foto rejeitada</span>
                          <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.85)",fontFamily:"'Jost',sans-serif",textAlign:"center",lineHeight:1.3}}>{f.motivo}</span>
                          <button onClick={() => removerFoto(i)} style={{marginTop:"0.25rem",fontSize:"0.68rem",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)",padding:"0.2rem 0.5rem",cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em"}}>Remover</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {fotos.length < 5 && (
                    <div className="foto-add" onClick={() => inputFotoRef.current?.click()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                      <span>Adicionar</span>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={e => adicionarFotos(e.target.files)}
              />

              {fotos.length > 0 && (
                <p style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.5rem"}}>
                  {fotos.length} foto{fotos.length > 1 ? "s" : ""} selecionada{fotos.length > 1 ? "s" : ""}. A primeira será a imagem principal.
                </p>
              )}
            </div>

            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button
                className="pub-btn pub-btn-black"
                onClick={() => {
                  if (!fotos.length) { setErro("Adiciona pelo menos uma foto."); return; }
                  if (fotos.some(f => f.validando)) { setErro("Aguarda a análise das fotos."); return; }
                  const invalidas = fotos.filter(f => f.valida === false);
                  if (invalidas.length > 0) { setErro("Remove as fotos rejeitadas antes de continuar."); return; }
                  setErro(""); setPasso(2);
                }}
                disabled={fotos.length === 0 || fotos.some(f => f.validando)}
              >
                {fotos.some(f => f.validando) ? "A analisar fotos..." : "Continuar →"}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 2 — DETALHES ── */}
        {passo === 2 && (
          <>
            <h1 className="pub-titulo">Detalhes da peça</h1>
            <p className="pub-subtitulo">Informação sobre a peça — quanto mais detalhes, melhor para a cliente.</p>

            {/* Categoria */}
            <div className="pub-card">
              <p className="pub-card-t">Categoria</p>
              <div className="pub-fg">
                <label className="pub-label">Categoria *</label>
                <select
                  className="pub-select"
                  value={peca.categoria}
                  onChange={e => {
                    const cat = e.target.value;
                    const semTam = CATEGORIAS_SEM_TAMANHO.includes(cat);
                    setPeca(prev => ({ ...prev, categoria: cat, tamanhos: semTam ? [{ tamanho: "Único", quantidade: 1 }] : prev.tamanhos }));
                  }}
                >
                  <option value="">Selecionar categoria...</option>
                  <optgroup label="Vestuário">
                    {CATEGORIAS_VESTUARIO.map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Acessórios">
                    {CATEGORIAS_ACESSORIOS.map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Relógios">
                    <option>Relógios</option>
                  </optgroup>
                  <optgroup label="Calçado">
                    {["Saltos","Sandálias","Botas","Sapatilhas","Calçado"].map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Nome + Marca */}
            <div className="pub-card">
              <p className="pub-card-t">Identificação</p>
              <div className="pub-grid2">
                <div className="pub-fg">
                  <label className="pub-label">Nome da peça *</label>
                  <input className="pub-input" value={peca.nome} onChange={e => setP("nome", e.target.value)} placeholder="Ex: Vestido midi azul marinho" />
                </div>
                <div className="pub-fg">
                  <label className="pub-label">Marca / Designer</label>
                  <input className="pub-input" value={peca.marca} onChange={e => setP("marca", e.target.value)} placeholder="Zara, Mango, Gucci..." />
                </div>
                <div className="pub-fg">
                  <label className="pub-label">Cor principal</label>
                  <input className="pub-input" value={peca.cor} onChange={e => setP("cor", e.target.value)} placeholder="Azul marinho" list="cores-lista" />
                  <datalist id="cores-lista">
                    {CORES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="pub-fg">
                  <label className="pub-label">Material</label>
                  <input className="pub-input" value={peca.material} onChange={e => setP("material", e.target.value)} placeholder="100% seda natural" />
                </div>
                <div className="pub-fg pub-full">
                  <label className="pub-label">Condição</label>
                  <select className="pub-select" value={peca.condicao} onChange={e => setP("condicao", e.target.value)}>
                    <option value="novo">Novo (com etiqueta)</option>
                    <option value="como_novo">Como novo (nunca usado)</option>
                    <option value="muito_bom">Muito bom estado</option>
                    <option value="bom">Bom estado</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
                <div className="pub-fg pub-full">
                  <label className="pub-label">Descrição</label>
                  <textarea className="pub-textarea" value={peca.descricao} onChange={e => setP("descricao", e.target.value)} placeholder="Conta a história desta peça — ocasião ideal, como usar, porquê é especial..." />
                </div>
              </div>
            </div>

            {/* Defeito */}
            <div className="pub-card">
              <p className="pub-card-t">Estado de conservação</p>
              <div className={`defeito-box${peca.tem_defeito ? " ativo" : ""}`}>
                <label className="defeito-label">
                  <input
                    type="checkbox"
                    checked={peca.tem_defeito}
                    onChange={e => setP("tem_defeito", e.target.checked)}
                    style={{ width: "1rem", height: "1rem", cursor: "pointer", accentColor: "#e74c3c" }}
                  />
                  A peça tem defeito
                </label>
                {peca.tem_defeito ? (
                  <textarea
                    className="pub-textarea"
                    value={peca.descricao_defeito}
                    onChange={e => setP("descricao_defeito", e.target.value)}
                    style={{ marginTop: "0.75rem", border: "1.5px solid #e74c3c" }}
                    placeholder="Descreve o defeito — ex: ligeira mancha na manga, fio solto na bainha..."
                  />
                ) : (
                  <p style={{ fontSize: "0.68rem", color: "#9c9894", marginTop: "0.5rem" }}>
                    A peça está em perfeitas condições.
                  </p>
                )}
              </div>
            </div>

            {/* Tamanhos */}
            <div className="pub-card">
              <p className="pub-card-t">Tamanhos disponíveis</p>
              {peca.tamanhos.map((t, idx) => (
                <div key={idx} className="tamanho-row">
                  <select
                    className="tamanho-sel"
                    value={t.tamanho}
                    onChange={e => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.map((x, i) => i === idx ? { ...x, tamanho: e.target.value } : x) }))}
                  >
                    {TAMANHOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input
                    type="number"
                    className="tamanho-qty"
                    value={t.quantidade}
                    min={1}
                    onChange={e => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.map((x, i) => i === idx ? { ...x, quantidade: parseInt(e.target.value) || 1 } : x) }))}
                    title="Quantidade"
                  />
                  {peca.tamanhos.length > 1 && (
                    <button
                      className="tamanho-rm"
                      onClick={() => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.filter((_, i) => i !== idx) }))}
                    >✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setPeca(prev => ({ ...prev, tamanhos: [...prev.tamanhos, { tamanho: "M", quantidade: 1 }] }))}
                style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "1.5px solid var(--g2)", padding: "0.4rem 0.75rem", cursor: "pointer", fontFamily: "var(--sans)", color: "var(--g4)" }}
              >
                + Tamanho
              </button>
            </div>

            {/* Ocasiões */}
            <div className="pub-card">
              <p className="pub-card-t">Ocasiões</p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {OCASIOES.map(oc => (
                  <button
                    key={oc}
                    type="button"
                    className={`ocasiao-btn${peca.ocasioes.includes(oc) ? " active" : ""}`}
                    onClick={() => {
                      const next = peca.ocasioes.includes(oc)
                        ? peca.ocasioes.filter(o => o !== oc)
                        : [...peca.ocasioes, oc];
                      setP("ocasioes", next);
                    }}
                  >
                    {oc}
                  </button>
                ))}
              </div>
            </div>

            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button className="pub-btn pub-btn-outline" onClick={() => { setErro(""); setPasso(1); }}>←</button>
              <button
                className="pub-btn pub-btn-black"
                onClick={() => { if (validarPasso2()) setPasso(3); }}
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 3 — PREÇOS ── */}
        {passo === 3 && (
          <>
            <h1 className="pub-titulo">Preços e disponibilidade</h1>
            <p className="pub-subtitulo">Define como a peça estará disponível — para alugar, vender, ou ambos.</p>

            {/* ── Estimativa inteligente ── */}
            {(() => {
              const est = calcEstimativa(peca);
              if (!est) return null;
              const tierLabel = { premium: "✦ Marca premium", alta: "Marca alta", massmarket: "Marca standard" }[est.tier];
              return (
                <div style={{
                  background: "linear-gradient(135deg,#1a1816 0%,#2d2926 100%)",
                  borderRadius: 14, padding: "1.1rem 1.25rem",
                  marginBottom: "0.75rem", color: "#fff",
                }}>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.6rem" }}>
                    Estimativa Nora Grei · {tierLabel}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
                    <div>
                      <div style={{ fontSize: "1.45rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1 }}>€{est.valorMercado}</div>
                      <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>valor de mercado</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.45rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1 }}>€{est.precoAluguerDia}</div>
                      <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>aluguer/dia sugerido</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.45rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1 }}>~{est.alugueresMes}×</div>
                      <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>rotações/mês</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                    Potencial: <strong style={{ color: "#fff" }}>€{est.ganho12m}</strong> em 12 meses de alugueres + venda usada a <strong style={{ color: "#fff" }}>€{est.precoVendaUsada}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{ flex: 1, padding: "0.55rem", background: "#c4748a", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                      onClick={() => setPeca(prev => ({
                        ...prev,
                        preco_aluguer_dia: est.precoAluguerDia.toString(),
                        preco_venda: est.precoVendaUsada.toString(),
                      }))}
                    >
                      Usar sugestão
                    </button>
                    <div style={{ flex: 1, padding: "0.55rem", background: "rgba(255,255,255,0.07)", borderRadius: 8, fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.3 }}>
                      Ou ajusta manualmente abaixo
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Idade da peça */}
            <div className="pub-card" style={{ marginBottom: "0.75rem" }}>
              <p className="pub-card-t">Idade da peça</p>
              <div className="pub-grid2">
                {[["novo","Menos de 1 ano"],["1a2","1 a 2 anos"],["2a4","2 a 4 anos"],["4mais","Mais de 4 anos"]].map(([v, l]) => (
                  <button
                    key={v}
                    className={`tipo-btn${peca.idade_peca === v ? " active" : ""}`}
                    onClick={() => setP("idade_peca", v)}
                    style={{ fontSize: "0.72rem" }}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="pub-card">
              <p className="pub-card-t">Disponível para</p>
              <div className="pub-grid3">
                {[["alugar","Alugar"],["comprar","Vender"],["ambos","Alugar e Vender"]].map(([val, label]) => (
                  <button
                    key={val}
                    className={`tipo-btn${peca.tipo === val ? " active" : ""}`}
                    onClick={() => setP("tipo", val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preços */}
            <div className="pub-card">
              <p className="pub-card-t">Preços</p>
              <div className="pub-grid2">

                {/* Valor nova */}
                <div className="pub-fg">
                  <label className="pub-label">Valor peça nova (€)</label>
                  <input
                    className="pub-input"
                    type="number"
                    min="0"
                    value={peca.valor_peca}
                    onChange={e => setP("valor_peca", e.target.value)}
                    placeholder="200"
                  />
                  <span className="pub-hint">Valor original de compra — usado para calcular a caução.</span>
                </div>

                {/* Preço aluguer */}
                {precisaAluguer && (
                  <div className="pub-fg">
                    <label className="pub-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      Aluguer / dia (€) *
                      {(() => { const est = calcEstimativa(peca); return est ? (
                        <span style={{ fontSize: "0.55rem", background: "#e8f5e9", color: "#27ae60", padding: "0.1rem 0.35rem", fontWeight: 600 }}>
                          sugerido: €{est.precoAluguerDia}
                        </span>
                      ) : null; })()}
                    </label>
                    <input
                      className="pub-input"
                      type="number"
                      min="0"
                      value={peca.preco_aluguer_dia}
                      onChange={e => setP("preco_aluguer_dia", e.target.value)}
                      placeholder="16"
                    />
                    {peca.valor_peca && peca.preco_aluguer_dia && parseFloat(peca.valor_peca) > 0 && parseFloat(peca.preco_aluguer_dia) > 0 && (
                      <span className="pub-sugestao">
                        A cliente poupa {Math.round((1 - parseFloat(peca.preco_aluguer_dia) / parseFloat(peca.valor_peca)) * 100)}% vs comprar nova
                      </span>
                    )}
                  </div>
                )}

                {/* Preço venda usada */}
                {precisaVenda && (
                  <div className="pub-fg">
                    <label className="pub-label">Preço de venda usada (€) *</label>
                    <input
                      className="pub-input"
                      type="number"
                      min="0"
                      value={peca.preco_venda}
                      onChange={e => setP("preco_venda", e.target.value)}
                      placeholder="150"
                    />
                    {(() => { const est = calcEstimativa(peca); return est ? (
                      <span className="pub-hint">Estimativa: €{est.precoVendaUsada} com base no estado e marca.</span>
                    ) : <span className="pub-hint">Preço de venda da peça em segunda mão.</span>; })()}
                  </div>
                )}

              </div>
            </div>

            {/* Link externo */}
            <div className="pub-card">
              <p className="pub-card-t">Link para comprar nova <span style={{opacity:0.5}}>(opcional)</span></p>
              <div className="link-externo-box">
                <label className="pub-label" style={{ color: "#8a6a2a" }}>
                  Link para comprar nova ↗
                  <span className="link-externo-badge">15€/mês</span>
                </label>
                <input
                  className="pub-input"
                  type="url"
                  value={peca.link_compra_externa}
                  onChange={e => setP("link_compra_externa", e.target.value)}
                  placeholder="https://www.zara.com/produto/..."
                  style={{ marginTop: "0.5rem" }}
                />
                <p style={{ fontSize: "0.65rem", color: "#8a6a2a", marginTop: "0.5rem", lineHeight: 1.5 }}>
                  Direciona as clientes para comprarem a peça nova noutro site. A Nora Grei ativa este link após pagamento de 15€/mês.
                </p>
              </div>
            </div>

            {progresso && (
              <p style={{ fontSize: "0.8rem", color: "#c4748a", fontStyle: "italic", marginBottom: "0.75rem" }}>{progresso}</p>
            )}
            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button className="pub-btn pub-btn-outline" onClick={() => { setErro(""); setPasso(2); }}>←</button>
              <button
                className="pub-btn pub-btn-black"
                onClick={publicar}
                disabled={enviando}
              >
                {enviando ? "A publicar..." : "Publicar peça"}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 4 — SUCESSO ── */}
        {passo === 4 && (
          <div className="pub-card sucesso-wrap">
            <div className="sucesso-icon">🎉</div>
            <h2 className="sucesso-titulo">Peça publicada!</h2>
            <p className="sucesso-sub">
              A tua peça foi adicionada ao teu catálogo e ficará visível na tua loja após aprovação.
            </p>
            <div className="sucesso-acoes">
              {cliente?.codigo_cliente && (
                <a
                  href={`/loja/${cliente.codigo_cliente}`}
                  className="sucesso-btn"
                  style={{ background: "#080808", color: "#fff" }}
                >
                  Ver a minha loja ↗
                </a>
              )}
              <button
                className="sucesso-btn"
                onClick={reiniciar}
                style={{ background: "#fff", border: "1.5px solid #e2dfda", color: "#080808" }}
              >
                Adicionar outra peça
              </button>
              <a href="/perfil" className="sucesso-btn" style={{ color: "#7a776f", textDecoration: "none", fontSize: "0.7rem" }}>
                Ir para o perfil
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
