"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

const OCASIOES_I18N = {
  pt: { "Casamento":"Casamento","Gala":"Gala","Cocktail":"Cocktail","Festa":"Festa","Trabalho":"Trabalho","Dia a dia":"Dia a dia","Jantar":"Jantar","Férias":"Férias","Praia":"Praia","Praia/Férias":"Praia/Férias" },
  fr: { "Casamento":"Mariage","Gala":"Gala","Cocktail":"Cocktail","Festa":"Fête","Trabalho":"Travail","Dia a dia":"Quotidien","Jantar":"Dîner","Férias":"Vacances","Praia":"Plage","Praia/Férias":"Plage/Vacances" },
  lt: { "Casamento":"Vestuvės","Gala":"Gala","Cocktail":"Kokteilis","Festa":"Šventė","Trabalho":"Darbas","Dia a dia":"Kasdien","Jantar":"Vakarienė","Férias":"Atostogos","Praia":"Paplūdimys","Praia/Férias":"Paplūdimys/Atostogos" },
};

const NIVEL_NOMES = {
  pt: { platina:"Platina", ouro:"Ouro", prata:"Prata", bronze:"Bronze" },
  fr: { platina:"Platine", ouro:"Or", prata:"Argent", bronze:"Bronze" },
  lt: { platina:"Platina", ouro:"Auksas", prata:"Sidabras", bronze:"Bronze" },
};
const NIVEL = (n, lang = "pt") => {
  const nm = NIVEL_NOMES[lang] || NIVEL_NOMES.pt;
  if (n >= 20) return { nome: nm.platina, icon: "💎", descCaucao: 80, cor: "#6c5ce7" };
  if (n >= 10) return { nome: nm.ouro,    icon: "🥇", descCaucao: 60, cor: "#f39c12" };
  if (n >= 5)  return { nome: nm.prata,   icon: "🥈", descCaucao: 40, cor: "#95a5a6" };
  return             { nome: nm.bronze,   icon: "🥉", descCaucao: 0,  cor: "#cd7f32" };
};
const calcularCaucaoRoi = (valorPeca, precoDia, totalAlugueres, nv) => {
  if (!valorPeca || valorPeca <= 0) return 0;
  const diasMedios = 3, aluguersMes = 4;
  const receitaJaGerada = totalAlugueres * precoDia * diasMedios;
  const valorResidual = Math.max(0, valorPeca - receitaJaGerada);
  const caucaoBase = Math.min(valorResidual / 3, valorResidual * 0.4);
  const caucao = Math.round(caucaoBase * (1 - nv.descCaucao / 100));
  return Math.max(Math.round(valorPeca * 0.05), caucao);
};

const t = {
  pt: {
    pecaNaoEncontrada: "Peça não encontrada.",
    tamanho: "Tamanho",
    dispEmBreve: "Disponível em breve",
    dispEm: "Disponível em",
    livreEm: "livre em",
    reservarTamanho: "reservar",
    garantirReserva: "Reservar quando disponível",
    comprar: "Comprar",
    reservarAlugar: "Reservar / Alugar",
    alugar: "Alugar agora",
    reservar: "Reservar quando disponível",
    adicionarCesto: "Adicionar ao cesto",
    partilhar: "Partilhar",
    estaPeca: "Esta peça",
    aLojaToda: "A loja toda",
    linkCopiado: "✓ Link copiado!",
    instagramTitle: "Copia o link e partilha no Instagram",
    preco: (p) => `${p}€ / dia`,
    precoCompra: (p) => `Compra: ${p}€`,
    disponivel: "Disponível",
    indisponivel: "Indisponível",
    deposito: "Depósito de caução",
    depositoDesc: "Devolvido no final do aluguer",
    semHistorico: "sem histórico",
    roiRecuperado: "% do valor da peça recuperado",
    pecaNova: "Peça nova",
    alugaPor: "Aluga por apenas",
    porcDia: "/dia",
    economia: "de economia",
    comprarNova: "Comprar nova",
    notaStylist: "Nota da stylist",
    ocasioes: "Ocasiões",
    material: "Material",
    origem: "Origem",
    descricao: "Descrição",
    avaliacoes: "Avaliações",
    semAvaliacoes: "Ainda sem avaliações.",
    anonimo: "Cliente",
    guardado: "Guardado ♥",
    guardarDepois: "Guardar para depois",
    semTamanho: "Seleciona um tamanho",
    alugar2: "Alugar",
    reservar2: "Reservar",
    contactar: "Falar com o lojista",
    contactarLoading: "A abrir...",
    contactarEntrar: "Entra para contactar",
    carregando: "A carregar...",
    voltar: "← Loja",
    porOcasiao: "Por ocasião",
  },
  fr: {
    pecaNaoEncontrada: "Pièce introuvable.",
    tamanho: "Taille",
    dispEmBreve: "Disponible bientôt",
    dispEm: "Disponible le",
    livreEm: "libre le",
    reservarTamanho: "réserver",
    garantirReserva: "Réserver quand disponible",
    comprar: "Acheter",
    reservarAlugar: "Réserver / Louer",
    alugar: "Louer maintenant",
    reservar: "Réserver quand disponible",
    adicionarCesto: "Ajouter au panier",
    partilhar: "Partager",
    estaPeca: "Cette pièce",
    aLojaToda: "Toute la boutique",
    linkCopiado: "✓ Lien copié !",
    instagramTitle: "Copiez le lien et partagez sur Instagram",
    preco: (p) => `${p}€ / jour`,
    precoCompra: (p) => `Achat : ${p}€`,
    disponivel: "Disponible",
    indisponivel: "Indisponible",
    deposito: "Dépôt de garantie",
    depositoDesc: "Remboursé à la fin de la location",
    semHistorico: "sans historique",
    roiRecuperado: "% de la valeur récupérée",
    pecaNova: "Pièce neuve",
    alugaPor: "Loue pour seulement",
    porcDia: "/jour",
    economia: "d'économie",
    comprarNova: "Acheter neuf",
    notaStylist: "Note de la styliste",
    ocasioes: "Occasions",
    material: "Matière",
    origem: "Origine",
    descricao: "Description",
    avaliacoes: "Avis",
    semAvaliacoes: "Pas encore d'avis.",
    anonimo: "Client",
    guardado: "Sauvegardé ♥",
    guardarDepois: "Sauvegarder pour plus tard",
    semTamanho: "Sélectionne une taille",
    alugar2: "Louer",
    reservar2: "Réserver",
    contactar: "Contacter le vendeur",
    contactarLoading: "Ouverture...",
    contactarEntrar: "Connectez-vous pour contacter",
    carregando: "Chargement...",
    voltar: "← Boutique",
    porOcasiao: "À l'occasion",
  },
  lt: {
    pecaNaoEncontrada: "Drabužis nerastas.",
    tamanho: "Dydis",
    dispEmBreve: "Greitai bus prieinama",
    dispEm: "Prieinama nuo",
    livreEm: "laisva",
    reservarTamanho: "rezervuoti",
    garantirReserva: "Rezervuoti kai bus prieinama",
    comprar: "Pirkti",
    reservarAlugar: "Rezervuoti / Nuomoti",
    alugar: "Nuomoti dabar",
    reservar: "Rezervuoti kai bus prieinama",
    adicionarCesto: "Į krepšelį",
    partilhar: "Dalintis",
    estaPeca: "Šis drabužis",
    aLojaToda: "Visa parduotuvė",
    linkCopiado: "✓ Nuoroda nukopijuota!",
    instagramTitle: "Nukopijuokite nuorodą ir pasidalinkite Instagram",
    preco: (p) => `${p}€ / dieną`,
    precoCompra: (p) => `Pirkti: ${p}€`,
    disponivel: "Prieinama",
    indisponivel: "Neprieinama",
    deposito: "Užstatas",
    depositoDesc: "Grąžinamas pabaigoje",
    semHistorico: "be istorijos",
    roiRecuperado: "% vertės susigrąžinta",
    pecaNova: "Nauja prekė",
    alugaPor: "Nuomok tik už",
    porcDia: "/d.",
    economia: "sutaupymas",
    comprarNova: "Pirkti naują",
    notaStylist: "Stilistės pastaba",
    ocasioes: "Progos",
    material: "Medžiaga",
    origem: "Kilmė",
    descricao: "Aprašymas",
    avaliacoes: "Atsiliepimai",
    semAvaliacoes: "Dar nėra atsiliepimų.",
    anonimo: "Klientas",
    guardado: "Išsaugota ♥",
    guardarDepois: "Išsaugoti vėlesniam",
    semTamanho: "Pasirink dydį",
    alugar2: "Nuomoti",
    reservar2: "Rezervuoti",
    contactar: "Susisiekti su pardavėju",
    contactarLoading: "Atidaroma...",
    contactarEntrar: "Prisijunkite norėdami susisiekti",
    carregando: "Kraunama...",
    voltar: "← Parduotuvė",
    porOcasiao: "Atskirai",
  },
};

function Timer({ dataFim, lang, labelOverride }) {
  const [tempo, setTempo] = useState("");
  const labels = { pt: "Disponível em", fr: "Disponible dans", lt: "Prieinama po" };
  useEffect(() => {
    if (!dataFim) return;
    const calc = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTempo(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [dataFim]);
  if (!tempo) return null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#fff8e1',padding:'0.75rem 1rem',marginBottom:'1rem',border:'1px solid #f39c12'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#f39c12',flexShrink:0,animation:'pulse 2s infinite'}}/>
      <span style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#e67e22',fontFamily:"'Jost',sans-serif"}}>
        {labelOverride || labels[lang] || labels.pt} <strong>{tempo}</strong>
      </span>
    </div>
  );
}

export default function PecaLojaPage() {
  const { codigo, id } = useParams();
  const [lang, setLang] = useState("pt");
  const [peca, setPeca] = useState(null);
  const [lojista, setLojista] = useState(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [loading, setLoading] = useState(true);
  const [partilhado, setPartilhado] = useState(false);
  const [dataFimTimer, setDataFimTimer] = useState(null);
  const [datasPorTamanho, setDatasPorTamanho] = useState({});
  const [userLogado, setUserLogado] = useState(null);
  const [totalAlugueres, setTotalAlugueres] = useState(0);
  const [naWishlist, setNaWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [contactando, setContactando] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ng_lang") : null;
    if (saved && t[saved]) setLang(saved);
    if (codigo && id) carregarDados();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const u = data.session.user;
        setUserLogado(u);
        supabase.from("clientes").select("total_pecas_alugadas").eq("id", u.id).single()
          .then(({ data: cli }) => { if (cli) setTotalAlugueres(cli.total_pecas_alugadas || 0); });
      }
    });
  }, [codigo, id]);

  const carregarDados = async () => {
    // Lojista
    const { data: cli } = await supabase.from("clientes").select("id, nome, codigo_cliente").eq("codigo_cliente", codigo).maybeSingle();
    if (cli) setLojista(cli);

    // Peça com stock
    const { data } = await supabase.from("pecas_lojista")
      .select("*, stock_lojista(id, tamanho, quantidade_disponivel)")
      .eq("id", id).maybeSingle();

    if (data) {
      setPeca(data);
      const stockDisp = data.stock_lojista?.filter(s => s.quantidade_disponivel > 0) || [];
      if (stockDisp.length > 0) setTamanhoSelecionado(stockDisp[0].id);

      // Alugueres activos para datas de disponibilidade por tamanho
      const stockIds = (data.stock_lojista || []).map(s => s.id);
      if (stockIds.length > 0) {
        const { data: alAtivos } = await supabase.from("alugueres_lojista")
          .select("stock_lojista_id, data_fim, data_disponivel_novamente, estado")
          .in("stock_lojista_id", stockIds)
          .in("estado", ["pendente","confirmado","enviado","ativo"]);
        if (alAtivos && alAtivos.length > 0) {
          const mapa = {};
          let maisTarde = null;
          alAtivos.forEach(a => {
            const dataD = a.data_disponivel_novamente
              ? new Date(a.data_disponivel_novamente)
              : new Date(new Date(a.data_fim).getTime() + 3 * 86400000);
            if (!mapa[a.stock_lojista_id] || dataD > mapa[a.stock_lojista_id]) mapa[a.stock_lojista_id] = dataD;
            if (!maisTarde || dataD > maisTarde) maisTarde = dataD;
          });
          setDatasPorTamanho(mapa);
          if (maisTarde) setDataFimTimer(maisTarde.toISOString());
        }
      }

      // Avaliações desta peça via alugueres_lojista
      const { data: avs } = await supabase.from("avaliacoes_lojista").select("nota, comentario, created_at, clientes(nome)").eq("peca_lojista_id", id).order("created_at", { ascending: false });
      if (avs) setAvaliacoes(avs);
    }
    setLoading(false);
  };

  const toggleWishlist = async () => {
    if (!userLogado) { window.location.href = "/entrar"; return; }
    setWishlistLoading(true);
    // Wishlist para lojas usa peca_lojista_id
    if (naWishlist) {
      await supabase.from("wishlist_lojista").delete().eq("cliente_id", userLogado.id).eq("peca_lojista_id", id);
      setNaWishlist(false);
    } else {
      await supabase.from("wishlist_lojista").insert({ cliente_id: userLogado.id, peca_lojista_id: id });
      setNaWishlist(true);
    }
    setWishlistLoading(false);
  };

  const irParaCheckout = () => {
    if (!tamanhoSelecionado) return;
    window.location.href = `/loja/${codigo}/checkout?peca=${id}&tamanho=${tamanhoSelecionado}`;
  };

  const diasAluguer = dataInicio && dataFim ? Math.max(1, Math.ceil((new Date(dataFim) - new Date(dataInicio)) / 86400000)) : 0;
  const totalAluguer = diasAluguer && peca?.preco_aluguer_dia ? diasAluguer * peca.preco_aluguer_dia : 0;

  const adicionarAoCesto = () => {
    if (!tamanhoSelecionado) return;
    const stockSel = peca?.stock_lojista?.find(s => s.id === tamanhoSelecionado);
    let cesto = [];
    try { cesto = JSON.parse(localStorage.getItem("ng_cesto") || "[]"); } catch (_) {}
    const jaExiste = cesto.some(c => c.pecaId === id && c.stockId === tamanhoSelecionado);
    if (!jaExiste) {
      cesto.push({ pecaId: id, stockId: tamanhoSelecionado, tamanhoNome: stockSel?.tamanho || tamanhoSelecionado, pecaNome: peca?.nome, precoDia: peca?.preco_aluguer_dia, precoVenda: peca?.preco_venda, valorPeca: peca?.valor_peca || peca?.preco_venda, fotos: peca?.fotos, dataInicio: dataInicio || null, dataFim: dataFim || null, lojaCodigo: codigo, lojistaId: lojista?.id, lojistaNome: lojista?.nome, origem: "lojista" });
      localStorage.setItem("ng_cesto", JSON.stringify(cesto));
      window.dispatchEvent(new Event("cesto-atualizado"));
    }
    window.location.href = "/cesto";
  };

  const contactarLojista = async () => {
    if (!userLogado) { window.location.href = "/entrar"; return; }
    if (!lojista?.id) return;
    if (lojista.id === userLogado.id) return;
    setContactando(true);
    try {
      const { data: existente } = await supabase.from("conversas").select("id").eq("cliente_id", userLogado.id).eq("lojista_id", lojista.id).maybeSingle();
      if (!existente) await supabase.from("conversas").insert({ cliente_id: userLogado.id, lojista_id: lojista.id, assunto: peca?.nome });
      window.location.href = "/mensagens";
    } catch { setContactando(false); }
  };

  const partilhar = async (rede) => {
    const urlBase = window.location.href.split("?")[0];
    const urlPartilha = urlBase;
    const urlEnc = encodeURIComponent(urlPartilha);
    const texto = encodeURIComponent(`${peca?.nome} — ${lojista?.nome || "Nora Grei"}`);
    if (rede === "whatsapp") { window.open(`https://wa.me/?text=${texto}%20${urlEnc}`, "_blank"); return; }
    if (rede === "facebook") { window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`, "_blank"); return; }
    try { await navigator.clipboard.writeText(urlPartilha); } catch { }
    setPartilhado(true); setTimeout(() => setPartilhado(false), 2500);
  };

  const partilharLoja = async () => {
    const url = `${window.location.origin}/loja/${codigo}`;
    try { await navigator.clipboard.writeText(url); } catch { }
    setPartilhado(true); setTimeout(() => setPartilhado(false), 2500);
  };

  const i = t[lang] || t.pt;

  if (loading) return (<><style>{ESTILOS}</style><div className="loading">{i.carregando}</div></>);
  if (!peca) return (<><style>{ESTILOS}</style><div className="loading">{i.pecaNaoEncontrada}</div></>);

  const fotos = peca.fotos?.filter(f => f)?.length > 0 ? peca.fotos.filter(f => f) : [null];
  const stockDisponivel = peca.stock_lojista?.filter(s => s.quantidade_disponivel > 0) || [];
  const stockEsgotado = peca.stock_lojista?.filter(s => s.quantidade_disponivel === 0) || [];
  const disponivel = stockDisponivel.length > 0;
  const nv = NIVEL(totalAlugueres, lang);
  const caucaoValor = calcularCaucaoRoi(peca.valor_peca || peca.preco_venda || 0, peca.preco_aluguer_dia || 0, totalAlugueres, nv);
  const caucaoSemNivel = calcularCaucaoRoi(peca.valor_peca || peca.preco_venda || 0, peca.preco_aluguer_dia || 0, 0, NIVEL(0, lang));
  const temDesconto = caucaoValor < caucaoSemNivel;
  const receitaGerada = Math.min(totalAlugueres * (peca.preco_aluguer_dia || 0) * 3, peca.valor_peca || 0);
  const pctRoi = (peca.valor_peca || 0) > 0 ? Math.min(100, Math.round((receitaGerada / peca.valor_peca) * 100)) : 0;

  // Conselho stylist automático
  const gerarConselho = () => {
    const ocs = peca.ocasioes || [];
    const mat = peca.material || "";
    const ocsI18n = ocs.map(o => (OCASIOES_I18N[lang] || OCASIOES_I18N.pt)[o] || o);
    const lista = ocsI18n.slice(0, 2).join(lang === "fr" ? " et " : lang === "lt" ? " ir " : " e ");
    if (ocs.includes("Casamento") || ocs.includes("Gala")) {
      if (lang === "fr") return `Parfaite pour les occasions formelles.${mat ? ` Le ${mat.toLowerCase()} garantit élégance et confort.` : ""}`;
      if (lang === "lt") return `Puikiai tinka formalioms progoms.${mat ? ` ${mat} užtikrina eleganciją.` : ""}`;
      return `Perfeita para ocasiões formais.${mat ? ` O ${mat.toLowerCase()} garante elegância e conforto.` : ""}`;
    }
    if (ocs.includes("Festa") || ocs.includes("Cocktail")) {
      if (lang === "fr") return `Incontournable pour ${lista.toLowerCase()}.${mat ? ` Le ${mat.toLowerCase()} crée un look sophistiqué.` : ""}`;
      if (lang === "lt") return `Nepakeičiamas ${lista.toLowerCase()}.${mat ? ` ${mat} sukuria rafinuotą išvaizdą.` : ""}`;
      return `Uma escolha infalível para ${lista.toLowerCase()}.${mat ? ` O ${mat.toLowerCase()} cria um look sofisticado.` : ""}`;
    }
    if (lista) {
      if (lang === "fr") return `Idéale pour ${lista.toLowerCase()}.${mat ? ` En ${mat.toLowerCase()}, confortable et élégante.` : ""}`;
      if (lang === "lt") return `Idealu ${lista.toLowerCase()}.${mat ? ` ${mat} — patogi ir elegantiška.` : ""}`;
      return `Ideal para ${lista.toLowerCase()}.${mat ? ` Em ${mat.toLowerCase()}, confortável e elegante.` : ""}`;
    }
    return null;
  };
  const conselho = peca.conselho_stylist || gerarConselho();

  return (
    <>
      <style>{ESTILOS}</style>

      {/* Banner de gestão — visível apenas para o dono da loja */}
      {userLogado && lojista && userLogado.id === lojista.id && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"var(--black)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.45rem 2rem",fontFamily:"var(--sans)"}}>
          <span style={{fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",opacity:0.7}}>Modo lojista — vista pública da peça</span>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <a href="/perfil" onClick={e=>{e.preventDefault();window.location.href="/perfil";}} style={{fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#fff",textDecoration:"none",padding:"0.25rem 0.6rem",border:"1px solid rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>← Dashboard</a>
            <a href="/perfil" style={{fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#fff",textDecoration:"none",padding:"0.25rem 0.6rem",border:"1px solid rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>Perfil</a>
          </div>
        </div>
      )}
      <nav className="nav" style={userLogado && lojista && userLogado.id === lojista.id ? {top:"32px"} : {}}>
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href={`/loja/${codigo}`} className="nav-back">{i.voltar}{lojista?.nome ? ` ${lojista.nome}` : ""}</a>
      </nav>

      <div className="layout">
        {/* GALERIA */}
        <div className="fotos">
          <div className="foto-main">
            {fotos[fotoAtiva]
              ? <img src={fotos[fotoAtiva]} alt={peca.nome} />
              : <div className="foto-placeholder"><span style={{fontFamily:"var(--sans)",fontSize:"2rem",fontWeight:300,color:"rgba(0,0,0,0.08)"}}>NG</span></div>
            }
            {fotos.length > 1 && <div className="foto-counter">{fotoAtiva + 1}/{fotos.length}</div>}
          </div>
          {fotos.length > 1 && (
            <div className="fotos-thumb">
              {fotos.map((f, idx) => (
                <div key={idx} className={`thumb${fotoAtiva === idx ? " active" : ""}`} onClick={() => setFotoAtiva(idx)}>
                  {f ? <img src={f} alt="" /> : <div style={{width:"100%",height:"100%",background:"var(--g2)"}}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="info">
          {lojista?.nome && <p className="badge-cat">{lojista.nome}</p>}
          <h1 className="nome">{peca.nome}</h1>

          {/* Preço */}
          {(peca.tipo === "ambos" || peca.tipo === "alugar" || !peca.tipo) && peca.preco_aluguer_dia && (
            <div className="preco-row">
              <span className="preco-val">{peca.preco_aluguer_dia}€</span>
              <span className="preco-unit">{i.porcDia}</span>
            </div>
          )}

          {/* Banner economia */}
          {peca.valor_peca > 0 && peca.preco_aluguer_dia > 0 && (() => {
            const eco = Math.round((1 - peca.preco_aluguer_dia / peca.valor_peca) * 100);
            return (
              <div style={{background:"linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)",borderRadius:"10px",padding:"0.75rem 1rem",margin:"0.5rem 0 1rem",display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4a882",fontWeight:700,whiteSpace:"nowrap"}}>{i.pecaNova}: {peca.valor_peca}€</span>
                <span style={{color:"#555",fontSize:"0.8rem"}}>→</span>
                <span style={{fontSize:"0.85rem",color:"#fff",fontWeight:600}}>{i.alugaPor} <strong style={{color:"#c4a882"}}>{peca.preco_aluguer_dia}€{i.porcDia}</strong></span>
                <span style={{marginLeft:"auto",background:"#c4a882",color:"#1a1a1a",borderRadius:"20px",padding:"0.2rem 0.6rem",fontSize:"0.65rem",fontWeight:800,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{eco}% {i.economia}</span>
              </div>
            );
          })()}

          {/* Badge disponibilidade */}
          <span className="badge-estado" style={{background:disponivel?"#e8f5e9":"#f0eeeb",color:disponivel?"#27ae60":"#5a5855"}}>
            {disponivel ? i.disponivel : i.indisponivel}
          </span>

          {!disponivel && dataFimTimer && <Timer dataFim={dataFimTimer} lang={lang} />}

          {/* Tamanhos */}
          {peca.stock_lojista?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{i.tamanho}</p>
              <div className="tamanhos-grid">
                {stockDisponivel.map(s => (
                  <div key={s.id} className="tam-wrap">
                    <button className={`tam-btn${tamanhoSelecionado === s.id ? " active" : ""}`} onClick={() => setTamanhoSelecionado(s.id)}>{s.tamanho}</button>
                  </div>
                ))}
                {stockEsgotado.map(s => {
                  const dataD = datasPorTamanho[s.id];
                  const dataStr = dataD ? dataD.toLocaleDateString("pt-PT", { day:"numeric", month:"short" }) : null;
                  return (
                    <div key={s.id} className="tam-wrap">
                      <button className="tam-btn sem-stock" disabled>{s.tamanho}</button>
                      {dataStr && <span className="tam-data">{i.livreEm} {dataStr}</span>}
                      <a href={`/reserva?peca=${id}&loja=${codigo}&tamanhoNome=${s.tamanho}`} className="tam-reservar">{i.reservarTamanho}</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ocasiões */}
          {peca.ocasioes?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{i.ocasioes}</p>
              <div className="ocasioes-wrap">
                {peca.ocasioes.map(o => <span key={o} className="ocasiao-tag">{(OCASIOES_I18N[lang] || OCASIOES_I18N.pt)[o] || o}</span>)}
              </div>
            </div>
          )}

          {/* Depósito de caução */}
          {(peca.valor_peca > 0 || peca.preco_venda > 0) && peca.preco_aluguer_dia > 0 && (
            <div className="deposito-box">
              <p className="secao-label">{i.deposito}</p>
              <p className="deposito-val">{caucaoValor}€ <span style={{fontSize:"0.72rem",fontFamily:"var(--sans)",fontWeight:300,color:nv.cor}}>{nv.icon} {nv.nome}</span></p>
              {temDesconto && <p style={{fontSize:"0.72rem",color:"#95a5a6",textDecoration:"line-through",marginBottom:"0.25rem"}}>{caucaoSemNivel}€ {i.semHistorico}</p>}
              {totalAlugueres > 0 && (
                <div style={{margin:"0.4rem 0 0.25rem"}}>
                  <div style={{height:"4px",background:"#e8e4df",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pctRoi}%`,background:"#c4a882",borderRadius:"2px",transition:"width 0.5s"}}/>
                  </div>
                  <p style={{fontSize:"0.65rem",color:"#9c9894",marginTop:"0.2rem"}}>{pctRoi}{i.roiRecuperado}</p>
                </div>
              )}
              <p className="deposito-desc">{i.depositoDesc}</p>
            </div>
          )}

          {/* Datas de aluguer */}
          {(peca.tipo === "ambos" || peca.tipo === "alugar" || !peca.tipo) && peca.preco_aluguer_dia && (
            <div style={{marginBottom:"0.85rem",border:"1.5px solid var(--g2)",padding:"0.85rem 1rem",background:"#fafaf8"}}>
              <p style={{fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"0.6rem"}}>Datas de aluguer</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                <div>
                  <label style={{fontSize:"0.6rem",color:"var(--g4)",display:"block",marginBottom:"0.2rem"}}>Início</label>
                  <input type="date" value={dataInicio} min={hoje} onChange={e=>{setDataInicio(e.target.value);if(dataFim&&e.target.value>=dataFim)setDataFim("")}} style={{width:"100%",border:"1px solid var(--g2)",padding:"0.45rem 0.5rem",fontFamily:"var(--sans)",fontSize:"0.75rem",outline:"none",background:"#fff"}} />
                </div>
                <div>
                  <label style={{fontSize:"0.6rem",color:"var(--g4)",display:"block",marginBottom:"0.2rem"}}>Fim</label>
                  <input type="date" value={dataFim} min={dataInicio||hoje} onChange={e=>setDataFim(e.target.value)} style={{width:"100%",border:"1px solid var(--g2)",padding:"0.45rem 0.5rem",fontFamily:"var(--sans)",fontSize:"0.75rem",outline:"none",background:"#fff"}} />
                </div>
              </div>
              {diasAluguer > 0 && (
                <div style={{marginTop:"0.6rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"0.65rem",color:"var(--g4)"}}>{diasAluguer} dia{diasAluguer!==1?"s":""} × {peca.preco_aluguer_dia}€</span>
                  <span style={{fontSize:"0.95rem",fontWeight:700,color:"var(--black)"}}>{totalAluguer}€</span>
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          {disponivel ? (
            <div style={{display:"flex",flexDirection:"column",gap:"0.6rem",marginBottom:"0.75rem"}}>
              <button className="btn-alugar" onClick={irParaCheckout} disabled={!tamanhoSelecionado}>
                {tamanhoSelecionado ? i.alugar : i.semTamanho}
              </button>
              {(peca.tipo === "ambos" || peca.tipo === "alugar" || !peca.tipo) && (
                <button className="btn-cesto" onClick={adicionarAoCesto} disabled={!tamanhoSelecionado}>
                  🛍 {tamanhoSelecionado ? i.adicionarCesto : i.semTamanho}
                </button>
              )}
            </div>
          ) : (
            <a href={`/reserva?peca=${id}&loja=${codigo}`} className="btn-reservar">{i.garantirReserva}</a>
          )}

          {/* Comprar nova */}
          {(peca.valor_peca > 0 || peca.tipo === "comprar" || peca.tipo === "ambos") && (
            <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.75rem"}}>
              {(peca.tipo === "comprar" || peca.tipo === "ambos") && peca.preco_venda > 0 && (
                <button className="btn-alugar" onClick={irParaCheckout} style={{flex:1,background:"var(--rosa)"}}>
                  {i.comprar} — {peca.preco_venda}€
                </button>
              )}
              <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer"
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0.75rem 1rem",border:"1.5px solid #c4a882",background:"#faf8f5",color:"#1a1a1a",textDecoration:"none",fontFamily:"var(--sans)",textAlign:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#c4a882";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#faf8f5";}}>
                <span style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600,color:"#c4a882",marginBottom:"0.15rem"}}>{i.comprarNova}</span>
                <span style={{fontSize:"1.1rem",fontWeight:700}}>{peca.valor_peca ? `${peca.valor_peca}€` : "↗"}</span>
              </a>
            </div>
          )}

          {/* Link externo — compra nova noutra marca */}
          {peca.link_externo_ativo && peca.link_compra_externa && (
            <a href={peca.link_compra_externa} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",width:"100%",marginBottom:"0.75rem",padding:"0.75rem 1rem",border:"1.5px solid #c4a882",background:"#faf8f5",color:"#8a6a2a",textDecoration:"none",fontFamily:"var(--sans)",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,boxSizing:"border-box"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#c4a882";e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#faf8f5";e.currentTarget.style.color="#8a6a2a";}}>
              {peca.marca ? `Comprar nova na ${peca.marca} ↗` : "Comprar nova ↗"}
            </a>
          )}

          {/* Botão contactar */}
          <button className="btn-contactar" onClick={contactarLojista} disabled={contactando}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {contactando ? i.contactarLoading : (userLogado ? i.contactar : i.contactarEntrar)}
          </button>

          <hr className="sep" />

          {/* Conselho stylist */}
          {conselho && (
            <div style={{background:"#f9f6f2",borderLeft:"3px solid #c4748a",padding:"0.85rem 1rem",marginBottom:"1.25rem",display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
              <span style={{fontSize:"1.1rem",flexShrink:0}}>✨</span>
              <div>
                <p style={{fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.3rem",fontFamily:"var(--sans)"}}>{i.notaStylist}</p>
                <p style={{fontSize:"0.85rem",color:"#3f3e3c",lineHeight:1.55,margin:0,fontFamily:"var(--sans)"}}>{conselho}</p>
              </div>
            </div>
          )}

          {/* Descrição */}
          {peca.descricao && (
            <div className="secao">
              <p className="secao-label">{i.descricao}</p>
              <p className="descricao">{peca.descricao}</p>
            </div>
          )}

          {/* Info extra */}
          <div style={{marginBottom:"1.5rem"}}>
            {peca.categoria && <div className="info-row"><span className="info-key">Categoria</span><span>{peca.categoria}</span></div>}
            {peca.cor && <div className="info-row"><span className="info-key">Cor</span><span>{peca.cor}</span></div>}
            {peca.material && <div className="info-row"><span className="info-key">{i.material}</span><span>{peca.material}</span></div>}
            {peca.origem && <div className="info-row"><span className="info-key">{i.origem}</span><span>{peca.origem}</span></div>}
            {peca.condicao && <div className="info-row"><span className="info-key">Condição</span><span>{{novo:"Novo (com etiqueta)",como_novo:"Como novo",muito_bom:"Muito bom estado",bom:"Bom estado",usado:"Usado"}[peca.condicao]||peca.condicao}</span></div>}
          </div>

          {/* Defeito — alerta de transparência */}
          {peca.tem_defeito && (
            <div style={{marginBottom:"1.5rem",padding:"0.85rem 1rem",border:"1.5px solid #e74c3c",background:"#fff5f5"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:peca.descricao_defeito?"0.4rem":"0",fontFamily:"var(--sans)",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#c0392b",fontWeight:600}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Peça com defeito
              </div>
              {peca.descricao_defeito && <p style={{fontSize:"0.8rem",color:"#7b241c",margin:0,lineHeight:1.5}}>{peca.descricao_defeito}</p>}
            </div>
          )}

          {/* Wishlist */}
          <button onClick={toggleWishlist} disabled={wishlistLoading}
            style={{display:"flex",alignItems:"center",gap:"0.5rem",background:"none",border:`1.5px solid ${naWishlist?"#c4748a":"#e2dfda"}`,padding:"0.65rem 1.25rem",width:"100%",justifyContent:"center",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",color:naWishlist?"#c4748a":"#5a5855",marginBottom:"1rem",transition:"all 0.2s"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={naWishlist?"#c4748a":"none"} stroke={naWishlist?"#c4748a":"#5a5855"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {naWishlist ? i.guardado : i.guardarDepois}
          </button>

          {/* Partilha */}
          <div className="partilha">
            <span className="partilha-label">{i.partilhar}</span>
            <button className="partilha-btn" onClick={() => partilhar("whatsapp")} title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.858L.057 23.998l6.305-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.64-.516-5.14-1.41l-.368-.218-3.812 1 1.021-3.727-.239-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("facebook")} title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("instagram")} title="Copiar link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("link")} title="Copiar link">
              {partilhado
                ? <span style={{fontSize:"0.65rem",color:"#27ae60",fontWeight:600}}>✓</span>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              }
            </button>
          </div>
          {partilhado && <p style={{fontSize:"0.7rem",color:"#27ae60",marginTop:"0.35rem"}}>{i.linkCopiado}</p>}

          {/* Avaliações */}
          <div style={{marginTop:"2rem",paddingTop:"1.5rem",borderTop:"1px solid var(--g2)"}}>
            <p style={{fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"#5a5855",marginBottom:"1rem",fontWeight:600}}>{i.avaliacoes}</p>
            {avaliacoes.length === 0
              ? <p style={{fontSize:"0.85rem",color:"#9c9894",fontStyle:"italic"}}>{i.semAvaliacoes}</p>
              : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                  {avaliacoes.map((av, idx) => (
                    <div key={idx} style={{padding:"1rem",background:"var(--g1)",borderLeft:"3px solid #c4748a"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                        <div style={{display:"flex",gap:"0.15rem"}}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{fontSize:"1rem",color:s <= av.nota ? "#c4748a" : "#e2dfda"}}>★</span>)}
                        </div>
                        <span style={{fontSize:"0.65rem",color:"#9c9894"}}>{av.clientes?.nome || i.anonimo}</span>
                      </div>
                      {av.comentario && <p style={{fontSize:"0.85rem",color:"#3f3e3c",fontStyle:"italic",lineHeight:1.6}}>"{av.comentario}"</p>}
                    </div>
                  ))}
                </div>
            }
          </div>

          <a href={`/loja/${codigo}`} style={{display:"block",textAlign:"center",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#5a5855",marginTop:"2rem",textDecoration:"none",paddingTop:"1rem",borderTop:"1px solid var(--g2)"}}>
            {i.voltar} →
          </a>
        </div>
      </div>

      {/* STICKY CTA MOBILE */}
      <div className="sticky-cta">
        <div className="sticky-preco">
          {peca.preco_aluguer_dia && <><span className="sticky-preco-val">{peca.preco_aluguer_dia}€</span><span className="sticky-preco-unit">{i.porcDia}</span></>}
        </div>
        {disponivel ? (
          <>
            <button className="sticky-btn-alugar" onClick={irParaCheckout} disabled={!tamanhoSelecionado}>
              {tamanhoSelecionado ? i.alugar2 : i.tamanho}
            </button>
            <button className="sticky-btn-cesto" onClick={adicionarAoCesto} disabled={!tamanhoSelecionado} title={i.adicionarCesto}>🛍</button>
          </>
        ) : (
          <a href={`/reserva?peca=${id}&loja=${codigo}`} className="sticky-btn-alugar">{i.reservar2}</a>
        )}
        <button className="sticky-btn-contactar" onClick={contactarLojista} disabled={contactando}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Chat
        </button>
      </div>
    </>
  );
}

const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
  body{background:var(--white);font-family:var(--sans);-webkit-font-smoothing:antialiased;color:var(--black)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
  .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
  .nav-back{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#3a3835;text-decoration:none;transition:color 0.2s}
  .nav-back:hover{color:var(--black)}
  .loading{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;color:#888}
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
  .badge-cat{font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:#aaa89f;margin-bottom:0.5rem}
  .nome{font-family:var(--sans);font-size:clamp(1.6rem,3vw,2.5rem);font-weight:600;line-height:1.1;margin-bottom:1rem}
  .preco-row{display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.75rem}
  .preco-val{font-family:var(--sans);font-size:2rem;font-weight:600}
  .preco-unit{font-size:0.72rem;color:#aaa89f;letter-spacing:0.1em}
  .badge-estado{display:inline-block;font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;padding:0.3rem 0.75rem;margin-bottom:1.25rem}
  .secao{margin-bottom:1.75rem}
  .secao-label{font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem}
  .tamanhos-grid{display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-start}
  .tam-wrap{display:flex;flex-direction:column;align-items:center;gap:0.25rem}
  .tam-btn{padding:0.5rem 1rem;font-size:0.72rem;letter-spacing:0.1em;font-family:var(--sans);border:1.5px solid var(--g2);background:var(--white);cursor:pointer;transition:all 0.2s}
  .tam-btn:hover{border-color:var(--black)}
  .tam-btn.active{background:var(--black);color:var(--white);border-color:var(--black)}
  .tam-btn.sem-stock{opacity:0.4;cursor:not-allowed;text-decoration:line-through}
  .tam-data{font-size:0.54rem;color:var(--rosa);letter-spacing:0.08em;text-transform:uppercase}
  .tam-reservar{font-size:0.54rem;color:#5a5855;letter-spacing:0.08em;text-transform:uppercase;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:var(--sans);padding:0}
  .tam-reservar:hover{color:var(--black)}
  .ocasioes-wrap{display:flex;gap:0.4rem;flex-wrap:wrap}
  .ocasiao-tag{font-size:0.62rem;letter-spacing:0.1em;padding:0.3rem 0.65rem;background:var(--g1);color:#5a5855;border:1px solid var(--g2)}
  .sep{border:none;border-top:1px solid var(--g2);margin:1.5rem 0}
  .info-row{display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--g1);font-size:0.85rem}
  .info-key{color:#5a5855;font-size:0.72rem;letter-spacing:0.1em}
  .deposito-box{background:var(--g1);padding:1rem 1.25rem;margin-bottom:1.5rem;border-left:3px solid var(--g2)}
  .deposito-val{font-family:var(--sans);font-size:1.5rem;font-weight:500}
  .deposito-desc{font-size:0.72rem;color:#5a5855;margin-top:0.2rem}
  .btn-alugar{width:100%;padding:1.1rem;background:var(--black);color:var(--white);border:none;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:background 0.2s}
  .btn-alugar:hover{background:#2a2926}
  .btn-alugar:disabled{background:#ccc;cursor:not-allowed}
  .btn-cesto{width:100%;padding:0.85rem;background:var(--white);color:var(--black);border:1.5px solid var(--black);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.4rem}
  .btn-cesto:hover{background:var(--g1)}
  .btn-cesto:disabled{opacity:0.4;cursor:not-allowed}
  .btn-reservar{width:100%;padding:1rem;background:var(--white);color:var(--black);border:1.5px solid var(--g2);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:border-color 0.2s;text-decoration:none;display:block;text-align:center;margin-bottom:0.75rem}
  .btn-reservar:hover{border-color:var(--black)}
  .btn-contactar{width:100%;padding:1rem;background:var(--white);color:var(--black);border:1.5px solid var(--black);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s;margin-top:0.75rem}
  .btn-contactar:hover{background:var(--black);color:var(--white)}
  .btn-contactar:disabled{opacity:0.5;cursor:not-allowed}
  .descricao{font-size:0.92rem;line-height:1.7;color:#3a3835}
  .partilha{display:flex;gap:0.5rem;align-items:center;margin-top:1.5rem}
  .partilha-label{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#5a5855;margin-right:0.25rem}
  .partilha-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--g2);background:var(--white);cursor:pointer;font-size:1rem;transition:all 0.2s;text-decoration:none;color:var(--black)}
  .partilha-btn:hover{border-color:var(--black);background:var(--g1)}
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
    .btn-alugar,.btn-reservar,.btn-contactar{display:none}
    .sticky-cta{
      display:flex;position:fixed;
      bottom:calc(64px + env(safe-area-inset-bottom));
      left:0;right:0;z-index:201;
      background:rgba(248,247,245,0.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      border-top:1px solid #e2dfda;padding:0.6rem 0.75rem;gap:0.5rem;align-items:center;
    }
    .sticky-preco{display:flex;flex-direction:column;flex-shrink:0}
    .sticky-preco-val{font-family:var(--sans);font-size:1.4rem;font-weight:600;line-height:1;color:#080808}
    .sticky-preco-unit{font-family:'Jost',sans-serif;font-size:0.55rem;color:#b0ada6;letter-spacing:0.08em}
    .sticky-btn-alugar{flex:2;min-height:46px;background:#080808;color:#f8f7f5;border:none;font-family:'Jost',sans-serif;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none;padding:0 0.75rem}
    .sticky-btn-alugar:disabled{background:#c5c2be;cursor:not-allowed}
    .sticky-btn-cesto{width:46px;min-height:46px;flex-shrink:0;background:var(--white);border:1.5px solid var(--black);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .sticky-btn-cesto:disabled{opacity:0.4;cursor:not-allowed}
    .sticky-btn-contactar{flex:1;min-height:46px;background:var(--white);color:var(--black);border:1.5px solid var(--black);font-family:'Jost',sans-serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.35rem;padding:0 0.6rem;white-space:nowrap}
    .deposito-box{margin-bottom:1rem}
    .partilha{margin-top:1rem}
    .secao{margin-bottom:1.25rem}
  }
`;
