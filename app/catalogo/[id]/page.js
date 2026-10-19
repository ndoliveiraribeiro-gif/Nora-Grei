"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Caução baseada em ROI: quantos alugueres são precisos para recuperar a peça
// Fórmula: (valor_peca - receita_já_gerada) / alugueres_esperados_mes × fator_risco
// Tecto: valor_peca. Piso: 5% do valor.
const calcularCaucaoRoi = (valorPeca, precoDia, totalAlugueres, nv) => {
  if (!valorPeca || valorPeca <= 0) return 0;
  const diasMediosPorAluguer = 3;
  const aluguersMes = 4; // estimativa conservadora
  const receitaEsperadaMes = aluguersMes * precoDia * diasMediosPorAluguer;
  const receitaJaGerada = totalAlugueres * precoDia * diasMediosPorAluguer;
  const valorResidual = Math.max(0, valorPeca - receitaJaGerada);
  // Caucao = valor residual / meses para amortizar (3 meses base) × desconto por nível
  const mesesAmort = 3;
  const caucaoBase = Math.min(valorResidual / mesesAmort, valorResidual * 0.4);
  const descontoNivel = nv.descCaucao; // % de desconto por nível de confiança
  const caucao = Math.round(caucaoBase * (1 - descontoNivel / 100));
  const piso = Math.round(valorPeca * 0.05);
  return Math.max(piso, caucao);
};

const NIVEL_NOMES = {
  pt: { platina:"Platina", ouro:"Ouro", prata:"Prata", bronze:"Bronze" },
  fr: { platina:"Platine", ouro:"Or",   prata:"Argent", bronze:"Bronze" },
  lt: { platina:"Platina", ouro:"Auksas", prata:"Sidabras", bronze:"Bronza" },
};
const NIVEL = (n, lang = "pt") => {
  const nm = NIVEL_NOMES[lang] || NIVEL_NOMES.pt;
  if (n >= 20) return { nome: nm.platina, icon: "💎", descCaucao: 80, cor: "#6c5ce7" };
  if (n >= 10) return { nome: nm.ouro,    icon: "🥇", descCaucao: 60, cor: "#f39c12" };
  if (n >= 5)  return { nome: nm.prata,   icon: "🥈", descCaucao: 40, cor: "#95a5a6" };
  return             { nome: nm.bronze,   icon: "🥉", descCaucao: 0,  cor: "#cd7f32" };
};

const OCASIOES_I18N = {
  pt: { "Casamento":"Casamento","Gala":"Gala","Cocktail":"Cocktail","Festa":"Festa","Trabalho":"Trabalho","Dia a dia":"Dia a dia","Jantar":"Jantar","Férias":"Férias","Praia":"Praia","Praia/Férias":"Praia/Férias" },
  fr: { "Casamento":"Mariage","Gala":"Gala","Cocktail":"Cocktail","Festa":"Fête","Trabalho":"Travail","Dia a dia":"Quotidien","Jantar":"Dîner","Férias":"Vacances","Praia":"Plage","Praia/Férias":"Plage/Vacances" },
  lt: { "Casamento":"Vestuvės","Gala":"Gala","Cocktail":"Kokteilis","Festa":"Šventė","Trabalho":"Darbas","Dia a dia":"Kasdien","Jantar":"Vakarienė","Férias":"Atostogos","Praia":"Paplūdimys","Praia/Férias":"Paplūdimys/Atostogos" },
};

const CATEGORIAS_I18N = {
  pt: { "Vestidos":"Vestidos","Conjuntos":"Conjuntos","Blusas":"Blusas","Casacos":"Casacos","Saias":"Saias","Calças":"Calças","Acessórios":"Acessórios","Malas":"Malas","Sapatos":"Sapatos","Fatos":"Fatos","Tops":"Tops" },
  fr: { "Vestidos":"Robes","Conjuntos":"Ensembles","Blusas":"Blouses","Casacos":"Manteaux","Saias":"Jupes","Calças":"Pantalons","Acessórios":"Accessoires","Malas":"Sacs","Sapatos":"Chaussures","Fatos":"Costumes","Tops":"Tops" },
  lt: { "Vestidos":"Suknelės","Conjuntos":"Komplektai","Blusas":"Palaidinės","Casacos":"Paltai","Saias":"Sijonai","Calças":"Kelnės","Acessórios":"Aksesuarai","Malas":"Krepšiai","Sapatos":"Batai","Fatos":"Kostiumai","Tops":"Topai" },
};

function Timer({ dataFim, lang }) {
  const [tempo, setTempo] = useState("");
  const labels = { pt: "Disponível em", fr: "Disponible dans", lt: "Prieinama po" };
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h`);
      else if (horas > 0) setTempo(`${horas}h ${mins}m`);
      else setTempo(`${mins}m`);
    };
    calc();
    const i = setInterval(calc, 60000);
    return () => clearInterval(i);
  }, [dataFim]);
  if (!tempo) return null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#fff8e1',padding:'0.75rem 1rem',marginBottom:'1rem',border:'1px solid #f39c12'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#f39c12',flexShrink:0,animation:'pulse 2s infinite'}}/>
      <span style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#e67e22',fontFamily:"'Jost',sans-serif"}}>
        {labels[lang]||labels.pt} <strong>{tempo}</strong>
      </span>
    </div>
  );
}

const TRADUCOES = {
  pt: { voltar:"← Catálogo", alugar:"Alugar agora", reservar:"Reservar quando disponível", disponivel:"Disponível", indisponivel:"Indisponível", tamanho:"Tamanho", ocasioes:"Ocasiões", material:"Material", origem:"Origem", deposito:"Depósito de caução", depositoDesc:"Devolvido no final do aluguer", semTamanho:"Seleciona um tamanho", porcDia:"/dia", comprar:"Comprar", partilhar:"Partilhar", descricao:"Descrição", categoria:"Categoria", disponibilidade:"Disponibilidade", verCatalogo:"Ver catálogo completo", avaliacoes:"Avaliações", semAvaliacoes:"Ainda sem avaliações.", anonimo:"Cliente Nora Grei", livreEm:"livre em", reservarTamanho:"reservar", contactar:"Falar com a lojista", contactarLoading:"A abrir chat...", contactarEntrar:"Entra para contactar", pecaNova:"Peça nova", alugaPor:"Aluga por apenas", poupas:"Em vez de comprares por", economia:"de economia", semHistorico:"sem histórico", roiRecuperado:"% do valor da peça recuperado", notaStylist:"Nota da stylist", porOcasiao:"Por ocasião", comprarNova:"Comprar nova", alugar2:"Alugar", tamanho2:"Tamanho", reservar2:"Reservar", adicionarCesto:"Adicionar ao cesto", aoCesto:"Ao cesto", guardado:"Guardado", guardarDepois:"Guardar para depois", linkCopiado:"Link copiado! Contém o teu código de afiliado.", carregando:"A carregar...", naoEncontrada:"Peça não encontrada", voltarCatalogo:"← Voltar ao catálogo" },
  fr: { voltar:"← Catalogue", alugar:"Louer maintenant", reservar:"Réserver quand disponible", disponivel:"Disponible", indisponivel:"Indisponible", tamanho:"Taille", ocasioes:"Occasions", material:"Matière", origem:"Origine", deposito:"Dépôt de garantie", depositoDesc:"Remboursé à la fin", semTamanho:"Sélectionne une taille", porcDia:"/jour", comprar:"Acheter", partilhar:"Partager", descricao:"Description", categoria:"Catégorie", disponibilidade:"Disponibilité", verCatalogo:"Voir tout le catalogue", avaliacoes:"Avis", semAvaliacoes:"Pas encore d'avis.", anonimo:"Cliente Nora Grei", livreEm:"libre le", reservarTamanho:"réserver", contactar:"Contacter la boutique", contactarLoading:"Ouverture...", contactarEntrar:"Connectez-vous pour contacter", pecaNova:"Pièce neuve", alugaPor:"Loue pour seulement", poupas:"Au lieu d'acheter pour", economia:"d'économie", semHistorico:"sans historique", roiRecuperado:"% de la valeur récupérée", notaStylist:"Note de la styliste", porOcasiao:"À l'occasion", comprarNova:"Acheter neuf", alugar2:"Louer", tamanho2:"Taille", reservar2:"Réserver", adicionarCesto:"Ajouter au panier", aoCesto:"Au panier", guardado:"Sauvegardé", guardarDepois:"Sauvegarder pour plus tard", linkCopiado:"Lien copié ! Il contient ton code d'affiliation.", carregando:"Chargement...", naoEncontrada:"Article introuvable", voltarCatalogo:"← Retour au catalogue" },
  lt: { voltar:"← Katalogas", alugar:"Nuomoti dabar", reservar:"Rezervuoti", disponivel:"Prieinama", indisponivel:"Neprieinama", tamanho:"Dydis", ocasioes:"Progos", material:"Medžiaga", origem:"Kilmė", deposito:"Užstatas", depositoDesc:"Grąžinamas pabaigoje", semTamanho:"Pasirink dydį", porcDia:"/d.", comprar:"Pirkti", partilhar:"Dalintis", descricao:"Aprašymas", categoria:"Kategorija", disponibilidade:"Prieinamumas", verCatalogo:"Peržiūrėti katalogą", avaliacoes:"Atsiliepimai", semAvaliacoes:"Dar nėra atsiliepimų.", anonimo:"Cliente Nora Grei", livreEm:"laisva", reservarTamanho:"rezervuoti", contactar:"Susisiekti su parduotuve", contactarLoading:"Atidaroma...", contactarEntrar:"Prisijunkite norėdami susisiekti", pecaNova:"Nauja prekė", alugaPor:"Nuomok tik už", poupas:"Vietoj pirkimo už", economia:"sutaupymas", semHistorico:"be istorijos", roiRecuperado:"% vertės susigrąžinta", notaStylist:"Stilistės pastaba", porOcasiao:"Atskirai", comprarNova:"Pirkti naują", alugar2:"Nuomoti", tamanho2:"Dydis", reservar2:"Rezervuoti", adicionarCesto:"Į krepšelį", aoCesto:"Krepšelis", guardado:"Išsaugota", guardarDepois:"Išsaugoti vėlesniam", linkCopiado:"Nuoroda nukopijuota! Joje yra jūsų partnerystės kodas.", carregando:"Kraunama...", naoEncontrada:"Prekė nerasta", voltarCatalogo:"← Grįžti į katalogą" },
};

export default function PecaDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [peca, setPeca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(null);
  const [dataFimTimer, setDataFimTimer] = useState(null);
  const [partilhado, setPartilhado] = useState(false);
  const [datasPorTamanho, setDatasPorTamanho] = useState({});
  const [avaliacoesPeca, setAvaliacoesPeca] = useState([]);
  const [contactando, setContactando] = useState(false);
  const [totalAlugueres, setTotalAlugueres] = useState(0);
  const [naWishlist, setNaWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && TRADUCOES[saved]) setLang(saved);
    carregarPeca();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserLogado(data.session.user);
        supabase.from("clientes").select("total_pecas_alugadas").eq("id", data.session.user.id).single()
          .then(({ data: cli }) => { if (cli) setTotalAlugueres(cli.total_pecas_alugadas || 0); });
        // Verificar se peça está na wishlist
        supabase.from("wishlist").select("id").eq("cliente_id", data.session.user.id).eq("peca_id", id).maybeSingle()
          .then(({ data: w }) => { if (w) setNaWishlist(true); });
      }
    });
  }, [id]);

  const toggleWishlist = async () => {
    if (!userLogado) { router.push("/entrar"); return; }
    setWishlistLoading(true);
    if (naWishlist) {
      await supabase.from("wishlist").delete().eq("cliente_id", userLogado.id).eq("peca_id", id);
      setNaWishlist(false);
    } else {
      await supabase.from("wishlist").insert({ cliente_id: userLogado.id, peca_id: id });
      setNaWishlist(true);
    }
    setWishlistLoading(false);
  };

  const carregarPeca = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pecas")
      .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_total, quantidade_disponivel)")
      .eq("id", id)
      .single();

    if (data) {
      setPeca(data);
      // Selecionar primeiro tamanho disponível
      const disponiveis = data.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0) || [];
      if (disponiveis.length > 0) setTamanhoSelecionado(disponiveis[0].id);

      // Buscar alugueres ativos para calcular datas de disponibilidade por tamanho
      const stockIds = data.stock_tamanhos?.map(s => s.id) || [];
      if (stockIds.length > 0) {
        const { data: alugueresAtivos } = await supabase
          .from("alugueres")
          .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
          .in("stock_tamanho_id", stockIds)
          .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

        if (alugueresAtivos && alugueresAtivos.length > 0) {
          const mapa = {};
          let dataMaisDistante = null;
          alugueresAtivos.forEach(a => {
            const dataDisp = a.data_disponivel_novamente
              ? new Date(a.data_disponivel_novamente)
              : new Date(new Date(a.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
            // Mapa por tamanho
            if (!mapa[a.stock_tamanho_id] || dataDisp > mapa[a.stock_tamanho_id]) {
              mapa[a.stock_tamanho_id] = dataDisp;
            }
            // Data mais distante global para o timer
            if (!dataMaisDistante || dataDisp > dataMaisDistante) {
              dataMaisDistante = dataDisp;
            }
          });
          setDatasPorTamanho(mapa);
          if (dataMaisDistante) setDataFimTimer(dataMaisDistante.toISOString());
        }
      }

      // Buscar avaliações desta peça
      const { data: avs } = await supabase
        .from("avaliacoes")
        .select("nota_cliente_empresa, comentario_cliente, created_at, clientes(nome), alugueres(stock_tamanhos(pecas(id)))")
        .not("nota_cliente_empresa", "is", null)
        .order("created_at", { ascending: false });
      if (avs) {
        const filtradas = avs.filter(av => av.alugueres?.stock_tamanhos?.pecas?.id === id);
        setAvaliacoesPeca(filtradas);
      }
    }
    setLoading(false);
  };

  const irParaCheckout = () => {
    if (!tamanhoSelecionado) return;
    if (!userLogado) { router.push("/entrar"); return; }
    router.push(`/checkout?peca=${id}&tamanho=${tamanhoSelecionado}`);
  };

  const adicionarAoCesto = () => {
    if (!tamanhoSelecionado) return;
    const stockSelecionado = peca?.stock_tamanhos?.find(s => s.tamanho === tamanhoSelecionado || s.id === tamanhoSelecionado);
    let cesto = [];
    try { cesto = JSON.parse(localStorage.getItem("ng_cesto") || "[]"); } catch (_) {}
    // Evitar duplicado da mesma peça + tamanho
    const jaExiste = cesto.some(i => i.pecaId === id && i.tamanhoNome === tamanhoSelecionado);
    if (!jaExiste) {
      cesto.push({
        pecaId: id,
        stockId: stockSelecionado?.id || null,
        tamanhoNome: tamanhoSelecionado,
        pecaNome: peca?.nome,
        precoDia: peca?.preco_aluguer_dia,
        valorPeca: peca?.valor_peca,
        fotos: peca?.fotos,
        dataInicio: null,
        dataFim: null,
      });
      localStorage.setItem("ng_cesto", JSON.stringify(cesto));
      window.dispatchEvent(new Event("cesto-atualizado"));
    }
    router.push("/cesto");
  };

  const contactarLojista = async () => {
    if (!userLogado) { router.push("/entrar"); return; }
    setContactando(true);
    try {
      // Determinar o lojista: usa lojista_id da peça se existir, senão busca o admin (modo_lojista)
      let lojistaId = peca?.lojista_id || null;
      if (!lojistaId) {
        const { data: lojista } = await supabase
          .from("clientes")
          .select("id")
          .eq("modo_lojista", true)
          .limit(1)
          .single();
        lojistaId = lojista?.id;
      }
      if (!lojistaId) { setContactando(false); return; }

      // Se é o próprio lojista, ir direto para mensagens
      if (lojistaId === userLogado.id) {
        router.push("/mensagens");
        return;
      }

      // Verificar se já existe uma conversa entre este cliente e este lojista
      const { data: existente } = await supabase
        .from("conversas")
        .select("id")
        .eq("cliente_id", userLogado.id)
        .eq("lojista_id", lojistaId)
        .maybeSingle();

      if (!existente) {
        // Criar nova conversa
        await supabase.from("conversas").insert({
          cliente_id: userLogado.id,
          lojista_id: lojistaId,
          assunto: peca.nome,
        });
      }

      router.push("/mensagens");
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
      setContactando(false);
    }
  };

  const partilhar = async (rede) => {
    // Verifica se o utilizador é um afiliado e adiciona o código ao URL
    let urlBase = window.location.href.split("?")[0];
    let refCode = new URLSearchParams(window.location.search).get("ref");
    // Se não tem ref no URL, tenta buscar o código do utilizador logado
    if (!refCode && userLogado) {
      const { data: afiliadoUser } = await supabase.from("afiliados").select("codigo").eq("email", userLogado.email).eq("ativo", true).maybeSingle();
      if (afiliadoUser) refCode = afiliadoUser.codigo;
    }
    const urlPartilha = refCode
      ? `${urlBase}?ref=${refCode}&utm_source=${rede}&utm_medium=social&utm_campaign=afiliado`
      : `${urlBase}?utm_source=${rede}&utm_medium=social`;
    const urlEnc = encodeURIComponent(urlPartilha);
    const texto = encodeURIComponent(`${peca.nome} — Nora Grei | Aluga peças exclusivas de moda`);
    const links = {
      whatsapp: `https://wa.me/?text=${texto}%20${urlEnc}`,
      instagram: null, // Instagram não suporta partilha directa via URL — copia link
      tiktok: null,    // TikTok igual — copia link
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`,
      link: null,
    };
    if (rede === "link" || rede === "instagram" || rede === "tiktok") {
      navigator.clipboard.writeText(urlPartilha);
      setPartilhado(true);
      setTimeout(() => setPartilhado(false), 2500);
    } else if (links[rede]) {
      window.open(links[rede], "_blank");
    }
  };

  const t = TRADUCOES[lang] || TRADUCOES.pt;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',color:'#888',textTransform:'uppercase'}}>
      {t.carregando}
    </div>
  );

  if (!peca) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",gap:'1rem'}}>
      <p style={{fontSize:'0.85rem',color:'#888'}}>{t.naoEncontrada}</p>
      <a href="/catalogo" style={{fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#080808'}}>{t.voltarCatalogo}</a>
    </div>
  );

  const fotos = peca.fotos?.filter(f => f)?.length > 0 ? peca.fotos.filter(f => f) : [null];
  const tamanhosDisponiveis = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0) || [];
  const tamanhosSemStock = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel === 0) || [];
  const disponivel = tamanhosDisponiveis.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--white);font-family:var(--sans);-webkit-font-smoothing:antialiased;color:var(--black)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:#3a3835;text-decoration:none;transition:color 0.2s}
        .nav-back:hover{color:var(--black)}
        .layout{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;padding-top:72px}
        .fotos{position:sticky;top:72px;height:calc(100vh - 72px);display:flex;flex-direction:column;gap:0.5rem;padding:1.5rem;background:var(--g1)}
        .foto-main{flex:1;overflow:hidden;position:relative}
        .foto-main img{width:100%;height:100%;object-fit:contain;background:var(--g1)}
        .foto-counter{position:absolute;top:1rem;right:1rem;background:rgba(8,8,8,0.6);color:#fff;font-size:0.65rem;letter-spacing:0.1em;padding:0.3rem 0.6rem;font-family:var(--sans)}
        .foto-placeholder{width:100%;height:100%;background:linear-gradient(160deg,#e8e4e0,#d5d0c8);display:flex;align-items:center;justify-content:center}
        .fotos-thumb{display:flex;gap:0.5rem;height:80px;overflow-x:auto}
        .thumb{flex-shrink:0;width:80px;cursor:pointer;overflow:hidden;opacity:0.5;transition:opacity 0.2s;border:2px solid transparent}
        .thumb.active{opacity:1;border-color:var(--black)}
        .thumb img{width:100%;height:100%;object-fit:cover}
        .info{padding:3rem;overflow-y:auto}
        .badge-cat{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#aaa89f;margin-bottom:0.5rem}
        .nome{font-family:var(--sans);font-size:clamp(1.6rem,3vw,2.5rem);font-weight:600;line-height:1.1;margin-bottom:1rem}
        .preco-row{display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.75rem}
        .preco-val{font-family:var(--sans);font-size:2rem;font-weight:600}
        .preco-unit{font-size:0.85rem;color:#aaa89f;letter-spacing:0.08em}
        .badge-estado{display:inline-block;font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;padding:0.35rem 0.85rem;margin-bottom:1.25rem}
        .secao{margin-bottom:1.75rem}
        .secao-label{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem;font-weight:500}
        .tamanhos-grid{display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-start}
        .tam-wrap{display:flex;flex-direction:column;align-items:center;gap:0.3rem}
        .tam-btn{padding:0.6rem 1.1rem;font-size:0.85rem;letter-spacing:0.06em;font-family:var(--sans);border:1.5px solid var(--g2);background:var(--white);cursor:pointer;transition:all 0.2s;min-height:44px}
        .tam-btn:hover{border-color:var(--black)}
        .tam-btn.active{background:#c4748a;color:#fff;border-color:#c4748a}
        .tam-btn.sem-stock{opacity:0.4;cursor:not-allowed;text-decoration:line-through}
        .tam-data{font-size:0.68rem;color:var(--rosa);letter-spacing:0.06em;text-transform:uppercase}
        .tam-reservar{font-size:0.68rem;color:#5a5855;letter-spacing:0.06em;text-transform:uppercase;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:var(--sans);padding:0}
        .tam-reservar:hover{color:var(--black)}
        .ocasioes-wrap{display:flex;gap:0.4rem;flex-wrap:wrap}
        .ocasiao-tag{font-size:0.78rem;letter-spacing:0.06em;padding:0.4rem 0.8rem;background:var(--g1);color:#5a5855;border:1px solid var(--g2)}
        .sep{border:none;border-top:1px solid var(--g2);margin:1.5rem 0}
        .info-row{display:flex;justify-content:space-between;align-items:center;padding:0.7rem 0;border-bottom:1px solid var(--g1);font-size:0.92rem}
        .info-key{color:#5a5855;font-size:0.78rem;letter-spacing:0.08em}
        .deposito-box{background:var(--g1);padding:1rem 1.25rem;margin-bottom:1.5rem;border-left:3px solid var(--g2)}
        .deposito-val{font-family:var(--sans);font-size:1.5rem;font-weight:500}
        .deposito-desc{font-size:0.82rem;color:#5a5855;margin-top:0.2rem}
        .btn-alugar{width:100%;padding:1.1rem;background:#c4748a;color:#fff;border:none;font-size:0.82rem;letter-spacing:0.16em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:background 0.2s}
        .btn-alugar:hover{background:#b5637a}
        .btn-alugar:disabled{background:#ccc;cursor:not-allowed}
        .btn-cesto{width:100%;padding:0.9rem;background:var(--white);color:var(--black);border:1.5px solid var(--black);font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.4rem}
        .btn-cesto:hover{background:var(--g1)}
        .btn-cesto:disabled{opacity:0.4;cursor:not-allowed}
        .btn-reservar{width:100%;padding:1rem;background:var(--white);color:var(--black);border:1.5px solid var(--g2);font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:border-color 0.2s;text-decoration:none;display:block;text-align:center;margin-bottom:0.75rem}
        .btn-reservar:hover{border-color:var(--black)}
        .btn-comprar{width:100%;padding:1rem;background:var(--rosa);color:var(--white);border:none;font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-decoration:none;display:block;text-align:center;transition:background 0.2s}
        .btn-comprar:hover{background:#a85c72}
        .btn-contactar{width:100%;padding:1rem;background:var(--white);color:var(--black);border:1.5px solid var(--black);font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s;margin-top:0.75rem}
        .btn-contactar:hover{background:var(--black);color:var(--white)}
        .btn-contactar:disabled{opacity:0.5;cursor:not-allowed}
        .descricao{font-size:1rem;line-height:1.75;color:#3a3835}
        .partilha{display:flex;gap:0.5rem;align-items:center;margin-top:1.5rem}
        .partilha-label{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;margin-right:0.25rem}
        .partilha-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--g2);background:var(--white);cursor:pointer;font-size:1rem;transition:all 0.2s;text-decoration:none;color:var(--black)}
        .partilha-btn:hover{border-color:var(--black);background:var(--g1)}
        /* Sticky CTA bar para mobile */
        .sticky-cta{display:none}
        @media(max-width:768px){
          .nav{padding:0.85rem 1rem}
          .nav-logo{font-size:1rem}
          .layout{grid-template-columns:1fr;padding-top:56px;padding-bottom:calc(80px + 72px + env(safe-area-inset-bottom))}
          .fotos{position:static;height:auto;padding:0}
          .foto-main{height:88vw;max-height:520px}
          .fotos-thumb{height:60px;padding:0.5rem 0.75rem}
          .thumb{width:60px}
          .info{padding:1.25rem 1rem 1.5rem}
          .nome{font-size:clamp(1.75rem,6vw,2.4rem)}
          .preco-val{font-size:1.6rem}
          /* Esconde botões inline no mobile — serão substituídos pelo sticky */
          .btn-alugar,.btn-reservar,.btn-comprar,.btn-contactar{display:none}
          /* Sticky CTA fixo no fundo — acima da bottom nav (bnav z-index:200) */
          .sticky-cta{
            display:flex;
            position:fixed;
            bottom:calc(64px + env(safe-area-inset-bottom));
            left:0;right:0;
            z-index:201;
            background:rgba(248,247,245,0.97);
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            border-top:1px solid #e2dfda;
            padding:0.6rem 0.75rem;
            gap:0.5rem;
            align-items:center;
          }
          .sticky-preco{
            display:flex;flex-direction:column;flex-shrink:0;
          }
          .sticky-preco-val{font-family:var(--sans);font-size:1.4rem;font-weight:600;line-height:1;color:#080808}
          .sticky-preco-unit{font-family:'Jost',sans-serif;font-size:0.55rem;color:#b0ada6;letter-spacing:0.08em}
          .sticky-btn-alugar{
            flex:2;min-height:52px;
            background:#c4748a;color:#fff;
            border:none;
            font-family:'Jost',sans-serif;font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            text-decoration:none;
            padding:0 0.75rem;
          }
          .sticky-btn-alugar:disabled{background:#c5c2be;cursor:not-allowed}
          .sticky-btn-cesto{
            width:52px;min-height:52px;flex-shrink:0;
            background:var(--white);border:1.5px solid var(--black);
            font-size:1.2rem;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
          }
          .sticky-btn-cesto:disabled{opacity:0.4;cursor:not-allowed}
          .sticky-btn-comprar{
            flex:1;min-height:52px;
            background:#c4748a;color:#fff;
            border:none;
            font-family:'Jost',sans-serif;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            text-decoration:none;
            padding:0 0.6rem;
            white-space:nowrap;
          }
          .sticky-btn-contactar{
            flex:1;min-height:52px;
            background:var(--white);color:var(--black);
            border:1.5px solid var(--black);
            font-family:'Jost',sans-serif;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;gap:0.35rem;
            padding:0 0.6rem;
            white-space:nowrap;
          }
          .deposito-box{margin-bottom:1rem}
          .partilha{margin-top:1rem}
          .secao{margin-bottom:1.25rem}
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/catalogo" className="nav-back">{t.voltar}</a>
      </nav>

      <div className="layout">
        <div className="fotos">
          <div className="foto-main">
            {fotos[fotoAtiva] ? (
              <img src={fotos[fotoAtiva]} alt={peca.nome} />
            ) : (
              <div className="foto-placeholder">
                <span style={{fontFamily:'var(--sans)',fontSize:'2rem',fontWeight:300,color:'rgba(0,0,0,0.08)'}}>NG</span>
              </div>
            )}
            {fotos.length > 1 && (
              <div className="foto-counter">{fotoAtiva + 1}/{fotos.length}</div>
            )}
          </div>
          {fotos.length > 1 && (
            <div className="fotos-thumb">
              {fotos.map((f, i) => (
                <div key={i} className={`thumb${fotoAtiva === i ? " active" : ""}`} onClick={() => setFotoAtiva(i)}>
                  {f ? <img src={f} alt="" /> : <div style={{width:'100%',height:'100%',background:'var(--g2)'}}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info">
          {peca.categorias?.nome && <p className="badge-cat">{(CATEGORIAS_I18N[lang] || CATEGORIAS_I18N.pt)[peca.categorias.nome] || peca.categorias.nome}</p>}
          <h1 className="nome">{peca.nome}</h1>

          <div className="preco-row">
            {peca.preco_aluguer_dia > 0 ? <>
              <span className="preco-val">{peca.preco_aluguer_dia}€</span>
              <span className="preco-unit">{t.porcDia}</span>
            </> : peca.preco_avulso > 0 ? <>
              <span className="preco-val">{peca.preco_avulso}€</span>
              <span className="preco-unit" style={{fontSize:"0.72rem",letterSpacing:"0.1em"}}>venda usada</span>
            </> : null}
          </div>

          {peca.valor_peca > 0 && peca.preco_aluguer_dia > 0 && (() => {
            const economia = Math.round((1 - peca.preco_aluguer_dia / peca.valor_peca) * 100);
            return (
              <div style={{background:'linear-gradient(135deg,#1a2e22 0%,#2d4a38 100%)',borderRadius:'10px',padding:'0.75rem 1rem',margin:'0.5rem 0 1rem',display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                <span style={{fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#c4a882',fontWeight:700,whiteSpace:'nowrap'}}>{t.pecaNova}: {peca.valor_peca}€</span>
                <span style={{color:'#c4a882',fontSize:'0.8rem'}}>→</span>
                <span style={{fontSize:'0.85rem',color:'#fff',fontWeight:400}}>{t.alugaPor} <strong style={{color:'#c4a882',fontWeight:700}}>{peca.preco_aluguer_dia}€{t.porcDia}</strong></span>
                <span style={{marginLeft:'auto',background:'#3a7a52',color:'#f0f5f2',borderRadius:'4px',padding:'0.2rem 0.6rem',fontSize:'0.75rem',fontWeight:800,letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{economia}% {t.economia}</span>
              </div>
            );
          })()}

          <span className="badge-estado" style={{background:disponivel?'#e8f5e9':'#f0eeeb',color:disponivel?'#27ae60':'#5a5855'}}>
            {disponivel ? t.disponivel : t.indisponivel}
          </span>

          {!disponivel && dataFimTimer && <Timer dataFim={dataFimTimer} lang={lang} />}

          {peca.stock_tamanhos?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.tamanho}</p>
              <div className="tamanhos-grid">
                {tamanhosDisponiveis.map(s => (
                  <div key={s.id} className="tam-wrap">
                    <button className={`tam-btn${tamanhoSelecionado === s.id ? " active" : ""}`} onClick={() => setTamanhoSelecionado(s.id)}>
                      {s.tamanho}
                    </button>
                  </div>
                ))}
                {tamanhosSemStock.map(s => {
                  const dataDisp = datasPorTamanho[s.id];
                  const dataStr = dataDisp ? dataDisp.toLocaleDateString("pt-PT", { day:"numeric", month:"short" }) : null;
                  return (
                    <div key={s.id} className="tam-wrap">
                      <button className="tam-btn sem-stock" disabled>{s.tamanho}</button>
                      {dataStr && <span className="tam-data">{t.livreEm} {dataStr}</span>}
                      <a href={`/reserva?peca=${id}&tamanhoNome=${s.tamanho}`} className="tam-reservar">{t.reservarTamanho}</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {peca.ocasioes?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.ocasioes}</p>
              <div className="ocasioes-wrap">
                {peca.ocasioes.map(o => <span key={o} className="ocasiao-tag">{(OCASIOES_I18N[lang] || OCASIOES_I18N.pt)[o] || o}</span>)}
              </div>
            </div>
          )}

          <div className="deposito-box">
            <p className="secao-label">{t.deposito}</p>
            {peca.valor_peca > 0 && peca.preco_aluguer_dia > 0 ? (() => {
              const nv = NIVEL(totalAlugueres, lang);
              const caucaoValor = calcularCaucaoRoi(peca.valor_peca, peca.preco_aluguer_dia, totalAlugueres, nv);
              const caucaoSemNivel = calcularCaucaoRoi(peca.valor_peca, peca.preco_aluguer_dia, 0, NIVEL(0, lang));
              const temDesconto = caucaoValor < caucaoSemNivel;
              // Barra de progresso: quanto já se gerou de receita vs valor peça
              const diasMedios = 3, receitaGerada = Math.min(totalAlugueres * peca.preco_aluguer_dia * diasMedios, peca.valor_peca);
              const pctRoi = Math.min(100, Math.round((receitaGerada / peca.valor_peca) * 100));
              return (
                <>
                  <p className="deposito-val">{caucaoValor}€ <span style={{ fontSize: "0.72rem", fontFamily: "var(--sans)", fontWeight: 300, color: nv.cor }}>{nv.icon} {nv.nome}</span></p>
                  {temDesconto && <p style={{ fontSize: "0.72rem", color: "#95a5a6", textDecoration: "line-through", marginBottom:"0.25rem" }}>{caucaoSemNivel}€ {t.semHistorico}</p>}
                  {totalAlugueres > 0 && (
                    <div style={{ margin:"0.4rem 0 0.25rem" }}>
                      <div style={{ height:"4px", background:"#e8e4df", borderRadius:"2px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pctRoi}%`, background:"#c4a882", borderRadius:"2px", transition:"width 0.5s" }} />
                      </div>
                      <p style={{ fontSize:"0.75rem", color:"#9c9894", marginTop:"0.2rem" }}>{pctRoi}{t.roiRecuperado}</p>
                    </div>
                  )}
                  <p className="deposito-desc">{t.depositoDesc}</p>
                </>
              );
            })() : (
              <>
                <p className="deposito-val">{peca.valor_peca ? `${peca.valor_peca}€` : "—"}</p>
                <p className="deposito-desc">{t.depositoDesc}</p>
              </>
            )}
          </div>

          {/* BLOCO DE AÇÕES — 3 opções */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.25rem" }}>

            {/* 1. ALUGAR POR DIA */}
            {peca.preco_aluguer_dia > 0 && (disponivel ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                <button className="btn-alugar" onClick={irParaCheckout} disabled={!tamanhoSelecionado}>
                  {tamanhoSelecionado ? t.alugar : t.semTamanho}
                </button>
                <button className="btn-cesto" onClick={adicionarAoCesto} disabled={!tamanhoSelecionado}>
                  🛍 {tamanhoSelecionado ? t.adicionarCesto : t.semTamanho}
                </button>
              </div>
            ) : (
              <a href={`/reserva?peca=${id}`} className="btn-reservar">{t.reservar}</a>
            ))}

            {/* 2. COMPRAR USADA */}
            {peca.preco_avulso > 0 && (
              <a href={`/checkout?peca=${id}&modo=comprar_usada`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.8rem 1rem", border:"1.5px solid #080808", background:"#fff", color:"#080808", textDecoration:"none", fontFamily:"var(--sans)", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#080808";e.currentTarget.style.color="#fff";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#080808";}}>
                <div>
                  <div style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:600, marginBottom:"0.1rem" }}>Comprar peça usada</div>
                  <div style={{ fontSize:"0.75rem", opacity:0.6 }}>Peça de segunda mão em bom estado</div>
                </div>
                <span style={{ fontSize:"1.15rem", fontWeight:600, fontFamily:"var(--sans)", whiteSpace:"nowrap" }}>{peca.preco_avulso}€</span>
              </a>
            )}

            {/* 3. COMPRAR NOVA */}
            {peca.valor_peca > 0 && (
              <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.8rem 1rem", border:"1.5px solid #c4a882", background:"#faf8f5", color:"#1a1a1a", textDecoration:"none", fontFamily:"var(--sans)", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#f5eaed";e.currentTarget.style.borderColor="#c4748a";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#faf8f5";e.currentTarget.style.borderColor="#c4a882";}}>
                <div>
                  <div style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:600, color:"#c4a882", marginBottom:"0.1rem" }}>Comprar nova</div>
                  <div style={{ fontSize:"0.75rem", color:"#888580" }}>noragrei.com ↗</div>
                </div>
                <span style={{ fontSize:"1.15rem", fontWeight:600, fontFamily:"var(--sans)", whiteSpace:"nowrap", color:"#c4a882" }}>{peca.valor_peca}€</span>
              </a>
            )}

          </div>

          <button
            className="btn-contactar"
            onClick={contactarLojista}
            disabled={contactando}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {contactando ? t.contactarLoading : (userLogado ? t.contactar : t.contactarEntrar)}
          </button>

          <hr className="sep" />

          {/* BANNER CONSELHO STYLIST */}
          {(() => {
            const conselho = peca.conselho_stylist || (() => {
              const mat = peca.material || "";
              const ocs = peca.ocasioes || [];
              const ocsI18n = ocs.map(o => (OCASIOES_I18N[lang] || OCASIOES_I18N.pt)[o] || o);
              const ocsList = ocsI18n.slice(0,2).join(lang === "fr" ? " et " : lang === "lt" ? " ir " : " e ");
              if (ocs.includes("Casamento") || ocs.includes("Gala")) {
                if (lang === "fr") return `Parfaite pour les occasions formelles.${mat ? ` Le ${mat.toLowerCase()} garantit élégance et confort tout au long de la cérémonie.` : " Idéale pour les cérémonies et les galas."}`;
                if (lang === "lt") return `Puikiai tinka formalioms progoms.${mat ? ` ${mat} užtikrina eleganciją ir patogumą visą ceremoniją.` : " Ideali ceremonijoms ir galos vakarėliams."}`;
                return `Perfeita para ocasiões formais.${mat ? ` O ${mat.toLowerCase()} garante elegância e conforto durante toda a cerimónia.` : " Ideal para cerimónias e eventos de gala."}`;
              }
              if (ocs.includes("Praia") || ocs.includes("Férias")) {
                if (lang === "fr") return `Un choix léger et décontracté pour ${ocsList.toLowerCase()}.${mat ? ` Le ${mat.toLowerCase()} est idéal pour les journées chaudes.` : ""}`;
                if (lang === "lt") return `Lengvas ir laisvalaikiškas pasirinkimas ${ocsList.toLowerCase()}.${mat ? ` ${mat} puikiai tinka karštoms dienoms.` : ""}`;
                return `Uma escolha leve e descontraída para ${ocsList.toLowerCase()}.${mat ? ` O ${mat.toLowerCase()} é ideal para dias quentes.` : ""}`;
              }
              if (ocs.includes("Trabalho")) {
                if (lang === "fr") return `Sophistiquée et polyvalente pour le quotidien professionnel.${mat ? ` En ${mat.toLowerCase()}, elle reste impeccable toute la journée.` : ""}`;
                if (lang === "lt") return `Rafinuotas ir universalus pasirinkimas kasdieniam darbui.${mat ? ` ${mat} — puikiai atrodo visą dieną.` : ""}`;
                return `Sofisticada e versátil para o dia a dia profissional.${mat ? ` Em ${mat.toLowerCase()}, mantém-se impecável ao longo do dia.` : ""}`;
              }
              if (ocs.includes("Festa") || ocs.includes("Cocktail")) {
                if (lang === "fr") return `Un choix infaillible pour ${ocsList.toLowerCase()}.${mat ? ` Le ${mat.toLowerCase()} crée un look sophistiqué sans effort.` : " Vous brillerez par votre élégance."}`;
                if (lang === "lt") return `Nepralenksimas pasirinkimas ${ocsList.toLowerCase()}.${mat ? ` ${mat} sukuria rafinuotą įvaizdį be pastangų.` : " Išsiskirsite elegancija."}`;
                return `Uma escolha infalível para ${ocsList.toLowerCase()}.${mat ? ` O ${mat.toLowerCase()} cria um look sofisticado sem esforço.` : " Vai destacar-se pela elegância."}`;
              }
              if (ocsList) {
                if (lang === "fr") return `Idéale pour ${ocsList.toLowerCase()}.${mat ? ` En ${mat.toLowerCase()}, confortable et élégante.` : " Une pièce polyvalente pour diverses occasions."}`;
                if (lang === "lt") return `Idealu ${ocsList.toLowerCase()}.${mat ? ` ${mat} — patogi ir elegantiška.` : " Universali detalė įvairioms progoms."}`;
                return `Ideal para ${ocsList.toLowerCase()}.${mat ? ` Em ${mat.toLowerCase()}, confortável e elegante.` : " Uma peça versátil para várias ocasiões."}`;
              }
              if (lang === "fr") return `Une pièce soigneusement sélectionnée par Nora Grei.${mat ? ` En ${mat.toLowerCase()}, avec une touche de sophistication.` : ""}`;
              if (lang === "lt") return `Kruopščiai Nora Grei atrinktas drabužis.${mat ? ` ${mat} — su rafinuotu akcentu.` : ""}`;
              return `Uma peça cuidadosamente selecionada pela Nora Grei.${mat ? ` Em ${mat.toLowerCase()}, com um toque de sofisticação.` : ""}`;
            })();
            return conselho ? (
              <div style={{ background:"#f9f6f2", borderLeft:"3px solid #c4748a", padding:"0.85rem 1rem", marginBottom:"1.25rem", display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
                <span style={{ fontSize:"1.1rem", flexShrink:0 }}>✨</span>
                <div>
                  <p style={{ fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#c4748a", fontWeight:600, marginBottom:"0.3rem", fontFamily:"var(--sans)" }}>{t.notaStylist}</p>
                  <p style={{ fontSize:"0.85rem", color:"#3f3e3c", lineHeight:1.55, margin:0, fontFamily:"var(--sans)" }}>{conselho}</p>
                </div>
              </div>
            ) : null;
          })()}

          {peca.descricao && (
            <div className="secao">
              <p className="secao-label">{t.descricao}</p>
              <p className="descricao">{peca.descricao}</p>
            </div>
          )}

          <div style={{marginBottom:'1.5rem'}}>
            {peca.material && <div className="info-row"><span className="info-key">{t.material}</span><span>{peca.material}</span></div>}
            {peca.origem && <div className="info-row"><span className="info-key">{t.origem}</span><span>{peca.origem}</span></div>}
            {peca.categorias?.nome && <div className="info-row"><span className="info-key">{t.categoria}</span><span>{(CATEGORIAS_I18N[lang] || CATEGORIAS_I18N.pt)[peca.categorias.nome] || peca.categorias.nome}</span></div>}
          </div>

          {/* WISHLIST */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"none", border:`1.5px solid ${naWishlist ? "#c4748a" : "#e2dfda"}`, padding:"0.65rem 1.25rem", width:"100%", justifyContent:"center", cursor:"pointer", fontFamily:"var(--sans)", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color: naWishlist ? "#c4748a" : "#5a5855", marginBottom:"1rem", transition:"all 0.2s" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={naWishlist ? "#c4748a" : "none"} stroke={naWishlist ? "#c4748a" : "#5a5855"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {naWishlist ? t.guardado : t.guardarDepois}
          </button>

          <div className="partilha">
            <span className="partilha-label">{t.partilhar}</span>
            <button className="partilha-btn" onClick={() => partilhar("whatsapp")} title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.858L.057 23.998l6.305-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.64-.516-5.14-1.41l-.368-.218-3.812 1 1.021-3.727-.239-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("facebook")} title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("instagram")} title="Copiar link para Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("tiktok")} title="Copiar link para TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("link")} title="Copiar link">
              {partilhado
                ? <span style={{fontSize:"0.75rem",color:"#27ae60",fontWeight:600,letterSpacing:"0.05em"}}>✓</span>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              }
            </button>
          </div>
          {partilhado && <p style={{fontSize:"0.7rem",color:"#27ae60",marginTop:"0.35rem"}}>{t.linkCopiado}</p>}

          {/* AVALIAÇÕES */}
          <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid var(--g2)'}}>
            <p style={{fontSize:'0.72rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'#5a5855',marginBottom:'1rem',fontWeight:600}}>{t.avaliacoes}</p>
            {avaliacoesPeca.length === 0 ? (
              <p style={{fontSize:'0.85rem',color:'#9c9894',fontStyle:'italic'}}>{t.semAvaliacoes}</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {avaliacoesPeca.map((av, idx) => (
                  <div key={idx} style={{padding:'1rem',background:'var(--g1)',borderLeft:'3px solid #c4748a'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.4rem'}}>
                      <div style={{display:'flex',gap:'0.15rem'}}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{fontSize:'1rem',color:s <= av.nota_cliente_empresa ? '#c4748a' : '#e2dfda'}}>★</span>
                        ))}
                      </div>
                      <span style={{fontSize:'0.75rem',color:'#9c9894'}}>{av.clientes?.nome || t.anonimo}</span>
                    </div>
                    {av.comentario_cliente && (
                      <p style={{fontSize:'0.85rem',color:'#3f3e3c',fontStyle:'italic',lineHeight:1.6}}>"{av.comentario_cliente}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="/catalogo" style={{display:'block',textAlign:'center',fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#5a5855',marginTop:'2rem',textDecoration:'none',paddingTop:'1rem',borderTop:'1px solid var(--g2)'}}>
            {t.verCatalogo} →
          </a>
        </div>
      </div>

      {/* STICKY CTA — apenas visível no mobile via CSS */}
      <div className="sticky-cta">
        <div className="sticky-preco">
          {peca.preco_aluguer_dia > 0 ? <>
            <span className="sticky-preco-val">{peca.preco_aluguer_dia}€</span>
            <span className="sticky-preco-unit">{t.porcDia}</span>
          </> : peca.preco_avulso > 0 ? <>
            <span className="sticky-preco-val">{peca.preco_avulso}€</span>
            <span className="sticky-preco-unit">/{t.porOcasiao.toLowerCase()}</span>
          </> : null}
        </div>
        {disponivel ? (
          <>
            <button
              className="sticky-btn-alugar"
              onClick={irParaCheckout}
              disabled={!tamanhoSelecionado}
            >
              {tamanhoSelecionado ? t.alugar2 : t.tamanho2}
            </button>
            <button
              className="sticky-btn-cesto"
              onClick={adicionarAoCesto}
              disabled={!tamanhoSelecionado}
              title={t.adicionarCesto}
            >
              🛍
            </button>
          </>
        ) : (
          <a href={`/reserva?peca=${id}`} className="sticky-btn-alugar">
            {t.reservar2}
          </a>
        )}
        <button
          className="sticky-btn-contactar"
          onClick={contactarLojista}
          disabled={contactando}
          title={t.contactar}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Chat
        </button>
      </div>
    </>
  );
}