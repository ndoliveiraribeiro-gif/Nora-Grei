"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const HIGIENIZACAO = 9;
const TAXA_SINISTRO = 0.03;
const FATOR_SEGURANCA = 1.5;
const CAUCAO_PISO = 0.08;

const NIVEL_NOMES_CESTO = {
  pt: { platina:"Platina", ouro:"Ouro", prata:"Prata", bronze:"Bronze" },
  fr: { platina:"Platine", ouro:"Or",   prata:"Argent", bronze:"Bronze" },
  lt: { platina:"Platina", ouro:"Auksas", prata:"Sidabras", bronze:"Bronza" },
};
const NIVEL = (n, lang = "pt") => {
  const nm = NIVEL_NOMES_CESTO[lang] || NIVEL_NOMES_CESTO.pt;
  if (n >= 20) return { nome: nm.platina, sigla: "PLT", icon: "💎", caucao: 8,  cor: "#6c5ce7", descontoAluguer: 10 };
  if (n >= 10) return { nome: nm.ouro,    sigla: "OUR", icon: "🥇", caucao: 50, cor: "#f39c12", descontoAluguer: 8  };
  if (n >= 5)  return { nome: nm.prata,   sigla: "PRT", icon: "🥈", caucao: 75, cor: "#95a5a6", descontoAluguer: 5  };
  return             { nome: nm.bronze,   sigla: "BRZ", icon: "🥉", caucao: 100, cor: "#cd7f32", descontoAluguer: 3  };
};

const calcularCaucao = (valorPeca, caucaoPct) => {
  const r = valorPeca * TAXA_SINISTRO * FATOR_SEGURANCA;
  const n = valorPeca * caucaoPct / 100;
  const p = valorPeca * CAUCAO_PISO;
  return Math.round(Math.max(r, n, p));
};

const T = {
  pt: {
    titulo: "O meu cesto",
    vazio: "O teu cesto está vazio.",
    verCatalogo: "Ver catálogo",
    remover: "Remover",
    higienizacao: "Higienização",
    caucao: "Caução",
    total: "Total agora",
    caucaoNota: "* A caução é devolvida após inspeção",
    confirmar: "Confirmar pedido",
    nivel: "Nível",
    desconto: "Desconto de volume",
    descontoNota: (n) => `Tens ${n} peças no cesto — escolhe o teu benefício:`,
    opcaoA: "Desconto no aluguer",
    opcaoADesc: (pct) => `${pct}% de desconto no valor total de aluguer`,
    opcaoB: "Desconto na caução",
    opcaoBDesc: "Sem desconto no aluguer — mantém a caução reduzida pelo teu nível",
    poupas: "Poupas",
    tamanho: "Tamanho",
    dias: (n) => `${n} dia${n !== 1 ? "s" : ""}`,
    pecas: (n) => `${n} peça${n !== 1 ? "s" : ""}`,
    login: "Precisa de fazer login para confirmar",
    fazerLogin: "Fazer login",
    subtotal: "Subtotal aluguer",
    totalCaucao: "Total caução",
    descontoAplicado: "Desconto aplicado",
    aProcessar: "A processar...",
    sucesso: "Pedidos registados!",
    verPedidos: "Ver os meus pedidos",
    semTamanho: "Sem tamanho",
    resumo: "Resumo",
  },
  fr: {
    titulo: "Mon panier",
    vazio: "Votre panier est vide.",
    verCatalogo: "Voir le catalogue",
    remover: "Supprimer",
    higienizacao: "Nettoyage",
    caucao: "Dépôt",
    total: "Total maintenant",
    caucaoNota: "* Le dépôt est remboursé après inspection",
    confirmar: "Confirmer la commande",
    nivel: "Niveau",
    desconto: "Remise volume",
    descontoNota: (n) => `Vous avez ${n} pièces — choisissez votre avantage :`,
    opcaoA: "Remise sur la location",
    opcaoADesc: (pct) => `${pct}% de remise sur le total de location`,
    opcaoB: "Remise sur le dépôt",
    opcaoBDesc: "Pas de remise sur la location — conservez votre dépôt réduit selon votre niveau",
    poupas: "Économie",
    tamanho: "Taille",
    dias: (n) => `${n} jour${n !== 1 ? "s" : ""}`,
    pecas: (n) => `${n} pièce${n !== 1 ? "s" : ""}`,
    login: "Connectez-vous pour confirmer",
    fazerLogin: "Se connecter",
    subtotal: "Sous-total location",
    totalCaucao: "Total dépôt",
    descontoAplicado: "Remise appliquée",
    aProcessar: "Traitement...",
    sucesso: "Commandes enregistrées !",
    verPedidos: "Voir mes commandes",
    semTamanho: "Sans taille",
    resumo: "Récapitulatif",
  },
  lt: {
    titulo: "Mano krepšelis",
    vazio: "Jūsų krepšelis tuščias.",
    verCatalogo: "Žiūrėti katalogą",
    remover: "Pašalinti",
    higienizacao: "Valymas",
    caucao: "Užstatas",
    total: "Iš viso dabar",
    caucaoNota: "* Užstatas grąžinamas po patikrinimo",
    confirmar: "Patvirtinti užsakymą",
    nivel: "Lygis",
    desconto: "Kiekio nuolaida",
    descontoNota: (n) => `Krepšelyje ${n} drabužiai — pasirinkite naudą:`,
    opcaoA: "Nuolaida nuomai",
    opcaoADesc: (pct) => `${pct}% nuolaida bendrai nuomos sumai`,
    opcaoB: "Nuolaida užstatui",
    opcaoBDesc: "Jokios nuolaidos nuomai — išlaikykite sumažintą užstatą pagal jūsų lygį",
    poupas: "Taupote",
    tamanho: "Dydis",
    dias: (n) => `${n} diena${n !== 1 ? "s" : ""}`,
    pecas: (n) => `${n} drabužis`,
    login: "Prisijunkite norėdami patvirtinti",
    fazerLogin: "Prisijungti",
    subtotal: "Nuomos tarpinė suma",
    totalCaucao: "Viso užstatas",
    descontoAplicado: "Pritaikyta nuolaida",
    aProcessar: "Apdorojama...",
    sucesso: "Užsakymai užregistruoti!",
    verPedidos: "Žiūrėti mano užsakymus",
    semTamanho: "Be dydžio",
    resumo: "Suvestinė",
  },
};

function gerarNumeroRecibo() {
  const ano = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NG-${ano}-${rand}`;
}

export default function CestoPage() {
  const [lang, setLang] = useState("pt");
  const [cesto, setCesto] = useState([]); // [{pecaId, stockId, tamanhoNome, dataInicio, dataFim, peca}]
  const [user, setUser] = useState(null);
  const [totalAlugueres, setTotalAlugueres] = useState(0);
  const [opcaoDesconto, setOpcaoDesconto] = useState("A"); // "A" = desconto aluguer, "B" = desconto caução
  const [loading, setLoading] = useState(true);
  // Estado individual por peça: { [idx]: { processando, sucesso, erro } }
  const [estadoItem, setEstadoItem] = useState({});
  // Desconto congelado: guardado quando cesto tem 3+ peças e cliente escolhe opção
  // Fica fixo mesmo quando peças vão sendo confirmadas individualmente
  const [descontoCongelado, setDescontoCongelado] = useState(null); // null | { pct, tipo }
  const [descontoAplicado, setDescontoAplicado] = useState(false); // true depois de 1ª confirmação

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    inicializar();
  }, []);

  const inicializar = async () => {
    setLoading(true);
    // Carregar cesto do localStorage
    let cestoGuardado = [];
    try { cestoGuardado = JSON.parse(localStorage.getItem("ng_cesto") || "[]"); } catch (_) {}

    // Carregar user
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u) {
      const { data: cli } = await supabase.from("clientes").select("total_pecas_alugadas").eq("id", u.id).single();
      if (cli) setTotalAlugueres(cli.total_pecas_alugadas || 0);
    }

    // Enriquecer cesto com dados das peças (Nora Grei + lojistas)
    if (cestoGuardado.length > 0) {
      const ngIds = cestoGuardado.filter(i => i.origem !== "lojista").map(i => i.pecaId);
      const lojIds = cestoGuardado.filter(i => i.origem === "lojista").map(i => i.pecaId);
      const pecasMap = {};

      if (ngIds.length > 0) {
        const { data: pecas } = await supabase
          .from("pecas")
          .select("id, nome, fotos, preco_aluguer_dia, valor_peca")
          .in("id", ngIds);
        (pecas || []).forEach(p => { pecasMap[p.id] = p; });
      }
      if (lojIds.length > 0) {
        const { data: pecasLoj } = await supabase
          .from("pecas_lojista")
          .select("id, nome, fotos, preco_aluguer_dia, preco_venda, valor_peca")
          .in("id", lojIds);
        (pecasLoj || []).forEach(p => { pecasMap[p.id] = p; });
      }

      const enriquecido = cestoGuardado
        .filter(i => pecasMap[i.pecaId])
        .map(i => ({ ...i, peca: pecasMap[i.pecaId] }));
      setCesto(enriquecido);
    }
    setLoading(false);
  };

  const remover = (idx) => {
    const novo = cesto.filter((_, i) => i !== idx);
    setCesto(novo);
    localStorage.setItem("ng_cesto", JSON.stringify(novo.map(({ peca, ...rest }) => rest)));
    window.dispatchEvent(new Event("cesto-atualizado"));
  };

  const i = T[lang] || T.pt;
  const nv = NIVEL(totalAlugueres, lang);
  // temDesconto activo se cesto originalmente tinha 3+ OU se já congelou
  const temDesconto = cesto.length >= 3 || descontoCongelado !== null;
  const todosPedidos = cesto.length > 0 && cesto.every((_, idx) => estadoItem[idx]?.sucesso);

  // Quando cesto atingir 3+ peças pela primeira vez, congelar o desconto ao escolher opção
  // O desconto congelado persiste mesmo quando peças vão sendo removidas ao confirmar
  const pctDescontoActivo = descontoCongelado
    ? descontoCongelado.pct
    : (cesto.length >= 3 && opcaoDesconto === "A" ? nv.descontoAluguer : 0);
  const tipoDescontoActivo = descontoCongelado?.tipo || opcaoDesconto;

  // Cálculos
  const subtotalAluguer = cesto.reduce((s, item) => {
    const dias = item.dataInicio && item.dataFim
      ? Math.max(1, Math.ceil((new Date(item.dataFim) - new Date(item.dataInicio)) / 86400000))
      : 1;
    return s + (item.peca?.preco_aluguer_dia || 0) * dias;
  }, 0);

  const descontoAluguerPct = pctDescontoActivo;
  const descontoAluguerVal = Math.round(subtotalAluguer * descontoAluguerPct / 100 * 100) / 100;
  const totalAluguer = subtotalAluguer - descontoAluguerVal;

  const totalHigienizacao = cesto.length * HIGIENIZACAO;

  const totalCaucao = cesto.reduce((s, item) => {
    const vp = item.peca?.valor_peca || 0;
    // Opção B: cliente abre mão do desconto no aluguer — a caução usa o nível mas sem benefício extra
    // Opção A: sem desconto no aluguer — caução normal pelo nível
    return s + calcularCaucao(vp, nv.caucao);
  }, 0);

  const totalAgora = totalAluguer + totalHigienizacao + totalCaucao;

  const setItemEstado = (idx, patch) =>
    setEstadoItem(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), ...patch } }));

  const confirmarItem = async (idx) => {
    if (!user) { window.location.href = "/entrar?redirect=/cesto"; return; }
    const item = cesto[idx];
    if (!item) return;
    setItemEstado(idx, { processando: true, erro: "" });

    try {
      const hoje = new Date().toISOString().split("T")[0];
      const daqui3dias = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

      // Congelar desconto na primeira confirmação (para as restantes peças manterem o mesmo benefício)
      let descontoAtual = pctDescontoActivo;
      let tipoAtual = tipoDescontoActivo;
      if (!descontoAplicado && (cesto.length >= 3 || descontoCongelado)) {
        const pctACongelar = cesto.length >= 3 && opcaoDesconto === "A" ? nv.descontoAluguer : 0;
        setDescontoCongelado({ pct: pctACongelar, tipo: opcaoDesconto });
        setDescontoAplicado(true);
        descontoAtual = pctACongelar;
        tipoAtual = opcaoDesconto;
      }

      const dias = item.dataInicio && item.dataFim
        ? Math.max(1, Math.ceil((new Date(item.dataFim) - new Date(item.dataInicio)) / 86400000))
        : 1;
      const valorAluguerItem = (item.peca?.preco_aluguer_dia || 0) * dias * (1 - descontoAtual / 100);
      const valorCaucaoItem = calcularCaucao(item.peca?.valor_peca || 0, nv.caucao);
      const dataInicio = item.dataInicio || hoje;
      const dataFim = item.dataFim || daqui3dias;
      const numero = gerarNumeroRecibo();

      if (item.origem === "lojista") {
        // Peça de lojista → inserir em alugueres_lojista
        const { data: novoAluguer } = await supabase.from("alugueres_lojista").insert({
          cliente_id: user.id,
          stock_lojista_id: item.stockId,
          peca_lojista_id: item.pecaId,
          lojista_id: item.lojistaId || null,
          data_inicio: dataInicio,
          data_fim: dataFim,
          estado: "pendente",
          metodo_pagamento: "cartao",
          valor_aluguer: Math.round(valorAluguerItem * 100) / 100,
          deposito_valor: valorCaucaoItem,
          deposito_estado: "recebido",
          desconto_cesto: descontoAtual > 0 ? `opcao_a_${descontoAtual}pct` : (temDesconto && tipoAtual === "B" ? "opcao_b_caucao" : null),
        }).select().single();

        if (novoAluguer) {
          await supabase.from("recibos").insert({
            numero,
            aluguer_lojista_id: novoAluguer.id,
            cliente_id: user.id,
            metodo_pagamento: "cartao",
            valor_aluguer: Math.round(valorAluguerItem * 100) / 100,
            valor_higienizacao: HIGIENIZACAO,
            valor_deposito: valorCaucaoItem,
            valor_total: Math.round((valorAluguerItem + HIGIENIZACAO + valorCaucaoItem) * 100) / 100,
            estado: "pago",
            detalhes: { tamanho: item.tamanhoNome, peca_nome: item.peca?.nome, origem: "lojista", lojista_nome: item.lojistaNome, desconto: descontoAtual },
          });
        }

        // Notificar lojista específico da peça
        if (item.lojistaId) {
          try {
            const { data: convExistente } = await supabase.from("conversas").select("id, nao_lidas_lojista").eq("cliente_id", user.id).eq("lojista_id", item.lojistaId).maybeSingle();
            const assunto = `Pedido: ${item.peca?.nome || "peça"}`;
            if (convExistente) {
              await supabase.from("conversas").update({ ultima_mensagem_em: new Date().toISOString(), nao_lidas_lojista: (convExistente.nao_lidas_lojista || 0) + 1, assunto }).eq("id", convExistente.id);
            } else {
              await supabase.from("conversas").insert({ cliente_id: user.id, lojista_id: item.lojistaId, assunto, ultima_mensagem_em: new Date().toISOString(), nao_lidas_lojista: 1 });
            }
          } catch (_) {}
        }
      } else {
        // Peça Nora Grei → inserir em alugueres (fluxo existente)
        const { data: novoAluguer } = await supabase.from("alugueres").insert({
          cliente_id: user.id,
          stock_tamanho_id: item.stockId,
          data_inicio: dataInicio,
          data_fim: dataFim,
          tipo: "avulso",
          estado: "confirmado",
          metodo_entrega: "envio",
          metodo_pagamento: "cartao",
          valor_aluguer: Math.round(valorAluguerItem * 100) / 100,
          deposito_valor: valorCaucaoItem,
          deposito_modalidade: "cartao",
          deposito_estado: "recebido",
          deposito_confirmado_em: new Date().toISOString(),
          desconto_cesto: descontoAtual > 0 ? `opcao_a_${descontoAtual}pct` : (temDesconto && tipoAtual === "B" ? "opcao_b_caucao" : null),
        }).select().single();

        if (novoAluguer) {
          await supabase.from("recibos").insert({
            numero,
            aluguer_id: novoAluguer.id,
            cliente_id: user.id,
            metodo_pagamento: "cartao",
            valor_aluguer: Math.round(valorAluguerItem * 100) / 100,
            valor_higienizacao: HIGIENIZACAO,
            valor_deposito: valorCaucaoItem,
            valor_total: Math.round((valorAluguerItem + HIGIENIZACAO + valorCaucaoItem) * 100) / 100,
            estado: "pago",
            detalhes: { tamanho: item.tamanhoNome, peca_nome: item.peca?.nome, desconto: descontoAtual },
          });
        }

        // Notificar Nora Grei
        try {
          const { data: lojistaNg } = await supabase.from("clientes").select("id").eq("modo_lojista", true).limit(1).single();
          if (lojistaNg && lojistaNg.id !== user.id) {
            const { data: convExistente } = await supabase.from("conversas").select("id, nao_lidas_lojista").eq("cliente_id", user.id).eq("lojista_id", lojistaNg.id).maybeSingle();
            const assunto = `Pedido: ${item.peca?.nome || "peça"}`;
            if (convExistente) {
              await supabase.from("conversas").update({ ultima_mensagem_em: new Date().toISOString(), nao_lidas_lojista: (convExistente.nao_lidas_lojista || 0) + 1, assunto }).eq("id", convExistente.id);
            } else {
              await supabase.from("conversas").insert({ cliente_id: user.id, lojista_id: lojistaNg.id, assunto, ultima_mensagem_em: new Date().toISOString(), nao_lidas_lojista: 1 });
            }
          }
        } catch (_) {}
      }

      // Remover só esta peça do cesto
      const novoCesto = cesto.filter((_, i) => i !== idx);
      setCesto(novoCesto);
      localStorage.setItem("ng_cesto", JSON.stringify(novoCesto.map(({ peca, ...rest }) => rest)));
      window.dispatchEvent(new Event("cesto-atualizado"));
      setItemEstado(prev => {
        const next = { ...prev };
        delete next[idx];
        // reindexar: itens com idx > este passam a idx-1
        const reindexed = {};
        Object.entries(next).forEach(([k, v]) => {
          const ki = parseInt(k);
          reindexed[ki > idx ? ki - 1 : ki] = v;
        });
        return reindexed;
      });
      setItemEstado(idx, { sucesso: true });
    } catch (e) { setItemEstado(idx, { erro: e.message, processando: false }); return; }
    setItemEstado(idx, { processando: false });
  };

  return (
    <>
      <style>{ESTILOS}</style>
      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {["pt","fr","lt"].map(l => (
            <button key={l} onClick={() => { localStorage.setItem("ng_lang", l); setLang(l); }} style={{ fontSize: "0.56rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", color: lang === l ? "var(--black)" : "var(--g4)", fontWeight: lang === l ? 500 : 300 }}>{l.toUpperCase()}</button>
          ))}
          <a href="/catalogo" className="nav-back">← Catálogo</a>
        </div>
      </nav>

      <div className="page">
        <div className="col-esquerda">
          <h1 className="titulo">{i.titulo} {cesto.length > 0 && <span className="count">{i.pecas(cesto.length)}</span>}</h1>

          {loading ? (
            <div className="vazio">...</div>
          ) : cesto.length === 0 ? (
            <div className="vazio">
              <p>{i.vazio}</p>
              <a href="/catalogo" className="btn-cat">{i.verCatalogo}</a>
            </div>
          ) : (
            <>
              {/* Lista de peças */}
              {cesto.map((item, idx) => {
                const dias = item.dataInicio && item.dataFim
                  ? Math.max(1, Math.ceil((new Date(item.dataFim) - new Date(item.dataInicio)) / 86400000))
                  : 1;
                const descontoAtual = temDesconto && opcaoDesconto === "A" ? nv.descontoAluguer : 0;
                const valorItem = (item.peca?.preco_aluguer_dia || 0) * dias * (1 - descontoAtual / 100);
                const caucaoItem = calcularCaucao(item.peca?.valor_peca || 0, nv.caucao);
                const totalItem = valorItem + HIGIENIZACAO + caucaoItem;
                const estado = estadoItem[idx] || {};
                return (
                  <div key={idx} className="item-card" style={{ opacity: estado.processando ? 0.6 : 1 }}>
                    {item.peca?.fotos?.[0] && <img src={item.peca.fotos[0]} alt={item.peca.nome} className="item-foto" />}
                    <div className="item-info" style={{ flex: 1 }}>
                      <div className="item-nome">{item.peca?.nome}</div>
                      {item.origem === "lojista" && item.lojistaNome && (
                        <div className="item-meta" style={{ color: "#b8964e", fontWeight: 500 }}>🏪 {item.lojistaNome}</div>
                      )}
                      <div className="item-meta">{item.tamanhoNome || i.semTamanho}</div>
                      {item.dataInicio && item.dataFim && (
                        <div className="item-meta">{item.dataInicio} → {item.dataFim} · {i.dias(dias)}</div>
                      )}
                      <div className="item-preco">{valorItem.toFixed(2)}€ <span style={{ fontSize: "0.7rem", color: "#5a5855", fontWeight: 300 }}>+ {i.higienizacao} {HIGIENIZACAO}€ + {i.caucao} {caucaoItem}€</span></div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 500, marginTop: "0.25rem" }}>= {totalItem.toFixed(2)}€</div>

                      {/* Botão confirmar por peça */}
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        {!user ? (
                          <a href="/entrar?redirect=/cesto" style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "#080808", color: "#fff", padding: "0.5rem 1rem", textDecoration: "none" }}>{i.fazerLogin}</a>
                        ) : (
                          <button
                            className="btn-confirmar-item"
                            onClick={() => confirmarItem(idx)}
                            disabled={estado.processando}
                            style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "#080808", color: "#fff", border: "none", cursor: estado.processando ? "default" : "pointer", padding: "0.5rem 1rem" }}
                          >
                            {estado.processando ? i.aProcessar : i.confirmar}
                          </button>
                        )}
                        <button className="btn-remover" onClick={() => remover(idx)} disabled={estado.processando}>{i.remover}</button>
                      </div>
                      {estado.erro && <div className="erro" style={{ marginTop: "0.5rem" }}>{estado.erro}</div>}
                    </div>
                  </div>
                );
              })}

              {/* Bloco de desconto por volume */}
              {temDesconto && (
                <div className="bloco-desconto">
                  <div className="desconto-titulo">
                    {nv.icon} {i.desconto} — {i.nivel} {nv.nome}
                  </div>
                  {descontoCongelado ? (
                    /* Já iniciou confirmações — desconto fixo */
                    <div style={{ fontSize: "0.8rem", color: "#5a5855", marginTop: "0.5rem" }}>
                      {descontoCongelado.tipo === "A"
                        ? <span style={{ color: "#27ae60", fontWeight: 500 }}>✓ {i.opcaoA}: {descontoCongelado.pct}% aplicado a todas as peças</span>
                        : <span style={{ color: "#27ae60", fontWeight: 500 }}>✓ {i.opcaoB}: caução reduzida ao nível {nv.nome}</span>
                      }
                      <div style={{ fontSize: "0.72rem", color: "#95a5a6", marginTop: "0.25rem" }}>Opção fixada ao confirmar a 1ª peça</div>
                    </div>
                  ) : (
                    <>
                      <p className="desconto-nota">{i.descontoNota(cesto.length)}</p>
                      <div className="opcoes-desconto">
                        <div className={`opcao-d${opcaoDesconto === "A" ? " on" : ""}`} onClick={() => setOpcaoDesconto("A")}>
                          <div className="opcao-radio" />
                          <div>
                            <div className="opcao-label">{i.opcaoA}</div>
                            <div className="opcao-desc">{i.opcaoADesc(nv.descontoAluguer)}</div>
                            <div className="opcao-poupas">{i.poupas} {descontoAluguerVal.toFixed(2)}€</div>
                          </div>
                        </div>
                        <div className={`opcao-d${opcaoDesconto === "B" ? " on" : ""}`} onClick={() => setOpcaoDesconto("B")}>
                          <div className="opcao-radio" />
                          <div>
                            <div className="opcao-label">{i.opcaoB}</div>
                            <div className="opcao-desc">{i.opcaoBDesc}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Resumo lateral */}
        {cesto.length > 0 && (
          <div className="resumo">
            <div className="resumo-titulo">{i.resumo}</div>

            {/* Nível fidelidade */}
            <div className="nivel-box">
              <span>{nv.icon}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{i.nivel} {nv.nome}</span>
              <span style={{ fontSize: "0.72rem", color: nv.cor, marginLeft: "auto" }}>{nv.caucao}% caução</span>
            </div>

            <div className="r-linha">
              <span>{i.subtotal}</span>
              <span>{subtotalAluguer.toFixed(2)}€</span>
            </div>
            {descontoAluguerVal > 0 && (
              <div className="r-linha" style={{ color: "#27ae60" }}>
                <span>— {i.descontoAplicado} ({nv.descontoAluguer}%)</span>
                <span>-{descontoAluguerVal.toFixed(2)}€</span>
              </div>
            )}
            <div className="r-linha">
              <span>{i.higienizacao} × {cesto.length}</span>
              <span>{totalHigienizacao}€</span>
            </div>
            <div className="r-linha">
              <span>{i.totalCaucao}</span>
              <span>{totalCaucao.toFixed(2)}€</span>
            </div>
            <div className="r-total">
              <span>{i.total}</span>
              <span>{totalAgora.toFixed(2)}€</span>
            </div>
            <p className="r-nota">{i.caucaoNota}</p>

            {todosPedidos && (
              <div style={{ marginTop: "1rem", background: "#f0faf4", border: "1px solid #c3e6cb", borderRadius: "4px", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.75rem" }}>{i.sucesso}</div>
                <a href="/pedidos" style={{ display: "block", background: "#080808", color: "#fff", padding: "0.75rem 1.5rem", textDecoration: "none", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>{i.verPedidos}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
  body{background:var(--g1);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;padding-top:max(1rem,env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between}
  .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
  .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none}
  .page{padding:6rem 2rem 4rem;max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 340px;gap:2rem;align-items:start}
  .col-esquerda{display:flex;flex-direction:column;gap:1rem}
  .titulo{font-family:var(--sans);font-size:2rem;font-weight:600;display:flex;align-items:baseline;gap:0.75rem;margin-bottom:0.5rem}
  .count{font-family:var(--sans);font-size:0.82rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);font-weight:400}
  .vazio{background:var(--white);padding:3rem 2rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1.5rem;font-size:0.95rem;color:var(--g4)}
  .btn-cat{display:inline-block;padding:0.75rem 2rem;background:#c4748a;color:#fff;text-decoration:none;font-size:0.78rem;letter-spacing:0.18em;text-transform:uppercase}
  .item-card{background:var(--white);padding:1.25rem;display:flex;gap:1rem;align-items:flex-start}
  .item-foto{width:64px;height:80px;object-fit:cover;flex-shrink:0;background:var(--g1)}
  .item-info{flex:1}
  .item-nome{font-family:var(--sans);font-size:1.1rem;font-weight:500;margin-bottom:0.25rem}
  .item-meta{font-size:0.82rem;color:var(--g4);margin-bottom:0.15rem}
  .item-preco{font-size:0.95rem;font-weight:500;margin-top:0.4rem}
  .btn-remover{font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;background:none;border:1px solid var(--g2);padding:0.3rem 0.65rem;cursor:pointer;color:var(--g4);font-family:var(--sans);white-space:nowrap;align-self:center;transition:border-color 0.2s}
  .btn-remover:hover{border-color:#e74c3c;color:#e74c3c}
  .bloco-desconto{background:var(--white);padding:1.5rem;border-left:3px solid var(--rosa)}
  .desconto-titulo{font-size:0.8rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem}
  .desconto-nota{font-size:0.82rem;color:var(--g4);margin-bottom:1rem}
  .opcoes-desconto{display:flex;flex-direction:column;gap:0.75rem}
  .opcao-d{display:flex;align-items:flex-start;gap:0.85rem;padding:1rem 1.1rem;border:1.5px solid var(--g2);cursor:pointer;transition:border-color 0.2s}
  .opcao-d.on{border-color:var(--black);background:var(--g1)}
  .opcao-radio{width:16px;height:16px;border-radius:50%;border:2px solid var(--g2);flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center}
  .opcao-d.on .opcao-radio{border-color:var(--black);background:var(--black)}
  .opcao-d.on .opcao-radio::after{content:'';width:5px;height:5px;border-radius:50%;background:#fff}
  .opcao-label{font-size:0.88rem;font-weight:500;margin-bottom:0.2rem}
  .opcao-desc{font-size:0.75rem;color:var(--g4);line-height:1.5}
  .opcao-poupas{font-size:0.75rem;color:#27ae60;margin-top:0.25rem;font-weight:500}
  .resumo{background:var(--white);padding:1.75rem;position:sticky;top:6rem;display:flex;flex-direction:column;gap:0}
  .resumo-titulo{font-size:0.78rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--g4);font-weight:500;padding-bottom:1rem;border-bottom:1px solid var(--g1);margin-bottom:1rem}
  .nivel-box{display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.85rem;background:var(--g1);margin-bottom:0.75rem;font-size:0.82rem}
  .r-linha{display:flex;justify-content:space-between;font-size:0.88rem;padding:0.5rem 0;border-bottom:1px solid var(--g1);color:var(--g4)}
  .r-total{display:flex;justify-content:space-between;font-size:1.05rem;font-weight:500;padding:0.85rem 0 0;color:var(--black);border-top:2px solid var(--black);margin-top:0.4rem}
  .r-nota{font-size:0.82rem;color:var(--g4);margin-top:0.6rem;font-style:italic;line-height:1.5}
  .login-box{margin-top:1rem}
  .btn-confirmar{display:block;width:100%;padding:1.1rem;background:#c4748a;color:#fff;border:none;font-size:0.82rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;margin-top:1.25rem;text-decoration:none;text-align:center;transition:background 0.2s}
  .btn-confirmar:hover{background:#b5637a}
  .btn-confirmar:disabled{opacity:0.6;cursor:not-allowed}
  .erro{color:#c0392b;font-size:0.85rem;margin-top:0.75rem;padding:0.65rem;background:#fff5f5;border:1px solid #f5c6cb}
  @media(max-width:768px){
    .page{grid-template-columns:1fr;padding:5rem 1.25rem 6rem}
    .resumo{position:static}
  }
`;
