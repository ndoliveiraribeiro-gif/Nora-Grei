"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SENHA = process.env.NEXT_PUBLIC_BACKOFFICE_SENHA || "noragrei2024admin";
const OCASIOES = ["Festa", "Dia a dia", "Trabalho", "Jantar", "Férias", "Casamento", "Praia", "Cerimónia", "Cocktail", "Gala"];
const TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL", "Único"];
const TABS = ["dashboard", "seewhois", "caixa", "catalogo", "alugueres", "lojistas", "clientes", "reservas", "campanhas", "mensagens", "afiliados", "feed", "landing", "estatisticas", "suporte", "relatorio", "loja", "config"];
const TAB_LABELS = { dashboard: "Dashboard", seewhois: "SeeWhois", caixa: "Caixa", catalogo: "Catálogo", alugueres: "Alugueres", lojistas: "Lojistas", clientes: "Clientes", reservas: "Reservas", campanhas: "Campanhas", mensagens: "Mensagens", afiliados: "Afiliados", feed: "Feed", landing: "Landing Page", estatisticas: "Estatísticas", suporte: "Suporte", relatorio: "Relatório Executivo", loja: "Loja Nora Grei", config: "Config" };
const TAB_ICONS = { dashboard: "📊", seewhois: "👁", caixa: "💰", catalogo: "👗", alugueres: "🔑", lojistas: "🏪", clientes: "👤", reservas: "📅", campanhas: "📢", mensagens: "💬", afiliados: "🤝", feed: "📸", landing: "🌐", estatisticas: "📈", suporte: "🎫", relatorio: "📋", loja: "✦", config: "⚙️" };
const TABS_PRIMARIOS = ["dashboard", "alugueres", "catalogo", "feed", "caixa"];

const PECA_VAZIA = { nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "", descricao: "", material: "", origem: "Portugal", destaque: false, hero_position: "center top", ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }] };

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", icon: "💎", caucao: 8,  cor: "#6c5ce7" };
  if (n >= 10) return { nome: "Ouro",    icon: "🥇", caucao: 50, cor: "#f39c12" };
  if (n >= 5)  return { nome: "Prata",   icon: "🥈", caucao: 75, cor: "#95a5a6" };
  return             { nome: "Bronze",   icon: "🥉", caucao: 100, cor: "#cd7f32" };
};

const ROW = { display: "flex", gap: "1rem", flexWrap: "wrap" };
const COL2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const COL4 = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" };
const CARD = { background: "#fff", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: 0 };
const CARD_T = { fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0eeeb" };
const LBL = { display: "block", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: "0.4rem", fontWeight: 500 };
const INP = { width: "100%", padding: "0.75rem 0.9rem", border: "1.5px solid #e2dfda", background: "#fff", fontSize: "0.9rem", fontFamily: "'Jost',sans-serif", color: "#080808", outline: "none", boxSizing: "border-box" };
const BTN = (c="black",s="md") => ({ padding: s==="sm"?"0.3rem 0.65rem":"0.55rem 1rem", fontSize: s==="sm"?"0.6rem":"0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", border: c==="outline"?"1.5px solid #e2dfda":"none", background: c==="black"?"#080808":c==="rosa"?"#c4748a":c==="red"?"#fff5f5":c==="green"?"#27ae60":"#fff", color: c==="black"||c==="rosa"||c==="green"?"#fff":c==="red"?"#e74c3c":"#080808", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontWeight: 500 });
const BADGE = (c) => ({ display: "inline-block", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2rem 0.5rem", fontWeight: 600, background: c==="green"?"#e8f5e9":c==="orange"?"#fff8e1":c==="red"?"#fff5f5":c==="rosa"?"#fff0f3":c==="blue"?"#e8f4f8":"#f0eeeb", color: c==="green"?"#27ae60":c==="orange"?"#f39c12":c==="red"?"#e74c3c":c==="rosa"?"#c4748a":c==="blue"?"#2980b9":"#888" });
const TH = { fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#888", fontWeight: 600, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: "2px solid #f0eeeb", whiteSpace: "nowrap" };
const TD = { fontSize: "0.85rem", padding: "0.85rem 0.75rem", borderBottom: "1px solid #f8f8f8", verticalAlign: "middle" };

const ETAPAS_ALUGUER = ["pendente", "confirmado", "enviado", "ativo", "em_verificacao", "devolvido"];
const ETAPA_LABEL = { pendente: "Pago", confirmado: "Pago", enviado: "Enviado", ativo: "A usar", em_verificacao: "Verificação", devolvido: "Concluído" };
const ESTADO_LABEL_PT = { pendente: "A aguardar pagamento", confirmado: "Pagamento confirmado", enviado: "A caminho", ativo: "A usar", em_verificacao: "Em inspeção", devolvido: "Concluído", devolvido_danificado: "Concluído — com danos", cancelado: "Cancelado", nao_devolvido: "Não devolvido" };

function ProgressoAluguer({ estado }) {
  const idx = ETAPAS_ALUGUER.indexOf(estado);
  const isProblema = estado === "devolvido_danificado" || estado === "cancelado" || estado === "nao_devolvido";
  if (isProblema) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ fontSize: "0.95rem" }}>⚠️</span>
        <span style={{ fontSize: "0.65rem", color: "#e74c3c", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {estado === "devolvido_danificado" ? "Com danos" : estado === "cancelado" ? "Cancelado" : "Não devolvido"}
        </span>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {ETAPAS_ALUGUER.map((etapa, i) => (
          <div key={etapa} title={ETAPA_LABEL[etapa]} style={{
            width: i === idx ? 22 : 14, height: 6, borderRadius: 3,
            background: i <= idx ? "#080808" : "#e2dfda",
            transition: "all 0.2s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ETAPA_LABEL[estado] || estado}</div>
    </div>
  );
}

// --- TALÃO / RECIBO (modal) ---
function ModalRecibo({ recibo, aluguer, peca, tamanho, onClose }) {
  if (!recibo) return null;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(8,8,8,0.6)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff",width:"100%",maxWidth:400,padding:"2rem",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"1rem",right:"1rem",background:"none",border:"none",fontSize:"1.3rem",cursor:"pointer",color:"#888" }}>✕</button>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"1rem",paddingBottom:"0.75rem",borderBottom:"2px dashed #e2dfda" }}>
          <span style={{ fontFamily:"var(--sans)",fontSize:"1.1rem",letterSpacing:"0.15em",textTransform:"uppercase" }}>NORA GREI</span>
          <span style={{ fontSize:"0.68rem",color:"#888",fontFamily:"monospace" }}>{recibo.numero}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Data</span><span>{new Date(recibo.created_at).toLocaleString("pt-PT")}</span></div>
        {recibo.clientes?.codigo_cliente && (
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Cliente</span><span style={{ fontFamily:"monospace",fontWeight:700,color:"#9c4d63" }}>{recibo.clientes.codigo_cliente}</span></div>
        )}
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Peça</span><span>{peca?.nome || "—"}</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Tamanho</span><span>{tamanho || "—"}</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Datas</span><span>{aluguer?.data_inicio} → {aluguer?.data_fim}</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Método pagamento</span><span style={{ textTransform:"capitalize" }}>{recibo.metodo_pagamento}</span></div>
        {recibo.comprovativo_url && (
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Comprovativo</span><a href={recibo.comprovativo_url} target="_blank" rel="noopener noreferrer" style={{ color:"#27ae60" }}>Ver ↗</a></div>
        )}
        <div style={{ borderTop:"1px dashed #e2dfda", margin:"0.5rem 0" }} />
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Aluguer</span><span>{recibo.valor_aluguer}€</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Higienização</span><span>{recibo.valor_higienizacao}€</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span>Depósito</span><span>{recibo.valor_deposito}€</span></div>
        <div style={{ borderTop:"1px dashed #e2dfda", margin:"0.5rem 0" }} />
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"1.1rem",fontWeight:600,padding:"0.5rem 0" }}><span>Total</span><span>{recibo.valor_total}€</span></div>
        <div style={{ textAlign:"center",fontSize:"1.2rem",fontWeight:700,marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"2px dashed #e2dfda",color:recibo.estado==="pago"?"#27ae60":"#f39c12" }}>
          {recibo.estado==="pago" ? "✓ Pago" : "⏳ Pendente"}
        </div>
      </div>
    </div>
  );
}

// --- SEEWHOIS ---
function SeeWhois() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [reciboAberto, setReciboAberto] = useState(null);
  const [contextoRecibo, setContextoRecibo] = useState(null);

  const pesquisar = async (termoForcado) => {
    const termo = (termoForcado ?? query).trim();
    if (!termo) return;
    setLoading(true); setErro(""); setResultado(null);

    const termoLower = termo.toLowerCase();
    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("*")
      .or(`nome.ilike.%${termo}%,email.ilike.%${termo}%,telefone.ilike.%${termo}%,nif.ilike.%${termo}%,codigo_cliente.ilike.%${termo}%,numero_cc.ilike.%${termo}%`)
      .limit(5);

    if (error) { setErro(error.message); setLoading(false); return; }
    if (!clientes || clientes.length === 0) { setErro("Nenhum cliente encontrado com esse termo."); setLoading(false); return; }

    const cliente = clientes[0];

    const { data: alugueres } = await supabase
      .from("alugueres")
      .select("*, stock_tamanhos(tamanho, pecas(nome, codigo_referencia, fotos, valor_peca))")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    const { data: recibos } = await supabase
      .from("recibos")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    const { data: reservas } = await supabase
      .from("reservas_espera")
      .select("*, stock_tamanhos(tamanho, pecas(nome, codigo_referencia, fotos))")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    const { data: codigos } = await supabase
      .from("codigos_desconto")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    const al = alugueres || [];
    const completos = al.filter(a => ["devolvido", "devolvido_danificado"].includes(a.estado)).length;
    const totalGasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
    const ativos = al.filter(a => ["pendente","confirmado","enviado","ativo","em_verificacao"].includes(a.estado));
    const nv = NIVEL(completos);

    setResultado({
      cliente, alugueres: al, recibos: recibos || [], reservas: reservas || [], codigos: codigos || [],
      stats: { totalGasto, completos, totalAlugueres: al.filter(a => a.estado !== "cancelado").length, ativos: ativos.length, nivel: nv },
      outrosClientes: clientes.slice(1),
    });
    setLoading(false);
  };

  const abrirRecibo = (recibo, aluguer) => {
    setReciboAberto(recibo);
    setContextoRecibo({ aluguer, peca: aluguer?.stock_tamanhos?.pecas, tamanho: aluguer?.stock_tamanhos?.tamanho });
  };

  return (
    <>
      <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>SeeWhois</h1>
      <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Pesquisa universal — quem é, o que pediu, o que pagou</p>

      <div style={CARD}>
        <div style={{ display:"flex",gap:"0.75rem" }}>
          <input
            style={{ ...INP, flex:1 }}
            placeholder="Nome, email, telefone, NIF, código de cliente ou nº de CC..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && pesquisar()}
            autoFocus
          />
          <button style={BTN("black")} onClick={() => pesquisar()} disabled={loading}>{loading ? "..." : "🔍 Pesquisar"}</button>
        </div>
        {erro && <p style={{ fontSize:"0.8rem",color:"#e74c3c",marginTop:"0.75rem" }}>{erro}</p>}
      </div>

      {resultado && (
        <>
          <div style={CARD}>
            <p style={CARD_T}>Identidade</p>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem" }}>
              <div>
                <div style={{ fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:600 }}>{resultado.cliente.nome || "—"}</div>
                <div style={{ fontSize:"0.78rem",color:"#c4748a",fontWeight:600,marginTop:"0.2rem" }}>{resultado.cliente.codigo_cliente || "—"}</div>
              </div>
              <span style={{ ...BADGE(""),background:resultado.stats.nivel.cor+"22",color:resultado.stats.nivel.cor,fontSize:"0.72rem",padding:"0.4rem 0.8rem" }}>{resultado.stats.nivel.icon} {resultado.stats.nivel.nome}</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem" }}>
              {[
                ["Email", resultado.cliente.email],
                ["Telefone", resultado.cliente.telefone || "—"],
                ["NIF", resultado.cliente.nif || "—"],
                ["Nº Cartão Cidadão", resultado.cliente.numero_cc || "—"],
                ["Morada", [resultado.cliente.morada, resultado.cliente.numero_porta, resultado.cliente.andar].filter(Boolean).join(", ") || "—"],
                ["Código postal", resultado.cliente.codigo_postal || "—"],
                ["Cidade", resultado.cliente.cidade || "—"],
                ["País", resultado.cliente.pais || "—"],
                ["Membro desde", resultado.cliente.created_at ? new Date(resultado.cliente.created_at).toLocaleDateString("pt-PT") : "—"],
                ["Perfil completo", resultado.cliente.perfil_completo ? "✓ Sim" : "⚠️ Não"],
              ].map(([k, v]) => (
                <div key={k} style={{ background:"#f8f8f6",padding:"0.85rem" }}>
                  <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.25rem" }}>{k}</div>
                  <div style={{ fontSize:"0.85rem",fontWeight:500,wordBreak:"break-word" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={COL4}>
            {[
              { val: resultado.stats.totalAlugueres, lbl: "Total alugueres" },
              { val: resultado.stats.ativos, lbl: "Em curso", cor: "#1976d2" },
              { val: `${resultado.stats.totalGasto.toFixed(0)}€`, lbl: "Total gasto", cor: "#c4748a" },
              { val: `${resultado.stats.nivel.caucao}%`, lbl: "Caução exigida", cor: resultado.stats.nivel.cor },
            ].map((s, i) => (
              <div key={i} style={{ background:"#fff",padding:"1.25rem",borderTop:`3px solid ${s.cor||"#080808"}` }}>
                <div style={{ fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:600,color:s.cor||"#080808" }}>{s.val}</div>
                <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginTop:"0.4rem" }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={CARD}>
            <p style={CARD_T}>Histórico de alugueres ({resultado.alugueres.length})</p>
            {resultado.alugueres.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem alugueres registados</p> : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Peça","Tam.","Datas","Valor","Estado","Recibo"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {resultado.alugueres.map(a => {
                      const peca = a.stock_tamanhos?.pecas;
                      const reciboDoAluguer = resultado.recibos.find(r => r.aluguer_id === a.id);
                      return (
                        <tr key={a.id} style={{ background:"#fff" }}>
                          <td style={TD}>
                            <div style={{ display:"flex",gap:"0.5rem",alignItems:"center" }}>
                              <div style={{ width:36,height:46,flexShrink:0,background:"#f0eeeb",overflow:"hidden" }}>
                                {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />}
                              </div>
                              <div>
                                <div style={{ fontWeight:600 }}>{peca?.nome || "—"}</div>
                                <div style={{ fontSize:"0.72rem",color:"#c4748a",fontWeight:600,fontFamily:"monospace" }}>{peca?.codigo_referencia || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={TD}>{a.stock_tamanhos?.tamanho || "—"}</td>
                          <td style={{ ...TD,whiteSpace:"nowrap",fontSize:"0.8rem" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={TD}>
                            <strong>{a.valor_aluguer}€</strong>
                            {a.desconto_cesto && <div style={{ fontSize:"0.68rem",color:"#c4748a",marginTop:"0.1rem" }}>🛍 {a.desconto_cesto.startsWith("opcao_a") ? a.desconto_cesto.replace("opcao_a_","").replace("pct","% desc.") : "desc. caução"}</div>}
                          </td>
                          <td style={TD}><span style={BADGE(a.estado==="devolvido"?"green":["devolvido_danificado","cancelado","nao_devolvido"].includes(a.estado)?"red":"orange")}>{ESTADO_LABEL_PT[a.estado] || a.estado}</span></td>
                          <td style={TD}>{reciboDoAluguer ? <button style={BTN("outline","sm")} onClick={() => abrirRecibo(reciboDoAluguer, a)}>🧾 Ver talão</button> : <span style={{ color:"#ccc",fontSize:"0.75rem" }}>—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem" }}>
            <div style={CARD}>
              <p style={CARD_T}>Reservas em espera ({resultado.reservas.filter(r => r.estado !== "expirado").length})</p>
              {resultado.reservas.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem reservas</p> : resultado.reservas.map(r => (
                <div key={r.id} style={{ display:"flex",justifyContent:"space-between",padding:"0.6rem 0",borderBottom:"1px solid #f8f8f6",fontSize:"0.82rem" }}>
                  <span>{r.stock_tamanhos?.pecas?.nome || "—"} ({r.stock_tamanhos?.tamanho})</span>
                  <span style={BADGE(r.estado==="notificado"?"green":r.estado==="expirado"?"red":"orange")}>{r.estado==="aguarda"?"A aguardar":r.estado==="notificado"?"Notificado":"Expirado"}</span>
                </div>
              ))}
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Códigos de desconto ({resultado.codigos.length})</p>
              {resultado.codigos.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem códigos gerados</p> : resultado.codigos.map(c => (
                <div key={c.id} style={{ display:"flex",justifyContent:"space-between",padding:"0.6rem 0",borderBottom:"1px solid #f8f8f6",fontSize:"0.82rem" }}>
                  <span style={{ fontFamily:"monospace",fontWeight:600 }}>{c.codigo}</span>
                  <span>{c.valor}€ — <span style={BADGE(c.estado==="ativo"?"green":"gray")}>{c.estado}</span></span>
                </div>
              ))}
            </div>
          </div>

          {resultado.outrosClientes.length > 0 && (
            <div style={CARD}>
              <p style={CARD_T}>Outros resultados parecidos</p>
              {resultado.outrosClientes.map(c => (
                <button key={c.id} style={{ ...BTN("outline","sm"), display:"block", marginBottom:"0.4rem", width:"fit-content" }} onClick={() => { setQuery(c.codigo_cliente || c.email); pesquisar(c.codigo_cliente || c.email); }}>
                  {c.nome} — {c.codigo_cliente || c.email}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {reciboAberto && (
        <ModalRecibo
          recibo={reciboAberto}
          aluguer={contextoRecibo?.aluguer}
          peca={contextoRecibo?.peca}
          tamanho={contextoRecibo?.tamanho}
          onClose={() => { setReciboAberto(null); setContextoRecibo(null); }}
        />
      )}
    </>
  );
}

function TimerReservaBackoffice({ dataDisponivel }) {
  const [tempo, setTempo] = useState("");
  useEffect(() => {
    if (!dataDisponivel) return;
    const calc = () => {
      const diff = new Date(dataDisponivel) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h ${mins}m`);
      else setTempo(`${horas}h ${mins}m`);
    };
    calc();
    const iv = setInterval(calc, 30000);
    return () => clearInterval(iv);
  }, [dataDisponivel]);
  if (!tempo) return null;
  return <div style={{ fontSize:"0.68rem",color:"#b8860b",fontWeight:600,marginTop:"0.2rem" }}>Disponível em {tempo}</div>;
}

const TRANSPORTADORAS = ["CTT Expresso", "DPD", "UPS", "DHL", "GLS", "Outra"];

function ModalEnvio({ aluguer, onClose, onEnviado }) {
  const [transportadora, setTransportadora] = useState(TRANSPORTADORAS[0]);
  const [codigoRastreio, setCodigoRastreio] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const confirmarEnvio = async () => {
    setAGuardar(true);
    const agora = new Date().toISOString();
    await supabase.from("envios").insert({
      aluguer_id: aluguer.id, transportadora, codigo_rastreio: codigoRastreio || null, data_envio: agora,
    });
    await supabase.from("alugueres").update({ estado: "enviado", data_envio: agora }).eq("id", aluguer.id);
    setAGuardar(false);
    onEnviado();
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(8,8,8,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff",width:"100%",maxWidth:420,padding:"2rem" }}>
        <h2 style={{ fontFamily:"var(--sans)",fontSize:"1.2rem",fontWeight:600,marginBottom:"1.25rem" }}>Marcar como enviado</h2>
        <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"1.25rem" }}>{aluguer.stock_tamanhos?.pecas?.nome} — {aluguer.clientes?.nome}</p>
        <div style={{ marginBottom:"1rem" }}>
          <label style={LBL}>Transportadora</label>
          <select style={INP} value={transportadora} onChange={e => setTransportadora(e.target.value)}>
            {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:"1.5rem" }}>
          <label style={LBL}>Código de rastreio (opcional)</label>
          <input style={INP} value={codigoRastreio} onChange={e => setCodigoRastreio(e.target.value)} placeholder="PT123456789CT" />
        </div>
        <div style={{ display:"flex",gap:"0.75rem" }}>
          <button style={{ ...BTN("black"),flex:1,opacity:aGuardar?0.6:1 }} onClick={confirmarEnvio} disabled={aGuardar}>{aGuardar?"A confirmar...":"Confirmar envio"}</button>
          <button style={BTN("outline")} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}


const CATEGORIAS_DESPESA = ["Compra de stock", "Manutenção", "Envio/Logística", "Marketing", "Higienização", "Outro"];
const CATEGORIAS_FIXAS = ["Renda", "Salários", "Subscrições", "Software", "Seguros", "Contabilidade", "Outro fixo"];
const CATEGORIAS_VARIAVEIS = ["Compra de stock", "Envio/Logística", "Higienização", "Marketing campanha", "Embalagem", "Reparação peça", "Outro variável"];

function Caixa() {
  const [movimentos, setMovimentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [reembolsosDinheiro, setReembolsosDinheiro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", tipo_custo: "variavel", categoria: CATEGORIAS_VARIAVEIS[0], valor: "", data: new Date().toISOString().split("T")[0] });
  const [aGuardar, setAGuardar] = useState(false);
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => { carregarCaixa(); }, []);

  const processarReembolso = async (id) => {
    await supabase.from("reembolsos_pendentes").update({
      estado: "processado",
      processado_em: new Date().toISOString(),
    }).eq("id", id);
    setReembolsosDinheiro(prev => prev.filter(r => r.id !== id));
  };

  const carregarCaixa = async () => {
    setLoading(true);
    const [recibosRes, alugueresRes, despesasRes, reembolsosRes] = await Promise.all([
      supabase.from("recibos").select("*, clientes(nome, codigo_cliente, nif), alugueres(desconto_cesto, valor_aluguer)").eq("estado", "pago").order("created_at", { ascending: false }),
      supabase.from("alugueres").select("id, valor_aluguer, deposito_valor, deposito_estado, caucao_libertada_em, clientes(nome, codigo_cliente)").eq("deposito_estado", "libertado").not("caucao_libertada_em", "is", null),
      supabase.from("despesas").select("*").order("data", { ascending: false }),
      supabase.from("reembolsos_pendentes").select("*, alugueres_lojista(id, pecas_lojista(nome)), clientes:cliente_id(nome, email, iban)").eq("estado", "reembolso_dinheiro").order("escolha_em", { ascending: true }),
    ]);

    const entradas = (recibosRes.data || []).map(r => ({
      tipo: "entrada", data: r.created_at,
      descricao: `Talão ${r.numero} — ${r.clientes?.nome || "Cliente"}`,
      valor: r.valor_total, categoria: r.metodo_pagamento,
      codigoCliente: r.clientes?.codigo_cliente || "—",
      nif: r.clientes?.nif || "—",
      numeroTalao: r.numero,
      desconto_cesto: r.alugueres?.desconto_cesto || null,
      recibo: r,
    }));
    const saidasCaucao = (alugueresRes.data || []).map(a => ({
      tipo: "saida", data: a.caucao_libertada_em,
      descricao: `Caução devolvida — ${a.clientes?.nome || "Cliente"}`,
      valor: a.deposito_valor || 0, categoria: "Caução",
      codigoCliente: a.clientes?.codigo_cliente || "—",
    }));
    const saidasDespesas = (despesasRes.data || []).map(d => ({
      tipo: "saida", data: d.data, descricao: d.descricao, valor: d.valor, categoria: d.categoria, tipo_custo: d.tipo_custo || "variavel", id: d.id,
    }));

    const todos = [...entradas, ...saidasCaucao, ...saidasDespesas].sort((a, b) => new Date(b.data) - new Date(a.data));
    setMovimentos(todos);
    setDespesas(despesasRes.data || []);
    setReembolsosDinheiro(reembolsosRes.data || []);
    setLoading(false);
  };

  const registarDespesa = async () => {
    if (!novaDespesa.descricao || !novaDespesa.valor) { alert("Descrição e valor são obrigatórios"); return; }
    setAGuardar(true);
    const { error } = await supabase.from("despesas").insert({
      descricao: novaDespesa.descricao, categoria: novaDespesa.categoria,
      valor: parseFloat(novaDespesa.valor), data: novaDespesa.data, tipo_custo: novaDespesa.tipo_custo,
    });
    setAGuardar(false);
    if (error) { alert("Erro: " + error.message); return; }
    setNovaDespesa({ descricao: "", tipo_custo: "variavel", categoria: CATEGORIAS_VARIAVEIS[0], valor: "", data: new Date().toISOString().split("T")[0] });
    carregarCaixa();
  };

  const apagarDespesa = async (id) => {
    if (!confirm("Apagar esta despesa?")) return;
    await supabase.from("despesas").delete().eq("id", id);
    carregarCaixa();
  };

  const movimentosDoMes = movimentos.filter(m => m.data && m.data.slice(0, 7) === mesFiltro);

  // Agrupar por dia para o livro de caixa, com saldo acumulado
  const porDia = {};
  movimentosDoMes.forEach(m => {
    const dia = m.data.slice(0, 10);
    if (!porDia[dia]) porDia[dia] = { entradas: 0, saidas: 0, itens: [] };
    if (m.tipo === "entrada") porDia[dia].entradas += m.valor;
    else porDia[dia].saidas += m.valor;
    porDia[dia].itens.push(m);
  });
  const diasOrdenados = Object.keys(porDia).sort((a, b) => new Date(a) - new Date(b));
  let saldoAcumulado = 0;
  const linhasCaixa = diasOrdenados.map(dia => {
    const d = porDia[dia];
    const saldoDia = d.entradas - d.saidas;
    saldoAcumulado += saldoDia;
    return { dia, ...d, saldoDia, saldoAcumulado };
  }).reverse();

  const totalEntradasMes = movimentosDoMes.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaidasMes = movimentosDoMes.filter(m => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);

  if (loading) return <div style={{ textAlign:"center",padding:"3rem",color:"#888" }}>A carregar caixa...</div>;

  return (
    <>
      <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Caixa</h1>
      <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Livro de caixa diário — entradas e saídas reais</p>

      {reembolsosDinheiro.length > 0 && (
        <div style={{ background:"#fff8e1",border:"1.5px solid #f9a825",borderRadius:10,padding:"1.5rem",marginBottom:"2rem" }}>
          <div style={{ fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#c17f00",fontWeight:700,marginBottom:"1rem" }}>
            ⚠ Reembolsos por processar ({reembolsosDinheiro.length})
          </div>
          <p style={{ fontSize:"0.78rem",color:"#5a4a00",marginBottom:"1.25rem",lineHeight:1.5 }}>
            Estes clientes cancelaram por iniciativa do lojista e optaram por reembolso em dinheiro. Após transferência bancária, marcar como processado.
          </p>
          {reembolsosDinheiro.map(r => (
            <div key={r.id} style={{ display:"flex",alignItems:"center",gap:"1rem",padding:"0.85rem 1rem",background:"#fff",borderRadius:6,marginBottom:"0.5rem",flexWrap:"wrap" }}>
              <div style={{ flex:1,minWidth:180 }}>
                <div style={{ fontSize:"0.8rem",fontWeight:600,color:"#1a1816" }}>{r.clientes?.nome || "—"}</div>
                <div style={{ fontSize:"0.72rem",color:"#888" }}>{r.alugueres_lojista?.pecas_lojista?.nome} · {r.metodo_pagamento_original || "MB/MBWay"}</div>
                {r.clientes?.iban && <div style={{ fontSize:"0.72rem",fontFamily:"monospace",color:"#3f3e3c",marginTop:"0.2rem" }}>IBAN: {r.clientes.iban}</div>}
                <div style={{ fontSize:"0.68rem",color:"#aaa" }}>Pedido: {r.escolha_em ? new Date(r.escolha_em).toLocaleDateString("pt-PT") : "—"}</div>
              </div>
              <div style={{ fontSize:"1.1rem",fontWeight:700,color:"#1a1816",minWidth:70,textAlign:"right" }}>€{r.valor?.toFixed(2)}</div>
              <button onClick={() => processarReembolso(r.id)} style={{ padding:"0.6rem 1.1rem",background:"#27ae60",color:"#fff",border:"none",borderRadius:4,fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap" }}>
                ✓ Processado
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={CARD}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
          <p style={{ ...CARD_T, marginBottom:0, border:"none", paddingBottom:0 }}>Mês</p>
          <input type="month" style={{ ...INP, width:"auto" }} value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
        </div>
        <div style={COL4}>
          {[
            { val: `${totalEntradasMes.toFixed(0)}€`, lbl: "Entradas no mês", cor: "#27ae60" },
            { val: `${totalSaidasMes.toFixed(0)}€`, lbl: "Saídas no mês", cor: "#e74c3c" },
            { val: `${(totalEntradasMes - totalSaidasMes).toFixed(0)}€`, lbl: "Saldo do mês", cor: (totalEntradasMes - totalSaidasMes) >= 0 ? "#27ae60" : "#e74c3c" },
            { val: movimentosDoMes.length, lbl: "Movimentos" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#f8f8f6",padding:"1.25rem",borderTop:`3px solid ${s.cor||"#080808"}` }}>
              <div style={{ fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:600,color:s.cor||"#080808" }}>{s.val}</div>
              <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginTop:"0.4rem" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={CARD}>
        <p style={CARD_T}>Registar nova despesa</p>
        {/* Toggle fixo / variável */}
        <div style={{ display:"flex",gap:"0.5rem",marginBottom:"1rem" }}>
          {[["fixo","🏠 Custo fixo","#3f3e3c"],["variavel","📦 Custo variável","#9c4d63"]].map(([val,lbl,cor]) => (
            <button key={val} onClick={() => setNovaDespesa(p=>({ ...p, tipo_custo:val, categoria: val==="fixo"?CATEGORIAS_FIXAS[0]:CATEGORIAS_VARIAVEIS[0] }))}
              style={{ padding:"0.4rem 1rem",fontSize:"0.75rem",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",border:`1.5px solid ${novaDespesa.tipo_custo===val?cor:"#e2dfda"}`,background:novaDespesa.tipo_custo===val?cor:"#fff",color:novaDespesa.tipo_custo===val?"#fff":"#888",cursor:"pointer",borderRadius:2,transition:"all 0.15s" }}>
              {lbl}
            </button>
          ))}
          <span style={{ fontSize:"0.72rem",color:"#aaa",alignSelf:"center",marginLeft:"0.5rem" }}>
            {novaDespesa.tipo_custo==="fixo" ? "Renda, salários, subscrições — recorrente independente do volume" : "Envios, stock, higienização — varia com o nº de alugueres"}
          </span>
        </div>
        <div style={COL4}>
          <div style={{ gridColumn:"span 2" }}><label style={LBL}>Descrição *</label><input style={INP} value={novaDespesa.descricao} onChange={e => setNovaDespesa(p=>({...p,descricao:e.target.value}))} placeholder={novaDespesa.tipo_custo==="fixo"?"Ex: Renda do armazém Março":"Ex: Envio expresso 5 peças"} /></div>
          <div><label style={LBL}>Categoria</label>
            <select style={INP} value={novaDespesa.categoria} onChange={e => setNovaDespesa(p=>({...p,categoria:e.target.value}))}>
              {(novaDespesa.tipo_custo==="fixo" ? CATEGORIAS_FIXAS : CATEGORIAS_VARIAVEIS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={LBL}>Valor (€) *</label><input style={INP} type="number" value={novaDespesa.valor} onChange={e => setNovaDespesa(p=>({...p,valor:e.target.value}))} placeholder="120" /></div>
        </div>
        <div style={{ ...COL2, marginTop:"1rem", maxWidth:300 }}>
          <div><label style={LBL}>Data</label><input style={INP} type="date" value={novaDespesa.data} onChange={e => setNovaDespesa(p=>({...p,data:e.target.value}))} /></div>
        </div>
        <button style={{ ...BTN("black"), marginTop:"1rem", opacity:aGuardar?0.6:1 }} onClick={registarDespesa} disabled={aGuardar}>{aGuardar?"A guardar...":"+ Registar despesa"}</button>
      </div>

      <div style={CARD}>
        <p style={CARD_T}>Livro de caixa — {mesFiltro}</p>
        {linhasCaixa.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem movimentos neste mês</p> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr>{["Dia","Entradas","Saídas","Saldo do dia","Saldo acumulado",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {linhasCaixa.map(l => (
                  <RowDia key={l.dia} linha={l} onApagarDespesa={apagarDespesa} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function RowDia({ linha, onApagarDespesa }) {
  const [aberto, setAberto] = useState(false);
  const [talaoAberto, setTalaoAberto] = useState(null);
  return (
    <>
      <tr style={{ background:"#fff",cursor:"pointer" }} onClick={() => setAberto(!aberto)}>
        <td style={TD}><strong>{new Date(linha.dia).toLocaleDateString("pt-PT", { weekday:"short", day:"2-digit", month:"short" })}</strong></td>
        <td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>+{linha.entradas.toFixed(0)}€</td>
        <td style={{ ...TD,color:"#e74c3c",fontWeight:600 }}>-{linha.saidas.toFixed(0)}€</td>
        <td style={{ ...TD,fontWeight:600,color:linha.saldoDia>=0?"#27ae60":"#e74c3c" }}>{linha.saldoDia>=0?"+":""}{linha.saldoDia.toFixed(0)}€</td>
        <td style={{ ...TD,fontWeight:700 }}>{linha.saldoAcumulado.toFixed(0)}€</td>
        <td style={TD}><span style={{ fontSize:"0.7rem",color:"#3f3e3c" }}>{aberto?"▲":"▼"} {linha.itens.length} itens</span></td>
      </tr>
      {aberto && linha.itens.map((item, idx) => (
        <tr key={idx} style={{ background:"#f8f8f6" }}>
          <td style={{ ...TD,paddingLeft:"2rem",fontSize:"0.78rem",color:"#3f3e3c" }}>↳ {item.codigoCliente && <span style={{ fontFamily:"monospace",fontWeight:700,color:"#9c4d63" }}>{item.codigoCliente}</span>}</td>
          <td colSpan={2} style={{ ...TD,fontSize:"0.78rem" }}>
            {item.descricao} <span style={{ color:"#888" }}>({item.categoria})</span>
            {item.nif && item.nif !== "—" && <span style={{ color:"#888",marginLeft:"0.5rem" }}>NIF {item.nif}</span>}
            {item.desconto_cesto && <span style={{ marginLeft:"0.5rem",fontSize:"0.75rem",background:"#fff0f3",color:"#c4748a",padding:"0.1rem 0.4rem",borderRadius:2,fontWeight:600 }}>🛍 {item.desconto_cesto.startsWith("opcao_a") ? "Cesto " + item.desconto_cesto.replace("opcao_a_","").replace("pct","% desc.") : "Cesto desc. caução"}</span>}
            {item.tipo === "saida" && item.id && <span style={{ marginLeft:"0.5rem",fontSize:"0.72rem",padding:"0.1rem 0.35rem",borderRadius:2,fontWeight:600,background:item.tipo_custo==="fixo"?"#f0f4ff":"#fff8f0",color:item.tipo_custo==="fixo"?"#3f5fa3":"#8a5a00" }}>{item.tipo_custo==="fixo"?"🏠 Fixo":"📦 Variável"}</span>}
          </td>
          <td style={{ ...TD,fontSize:"0.78rem",color:item.tipo==="entrada"?"#27ae60":"#e74c3c",fontWeight:600 }}>{item.tipo==="entrada"?"+":"-"}{item.valor.toFixed(0)}€</td>
          <td style={TD}></td>
          <td style={TD}>
            <div style={{ display:"flex",gap:"0.3rem" }}>
              {item.recibo && <button onClick={(e) => { e.stopPropagation(); setTalaoAberto(item.recibo); }} style={{ ...BTN("outline","sm") }}>🧾 Talão</button>}
              {item.id && <button onClick={(e) => { e.stopPropagation(); onApagarDespesa(item.id); }} style={{ ...BTN("red","sm") }}>Apagar</button>}
            </div>
          </td>
        </tr>
      ))}
      {talaoAberto && (
        <tr><td colSpan={6} style={{padding:0,border:"none"}}>
          <ModalRecibo recibo={talaoAberto} aluguer={null} peca={null} tamanho={null} onClose={() => setTalaoAberto(null)} />
        </td></tr>
      )}
    </>
  );
}

function FeedBackoffice() {
  const [posts, setPosts] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [vista, setVista] = useState("pendentes"); // pendentes | publicados | boosts

  useEffect(() => { carregarFeed(); }, [vista]);

  const carregarFeed = async () => {
    if (vista === "boosts") {
      const { data } = await supabase.from("boost_pagamentos").select("*, feed_posts(titulo, estado), clientes(nome)").order("created_at", { ascending: false });
      setBoosts(data || []);
    } else {
      const estado = vista === "pendentes" ? "pendente" : "publicado";
      const { data } = await supabase.from("feed_posts").select("*, clientes(nome)").eq("estado", estado).order("created_at", { ascending: false });
      setPosts(data || []);
    }
  };

  const aprovar = async (id) => {
    await supabase.from("feed_posts").update({ estado: "publicado", publicado_em: new Date().toISOString() }).eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const rejeitar = async (id) => {
    await supabase.from("feed_posts").update({ estado: "rejeitado" }).eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const confirmarBoost = async (b) => {
    await supabase.from("boost_pagamentos").update({ estado: "pago" }).eq("id", b.id);
    const fim = new Date(); fim.setDate(fim.getDate() + b.dias);
    await supabase.from("feed_posts").update({ boosted: true, boost_inicio: new Date().toISOString(), boost_fim: fim.toISOString(), boost_valor: b.valor, boost_pago: true }).eq("id", b.post_id);
    setBoosts(prev => prev.map(x => x.id === b.id ? { ...x, estado: "pago" } : x));
  };

  const BTN = (c="dark",s="md") => ({ background: c==="dark"?"#1a1a1a":c==="green"?"#27ae60":c==="red"?"#e74c3c":"#fff", color: c==="outline"?"#1a1a1a":"#fff", border: c==="outline"?"1.5px solid #1a1a1a":"none", padding: s==="sm"?"0.35rem 0.75rem":"0.5rem 1rem", borderRadius:"6px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"'Jost',sans-serif" });
  const TD = { padding:"0.65rem 0.75rem", borderBottom:"1px solid #f0eeeb", fontSize:"0.8rem", verticalAlign:"middle" };

  return (
    <div>
      <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Feed</h1>
      <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"1.5rem" }}>Moderar posts e gerir boosts pagos</p>
      <div style={{ display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap" }}>
        {["pendentes","publicados","boosts"].map(v => (
          <button key={v} onClick={() => setVista(v)} style={{ ...BTN(vista===v?"dark":"outline","sm"), textTransform:"capitalize" }}>{v}</button>
        ))}
        <a href="/feed" target="_blank" style={{ ...BTN("outline","sm"), textDecoration:"none", marginLeft:"auto" }}>Ver feed público ↗</a>
      </div>

      {vista !== "boosts" ? (
        posts.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem posts {vista}.</p> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:"10px", overflow:"hidden" }}>
              <thead><tr style={{ background:"#f7f5f2" }}>
                {["Foto","Título","Lojista","Tipo","Data","Ações"].map(h => <th key={h} style={{ ...TD, fontWeight:600, fontSize:"0.7rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#5a5855" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td style={TD}>{p.fotos?.[0] && <img src={p.fotos[0]} style={{ width:44,height:44,objectFit:"cover",borderRadius:6 }} />}</td>
                    <td style={TD}><strong>{p.titulo}</strong><br/><span style={{ fontSize:"0.72rem",color:"#888" }}>{(p.descricao||"").slice(0,50)}{p.descricao?.length>50?"...":""}</span></td>
                    <td style={TD}>{p.clientes?.nome || "—"}</td>
                    <td style={TD}><span style={{ background:"#f0eeeb",padding:"0.2rem 0.5rem",borderRadius:10,fontSize:"0.68rem" }}>{p.tipo}</span></td>
                    <td style={TD}>{new Date(p.created_at).toLocaleDateString("pt-PT")}</td>
                    <td style={TD}>
                      {vista === "pendentes" && <div style={{ display:"flex",gap:"0.4rem" }}>
                        <button style={BTN("green","sm")} onClick={() => aprovar(p.id)}>✓ Aprovar</button>
                        <button style={BTN("red","sm")} onClick={() => rejeitar(p.id)}>✕ Rejeitar</button>
                      </div>}
                      {vista === "publicados" && <div style={{ display:"flex",gap:"0.4rem" }}>
                        <button style={BTN("red","sm")} onClick={() => rejeitar(p.id)}>Despublicar</button>
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        boosts.length === 0 ? <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem pedidos de boost.</p> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:"10px", overflow:"hidden" }}>
              <thead><tr style={{ background:"#f7f5f2" }}>
                {["Post","Lojista","Valor","Dias","Estado","Ação"].map(h => <th key={h} style={{ ...TD, fontWeight:600, fontSize:"0.7rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#5a5855" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {boosts.map(b => (
                  <tr key={b.id}>
                    <td style={TD}>{b.feed_posts?.titulo || "—"}</td>
                    <td style={TD}>{b.clientes?.nome || "—"}</td>
                    <td style={TD}><strong>{b.valor}€</strong></td>
                    <td style={TD}>{b.dias} dias</td>
                    <td style={TD}><span style={{ background: b.estado==="pago"?"#e8f5e9":b.estado==="cancelado"?"#ffeaea":"#fff9e6", color: b.estado==="pago"?"#27ae60":b.estado==="cancelado"?"#e74c3c":"#c4a882", padding:"0.2rem 0.5rem", borderRadius:10, fontSize:"0.68rem", fontWeight:600 }}>{b.estado}</span></td>
                    <td style={TD}>{b.estado === "pendente" && <button style={BTN("green","sm")} onClick={() => confirmarBoost(b)}>✓ Confirmar pagamento</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

function AfiliadosTab() {
  const [afiliados, setAfiliados] = useState([]);
  const [conversoes, setConversoes] = useState([]);
  const [form, setForm] = useState({ nome:"", handle:"", plataforma:"instagram", codigo:"", desconto_pct:10, comissao_pct:10, email:"", notas:"" });
  const [editId, setEditId] = useState(null);
  const [vista, setVista] = useState("lista"); // "lista" | "novo" | "conversoes"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const { data: afs } = await supabase.from("afiliados").select("*").order("created_at", { ascending: false });
    setAfiliados(afs || []);
    const { data: cvs } = await supabase.from("conversoes_afiliado").select("*, afiliados(nome,codigo)").order("created_at", { ascending: false }).limit(50);
    setConversoes(cvs || []);
  };

  const salvar = async () => {
    setLoading(true);
    const payload = { ...form, codigo: form.codigo.trim().toUpperCase(), desconto_pct: Number(form.desconto_pct), comissao_pct: Number(form.comissao_pct) };
    if (editId) {
      await supabase.from("afiliados").update(payload).eq("id", editId);
    } else {
      await supabase.from("afiliados").insert(payload);
    }
    setMsg(editId ? "Afiliado actualizado." : "Afiliado criado.");
    setForm({ nome:"", handle:"", plataforma:"instagram", codigo:"", desconto_pct:10, comissao_pct:10, email:"", notas:"" });
    setEditId(null); setVista("lista"); setLoading(false);
    carregar();
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleAtivo = async (af) => {
    await supabase.from("afiliados").update({ ativo: !af.ativo }).eq("id", af.id);
    carregar();
  };

  const marcarPago = async (id) => {
    await supabase.from("conversoes_afiliado").update({ comissao_paga: true, comissao_paga_em: new Date().toISOString() }).eq("id", id);
    carregar();
  };

  const editarAfiliado = (af) => {
    setForm({ nome: af.nome, handle: af.handle||"", plataforma: af.plataforma||"instagram", codigo: af.codigo, desconto_pct: af.desconto_pct, comissao_pct: af.comissao_pct, email: af.email||"", notas: af.notas||"" });
    setEditId(af.id); setVista("novo");
  };

  const copiarLink = (codigo) => {
    navigator.clipboard.writeText(`${window.location.origin}/catalogo?ref=${codigo}&utm_source=afiliado&utm_medium=social`);
    setMsg("Link copiado!");
    setTimeout(() => setMsg(""), 2000);
  };

  const totalPorPagar = conversoes.filter(c => !c.comissao_paga).reduce((s, c) => s + (c.comissao_valor || 0), 0);

  const FLD = { border:"1px solid #e0ddd8", padding:"0.55rem 0.75rem", fontSize:"0.82rem", fontFamily:"inherit", width:"100%", background:"#faf9f7", outline:"none" };
  const BTN = { fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0.65rem 1.25rem", border:"none", cursor:"pointer", fontFamily:"inherit" };

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"var(--sans)", fontSize:"2rem", fontWeight:300, marginBottom:"0.1rem" }}>Afiliados</h1>
          <p style={{ fontSize:"0.75rem", color:"#888" }}>Criadores de conteúdo com código de desconto + comissão rastreável</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          {["lista","conversoes","novo"].map(v => (
            <button key={v} onClick={() => { setVista(v); setEditId(null); setForm({ nome:"", handle:"", plataforma:"instagram", codigo:"", desconto_pct:10, comissao_pct:10, email:"", notas:"" }); }} style={{ ...BTN, background: vista===v ? "#080808":"#f0eeeb", color: vista===v ? "#fff":"#080808" }}>
              {v === "lista" ? "Lista" : v === "conversoes" ? `Conversões (${conversoes.filter(c=>!c.comissao_paga).length} por pagar)` : editId ? "Editar" : "Novo afiliado"}
            </button>
          ))}
        </div>
      </div>

      {msg && <div style={{ background:"#eaf7ed", border:"1px solid #27ae60", color:"#27ae60", padding:"0.65rem 1rem", fontSize:"0.8rem", marginBottom:"1rem" }}>{msg}</div>}

      {/* RESUMO TOPO */}
      {vista === "lista" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1px", background:"#e0ddd8", marginBottom:"1.5rem" }}>
          {[
            { label:"Afiliados activos", val: afiliados.filter(a=>a.ativo).length },
            { label:"Total conversões", val: afiliados.reduce((s,a)=>s+(a.total_conversoes||0),0) },
            { label:"Comissões por pagar", val: `${totalPorPagar.toFixed(2)}€` },
          ].map((s,i) => (
            <div key={i} style={{ background:"#faf9f7", padding:"1.25rem 1.5rem" }}>
              <div style={{ fontFamily:"var(--sans)", fontSize:"2rem", fontWeight:300, color:"#c4748a" }}>{s.val}</div>
              <div style={{ fontSize:"0.75rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#888" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {vista === "lista" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1px", background:"#e0ddd8" }}>
          {afiliados.length === 0 && <div style={{ background:"#faf9f7", padding:"2rem", textAlign:"center", fontSize:"0.82rem", color:"#aaa" }}>Nenhum afiliado criado.</div>}
          {afiliados.map(af => (
            <div key={af.id} style={{ background:"#faf9f7", padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:500, marginBottom:"0.15rem" }}>{af.nome}</div>
                <div style={{ fontSize:"0.72rem", color:"#888" }}>{af.handle && `${af.handle} · `}{af.plataforma}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--sans)", fontSize:"1.4rem", fontWeight:300, letterSpacing:"0.1em", color:"#080808" }}>{af.codigo}</div>
                <div style={{ fontSize:"0.72rem", color:"#aaa", letterSpacing:"0.1em" }}>código</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1rem", fontWeight:500, color:"#c4748a" }}>{af.desconto_pct}%</div>
                <div style={{ fontSize:"0.72rem", color:"#aaa" }}>desc. cliente</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1rem", fontWeight:500 }}>{af.comissao_pct}%</div>
                <div style={{ fontSize:"0.72rem", color:"#aaa" }}>comissão</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1rem", fontWeight:500 }}>{af.total_conversoes || 0}</div>
                <div style={{ fontSize:"0.72rem", color:"#aaa" }}>conversões</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1rem", fontWeight:500, color:"#27ae60" }}>{(af.total_comissao_gerada||0).toFixed(2)}€</div>
                <div style={{ fontSize:"0.72rem", color:"#aaa" }}>gerado</div>
              </div>
              <div style={{ display:"flex", gap:"0.4rem", flexShrink:0 }}>
                <button onClick={() => copiarLink(af.codigo)} style={{ ...BTN, background:"#f0eeeb", color:"#080808", fontSize:"0.72rem" }} title="Copiar link de afiliado">🔗 Link</button>
                <button onClick={() => editarAfiliado(af)} style={{ ...BTN, background:"#f0eeeb", color:"#080808", fontSize:"0.72rem" }}>Editar</button>
                <button onClick={() => toggleAtivo(af)} style={{ ...BTN, background: af.ativo?"#fdf0f2":"#eaf7ed", color: af.ativo?"#c0392b":"#27ae60", fontSize:"0.72rem" }}>{af.ativo ? "Pausar" : "Activar"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "conversoes" && (
        <div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1px", background:"#e0ddd8" }}>
            <div style={{ background:"#f0eeeb", padding:"0.6rem 1rem", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr", gap:"0.5rem" }}>
              {["Data","Afiliado","Código","Aluguer","Desconto","Comissão"].map(h => <span key={h} style={{ fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888" }}>{h}</span>)}
            </div>
            {conversoes.length === 0 && <div style={{ background:"#faf9f7", padding:"2rem", textAlign:"center", fontSize:"0.82rem", color:"#aaa" }}>Nenhuma conversão.</div>}
            {conversoes.map(c => (
              <div key={c.id} style={{ background:"#faf9f7", padding:"0.75rem 1rem", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr", gap:"0.5rem", alignItems:"center" }}>
                <span style={{ fontSize:"0.75rem", color:"#888" }}>{new Date(c.created_at).toLocaleDateString("pt-PT")}</span>
                <span style={{ fontSize:"0.8rem", fontWeight:500 }}>{c.afiliados?.nome || "—"}</span>
                <span style={{ fontSize:"0.75rem", fontFamily:"monospace", letterSpacing:"0.05em" }}>{c.codigo_usado}</span>
                <span style={{ fontSize:"0.8rem" }}>{c.valor_aluguer?.toFixed(2)}€</span>
                <span style={{ fontSize:"0.8rem", color:"#c4748a" }}>−{c.desconto_aplicado?.toFixed(2)}€</span>
                <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  <span style={{ fontSize:"0.8rem", fontWeight:500, color: c.comissao_paga?"#27ae60":"#e74c3c" }}>{c.comissao_valor?.toFixed(2)}€</span>
                  {!c.comissao_paga && <button onClick={() => marcarPago(c.id)} style={{ ...BTN, background:"#eaf7ed", color:"#27ae60", fontSize:"0.68rem", padding:"0.25rem 0.5rem" }}>✓ Pagar</button>}
                  {c.comissao_paga && <span style={{ fontSize:"0.72rem", color:"#27ae60" }}>pago</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vista === "novo" && (
        <div style={{ background:"#faf9f7", border:"1px solid #e0ddd8", padding:"2rem" }}>
          <h2 style={{ fontFamily:"var(--sans)", fontSize:"1.5rem", fontWeight:300, marginBottom:"1.5rem" }}>{editId ? "Editar afiliado" : "Novo afiliado"}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            {[
              { label:"Nome *", key:"nome", placeholder:"Ex: Ana Silva" },
              { label:"Handle (@)", key:"handle", placeholder:"@anasilva" },
              { label:"Email (para pagamentos)", key:"email", placeholder:"ana@email.com" },
              { label:"Código único *", key:"codigo", placeholder:"EX: ANA15", upper:true },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", display:"block", marginBottom:"0.3rem" }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value }))} placeholder={f.placeholder} style={FLD} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", display:"block", marginBottom:"0.3rem" }}>Plataforma</label>
              <select value={form.plataforma} onChange={e => setForm(v=>({...v, plataforma:e.target.value}))} style={FLD}>
                {["instagram","tiktok","youtube","outro"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", display:"block", marginBottom:"0.3rem" }}>Desconto para o cliente (%)</label>
              <input type="number" min="0" max="50" value={form.desconto_pct} onChange={e => setForm(v=>({...v, desconto_pct:e.target.value}))} style={FLD} />
            </div>
            <div>
              <label style={{ fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", display:"block", marginBottom:"0.3rem" }}>Comissão para o criador (%)</label>
              <input type="number" min="0" max="50" value={form.comissao_pct} onChange={e => setForm(v=>({...v, comissao_pct:e.target.value}))} style={FLD} />
            </div>
          </div>
          <div style={{ marginBottom:"1.5rem" }}>
            <label style={{ fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", display:"block", marginBottom:"0.3rem" }}>Notas internas</label>
            <textarea value={form.notas} onChange={e => setForm(v=>({...v, notas:e.target.value}))} rows={2} style={{ ...FLD, resize:"vertical" }} />
          </div>
          {form.codigo && (
            <div style={{ background:"#f0eeeb", padding:"0.75rem 1rem", marginBottom:"1.25rem", fontSize:"0.78rem", color:"#5a5855" }}>
              Link de partilha: <strong>{typeof window !== "undefined" ? window.location.origin : "https://noragrei.com"}/catalogo?ref={form.codigo}</strong>
            </div>
          )}
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button onClick={salvar} disabled={loading || !form.nome || !form.codigo} style={{ ...BTN, background:"#080808", color:"#fff", opacity: (!form.nome||!form.codigo)?0.5:1 }}>{loading ? "A guardar..." : editId ? "Actualizar" : "Criar afiliado"}</button>
            <button onClick={() => { setVista("lista"); setEditId(null); }} style={{ ...BTN, background:"#f0eeeb", color:"#080808" }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MensagensBackoffice() {
  const [conversas, setConversas] = useState([]);
  const [convAtiva, setConvAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => { carregarConversas(); }, []);

  const carregarConversas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("conversas")
      .select(`id, assunto, ultima_mensagem_em, nao_lidas_lojista, nao_lidas_cliente,
        cliente:cliente_id(id, nome, email),
        lojista:lojista_id(id, nome),
        aluguer:aluguer_lojista_id(id, referencia)`)
      .order("ultima_mensagem_em", { ascending: false, nullsFirst: false });
    setConversas(data || []);
    setLoading(false);
  };

  const abrirConversa = async (conv) => {
    setConvAtiva(conv);
    if (subRef.current) supabase.removeChannel(subRef.current);
    const { data } = await supabase.from("mensagens_conversa").select("*").eq("conversa_id", conv.id).order("created_at", { ascending: true });
    setMensagens(data || []);
    const ch = supabase.channel(`bo-chat-${conv.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens_conversa", filter: `conversa_id=eq.${conv.id}` }, (p) => {
        setMensagens(prev => [...prev, p.new]);
      }).subscribe();
    subRef.current = ch;
  };

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [mensagens]);

  const enviar = async () => {
    if (!texto.trim() || !convAtiva) return;
    const c = convAtiva;
    const msg = texto.trim();
    setTexto("");
    await supabase.from("mensagens_conversa").insert({ conversa_id: c.id, remetente_id: c.lojista.id, conteudo: msg });
  };

  const CARD_S = { background:"#fff",borderRadius:2,border:"1px solid #e2dfda",overflow:"hidden" };

  return (
    <>
      <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Mensagens</h1>
      <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Conversas entre lojistas e clientes</p>
      <div style={{ display:"flex",gap:"1.5rem",height:"65vh" }}>
        {/* Lista */}
        <div style={{ ...CARD_S, width:320, minWidth:280, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"1rem",borderBottom:"1px solid #f0eeeb",fontSize:"0.75rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888" }}>
            {loading ? "..." : `${conversas.length} conversa${conversas.length!==1?"s":""}`}
          </div>
          <div style={{ overflowY:"auto",flex:1 }}>
            {conversas.map(conv => (
              <div key={conv.id} onClick={() => abrirConversa(conv)}
                style={{ padding:"0.85rem 1rem",borderBottom:"1px solid #f0eeeb",cursor:"pointer",background:convAtiva?.id===conv.id?"#f0eeeb":"#fff",transition:"background 0.15s" }}>
                <div style={{ fontSize:"0.82rem",fontWeight:500,marginBottom:"0.15rem" }}>{conv.cliente?.nome || "—"} ↔ {conv.lojista?.nome || "—"}</div>
                <div style={{ fontSize:"0.68rem",color:"#888" }}>
                  {conv.aluguer?.referencia ? `Ref. ${conv.aluguer.referencia}` : conv.assunto || "—"}
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:"0.25rem",alignItems:"center" }}>
                  <span style={{ fontSize:"0.72rem",color:"#aaa" }}>{conv.ultima_mensagem_em ? new Date(conv.ultima_mensagem_em).toLocaleDateString("pt-PT") : ""}</span>
                  {(conv.nao_lidas_lojista > 0 || conv.nao_lidas_cliente > 0) && (
                    <span style={{ background:"#c4748a",color:"#fff",fontSize:"0.68rem",padding:"0.1rem 0.4rem",borderRadius:10 }}>
                      {conv.nao_lidas_lojista + conv.nao_lidas_cliente}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!loading && conversas.length === 0 && <div style={{ padding:"2rem",textAlign:"center",color:"#aaa",fontSize:"0.78rem" }}>Sem conversas ainda</div>}
          </div>
        </div>
        {/* Chat */}
        <div style={{ ...CARD_S, flex:1, display:"flex", flexDirection:"column" }}>
          {!convAtiva ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#aaa",fontSize:"0.78rem" }}>Selecciona uma conversa</div>
          ) : (
            <>
              <div style={{ padding:"1rem",borderBottom:"1px solid #f0eeeb" }}>
                <div style={{ fontSize:"0.85rem",fontWeight:500 }}>{convAtiva.cliente?.nome} ↔ {convAtiva.lojista?.nome}</div>
                <div style={{ fontSize:"0.68rem",color:"#888" }}>{convAtiva.cliente?.email}</div>
              </div>
              <div ref={chatRef} style={{ flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.5rem" }}>
                {mensagens.map(m => {
                  const eLojista = m.remetente_id === convAtiva.lojista?.id;
                  return (
                    <div key={m.id} style={{ display:"flex",flexDirection:"column",alignSelf:eLojista?"flex-end":"flex-start",maxWidth:"70%" }}>
                      <div style={{ padding:"0.6rem 0.85rem",background:eLojista?"#080808":"#f0eeeb",color:eLojista?"#fff":"#080808",fontSize:"0.82rem",lineHeight:1.4,wordBreak:"break-word" }}>
                        {m.conteudo}
                      </div>
                      <span style={{ fontSize:"0.68rem",color:"#aaa",marginTop:"0.2rem",alignSelf:eLojista?"flex-end":"flex-start" }}>
                        {eLojista?"Lojista":"Cliente"} · {new Date(m.created_at).toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"})}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"0.75rem",borderTop:"1px solid #f0eeeb",display:"flex",gap:"0.5rem" }}>
                <input value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();enviar();}}}
                  placeholder="Responder como lojista..."
                  style={{ flex:1,padding:"0.6rem 0.85rem",border:"1px solid #e2dfda",fontFamily:"'Jost',sans-serif",fontSize:"0.82rem",outline:"none" }} />
                <button onClick={enviar} style={{ padding:"0.6rem 1rem",background:"#080808",color:"#fff",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase" }}>Enviar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Backoffice() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0, reservas_espera: 0, taxa_ocupacao: 0 });
  const [pecas, setPecas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novaPeca, setNovaPeca] = useState(PECA_VAZIA);
  const [fotosUpload, setFotosUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [criandoPeca, setCriandoPeca] = useState(false);

  const [pecaEditando, setPecaEditando] = useState(null);
  const [editForm, setEditForm] = useState(PECA_VAZIA);
  const [editFotosNovas, setEditFotosNovas] = useState([]);
  const [editFotosExistentes, setEditFotosExistentes] = useState([]);
  const [editProgress, setEditProgress] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [editTamanhos, setEditTamanhos] = useState([]);

  const [landingCfg, setLandingCfg] = useState({ video_landing_url: "", hero_peca_id: "", categoria_festa_peca_id: "", categoria_trabalho_peca_id: "", categoria_ferias_peca_id: "", categoria_jantar_peca_id: "" });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState("");
  const [pecasComFoto, setPecasComFoto] = useState([]);

  const [alugueres, setAlugueres] = useState([]);
  const [aluguerParaEnviar, setAluguerParaEnviar] = useState(null);
  const [modalAvaliacao, setModalAvaliacao] = useState(null);
  const [notaEmpresa, setNotaEmpresa] = useState(0);
  const [comentarioEmpresa, setComentarioEmpresa] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", titulo_fr: "", titulo_lt: "", mensagem: "", mensagem_fr: "", mensagem_lt: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
  const [estatisticas, setEstatisticas] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiPergunta, setAiPergunta] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });
  const [alugueresLojista, setAlugueresLojista] = useState([]);
  const [candidaturasLojista, setCandidaturasLojista] = useState([]);
  const [pecasPendentes, setPecasPendentes] = useState([]);
  const [pecasLojistaTodas, setPecasLojistaTodas] = useState([]);
  const [editFotosLojista, setEditFotosLojista] = useState(null); // {id, nome, fotos}
  const [subTabCandidaturas, setSubTabCandidaturas] = useState(false); // toggle detalhe
  const [subTabLojistas, setSubTabLojistas] = useState("depositos");
  const [lojistasAprovados, setLojistasAprovados] = useState([]);
  const [avaliacoesBackoffice, setAvaliacoesBackoffice] = useState({}); // { lojista_id: [avaliacoes] }
  const chatRef = useRef(null);

  // Filtros alugueres
  const [filtroEstadoAl, setFiltroEstadoAl] = useState("ativos");
  const [pesquisaAl, setPesquisaAl] = useState("");

  // Modal edição campanha
  const [campanhaEditando, setCampanhaEditando] = useState(null);
  const [editCampanha, setEditCampanha] = useState(null);

  const entrar = () => { if (senha === SENHA) { setLogado(true); setErroSenha(false); } else setErroSenha(true); };

  useEffect(() => { if (logado) carregarDados(); }, [logado, tab]);

  const carregarDados = async () => {
    if (tab === "dashboard") {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
      const [alRes, resRes, resCompletasRes, stockRes, recibosRes, alugueresTodosRes] = await Promise.all([
        supabase.from("alugueres").select("estado, valor_aluguer, deposito_valor, desconto_cesto, created_at"),
        supabase.from("reservas_espera").select("id").eq("estado", "aguarda"),
        supabase.from("reservas_espera").select("id, estado, data_inicio_desejada, data_fim_desejada, stock_tamanho_id, clientes(nome, codigo_cliente), stock_tamanhos(tamanho, pecas(nome, codigo_referencia))").in("estado", ["aguarda", "notificado"]).order("created_at", { ascending: false }),
        supabase.from("stock_tamanhos").select("quantidade_total"),
        supabase.from("recibos").select("valor_aluguer, valor_higienizacao, valor_deposito, valor_total, created_at").eq("estado", "pago").gte("created_at", inicioMes),
        supabase.from("alugueres").select("id, estado, data_fim, data_inicio, valor_aluguer, deposito_valor, desconto_cesto, cliente_id, stock_tamanho_id").in("estado", ["pendente","confirmado","enviado","ativo","em_verificacao"]),
      ]);
      const al = alRes.data || [];
      const res = resRes.data || [];
      const resCompletas = resCompletasRes.data || [];
      const stock = stockRes.data || [];
      const recibos = recibosRes.data || [];
      const alRaw2 = alugueresTodosRes.data || [];

      const ativos = al.filter(a => ["pendente","confirmado","enviado","ativo","em_verificacao"].includes(a.estado)).length;
      const totalStock = stock.reduce((s, t) => s + t.quantidade_total, 0) || 1;

      // Receita real do mês = soma dos recibos pagos (aluguer + higienização, excluindo depósito)
      const receita_mes = recibos.reduce((s, r) => s + (r.valor_aluguer || 0) + (r.valor_higienizacao || 0), 0);
      const caucoes_mes = recibos.reduce((s, r) => s + (r.valor_deposito || 0), 0);

      // Descontos de cesto aplicados este mês
      const alMes = al.filter(a => a.created_at >= inicioMes);
      const cestosMes = alMes.filter(a => a.desconto_cesto);
      const desconto_cesto_mes = cestosMes.length; // nº de alugueres com desconto cesto

      // Clientes por nível
      const { data: niveisData } = await supabase.from("clientes").select("total_pecas_alugadas").neq("modo_lojista", true);
      const niveis = { Bronze: 0, Prata: 0, Ouro: 0, Platina: 0 };
      (niveisData || []).forEach(c => {
        const nv = NIVEL(c.total_pecas_alugadas || 0);
        niveis[nv.nome]++;
      });

      setStats({
        alugueres_ativos: ativos,
        devolucoes_hoje: al.filter(a => a.estado === "devolvido" && new Date(a.created_at).toDateString() === agora.toDateString()).length,
        receita_mes,
        caucoes_mes,
        clientes_total: 0,
        reservas_espera: res.length,
        taxa_ocupacao: Math.round((ativos / totalStock) * 100),
        reservasAtivas: resCompletas,
        desconto_cesto_mes,
        niveis,
        alugueresAtivos: [], // preenchido abaixo
      });

      const { count } = await supabase.from("clientes").select("id", { count: "exact" });
      const alRaw = alRaw2;

      let alugueresAtivos = [];
      for (const a of (alRaw || [])) {
        const { data: cl } = await supabase.from("clientes").select("nome, codigo_cliente").eq("id", a.cliente_id).maybeSingle();
        const { data: st } = await supabase.from("stock_tamanhos").select("tamanho, pecas(nome, codigo_referencia)").eq("id", a.stock_tamanho_id).maybeSingle();
        const { data: env } = await supabase.from("envios").select("data_envio").eq("aluguer_id", a.id).maybeSingle();
        alugueresAtivos.push({ ...a, clientes: cl, stock_tamanhos: st, envios: env ? [env] : [] });
      }
      setStats(prev => ({ ...prev, clientes_total: count || 0, alugueresAtivos }));
    }
    if (tab === "catalogo") {
      const { data: p } = await supabase.from("pecas").select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_total, quantidade_disponivel)").order("created_at", { ascending: false });
      if (p) setPecas(p);
      const { data: c } = await supabase.from("categorias").select("*");
      if (c) setCategorias(c);
    }
    if (tab === "alugueres") {
      const { data: al, error: alErr } = await supabase.from("alugueres").select("*").order("created_at", { ascending: false }).limit(100);
      if (alErr) console.error("Erro alugueres:", alErr);
      if (al) {
        const alComDados = await Promise.all(al.map(async (a) => {
          const { data: cl } = await supabase.from("clientes").select("nome, email, telefone, total_pecas_alugadas, codigo_cliente, morada, numero_porta, andar, codigo_postal, cidade").eq("id", a.cliente_id).single();
          const { data: st } = await supabase.from("stock_tamanhos").select("tamanho, pecas(nome, valor_peca, codigo_referencia, fotos)").eq("id", a.stock_tamanho_id).single();
          return { ...a, clientes: cl, stock_tamanhos: st };
        }));
        setAlugueres(alComDados);
      }
    }
    if (tab === "clientes") {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) console.error("Erro clientes:", error);
      if (data) {
        const clientesComAlugueres = await Promise.all(data.map(async (c) => {
          const { data: al } = await supabase.from("alugueres").select("id, estado, valor_aluguer, data_inicio, data_fim, stock_tamanhos(tamanho, pecas(nome, fotos))").eq("cliente_id", c.id);
          return { ...c, alugueres: al || [] };
        }));
        setClientes(clientesComAlugueres);
      }
    }
    if (tab === "reservas") {
      const { data: res } = await supabase
        .from("reservas_espera")
        .select("*, clientes(nome, email, telefone), stock_tamanho_id, stock_tamanhos(id, tamanho, pecas(nome, codigo_referencia, fotos))")
        .in("estado", ["aguarda", "notificado"])
        .order("created_at", { ascending: false });

      if (res && res.length > 0) {
        const stockIds = [...new Set(res.map(r => r.stock_tamanho_id).filter(Boolean))];
        const { data: alugueresAtivos } = await supabase
          .from("alugueres")
          .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
          .in("stock_tamanho_id", stockIds)
          .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

        const agora = new Date();
        const resComDisponibilidade = [];
        for (const r of res) {
          const ocupantes = (alugueresAtivos || []).filter(a => a.stock_tamanho_id === r.stock_tamanho_id);
          let dataDisponivel = null;
          ocupantes.forEach(a => {
            const dataDisp = a.data_disponivel_novamente
              ? new Date(a.data_disponivel_novamente)
              : new Date(new Date(a.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
            if (!dataDisponivel || dataDisp > dataDisponivel) dataDisponivel = dataDisp;
          });
          const disponivelAgora = !dataDisponivel || dataDisponivel <= agora;

          // Auto-notificação: se já está disponível e ainda está em "aguarda", marca sozinho como notificado
          if (disponivelAgora && r.estado === "aguarda") {
            const prazo = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
            const linkCheckout = `https://nora-grei.vercel.app/checkout?peca=${r.stock_tamanhos?.pecas ? r.stock_tamanho_id : ""}&tamanho=${r.stock_tamanho_id}`;
            await supabase.from("reservas_espera").update({
              estado: "notificado",
              notificado_em: agora.toISOString(),
              prazo_confirmacao: prazo.toISOString(),
              link_checkout: linkCheckout,
            }).eq("id", r.id);
            r.estado = "notificado";
            r.notificado_em = agora.toISOString();
            r.prazo_confirmacao = prazo.toISOString();
          }

          resComDisponibilidade.push({ ...r, dataDisponivel: dataDisponivel ? dataDisponivel.toISOString() : null, disponivelAgora });
        }
        setReservas(resComDisponibilidade);
      } else {
        setReservas([]);
      }
    }
    if (tab === "campanhas") {
      const { data, error } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      if (error) console.error("Erro campanhas:", error);
      if (data) setCampanhas(data);
    }
    if (tab === "landing") {
      const { data: cfg } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
      if (cfg) setLandingCfg({
        video_landing_url: cfg.video_landing_url || "",
        hero_peca_id: cfg.hero_peca_id || "",
        categoria_festa_peca_id: cfg.categoria_festa_peca_id || "",
        categoria_trabalho_peca_id: cfg.categoria_trabalho_peca_id || "",
        categoria_ferias_peca_id: cfg.categoria_ferias_peca_id || "",
        categoria_jantar_peca_id: cfg.categoria_jantar_peca_id || "",
      });
      const { data: pcf } = await supabase.from("pecas").select("id, nome, fotos");
      if (pcf) setPecasComFoto(pcf.filter(p => p.fotos?.length > 0));
    }
    if (tab === "dashboard" || tab === "lojistas") {
      const { data: al } = await supabase
        .from("alugueres_lojista")
        .select("*, clientes(nome, email, telefone), pecas_lojista(nome), stock_lojista(tamanho)")
        .order("created_at", { ascending: false });
      if (al) setAlugueresLojista(al);
      const { data: cands } = await supabase
        .from("clientes")
        .select("id, nome, email, telefone, nif, codigo_cliente, candidatura_lojista, lojista_candidatura_dados, modo_lojista")
        .eq("candidatura_lojista", "pendente")
        .eq("modo_lojista", false);
      if (cands) setCandidaturasLojista(cands);
      const { data: pendentes } = await supabase
        .from("pecas_lojista")
        .select("id, nome, categoria, fotos, created_at, clientes(nome, email)")
        .eq("estado", "pendente")
        .order("created_at", { ascending: false });
      if (pendentes) setPecasPendentes(pendentes);
      const { data: todasPL } = await supabase
        .from("pecas_lojista")
        .select("id, nome, categoria, fotos, estado, clientes(nome, codigo_cliente)")
        .in("estado", ["disponivel", "indisponivel", "rejeitado"])
        .order("created_at", { ascending: false });
      if (todasPL) setPecasLojistaTodas(todasPL);
      // lojistas aprovados para painel de avaliações
      const { data: lojs } = await supabase
        .from("clientes")
        .select("id, nome, email, codigo_cliente, lojista_estado, loja_verificada, is_marca_propria")
        .eq("modo_lojista", true)
        .order("nome");
      if (lojs) setLojistasAprovados(lojs);
      // avaliações agrupadas por lojista
      const { data: avsTodas } = await supabase
        .from("avaliacoes_lojista")
        .select("lojista_id, nota_cliente_lojista, nota_plataforma, motivo_plataforma, created_at");
      if (avsTodas) {
        const map = {};
        avsTodas.forEach(av => {
          if (!map[av.lojista_id]) map[av.lojista_id] = [];
          map[av.lojista_id].push(av);
        });
        setAvaliacoesBackoffice(map);
      }
    }
    if (tab === "estatisticas") await carregarEstatisticas();
  };

  const carregarEstatisticas = async () => {
    const [alRes, stRes, pecasRes, clientesRes, reservasRes, recibosRes, despesasRes] = await Promise.all([
      supabase.from("alugueres").select("id, estado, valor_aluguer, data_inicio, data_fim, created_at, cliente_id, stock_tamanho_id"),
      supabase.from("stock_tamanhos").select("id, tamanho, peca_id, pecas(id, nome, valor_peca, preco_aluguer_dia, categorias(nome))"),
      supabase.from("pecas").select("id, nome, valor_peca, preco_aluguer_dia, categorias(nome), stock_tamanhos(quantidade_total, quantidade_disponivel)"),
      supabase.from("clientes").select("id, nome, email, cidade, codigo_postal, data_nascimento, profissao, genero, total_pecas_alugadas, alugueres(id, estado, valor_aluguer, created_at)"),
      supabase.from("reservas_espera").select("id, stock_tamanho_id, stock_tamanhos(peca_id, pecas(nome))"),
      supabase.from("recibos").select("id, estado, valor_total, valor_aluguer, valor_higienizacao, valor_deposito, metodo_pagamento, comprovativo_url, created_at, clientes(nome, email)"),
      supabase.from("despesas").select("valor, categoria, data"),
    ]);
    const al = alRes.data || [], st = stRes.data || [], pl = pecasRes.data || [], cl = clientesRes.data || [], rl = reservasRes.data || [], recibos = recibosRes.data || [], despesas = despesasRes.data || [];
    const stMap = {}; st.forEach(s => { stMap[s.id] = s; });
    const clMap = {}; cl.forEach(c => { clMap[c.id] = c; });
    const alE = al.map(a => ({ ...a, peca: stMap[a.stock_tamanho_id]?.pecas || null, tamanho: stMap[a.stock_tamanho_id]?.tamanho || null, cliente: clMap[a.cliente_id] || null }));
    const alAtivos = alE.filter(a => a.estado !== "cancelado");
    const roiPecas = pl.map(p => { const ap = alAtivos.filter(a => a.peca?.id === p.id); const rec = ap.reduce((s, a) => s + (a.valor_aluguer || 0), 0); return { ...p, receitaGerada: rec, vezesAlugada: ap.length, roi: p.valor_peca > 0 ? ((rec/p.valor_peca)*100).toFixed(0) : 0, danificada: ap.filter(a => a.estado === "devolvido_danificado").length }; }).sort((a,b) => b.vezesAlugada - a.vezesAlugada);
    const pecasEspera = {}; rl.forEach(r => { const n = r.stock_tamanhos?.pecas?.nome || "—"; pecasEspera[n] = (pecasEspera[n]||0)+1; });
    const cidades = {}; alAtivos.forEach(a => { const c = a.cliente?.cidade || "Desconhecida"; if(c) cidades[c] = (cidades[c]||0)+1; });
    const catCount = {}; alAtivos.forEach(a => { const c = a.peca?.categorias?.nome || "Outro"; catCount[c] = (catCount[c]||0)+1; });
    const clNivel = cl.map(c => { const comp = (c.alugueres||[]).filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length; const tot = (c.alugueres||[]).filter(a => a.estado !== "cancelado").length; const gasto = (c.alugueres||[]).reduce((s,a) => s+(a.valor_aluguer||0),0); return { ...c, alugueresTotal: tot, alugueresCompletos: comp, totalGasto: gasto, nivel: NIVEL(comp) }; });
    const ltv = clNivel.reduce((s,c) => s+c.totalGasto,0) / (clNivel.length||1);

    // --- Métricas a partir dos recibos/talões ---
    const porMetodo = {};
    recibos.forEach(r => {
      const m = r.metodo_pagamento || "outro";
      if (!porMetodo[m]) porMetodo[m] = { total: 0, pagos: 0, pendentes: 0, valorPago: 0, valorPendente: 0, somaTempoConfirmacao: 0, nConfirmados: 0 };
      porMetodo[m].total++;
      if (r.estado === "pago") { porMetodo[m].pagos++; porMetodo[m].valorPago += (r.valor_total || 0); }
      else { porMetodo[m].pendentes++; porMetodo[m].valorPendente += (r.valor_total || 0); }
    });
    const distribuicaoPagamento = Object.entries(porMetodo).map(([metodo, d]) => ({
      metodo, total: d.total, pagos: d.pagos, pendentes: d.pendentes,
      taxaConversao: d.total > 0 ? ((d.pagos / d.total) * 100).toFixed(0) : 0,
      ticketMedio: d.total > 0 ? ((d.valorPago + d.valorPendente) / d.total).toFixed(0) : 0,
    })).sort((a, b) => b.total - a.total);

    const receitaRecebida = recibos.filter(r => r.estado === "pago").reduce((s, r) => s + (r.valor_total || 0), 0);
    const receitaPendente = recibos.filter(r => r.estado !== "pago").reduce((s, r) => s + (r.valor_total || 0), 0);
    const ticketMedioGeral = recibos.length > 0 ? ((receitaRecebida + receitaPendente) / recibos.length).toFixed(0) : 0;

    const comprovativosPendentes = recibos
      .filter(r => r.estado !== "pago" && r.comprovativo_url)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Métricas de logística
    const devolvidos = alE.filter(a => (a.estado === "devolvido" || a.estado === "devolvido_danificado") && a.data_devolucao_real && a.data_fim);
    const atrasos = devolvidos.map(a => (new Date(a.data_devolucao_real).setHours(0,0,0,0) - new Date(a.data_fim).setHours(0,0,0,0)) / 86400000).filter(d => d >= 0);
    const mediaAtraso = atrasos.length > 0 ? (atrasos.reduce((s,d) => s+d, 0) / atrasos.length).toFixed(1) : 0;
    const medianaAtraso = atrasos.length > 0 ? (() => { const s = [...atrasos].sort((a,b)=>a-b); const m = Math.floor(s.length/2); return s.length%2 ? s[m] : ((s[m-1]+s[m])/2).toFixed(1); })() : 0;
    const ciclos = alE.filter(a => a.data_disponivel_novamente && a.data_inicio).map(a => (new Date(a.data_disponivel_novamente).setHours(0,0,0,0) - new Date(a.data_inicio).setHours(0,0,0,0)) / 86400000).filter(d => d > 0);
    const mediaCiclo = ciclos.length > 0 ? (ciclos.reduce((s,d)=>s+d,0)/ciclos.length).toFixed(1) : 0;
    const rotacoesMes = mediaCiclo > 0 ? (30 / parseFloat(mediaCiclo)).toFixed(1) : 0;

    // Pareto 80-20
    const totalRec = alAtivos.reduce((s,a) => s+(a.valor_aluguer||0), 0);
    const pecasOrdenadas = [...roiPecas].sort((a,b) => b.receitaGerada - a.receitaGerada);
    let acum = 0; let pareto20Pecas = 0;
    for (const p of pecasOrdenadas) { acum += p.receitaGerada; pareto20Pecas++; if (acum >= totalRec * 0.8) break; }
    const clientesOrdenados = [...clNivel].sort((a,b) => b.totalGasto - a.totalGasto);
    acum = 0; let pareto20Clientes = 0;
    const totalGastoClientes = clNivel.reduce((s,c) => s+c.totalGasto, 0);
    for (const c of clientesOrdenados) { acum += c.totalGasto; pareto20Clientes++; if (acum >= totalGastoClientes * 0.8) break; }

    // Perfil demográfico dos clientes Pareto (top 20% em receita)
    const top20pct = clientesOrdenados.slice(0, Math.max(1, Math.ceil(clientesOrdenados.length * 0.2)));
    const cidadesPareto = {}; top20pct.forEach(c => { if(c.cidade) cidadesPareto[c.cidade] = (cidadesPareto[c.cidade]||0)+1; });
    const generosPareto = {}; top20pct.forEach(c => { const g = c.genero||"nd"; generosPareto[g] = (generosPareto[g]||0)+1; });
    const profissoesPareto = {}; top20pct.forEach(c => { if(c.profissao) profissoesPareto[c.profissao] = (profissoesPareto[c.profissao]||0)+1; });
    const idadesPareto = top20pct.map(c => { if(!c.data_nascimento) return null; const a = new Date().getFullYear()-new Date(c.data_nascimento).getFullYear(); return a>0&&a<100?a:null; }).filter(Boolean);
    const idadeMediaPareto = idadesPareto.length > 0 ? Math.round(idadesPareto.reduce((s,a)=>s+a,0)/idadesPareto.length) : null;

    // Tendência mensal (últimos 6 meses)
    const agora = new Date();
    const tendenciaMensal = Array.from({length:6},(_,i)=>{
      const d = new Date(agora.getFullYear(), agora.getMonth()-5+i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const label = d.toLocaleDateString("pt-PT",{month:"short",year:"2-digit"});
      const recMes = recibos.filter(r => r.estado==="pago" && r.created_at?.slice(0,7)===key).reduce((s,r)=>(s+(r.valor_aluguer||0)+(r.valor_higienizacao||0)),0);
      const alMes = alAtivos.filter(a => a.created_at?.slice(0,7)===key).length;
      const despMes = despesas.filter(d2 => d2.data?.slice(0,7)===key).reduce((s,d2)=>s+(d2.valor||0),0);
      const despFixasMes = despesas.filter(d2 => d2.data?.slice(0,7)===key && d2.tipo_custo==="fixo").reduce((s,d2)=>s+(d2.valor||0),0);
      const despVarMes = despesas.filter(d2 => d2.data?.slice(0,7)===key && d2.tipo_custo!=="fixo").reduce((s,d2)=>s+(d2.valor||0),0);
      return { key, label, receita: recMes, alugueres: alMes, despesas: despMes, despFixas: despFixasMes, despVarProd: despVarMes, lucro: recMes - despMes };
    });

    // Breakeven mensal — separar fixos de variáveis
    const receitaMedia3M = tendenciaMensal.slice(-3).reduce((s,m)=>s+m.receita,0)/3;
    const despesasMedia3M = tendenciaMensal.slice(-3).reduce((s,m)=>s+m.despesas,0)/3;
    const despesasFixasMedia3M = tendenciaMensal.slice(-3).reduce((s,m)=>s+m.despFixas,0)/3;
    const despesasVarMedia3M = tendenciaMensal.slice(-3).reduce((s,m)=>s+m.despVarProd,0)/3;
    // Breakeven teórico: apenas os custos fixos (os variáveis já saem com cada aluguer)
    const custoDiario = despesasMedia3M / 30;
    const receitaDiaria = receitaMedia3M / 30;
    // Se há separação fixo/variável: breakeven = dia em que receita >= custos fixos mensais
    const temSeparacao = despesasFixasMedia3M > 0 || despesasVarMedia3M > 0;
    const baseCustoBreakeven = temSeparacao ? despesasFixasMedia3M : despesasMedia3M;
    const diaBreakeven = custoDiario > 0 && receitaDiaria > 0 ? Math.ceil(baseCustoBreakeven / receitaDiaria) : null;
    // Margem operacional
    const margemOp = receitaMedia3M > 0 ? ((receitaMedia3M - despesasMedia3M) / receitaMedia3M * 100).toFixed(1) : 0;
    // Receita total dos recibos pagos (mais precisa que soma de alugueres)
    const totalReceitaReal = recibos.filter(r=>r.estado==="pago").reduce((s,r)=>s+(r.valor_aluguer||0)+(r.valor_higienizacao||0),0);

    setEstatisticas({
      roiPecas, pecasEspera, cidades, catCount,
      clientesMaisAtivos: [...clNivel].sort((a,b) => b.totalGasto-a.totalGasto).slice(0,5),
      taxaCancelamento: al.length > 0 ? ((al.filter(a => a.estado==="cancelado").length/al.length)*100).toFixed(1) : 0,
      ltv, churn: clNivel.filter(c => c.alugueresTotal===1).length,
      totalReceita: totalReceitaReal,
      totalAlugueres: alAtivos.length,
      pecaMaisAlugada: roiPecas[0]?.nome || "—",
      distribuicaoPagamento, receitaRecebida, receitaPendente, ticketMedioGeral,
      comprovativosPendentes, totalRecibos: recibos.length,
      mediaAtraso, medianaAtraso, mediaCiclo, rotacoesMes,
      pareto20Pecas, pareto20Clientes, totalPecas: pecasOrdenadas.length, totalClientes: clNivel.length,
      // Pareto perfil
      cidadesPareto: Object.entries(cidadesPareto).sort((a,b)=>b[1]-a[1]).slice(0,4),
      generosPareto, profissoesPareto: Object.entries(profissoesPareto).sort((a,b)=>b[1]-a[1]).slice(0,4),
      idadeMediaPareto,
      // Tendência
      tendenciaMensal,
      // Breakeven
      receitaMedia3M, despesasMedia3M, despesasFixasMedia3M, despesasVarMedia3M, temSeparacao,
      custoDiario, receitaDiaria, diaBreakeven, margemOp,
    });
  };

  const perguntarAI = async () => {
    if (!aiPergunta.trim() || !estatisticas) return;
    const pergunta = aiPergunta; setAiPergunta(""); setAiLoading(true);
    setAiChat(prev => [...prev, { role: "user", content: pergunta }]);
    const ctx = `És consultor de negócios de moda e aluguer de roupa de luxo. Dados Nora Grei: Total alugueres:${estatisticas.totalAlugueres}, Receita:${estatisticas.totalReceita.toFixed(0)}€, LTV:${estatisticas.ltv.toFixed(0)}€, Cancelamentos:${estatisticas.taxaCancelamento}%, Churn:${estatisticas.churn}. Clientes ativos:${estatisticas.clientesMaisAtivos.map(c=>`${c.nome}(${c.alugueresTotal}x)`).join(",")}. Categorias:${Object.entries(estatisticas.catCount).map(([k,v])=>`${k}:${v}`).join(",")}. Responde em português, conciso e útil.`;
    try {
      const resp = await fetch("/api/ai-consultant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pergunta, contexto: ctx, historico: aiChat }) });
      const data = await resp.json();
      setAiChat(prev => [...prev, { role: "assistant", content: data.resposta || data.error || "Erro." }]);
    } catch { setAiChat(prev => [...prev, { role: "assistant", content: "Erro de ligação." }]); }
    setAiLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) { alert("Nome e preço são obrigatórios"); return; }
    setCriandoPeca(true); setUploadProgress("A criar peça...");
    // codigo_referencia gerado automaticamente pelo trigger SQL (NG-0001, NG-0002, ...)
    const { data: pc, error } = await supabase.from("pecas").insert({ nome: novaPeca.nome, categoria_id: novaPeca.categoria_id||null, preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia), preco_avulso: parseFloat(novaPeca.preco_avulso)||null, valor_peca: parseFloat(novaPeca.valor_peca)||0, descricao: novaPeca.descricao, material: novaPeca.material, origem: novaPeca.origem, destaque: novaPeca.destaque, hero_position: novaPeca.hero_position||"center top", ocasioes: novaPeca.ocasioes, estado: "disponivel" }).select().single();
    if (error) { setUploadProgress("❌ " + error.message); setCriandoPeca(false); return; }
    for (const t of novaPeca.tamanhos) { if (t.tamanho) await supabase.from("stock_tamanhos").insert({ peca_id: pc.id, tamanho: t.tamanho, quantidade_total: parseInt(t.quantidade_total)||1, quantidade_disponivel: parseInt(t.quantidade_total)||1 }); }
    if (fotosUpload.length > 0) {
      const urls = [];
      for (const foto of fotosUpload) { const ext = foto.name.split(".").pop(); const path = `${pc.id}/${Date.now()}.${ext}`; setUploadProgress(`A fazer upload de ${foto.name}...`); const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true }); if (!upErr) { const { data } = supabase.storage.from("pecas").getPublicUrl(path); urls.push(data.publicUrl); } }
      if (urls.length > 0) { await supabase.from("pecas").update({ fotos: urls }).eq("id", pc.id); setUploadProgress(`✓ ${urls.length} foto(s) guardada(s)!`); }
    } else { setUploadProgress("✓ Peça criada!"); }
    setNovaPeca(PECA_VAZIA);
    setFotosUpload([]); setCriandoPeca(false);
    setTimeout(() => setUploadProgress(""), 4000);
    carregarDados();
  };

  const abrirEdicao = (p) => {
    setPecaEditando(p.id);
    setEditForm({
      nome: p.nome || "", categoria_id: p.categoria_id || "",
      preco_aluguer_dia: p.preco_aluguer_dia || "", preco_avulso: p.preco_avulso || "",
      valor_peca: p.valor_peca || "", descricao: p.descricao || "",
      material: p.material || "", origem: p.origem || "Portugal",
      destaque: !!p.destaque, hero_position: p.hero_position||"center top", ocasioes: p.ocasioes || [],
    });
    setEditTamanhos((p.stock_tamanhos || []).map(s => ({ id: s.id, tamanho: s.tamanho, quantidade_total: s.quantidade_total, quantidade_disponivel: s.quantidade_disponivel })));
    setEditFotosExistentes(p.fotos || []);
    setEditFotosNovas([]);
    setEditProgress("");
  };

  const fecharEdicao = () => { setPecaEditando(null); setEditForm(PECA_VAZIA); setEditTamanhos([]); setEditFotosExistentes([]); setEditFotosNovas([]); };

  const removerFotoExistente = (idx) => setEditFotosExistentes(prev => prev.filter((_, i) => i !== idx));

  const atualizarTamanhoEdit = (idx, campo, valor) => {
    setEditTamanhos(prev => prev.map((t, i) => i === idx ? { ...t, [campo]: valor } : t));
  };

  const adicionarTamanhoEdit = () => setEditTamanhos(prev => [...prev, { id: null, tamanho: "", quantidade_total: 1, quantidade_disponivel: 1 }]);
  const removerTamanhoEdit = async (idx) => {
    const t = editTamanhos[idx];
    if (t.id) { await supabase.from("stock_tamanhos").delete().eq("id", t.id); }
    setEditTamanhos(prev => prev.filter((_, i) => i !== idx));
  };

  const guardarEdicao = async () => {
    if (!pecaEditando) return;
    setSalvandoEdicao(true);
    setEditProgress("A guardar...");

    let fotosFinais = [...editFotosExistentes];
    if (editFotosNovas.length > 0) {
      for (const foto of editFotosNovas) {
        const ext = foto.name.split(".").pop();
        const path = `${pecaEditando}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        setEditProgress(`A fazer upload de ${foto.name}...`);
        const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true });
        if (!upErr) { const { data } = supabase.storage.from("pecas").getPublicUrl(path); fotosFinais.push(data.publicUrl); }
      }
    }

    const { error } = await supabase.from("pecas").update({
      nome: editForm.nome, categoria_id: editForm.categoria_id || null,
      preco_aluguer_dia: parseFloat(editForm.preco_aluguer_dia) || 0,
      preco_avulso: parseFloat(editForm.preco_avulso) || null,
      valor_peca: parseFloat(editForm.valor_peca) || 0,
      descricao: editForm.descricao, material: editForm.material, origem: editForm.origem,
      destaque: editForm.destaque, hero_position: editForm.hero_position||"center top", ocasioes: editForm.ocasioes,
      fotos: fotosFinais,
    }).eq("id", pecaEditando);

    if (error) { setEditProgress("❌ " + error.message); setSalvandoEdicao(false); return; }

    for (const t of editTamanhos) {
      if (!t.tamanho) continue;
      if (t.id) {
        await supabase.from("stock_tamanhos").update({
          tamanho: t.tamanho,
          quantidade_total: parseInt(t.quantidade_total) || 0,
          quantidade_disponivel: parseInt(t.quantidade_disponivel) || 0,
        }).eq("id", t.id);
      } else {
        await supabase.from("stock_tamanhos").insert({
          peca_id: pecaEditando, tamanho: t.tamanho,
          quantidade_total: parseInt(t.quantidade_total) || 1,
          quantidade_disponivel: parseInt(t.quantidade_disponivel) || 1,
        });
      }
    }

    setEditProgress("✓ Guardado com sucesso!");
    setSalvandoEdicao(false);
    setTimeout(() => { fecharEdicao(); carregarDados(); }, 1000);
  };

  const atualizarEstado = async (id, estado) => {
    if (["devolvido","devolvido_danificado"].includes(estado)) {
      await supabase.from("alugueres").update({
        estado: estado,
        data_devolucao_real: new Date().toISOString(),
        data_disponivel_novamente: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      }).eq("id", id);
    } else {
      await supabase.from("alugueres").update({ estado: estado }).eq("id", id);
    }
    carregarDados();
  };
  const guardarAvaliacaoEmpresa = async () => {
    if (!modalAvaliacao || notaEmpresa === 0) return;
    await supabase.from("avaliacoes").upsert({
      aluguer_id: modalAvaliacao.aluguer_id,
      cliente_id: modalAvaliacao.cliente_id,
      nota_empresa_cliente: notaEmpresa,
      comentario_empresa: comentarioEmpresa || null,
    }, { onConflict: "aluguer_id" });
    setModalAvaliacao(null);
  };
  const confirmarDeposito = async (id) => { await supabase.from("alugueres").update({ deposito_estado: "recebido", deposito_confirmado_em: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const marcarEnviado = (aluguer) => { setAluguerParaEnviar(aluguer); };
  const confirmarRecepcao = async (id) => { await supabase.from("alugueres").update({ estado: "em_verificacao", data_recepcao: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const confirmarVerificacao = async (id, danificado=false, info=null) => {
    const agora = new Date().toISOString();
    const dispData = new Date(Date.now() + 3*24*60*60*1000).toISOString();
    const updateData = {
      estado: danificado ? "devolvido_danificado" : "devolvido",
      data_verificacao: agora,
      data_devolucao_real: agora,
      data_disponivel_novamente: dispData,
    };
    // Caução libertada automaticamente quando peça OK (sem danos)
    if (!danificado) {
      updateData.deposito_estado = "libertado";
      updateData.caucao_libertada_em = agora;
    }
    await supabase.from("alugueres").update(updateData).eq("id", id);

    // Atribuir pontos e incrementar contagem ao cliente quando aluguer concluído
    if (info?.cliente_id) {
      const { data: cli } = await supabase.from("clientes").select("pontos, total_pecas_alugadas").eq("id", info.cliente_id).single();
      if (cli) {
        const novosCompletos = (cli.total_pecas_alugadas || 0) + 1;
        await supabase.from("clientes").update({
          pontos: (cli.pontos || 0) + 1,
          total_pecas_alugadas: novosCompletos,
        }).eq("id", info.cliente_id);
      }
    }

    carregarDados();
    if (info) { setNotaEmpresa(0); setComentarioEmpresa(""); setModalAvaliacao({ aluguer_id: id, ...info }); }
  };
  const libertarCaucao = async (id) => { await supabase.from("alugueres").update({ deposito_estado: "libertado", caucao_libertada_em: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const calcularAtraso = (dataFim) => { if (!dataFim) return 0; const diff = Math.floor((new Date()-new Date(dataFim))/86400000); return diff>0?diff:0; };

  const criarCampanha = async () => {
    if (!novaCampanha.titulo || !novaCampanha.mensagem) { alert("Título e mensagem obrigatórios"); return; }
    const { error } = await supabase.from("campanhas").insert({ ...novaCampanha, probabilidade: parseInt(novaCampanha.probabilidade), codigo: novaCampanha.codigo||null, desconto: novaCampanha.desconto||null, validade: novaCampanha.validade||null, ativa: true });
    if (error) { alert("Erro: " + error.message); return; }
    setNovaCampanha({ titulo: "", titulo_fr: "", titulo_lt: "", mensagem: "", mensagem_fr: "", mensagem_lt: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
    carregarDados();
  };

  const guardarEdicaoCampanha = async () => {
    if (!editCampanha?.titulo || !editCampanha?.mensagem) { alert("Título e mensagem obrigatórios"); return; }
    const { error } = await supabase.from("campanhas").update({
      titulo: editCampanha.titulo,
      mensagem: editCampanha.mensagem,
      tipo: editCampanha.tipo,
      titulo_fr: editCampanha.titulo_fr || null,
      mensagem_fr: editCampanha.mensagem_fr || null,
      titulo_lt: editCampanha.titulo_lt || null,
      mensagem_lt: editCampanha.mensagem_lt || null,
      codigo: editCampanha.codigo || null,
      desconto: editCampanha.desconto || null,
      probabilidade: parseInt(editCampanha.probabilidade),
      validade: editCampanha.validade || null,
      url_destino: editCampanha.url_destino || null,
    }).eq("id", campanhaEditando.id);
    if (error) { alert("Erro: " + error.message); return; }
    setCampanhaEditando(null);
    setEditCampanha(null);
    carregarDados();
  };

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setVideoProgress("A fazer upload do vídeo...");
    const ext = file.name.split(".").pop();
    const path = `landing/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, file, { upsert: true });
    if (error) { setVideoProgress("❌ " + error.message); setUploadingVideo(false); return; }
    const { data } = supabase.storage.from("videos").getPublicUrl(path);
    setLandingCfg(prev => ({ ...prev, video_landing_url: data.publicUrl }));
    setVideoProgress("✓ Vídeo carregado! Clica em Guardar para aplicar.");
    setUploadingVideo(false);
  };

  const guardarLanding = async () => {
    const payload = {
      video_landing_url: landingCfg.video_landing_url || null,
      hero_peca_id: landingCfg.hero_peca_id || null,
      categoria_festa_peca_id: landingCfg.categoria_festa_peca_id || null,
      categoria_trabalho_peca_id: landingCfg.categoria_trabalho_peca_id || null,
      categoria_ferias_peca_id: landingCfg.categoria_ferias_peca_id || null,
      categoria_jantar_peca_id: landingCfg.categoria_jantar_peca_id || null,
    };
    const { data: existing } = await supabase.from("configuracoes").select("id").limit(1).maybeSingle();
    let result;
    if (existing) {
      result = await supabase.from("configuracoes").update(payload).eq("id", existing.id);
    } else {
      result = await supabase.from("configuracoes").insert(payload);
    }
    if (result.error) {
      alert("Erro ao guardar: " + result.error.message);
    } else {
      alert("Configurações da landing page guardadas!");
    }
  };

  if (!logado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0eeeb", fontFamily: "'Jost',sans-serif" }}>
      <div style={{ background: "#fff", padding: "3rem", width: "340px", textAlign: "center", boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.8rem", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase" }}>Nora Grei</div>
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.35em", color: "#999", textTransform: "uppercase", marginBottom: "2rem", marginTop: "0.3rem" }}>Backoffice</div>
        <input type="password" placeholder="Password" value={senha} onChange={e => { setSenha(e.target.value); setErroSenha(false); }} onKeyDown={e => e.key==="Enter"&&entrar()} autoFocus style={{ ...INP, marginBottom: "0.75rem", border: erroSenha?"1.5px solid #e74c3c":"1.5px solid #e2dfda" }} />
        {erroSenha && <div style={{ fontSize: "0.72rem", color: "#e74c3c", marginBottom: "0.75rem" }}>Password incorreta</div>}
        <button onClick={entrar} style={{ width: "100%", padding: "0.9rem", background: "#080808", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Entrar</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Jost',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        @media (max-width: 768px) {
          .bo-nav-desktop { display: none !important; }
          .bo-nav-mobile { display: flex !important; }
          .bo-content { padding: 1rem !important; }
          .bo-bottom-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bo-nav-desktop { display: flex !important; }
          .bo-nav-mobile { display: none !important; }
          .bo-content { padding: 2rem !important; }
          .bo-bottom-bar { display: none !important; }
        }
        .bo-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #080808; border-top: 1px solid rgba(255,255,255,0.1); z-index: 200; justify-content: space-around; align-items: stretch; padding: 0; }
        .bo-bottom-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.6rem 0.25rem 0.5rem; border: none; background: none; color: rgba(255,255,255,0.5); cursor: pointer; font-family: 'Jost',sans-serif; gap: 0.2rem; border-top: 2px solid transparent; }
        .bo-bottom-btn.active { color: #fff; border-top-color: #c4748a; }
        .bo-bottom-btn span.icon { font-size: 1.2rem; line-height: 1; }
        .bo-bottom-btn span.lbl { font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
        .bo-tab-select { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 0.45rem 0.75rem; font-family: 'Jost',sans-serif; font-size: 0.72rem; letter-spacing: 0.1em; cursor: pointer; flex: 1; }
        .bo-tab-select option { background: #080808; color: #fff; }
      `}</style>

      {/* NAV DESKTOP */}
      <div style={{ background: "#080808", color: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "0" }}>
          <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.1rem", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "1rem 2rem 1rem 0", borderRight: "1px solid rgba(255,255,255,0.1)", marginRight: "1rem", whiteSpace: "nowrap" }}>Nora Grei</div>
          {/* Desktop: tabs horizontais */}
          <div className="bo-nav-desktop" style={{ flex: 1, overflowX: "auto", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "1rem 1.1rem", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: tab===t?"#fff":"rgba(255,255,255,0.5)", background: tab===t?"rgba(255,255,255,0.1)":"none", border: "none", borderBottom: tab===t?"2px solid #c4748a":"2px solid transparent", cursor: "pointer", fontFamily: "'Jost',sans-serif", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          {/* Mobile: dropdown select */}
          <div className="bo-nav-mobile" style={{ flex: 1, alignItems: "center", gap: "0.5rem", padding: "0.6rem 0" }}>
            <span style={{ fontSize: "1.1rem" }}>{TAB_ICONS[tab]}</span>
            <select className="bo-tab-select" value={tab} onChange={e => setTab(e.target.value)}>
              {TABS.map(t => <option key={t} value={t}>{TAB_ICONS[t]} {TAB_LABELS[t]}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: "auto", paddingLeft: "1rem" }}>
            <button onClick={() => setLogado(false)} style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Sair</button>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR MOBILE — 5 tabs principais */}
      <div className="bo-bottom-bar">
        {TABS_PRIMARIOS.map(t => (
          <button key={t} className={`bo-bottom-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
            <span className="icon">{TAB_ICONS[t]}</span>
            <span className="lbl">{TAB_LABELS[t]}</span>
          </button>
        ))}
        <button className={`bo-bottom-btn${!TABS_PRIMARIOS.includes(tab)?" active":""}`} onClick={() => {
          const outros = TABS.filter(t => !TABS_PRIMARIOS.includes(t));
          const idx = outros.indexOf(tab);
          setTab(outros[(idx + 1) % outros.length]);
        }}>
          <span className="icon">⋯</span>
          <span className="lbl">Mais</span>
        </button>
      </div>

      <div className="bo-content" style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "5rem" }}>

        {tab === "dashboard" && (
          <>
            <h1 style={{ fontFamily: "var(--sans)", fontSize: "1.6rem", fontWeight: 600, marginBottom: "0.25rem" }}>Dashboard</h1>
            <p style={{ fontSize: "0.82rem", color: "#3f3e3c", marginBottom: "1.5rem" }}>
              {new Date().toLocaleDateString("pt-PT", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>

            {/* ALERTAS CRITICOS DO DIA */}
            {(() => {
              const atrasos = (stats.alugueresAtivos||[]).filter(a => new Date(a.data_fim) < new Date() && a.estado === "ativo");
              const urgentes = (stats.alugueresAtivos||[]).filter(a => {
                const h = (new Date(a.data_fim) - new Date()) / 3600000;
                return h <= 6 && h > 0 && a.estado === "ativo";
              });
              if (atrasos.length === 0 && urgentes.length === 0) return null;
              return (
                <div style={{ background:"#fff5f5",border:"2px solid #e74c3c",padding:"1rem 1.5rem",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap" }}>
                  <span style={{ fontSize:"1.5rem" }}>🚨</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,color:"#e74c3c",fontSize:"0.85rem",marginBottom:"0.25rem" }}>Ação imediata necessária</div>
                    {atrasos.length > 0 && <div style={{ fontSize:"0.78rem",color:"#c0392b" }}>{atrasos.length} aluguer(es) em atraso — dias extra a contar</div>}
                    {urgentes.length > 0 && <div style={{ fontSize:"0.78rem",color:"#c0392b" }}>{urgentes.length} aluguer(es) terminam em menos de 6 horas</div>}
                  </div>
                  <button style={BTN("red","sm")} onClick={() => setTab("alugueres")}>Ver alugueres →</button>
                </div>
              );
            })()}

            {/* KPIs PRINCIPAIS */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"#e2dfda",marginBottom:"1rem" }}>
              {[
                { val: stats.alugueres_ativos, lbl: "Em curso agora", cor: "#c4748a", sub: `${(stats.alugueresAtivos||[]).filter(a=>a.estado==="enviado").length} a caminho` },
                { val: `${Number(stats.receita_mes).toFixed(0)}€`, lbl: "Receita este mês", cor: "#1e7e3e", sub: `${new Date().toLocaleDateString("pt-PT",{month:"long"})}` },
                { val: stats.clientes_total, lbl: "Clientes", cor: "#1565c0", sub: `${stats.reservas_espera} reserva(s) em espera` },
                { val: `${stats.taxa_ocupacao}%`, lbl: "Ocupação", cor: stats.taxa_ocupacao > 70 ? "#1e7e3e" : stats.taxa_ocupacao > 30 ? "#b8860b" : "#e74c3c", sub: "do stock total" },
              ].map((s,idx) => (
                <div key={idx} style={{ background:"#fff",padding:"1.5rem" }}>
                  <div style={{ fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#3f3e3c",marginBottom:"0.4rem" }}>{s.lbl}</div>
                  <div style={{ fontFamily:"var(--sans)",fontSize:"2.2rem",fontWeight:400,color:s.cor,lineHeight:1,marginBottom:"0.3rem" }}>{s.val}</div>
                  <div style={{ fontSize:"0.68rem",color:"#888" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* KPIs SECUNDARIOS */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"#e2dfda",marginBottom:"1rem" }}>
              {[
                { val: (stats.alugueresAtivos||[]).filter(a=>a.estado==="enviado").length, lbl: "Entregas pendentes", icon: "🚚" },
                { val: (stats.alugueresAtivos||[]).filter(a=>new Date(a.data_fim)<new Date()&&a.estado==="ativo").length, lbl: "Em atraso", icon: "⚠️", cor: "#e74c3c" },
                { val: (stats.alugueresAtivos||[]).filter(a=>a.estado==="em_verificacao").length, lbl: "Em verificação", icon: "🔍" },
                { val: stats.reservas_espera, lbl: "Reservas à espera", icon: "📋", cor: stats.reservas_espera > 0 ? "#b8860b" : undefined },
              ].map((s,idx) => (
                <div key={idx} style={{ background:"#f8f8f6",padding:"1rem 1.5rem",display:"flex",alignItems:"center",gap:"0.75rem" }}>
                  <span style={{ fontSize:"1.4rem" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:400,color:s.cor||"#080808",lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#3f3e3c",marginTop:"0.2rem" }}>{s.lbl}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* PAINEL CESTO + FIDELIDADE */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"#e2dfda",marginBottom:"1rem" }}>
              {/* Cesto deste mês */}
              <div style={{ background:"#fff",padding:"1.25rem 1.5rem" }}>
                <div style={{ fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",marginBottom:"0.75rem" }}>🛍 Cestos este mês</div>
                <div style={{ display:"flex",gap:"1.5rem",alignItems:"flex-end" }}>
                  <div>
                    <div style={{ fontFamily:"var(--sans)",fontSize:"2.2rem",fontWeight:300,color:"#c4748a",lineHeight:1 }}>{stats.desconto_cesto_mes||0}</div>
                    <div style={{ fontSize:"0.68rem",color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:"0.2rem" }}>com desconto</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:"var(--sans)",fontSize:"2.2rem",fontWeight:300,color:"#27ae60",lineHeight:1 }}>{Number(stats.caucoes_mes||0).toFixed(0)}€</div>
                    <div style={{ fontSize:"0.68rem",color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:"0.2rem" }}>cauções recebidas</div>
                  </div>
                </div>
              </div>
              {/* Fidelidade - distribuição de níveis */}
              <div style={{ background:"#fff",padding:"1.25rem 1.5rem" }}>
                <div style={{ fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",marginBottom:"0.75rem" }}>🏆 Níveis de fidelidade</div>
                <div style={{ display:"flex",gap:"1rem",flexWrap:"wrap" }}>
                  {[
                    { n:"Bronze",  icon:"🥉", cor:"#cd7f32" },
                    { n:"Prata",   icon:"🥈", cor:"#95a5a6" },
                    { n:"Ouro",    icon:"🥇", cor:"#f39c12" },
                    { n:"Platina", icon:"💎", cor:"#6c5ce7" },
                  ].map(lv => (
                    <div key={lv.n} style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:400,color:lv.cor,lineHeight:1 }}>{(stats.niveis||{})[lv.n]||0}</div>
                      <div style={{ fontSize:"0.72rem",color:lv.cor,marginTop:"0.15rem" }}>{lv.icon} {lv.n}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginTop:"1rem",marginBottom:"2rem" }}>
              <div style={{ background:"#fff",padding:"1.5rem",borderTop:"3px solid #080808" }}>
                <div style={{ fontFamily:"var(--sans)",fontSize:"2rem",fontWeight:300 }}>{stats.taxa_ocupacao}%</div>
                <div style={{ fontSize:"0.75rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>Taxa de ocupação</div>
              </div>
              <div style={{ background:"#fff",padding:"1.5rem",borderTop:"3px solid #c4748a",cursor:"pointer" }} onClick={() => setTab("seewhois")}>
                <div style={{ fontSize:"1.5rem" }}>🔍</div>
                <div style={{ fontSize:"0.75rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>Pesquisar cliente (SeeWhois) →</div>
              </div>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Ações rápidas</p>
              <div style={ROW}>
                {[["🔍 SeeWhois","rosa","seewhois"],["+ Adicionar peça","black","catalogo"],["Ver alugueres","outline","alugueres"],["Ver clientes","outline","clientes"],["📊 Analytics","outline","estatisticas"]].map(([l,c,t]) => (
                  <button key={l} style={BTN(c)} onClick={() => setTab(t)}>{l}</button>
                ))}
              </div>
            </div>

            {/* RESERVAS EM ESPERA */}
            {stats.reservasAtivas && stats.reservasAtivas.length > 0 && (
              <div style={CARD}>
                <p style={CARD_T}>Reservas em espera ({stats.reservasAtivas.length})</p>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Cód. Cliente","Peça / Ref.","Datas desejadas","Estado","Disponibilidade"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats.reservasAtivas.filter(r => r.estado === "aguarda").map(r => {
                      return (
                        <tr key={r.id} style={{ background:"#fff" }}>
                          <td style={TD}><span style={{ fontFamily:"monospace",fontWeight:700,color:"#c4748a" }}>{r.clientes?.codigo_cliente || "—"}</span></td>
                          <td style={TD}>
                            <div style={{ fontWeight:600,fontSize:"0.85rem" }}>{r.stock_tamanhos?.pecas?.nome || "—"}</div>
                            <div style={{ fontSize:"0.75rem",color:"#c4748a",fontFamily:"monospace" }}>{r.stock_tamanhos?.pecas?.codigo_referencia || "—"}</div>
                            <div style={{ fontSize:"0.75rem",color:"#888" }}>Tam: {r.stock_tamanhos?.tamanho}</div>
                          </td>
                          <td style={{ ...TD,fontSize:"0.82rem",whiteSpace:"nowrap" }}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                          <td style={TD}><span style={BADGE(r.estado==="notificado"?"green":"orange")}>{r.estado==="notificado"?"Notificado":"A aguardar"}</span></td>
                          <td style={TD}>
                            {r.estado==="notificado" ? (
                              <span style={{ color:"#27ae60",fontWeight:700,fontSize:"0.82rem" }}>✓ Disponível</span>
                            ) : (
                              <span style={{ color:"#b8860b",fontSize:"0.82rem" }}>A aguardar libertação</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* OPERACIONAL EM TEMPO REAL */}
            {stats.alugueresAtivos && stats.alugueresAtivos.length > 0 && (
              <>
                {/* Alertas críticos */}
                {stats.alugueresAtivos.filter(a => {
                  const horasRestantes = (new Date(a.data_fim) - new Date()) / 3600000;
                  return horasRestantes <= 6 && horasRestantes > 0;
                }).length > 0 && (
                  <div style={{ background:"#fff5f5",border:"2px solid #e74c3c",padding:"1.25rem 1.5rem",marginBottom:"1rem" }}>
                    <p style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#e74c3c",fontWeight:700,marginBottom:"0.75rem" }}>⚠ Termina em menos de 6 horas</p>
                    {stats.alugueresAtivos.filter(a => {
                      const h = (new Date(a.data_fim) - new Date()) / 3600000;
                      return h <= 6 && h > 0;
                    }).map(a => (
                      <div key={a.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid #ffd5d5",fontSize:"0.85rem" }}>
                        <div>
                          <span style={{ fontFamily:"monospace",fontWeight:700,color:"#c4748a",marginRight:"0.5rem" }}>{a.clientes?.codigo_cliente}</span>
                          <span style={{ fontWeight:600 }}>{a.stock_tamanhos?.pecas?.nome}</span>
                          <span style={{ color:"#888",marginLeft:"0.5rem",fontSize:"0.72rem" }}>{a.stock_tamanhos?.pecas?.codigo_referencia}</span>
                        </div>
                        <span style={{ color:"#e74c3c",fontWeight:700,fontSize:"0.82rem" }}>
                          {Math.max(0, Math.floor((new Date(a.data_fim) - new Date()) / 3600000))}h restantes
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Atrasos */}
                {stats.alugueresAtivos.filter(a => new Date(a.data_fim) < new Date() && a.estado === "ativo").length > 0 && (
                  <div style={{ background:"#fff8e1",border:"2px solid #f39c12",padding:"1.25rem 1.5rem",marginBottom:"1rem" }}>
                    <p style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#b8860b",fontWeight:700,marginBottom:"0.75rem" }}>🕐 Em atraso — dias extra a contar</p>
                    {stats.alugueresAtivos.filter(a => new Date(a.data_fim) < new Date() && a.estado === "ativo").map(a => {
                      const diasAtraso = Math.floor((new Date() - new Date(a.data_fim)) / 86400000);
                      return (
                        <div key={a.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid #ffeaa0",fontSize:"0.85rem" }}>
                          <div>
                            <span style={{ fontFamily:"monospace",fontWeight:700,color:"#c4748a",marginRight:"0.5rem" }}>{a.clientes?.codigo_cliente}</span>
                            <span style={{ fontWeight:600 }}>{a.stock_tamanhos?.pecas?.nome}</span>
                            <span style={{ color:"#888",marginLeft:"0.5rem",fontSize:"0.72rem" }}>{a.stock_tamanhos?.pecas?.codigo_referencia}</span>
                          </div>
                          <span style={{ color:"#b8860b",fontWeight:700,fontSize:"0.82rem" }}>+{diasAtraso} dia{diasAtraso !== 1 ? "s" : ""} atraso</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Todos os alugueres ativos */}
                <div style={CARD}>
                  <p style={CARD_T}>Em curso agora ({stats.alugueresAtivos.length})</p>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead><tr>{["Cód. Cliente","Peça / Ref.","Estado","Entrega / Devolução","Valor"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {stats.alugueresAtivos.map(a => {
                        const diasRestantes = Math.ceil((new Date(a.data_fim) - new Date()) / 86400000);
                        const emAtraso = diasRestantes < 0;
                        const urgente = diasRestantes === 0 || ((new Date(a.data_fim) - new Date()) / 3600000) <= 6;

                        // Timer entrega: 24h desde data_envio
                        const dataEnvio = a.envios?.[0]?.data_envio;
                        const prazoEntrega = dataEnvio ? new Date(new Date(dataEnvio).getTime() + 24*60*60*1000) : null;
                        const horasEntrega = prazoEntrega ? Math.max(0, Math.floor((prazoEntrega - new Date()) / 3600000)) : null;
                        const minsEntrega = prazoEntrega ? Math.max(0, Math.floor(((prazoEntrega - new Date()) % 3600000) / 60000)) : null;

                        // Timer devolução: a partir de data_confirmacao_recepcao
                        const horasRestantesDev = Math.floor((new Date(a.data_fim) - new Date()) / 3600000);
                        const minsRestantesDev = Math.floor(((new Date(a.data_fim) - new Date()) % 3600000) / 60000);

                        return (
                          <tr key={a.id} style={{ background: emAtraso ? "#fff8e1" : urgente ? "#fff5f5" : "#fff" }}>
                            <td style={TD}><span style={{ fontFamily:"monospace",fontWeight:700,color:"#c4748a" }}>{a.clientes?.codigo_cliente || "—"}</span></td>
                            <td style={TD}>
                              <div style={{ fontWeight:600,fontSize:"0.85rem" }}>{a.stock_tamanhos?.pecas?.nome || "—"}</div>
                              <div style={{ fontSize:"0.75rem",color:"#c4748a",fontFamily:"monospace" }}>{a.stock_tamanhos?.pecas?.codigo_referencia || "—"}</div>
                              <div style={{ fontSize:"0.75rem",color:"#888" }}>Tam: {a.stock_tamanhos?.tamanho}</div>
                            </td>
                            <td style={TD}>
                              <span style={BADGE(a.estado==="ativo"?"green":a.estado==="enviado"?"orange":"gray")}>{ESTADO_LABEL_PT[a.estado]||a.estado}</span>
                              {a.estado==="ativo" && emAtraso && <div style={{ marginTop:"0.25rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#e74c3c",fontWeight:700 }}>⚠️ Atraso {calcularAtraso(a.data_fim)}d</div>}
                              {a.estado==="enviado" && prazoEntrega && new Date(prazoEntrega) < new Date() && <div style={{ marginTop:"0.25rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#e67e22",fontWeight:700 }}>⚠️ Entrega atrasada</div>}
                            </td>
                            <td style={TD}>
                              {a.estado === "enviado" && prazoEntrega && (
                                <div style={{ color:"#1565c0",fontWeight:700,fontSize:"0.82rem" }}>
                                  🚚 {horasEntrega > 0 ? `Chega em ${horasEntrega}h ${minsEntrega}m` : "A chegar a qualquer momento"}
                                </div>
                              )}
                              {a.estado === "ativo" && (
                                <div style={{ color:emAtraso?"#e74c3c":urgente?"#b8860b":"#27ae60",fontWeight:700,fontSize:"0.82rem" }}>
                                  {emAtraso 
                                    ? `⚠ +${Math.abs(diasRestantes)}d atraso` 
                                    : urgente 
                                    ? `⏰ ${horasRestantesDev}h ${minsRestantesDev}m para devolver`
                                    : `↩ Devolver em ${diasRestantes}d`}
                                </div>
                              )}
                              {a.estado === "confirmado" && <div style={{ color:"#6b3fa0",fontSize:"0.82rem" }}>A preparar envio</div>}
                              {a.estado === "pendente" && <div style={{ color:"#b8860b",fontSize:"0.82rem" }}>A aguardar pagamento</div>}
                            </td>
                            <td style={TD}><strong>{a.valor_aluguer}€</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* PERFORMANCE LOJISTAS */}
            {(() => {
              if (!alugueresLojista || alugueresLojista.length === 0) return null;
              const porLojista = {};
              alugueresLojista.forEach(a => {
                const id = a.lojista_id;
                const nome = a.clientes?.nome || "—";
                if (!porLojista[id]) porLojista[id] = { nome, total: 0, disputas: 0, receitaTotal: 0, liquidado: 0, aReceber: 0 };
                porLojista[id].total++;
                if (a.deposito_estado === "em_disputa") porLojista[id].disputas++;
                if (a.estado === "devolvido" && !a.liquidado_em) porLojista[id].aReceber += (a.valor_aluguer || 0) * 0.9;
                if (a.liquidado_em) porLojista[id].liquidado += (a.valor_liquidacao || 0);
                porLojista[id].receitaTotal += (a.valor_aluguer || 0);
              });
              const lista = Object.values(porLojista).sort((a, b) => b.receitaTotal - a.receitaTotal);
              return (
                <div style={CARD}>
                  <p style={CARD_T}>Performance Lojistas</p>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["Lojista","Alugueres","Receita total","A receber","Já pago","Disputas","Estado"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {lista.map((l, i) => {
                        const cor = l.disputas > 0 ? "red" : l.aReceber > 0 ? "orange" : "green";
                        return (
                          <tr key={i} style={{ background:"#fff",borderBottom:"1px solid #f0eeeb" }}>
                            <td style={{ ...TD,fontWeight:600 }}>{l.nome}</td>
                            <td style={TD}>{l.total}</td>
                            <td style={TD}>{l.receitaTotal.toFixed(0)}€</td>
                            <td style={{ ...TD,color:l.aReceber>0?"#c4748a":"#888",fontWeight:l.aReceber>0?600:400 }}>{l.aReceber>0?`${l.aReceber.toFixed(2)}€`:"—"}</td>
                            <td style={{ ...TD,color:"#27ae60" }}>{l.liquidado>0?`${l.liquidado.toFixed(2)}€`:"—"}</td>
                            <td style={TD}>{l.disputas>0?<span style={BADGE("red")}>{l.disputas} disputa{l.disputas>1?"s":""}</span>:<span style={{color:"#888",fontSize:"0.78rem"}}>—</span>}</td>
                            <td style={TD}><span style={BADGE(cor)}>{cor==="green"?"✓ OK":cor==="orange"?"Pag. pendente":"Em disputa"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ marginTop:"0.75rem",textAlign:"right" }}>
                    <button style={BTN("outline","sm")} onClick={() => setTab("lojistas")}>Gerir lojistas →</button>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {tab === "seewhois" && <SeeWhois />}

        {tab === "caixa" && <Caixa />}

        {tab === "catalogo" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Catálogo</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{pecas.length} peças</p>

            <div style={CARD}>
              <p style={CARD_T}>Adicionar nova peça</p>
              <div style={COL2}>
                <div><label style={LBL}>Nome *</label><input style={INP} value={novaPeca.nome} onChange={e => setNovaPeca(p=>({...p,nome:e.target.value}))} placeholder="Vestido Seda Noite" /></div>
                <div><label style={LBL}>Categoria</label>
                  <select style={INP} value={novaPeca.categoria_id} onChange={e => setNovaPeca(p=>({...p,categoria_id:e.target.value}))}>
                    <option value="">Selecionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div><label style={LBL}>Preço aluguer/dia (€) *</label><input style={INP} type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="35" /></div>
                <div><label style={LBL}>Preço por ocasião (€)</label><input style={INP} type="number" value={novaPeca.preco_avulso} onChange={e => setNovaPeca(p=>({...p,preco_avulso:e.target.value}))} placeholder="89" /></div>
                <div><label style={LBL}>Valor peça (€) — caução base</label><input style={INP} type="number" value={novaPeca.valor_peca} onChange={e => {
                  const v = e.target.value;
                  const sugerido = v > 0 ? Math.round((parseFloat(v) * 0.10 / 3) * 10) / 10 : "";
                  setNovaPeca(p => ({ ...p, valor_peca: v, ...(!p.preco_aluguer_dia ? { preco_aluguer_dia: sugerido } : {}) }));
                }} placeholder="450" />
                {novaPeca.valor_peca > 0 && (() => { const s = Math.round((parseFloat(novaPeca.valor_peca) * 0.10 / 3) * 10) / 10; return s > 0 ? <p style={{fontSize:"0.7rem",color:"#c4a882",marginTop:"0.25rem"}}>💡 Sugestão: {s}€/dia (valor × 10% ÷ 3)</p> : null; })()}
                </div>
                <div><label style={LBL}>Material</label><input style={INP} value={novaPeca.material} onChange={e => setNovaPeca(p=>({...p,material:e.target.value}))} placeholder="100% Seda natural" /></div>
                <div><label style={LBL}>Origem</label><input style={INP} value={novaPeca.origem} onChange={e => setNovaPeca(p=>({...p,origem:e.target.value}))} /></div>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",paddingTop:"1.5rem" }}>
                  <input type="checkbox" id="dest" checked={novaPeca.destaque} onChange={e => setNovaPeca(p=>({...p,destaque:e.target.checked}))} />
                  <label htmlFor="dest" style={{ ...LBL,marginBottom:0 }}>Em destaque</label>
                </div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Descrição</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={novaPeca.descricao} onChange={e => setNovaPeca(p=>({...p,descricao:e.target.value}))} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Nota da stylist <span style={{fontWeight:400,color:"#aaa",textTransform:"none",letterSpacing:0}}>(opcional — se vazio, gerado automaticamente com base nas ocasiões)</span></label><textarea style={{ ...INP,resize:"vertical",minHeight:"70px" }} value={novaPeca.conselho_stylist||""} onChange={e => setNovaPeca(p=>({...p,conselho_stylist:e.target.value}))} placeholder="Ex: Perfeita para casamentos de verão ao ar livre — já usada por 3 noivas na Nora Grei" /></div>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LBL}>Ocasiões</label>
                <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.5rem" }}>
                  {OCASIOES.map(o => (
                    <button key={o} type="button" onClick={() => setNovaPeca(p=>({...p,ocasioes:p.ocasioes.includes(o)?p.ocasioes.filter(x=>x!==o):[...p.ocasioes,o]}))}
                      style={{ fontSize:"0.68rem",padding:"0.4rem 0.75rem",border:`1.5px solid ${novaPeca.ocasioes.includes(o)?"#080808":"#e2dfda"}`,background:novaPeca.ocasioes.includes(o)?"#080808":"#fff",color:novaPeca.ocasioes.includes(o)?"#fff":"#080808",cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"all 0.15s" }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LBL}>Tamanhos & stock</label>
                {novaPeca.tamanhos.map((t,i) => (
                  <div key={i} style={{ display:"flex",gap:"0.75rem",alignItems:"center",marginBottom:"0.5rem" }}>
                    <select style={{ ...INP,width:"130px" }} value={t.tamanho} onChange={e => { const ts=[...novaPeca.tamanhos]; ts[i].tamanho=e.target.value; setNovaPeca(p=>({...p,tamanhos:ts})); }}>
                      <option value="">Tamanho</option>
                      {TAMANHOS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                    <input style={{ ...INP,width:"100px" }} type="number" min="1" value={t.quantidade_total} placeholder="Qtd" onChange={e => { const ts=[...novaPeca.tamanhos]; ts[i].quantidade_total=e.target.value; setNovaPeca(p=>({...p,tamanhos:ts})); }} />
                    {novaPeca.tamanhos.length > 1 && <button type="button" onClick={() => setNovaPeca(p=>({...p,tamanhos:p.tamanhos.filter((_,j)=>j!==i)}))} style={{ background:"none",border:"none",cursor:"pointer",color:"#e74c3c",fontSize:"1.2rem" }}>✕</button>}
                  </div>
                ))}
                <button type="button" style={BTN("outline","sm")} onClick={() => setNovaPeca(p=>({...p,tamanhos:[...p.tamanhos,{tamanho:"",quantidade_total:1}]}))}>+ Tamanho</button>
              </div>

              <div style={{ marginBottom:"1rem" }}>
                <label style={LBL}>Fotos</label>
                <label style={{ display:"block",padding:"1.5rem",border:"2px dashed #e2dfda",background:"#f8f8f6",cursor:"pointer",textAlign:"center",transition:"border-color 0.2s" }}>
                  <input type="file" accept="image/*" multiple onChange={e => setFotosUpload(Array.from(e.target.files))} style={{ display:"none" }} />
                  {fotosUpload.length===0 ? <div><div style={{ fontSize:"2rem" }}>📷</div><div style={{ fontSize:"0.82rem",color:"#888",marginTop:"0.4rem" }}>Clica para selecionar fotos</div></div>
                    : <div style={{ color:"#27ae60",fontWeight:500 }}>{fotosUpload.length} foto(s): {fotosUpload.map(f=>f.name).join(", ")}</div>}
                </label>
                {fotosUpload.length > 0 && <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.75rem" }}>{fotosUpload.map((f,i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width:60,height:60,objectFit:"cover",border:"1px solid #e2dfda" }} />)}</div>}
                {uploadProgress && <p style={{ fontSize:"0.78rem",color:uploadProgress.startsWith("✓")?"#27ae60":uploadProgress.startsWith("❌")?"#e74c3c":"#c4748a",marginTop:"0.5rem",fontWeight:500 }}>{uploadProgress}</p>}
              </div>

              <button style={{ ...BTN("black"),opacity:criandoPeca?0.6:1 }} onClick={criarPeca} disabled={criandoPeca}>{criandoPeca?"A criar...":"+ Adicionar peça"}</button>
            </div>

            <div style={CARD}>
              <p style={CARD_T}>Peças ({pecas.length})</p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Foto","Peça","Cat.","€/dia","Ocasiões","Tamanhos","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id} style={{ background:"#fff" }}>
                        <td style={TD}>{p.fotos?.length>0?<img src={p.fotos[0]} alt="" style={{ width:48,height:60,objectFit:"cover" }}/>:<div style={{ width:48,height:60,background:"#f0eeeb",display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc" }}>📷</div>}</td>
                        <td style={TD}><div style={{ fontWeight:600 }}>{p.nome}</div>{p.destaque&&<span style={{ fontSize:"0.72rem",background:"#fff0f3",color:"#c4748a",padding:"0.1rem 0.4rem" }}>★ DESTAQUE</span>}<div style={{ fontSize:"0.75rem",color:"#c4748a",marginTop:"0.2rem",fontFamily:"monospace",fontWeight:600 }}>{p.codigo_referencia || p.id.slice(0,8)}</div></td>
                        <td style={TD}>{p.categorias?.nome||"—"}</td>
                        <td style={TD}>{p.preco_aluguer_dia}€{p.preco_avulso?<div style={{ fontSize:"0.72rem",color:"#888" }}>{p.preco_avulso}€/oc.</div>:null}</td>
                        <td style={{ ...TD,maxWidth:120 }}><div style={{ fontSize:"0.72rem",color:"#888" }}>{(p.ocasioes||[]).slice(0,3).join(", ")||"—"}</div></td>
                        <td style={TD}><div style={{ fontSize:"0.75rem" }}>{p.stock_tamanhos?.map(s=>`${s.tamanho}(${s.quantidade_disponivel}/${s.quantidade_total})`).join(", ")||"—"}</div></td>
                        <td style={TD}><span style={BADGE(p.estado==="disponivel"?"green":"gray")}>{p.estado==="disponivel"?"Disponível":"Indisponível"}</span></td>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                            <button style={BTN("rosa","sm")} onClick={() => abrirEdicao(p)}>✏️ Editar</button>
                            <button style={BTN("outline","sm")} onClick={async()=>{ await supabase.from("pecas").update({estado:p.estado==="disponivel"?"indisponivel":"disponivel"}).eq("id",p.id); carregarDados(); }}>{p.estado==="disponivel"?"Desativar":"Ativar"}</button>
                            <button style={BTN("red","sm")} onClick={async()=>{ if(confirm("Apagar?")){ await supabase.from("pecas").delete().eq("id",p.id); carregarDados(); } }}>Apagar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pecaEditando && (
              <div style={{ position:"fixed",inset:0,background:"rgba(8,8,8,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem" }} onClick={(e) => e.target === e.currentTarget && fecharEdicao()}>
                <div style={{ background:"#fff",width:"100%",maxWidth:700,maxHeight:"90vh",overflowY:"auto",padding:"2rem" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
                    <h2 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:300 }}>Editar peça</h2>
                    <button onClick={fecharEdicao} style={{ background:"none",border:"none",fontSize:"1.5rem",cursor:"pointer",color:"#888" }}>✕</button>
                  </div>

                  <div style={COL2}>
                    <div><label style={LBL}>Nome *</label><input style={INP} value={editForm.nome} onChange={e => setEditForm(f=>({...f,nome:e.target.value}))} /></div>
                    <div><label style={LBL}>Categoria</label>
                      <select style={INP} value={editForm.categoria_id} onChange={e => setEditForm(f=>({...f,categoria_id:e.target.value}))}>
                        <option value="">Selecionar</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div><label style={LBL}>Preço aluguer/dia (€) *</label><input style={INP} type="number" value={editForm.preco_aluguer_dia} onChange={e => setEditForm(f=>({...f,preco_aluguer_dia:e.target.value}))} /></div>
                    <div><label style={LBL}>Preço por ocasião (€)</label><input style={INP} type="number" value={editForm.preco_avulso} onChange={e => setEditForm(f=>({...f,preco_avulso:e.target.value}))} /></div>
                    <div><label style={LBL}>Valor peça (€) — caução base</label><input style={INP} type="number" value={editForm.valor_peca} onChange={e => setEditForm(f=>({...f,valor_peca:e.target.value}))} /></div>
                    <div><label style={LBL}>Material</label><input style={INP} value={editForm.material} onChange={e => setEditForm(f=>({...f,material:e.target.value}))} /></div>
                    <div><label style={LBL}>Origem</label><input style={INP} value={editForm.origem} onChange={e => setEditForm(f=>({...f,origem:e.target.value}))} /></div>
                    <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",paddingTop:"1.5rem" }}>
                      <input type="checkbox" id="editdest" checked={editForm.destaque} onChange={e => setEditForm(f=>({...f,destaque:e.target.checked}))} />
                      <label htmlFor="editdest" style={{ ...LBL,marginBottom:0 }}>Em destaque</label>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={LBL}>Posição da foto no hero da landing</label>
                      <select style={INP} value={editForm.hero_position||"center top"} onChange={e => setEditForm(f=>({...f,hero_position:e.target.value}))}>
                        <option value="center top">Topo (cabeça visível)</option>
                        <option value="center center">Centro</option>
                        <option value="center bottom">Base (pés visíveis)</option>
                        <option value="top center">Topo centrado</option>
                        <option value="20% center">Ligeiramente acima</option>
                        <option value="80% center">Ligeiramente abaixo</option>
                      </select>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Descrição</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={editForm.descricao} onChange={e => setEditForm(f=>({...f,descricao:e.target.value}))} /></div>
                    <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Nota da stylist <span style={{fontWeight:400,color:"#aaa",textTransform:"none",letterSpacing:0}}>(opcional — se vazio, gerado automaticamente)</span></label><textarea style={{ ...INP,resize:"vertical",minHeight:"70px" }} value={editForm.conselho_stylist||""} onChange={e => setEditForm(f=>({...f,conselho_stylist:e.target.value}))} placeholder="Ex: Perfeita para casamentos de verão ao ar livre — já usada por 3 noivas na Nora Grei" /></div>
                  </div>

                  <div style={{ marginTop:"1.25rem",marginBottom:"1.25rem" }}>
                    <label style={LBL}>Ocasiões</label>
                    <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.5rem" }}>
                      {OCASIOES.map(o => (
                        <button key={o} type="button" onClick={() => setEditForm(f=>({...f,ocasioes:f.ocasioes.includes(o)?f.ocasioes.filter(x=>x!==o):[...f.ocasioes,o]}))}
                          style={{ fontSize:"0.68rem",padding:"0.4rem 0.75rem",border:`1.5px solid ${editForm.ocasioes.includes(o)?"#080808":"#e2dfda"}`,background:editForm.ocasioes.includes(o)?"#080808":"#fff",color:editForm.ocasioes.includes(o)?"#fff":"#080808",cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom:"1.25rem" }}>
                    <label style={LBL}>Tamanhos & stock</label>
                    {editTamanhos.map((t,i) => (
                      <div key={i} style={{ display:"flex",gap:"0.75rem",alignItems:"center",marginBottom:"0.5rem" }}>
                        <select style={{ ...INP,width:"110px" }} value={t.tamanho} onChange={e => atualizarTamanhoEdit(i, "tamanho", e.target.value)}>
                          <option value="">Tamanho</option>
                          {TAMANHOS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                        <div style={{ display:"flex",flexDirection:"column",gap:"0.2rem" }}>
                          <span style={{ fontSize:"0.68rem",color:"#888" }}>Total</span>
                          <input style={{ ...INP,width:"80px" }} type="number" min="0" value={t.quantidade_total} onChange={e => atualizarTamanhoEdit(i, "quantidade_total", e.target.value)} />
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",gap:"0.2rem" }}>
                          <span style={{ fontSize:"0.68rem",color:"#888" }}>Disponível</span>
                          <input style={{ ...INP,width:"80px" }} type="number" min="0" value={t.quantidade_disponivel} onChange={e => atualizarTamanhoEdit(i, "quantidade_disponivel", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removerTamanhoEdit(i)} style={{ background:"none",border:"none",cursor:"pointer",color:"#e74c3c",fontSize:"1.2rem",marginTop:"1rem" }}>✕</button>
                      </div>
                    ))}
                    <button type="button" style={BTN("outline","sm")} onClick={adicionarTamanhoEdit}>+ Tamanho</button>
                  </div>

                  <div style={{ marginBottom:"1.25rem" }}>
                    <label style={LBL}>Fotos atuais</label>
                    {editFotosExistentes.length === 0 ? (
                      <p style={{ fontSize:"0.8rem",color:"#888",marginTop:"0.5rem" }}>Sem fotos</p>
                    ) : (
                      <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.5rem" }}>
                        {editFotosExistentes.map((f, i) => (
                          <div key={i} style={{ position:"relative" }}>
                            <img src={f} alt="" style={{ width:70,height:70,objectFit:"cover",border:"1px solid #e2dfda" }} />
                            <button onClick={() => removerFotoExistente(i)} style={{ position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#e74c3c",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.7rem" }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom:"1.5rem" }}>
                    <label style={LBL}>Adicionar novas fotos</label>
                    <label style={{ display:"block",padding:"1.25rem",border:"2px dashed #e2dfda",background:"#f8f8f6",cursor:"pointer",textAlign:"center",marginTop:"0.5rem" }}>
                      <input type="file" accept="image/*" multiple onChange={e => setEditFotosNovas(Array.from(e.target.files))} style={{ display:"none" }} />
                      {editFotosNovas.length === 0 ? <div style={{ fontSize:"0.8rem",color:"#888" }}>📷 Clica para adicionar fotos</div>
                        : <div style={{ color:"#27ae60",fontWeight:500,fontSize:"0.82rem" }}>{editFotosNovas.length} nova(s) foto(s) selecionada(s)</div>}
                    </label>
                  </div>

                  {editProgress && <p style={{ fontSize:"0.8rem",color:editProgress.startsWith("✓")?"#27ae60":editProgress.startsWith("❌")?"#e74c3c":"#c4748a",fontWeight:500,marginBottom:"1rem" }}>{editProgress}</p>}

                  <div style={{ display:"flex",gap:"0.75rem" }}>
                    <button style={{ ...BTN("black"),flex:1,opacity:salvandoEdicao?0.6:1 }} onClick={guardarEdicao} disabled={salvandoEdicao}>{salvandoEdicao?"A guardar...":"Guardar alterações"}</button>
                    <button style={BTN("outline")} onClick={fecharEdicao}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "alugueres" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Alugueres</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"1rem" }}>{alugueres.length} registados</p>

            {/* Filtros */}
            <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"center",marginBottom:"1.5rem" }}>
              {[
                { id:"ativos", lbl:"Ativos", estados:["pendente","confirmado","enviado","ativo","em_verificacao"] },
                { id:"todos", lbl:"Todos", estados:null },
                { id:"pendente", lbl:"A aguardar pagamento", estados:["pendente"] },
                { id:"confirmado", lbl:"A preparar envio", estados:["confirmado"] },
                { id:"enviado", lbl:"A caminho", estados:["enviado"] },
                { id:"ativo", lbl:"A usar", estados:["ativo"] },
                { id:"em_verificacao", lbl:"Em verificação", estados:["em_verificacao"] },
                { id:"devolvido", lbl:"Concluídos", estados:["devolvido","devolvido_danificado"] },
                { id:"cancelado", lbl:"Cancelados", estados:["cancelado","nao_devolvido"] },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltroEstadoAl(f.id)} style={{ padding:"0.35rem 0.75rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",border:"none",background:filtroEstadoAl===f.id?"#080808":"#f0eeeb",color:filtroEstadoAl===f.id?"#fff":"#555",cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap" }}>
                  {f.lbl}
                  {f.estados && <span style={{ marginLeft:"0.35rem",opacity:0.7 }}>({alugueres.filter(a=>f.estados.includes(a.estado)).length})</span>}
                </button>
              ))}
              <input
                value={pesquisaAl}
                onChange={e => setPesquisaAl(e.target.value)}
                placeholder="Pesquisar cliente ou peça..."
                style={{ ...INP, width:"220px", fontSize:"0.8rem", padding:"0.35rem 0.75rem" }}
              />
            </div>

            <div style={CARD}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Peça","Cliente","Progresso","Datas","Atraso","Valor","Cesto","Depósito","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(() => {
                      const FILTRO_ESTADOS = {
                        ativos: ["pendente","confirmado","enviado","ativo","em_verificacao"],
                        pendente: ["pendente"], confirmado: ["confirmado"], enviado: ["enviado"],
                        ativo: ["ativo"], em_verificacao: ["em_verificacao"],
                        devolvido: ["devolvido","devolvido_danificado"],
                        cancelado: ["cancelado","nao_devolvido"],
                      };
                      const estadosFiltro = FILTRO_ESTADOS[filtroEstadoAl];
                      const q = pesquisaAl.toLowerCase();
                      return alugueres.filter(a => {
                        const passaEstado = !estadosFiltro || estadosFiltro.includes(a.estado);
                        const passaPesquisa = !q || (a.clientes?.nome||"").toLowerCase().includes(q) || (a.clientes?.codigo_cliente||"").toLowerCase().includes(q) || (a.stock_tamanhos?.pecas?.nome||"").toLowerCase().includes(q) || (a.stock_tamanhos?.pecas?.codigo_referencia||"").toLowerCase().includes(q);
                        return passaEstado && passaPesquisa;
                      });
                    })().map(a => {
                      const peca = a.stock_tamanhos?.pecas;
                      const nv = NIVEL(a.clientes?.total_pecas_alugadas||0);
                      const atraso = calcularAtraso(a.data_fim);
                      const enderecoCompleto = [a.clientes?.morada, a.clientes?.numero_porta, a.clientes?.andar].filter(Boolean).join(", ");
                      return (
                        <tr key={a.id} style={{ background:"#fff" }}>
                          <td style={TD}>
                            <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                              <div style={{ width:44,height:56,flexShrink:0,background:"#f0eeeb",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span style={{ fontFamily:"var(--sans)",fontSize:"1.1rem",color:"#ccc",fontStyle:"italic" }}>NG</span>}
                              </div>
                              <div>
                                <div style={{ fontWeight:600,fontSize:"0.85rem" }}>{peca?.nome||"—"}</div>
                                <div style={{ fontSize:"0.75rem",color:"#c4748a",fontWeight:600,fontFamily:"monospace" }}>{peca?.codigo_referencia||"—"}</div>
                                <div style={{ fontSize:"0.72rem",color:"#888" }}>Tam: {a.stock_tamanhos?.tamanho}</div>
                              </div>
                            </div>
                          </td>
                          <td style={TD}>
                            <div style={{ fontWeight:600 }}>{a.clientes?.nome||"—"}</div>
                            <div style={{ fontSize:"0.75rem",color:"#c4748a",fontWeight:600 }}>{a.clientes?.codigo_cliente||"—"}</div>
                            <div style={{ fontSize:"0.72rem",color:"#888" }}>{a.clientes?.telefone||a.clientes?.email}</div>
                            {enderecoCompleto && <div style={{ fontSize:"0.68rem",color:"#aaa",marginTop:"0.15rem" }}>📍 {enderecoCompleto}{a.clientes?.cidade?`, ${a.clientes.cidade}`:""}</div>}
                            <span style={{ ...BADGE(""),background:nv.cor+"22",color:nv.cor,marginTop:"0.2rem",display:"inline-block" }}>{nv.icon} {nv.nome}</span>
                          </td>
                          <td style={TD}>
                            <ProgressoAluguer estado={a.estado} />
                            <select value={a.estado} onChange={e=>atualizarEstado(a.id,e.target.value)} style={{ fontSize:"0.72rem",padding:"0.3rem 0.4rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"'Jost',sans-serif",cursor:"pointer",marginTop:"0.4rem" }}>
                              <option value="pendente">A aguardar pagamento</option>
                              <option value="confirmado">Pago — a preparar envio</option>
                              <option value="enviado">A caminho</option>
                              <option value="ativo">A usar</option>
                              <option value="em_verificacao">Em inspeção</option>
                              <option value="devolvido">Concluído</option>
                              <option value="devolvido_danificado">Concluído — com danos</option>
                              <option value="nao_devolvido">Não devolvido</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td style={{ ...TD,whiteSpace:"nowrap" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={TD}>{atraso>0?<span style={{ color:"#e74c3c",fontWeight:700 }}>+{atraso}d</span>:<span style={{ color:"#27ae60" }}>✓</span>}</td>
                          <td style={TD}>
                            <strong>{a.valor_aluguer}€</strong>
                            {a.desconto_cesto && <div style={{ fontSize:"0.72rem",color:"#888",marginTop:"0.15rem" }}>{a.deposito_valor}€ dep.</div>}
                          </td>
                          <td style={TD}>
                            {a.desconto_cesto ? (
                              <span style={{ ...BADGE("rosa"),whiteSpace:"nowrap" }}>
                                🛍 {a.desconto_cesto.startsWith("opcao_a") ? "–" + a.desconto_cesto.replace("opcao_a_","").replace("pct","%") : "caução"}
                              </span>
                            ) : <span style={{ color:"#ccc",fontSize:"0.75rem" }}>—</span>}
                          </td>
                          <td style={TD}>
                            <span style={BADGE(a.deposito_estado==="recebido"||a.deposito_estado==="libertado"?"green":"orange")}>{{recebido:"Recebido",pendente:"A aguardar",libertado:"Devolvido ao cliente"}[a.deposito_estado]||a.deposito_estado}</span>
                            {a.deposito_estado==="pendente"&&<button style={{ ...BTN("rosa","sm"),display:"block",marginTop:"0.25rem" }} onClick={()=>confirmarDeposito(a.id)}>Confirmar</button>}
                          </td>
                          <td style={TD}>
                            <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
                              {a.estado==="confirmado"&&<button style={BTN("rosa","sm")} onClick={()=>marcarEnviado(a)}>🚚 Enviar</button>}
                              {a.estado==="ativo"&&<button style={BTN("rosa","sm")} onClick={()=>confirmarRecepcao(a.id)}>📦 Recebi devolução</button>}
                              {a.estado==="em_verificacao"&&<><button style={BTN("black","sm")} onClick={()=>confirmarVerificacao(a.id,false,{cliente_id:a.cliente_id,cliente_nome:a.clientes?.nome||"Cliente"})}>✓ OK</button><button style={BTN("red","sm")} onClick={()=>confirmarVerificacao(a.id,true,{cliente_id:a.cliente_id,cliente_nome:a.clientes?.nome||"Cliente"})}>✗ Dano</button></>}
                              {a.estado==="devolvido"&&a.deposito_estado!=="libertado"&&<button style={BTN("outline","sm")} onClick={()=>libertarCaucao(a.id)}>💰 Libertar</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "clientes" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Clientes</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{clientes.length} registados</p>
            <div style={CARD}>
              {clientes.length === 0 ? (
                <p style={{ color:"#888",fontSize:"0.85rem",padding:"1rem 0" }}>Nenhum cliente encontrado. Se sabes que existem clientes registados, verifica se há erro de RLS na tabela clientes (consola do navegador).</p>
              ) : (
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Cliente","Contacto","Cidade","Nível","Alugueres","Gasto","Caução",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {clientes.map(c => {
                    const al = c.alugueres||[];
                    const total = al.filter(a=>a.estado!=="cancelado").length;
                    const comp = al.filter(a=>["devolvido","devolvido_danificado"].includes(a.estado)).length;
                    const gasto = al.reduce((s,a)=>s+(a.valor_aluguer||0),0);
                    const nv = NIVEL(comp);
                    return (
                      <tr key={c.id} style={{ background:"#fff" }}>
                        <td style={TD}><div style={{ fontWeight:600 }}>{c.nome||"—"}</div><div style={{ fontSize:"0.72rem",color:"#888" }}>{c.email}</div><div style={{ fontSize:"0.75rem",color:"#c4748a",fontWeight:600,marginTop:"0.15rem" }}>{c.codigo_cliente}</div></td>
                        <td style={TD}><div style={{ fontSize:"0.82rem" }}>{c.telefone||"—"}</div><div style={{ fontSize:"0.72rem",color:"#888" }}>{c.nif?"NIF: "+c.nif:""}</div></td>
                        <td style={TD}>{c.cidade||"—"}</td>
                        <td style={TD}>
                          <span style={{ ...BADGE(""),background:nv.cor+"22",color:nv.cor }}>{nv.nome}</span>
                          <div style={{ fontSize:"0.68rem",color:"#888",marginTop:"0.2rem" }}>{comp<5?`${5-comp}→Prata`:comp<10?`${10-comp}→Ouro`:comp<20?`${20-comp}→Platina`:"Platina ✓"}</div>
                        </td>
                        <td style={TD}><span style={BADGE("rosa")}>{total} pts</span></td>
                        <td style={TD}><strong>{gasto.toFixed(0)}€</strong></td>
                        <td style={{ ...TD,color:nv.cor,fontWeight:700 }}>{nv.caucao}%</td>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.4rem" }}>
                            <button style={BTN("outline","sm")} onClick={()=>setClienteSel(clienteSel?.id===c.id?null:c)}>{clienteSel?.id===c.id?"Fechar":"Ver"}</button>
                          </div>
                        </td>
                      </tr>

                    );
                  })}
                </tbody>
              </table>
              )}
            </div>

            {clienteSel && (
              <div style={CARD}>
                <p style={CARD_T}>Perfil — {clienteSel.nome}</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem" }}>
                  {[["Email",clienteSel.email],["Telefone",clienteSel.telefone||"—"],["NIF",clienteSel.nif||"—"],["Cidade",clienteSel.cidade||"—"],["País",clienteSel.pais||"—"],["Membro desde",new Date(clienteSel.created_at).toLocaleDateString("pt-PT")],["Género",clienteSel.genero||"—"],["Código postal",clienteSel.codigo_postal||"—"]].map(([k,v])=>(
                    <div key={k} style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.3rem" }}>{k}</div>
                      <div style={{ fontSize:"0.9rem",fontWeight:500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <p style={CARD_T}>Histórico de alugueres</p>
                {(clienteSel.alugueres||[]).length===0?<p style={{ color:"#888",fontSize:"0.85rem" }}>Sem alugueres</p>:(
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead><tr>{["Foto","Peça","Tam.","Datas","Valor","Estado"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(clienteSel.alugueres||[]).map(a=>(
                        <tr key={a.id} style={{ background:"#fff" }}>
                          <td style={TD}>{a.stock_tamanhos?.pecas?.fotos?.[0]?<img src={a.stock_tamanhos.pecas.fotos[0]} alt="" style={{ width:32,height:40,objectFit:"cover" }}/>:<div style={{ width:32,height:40,background:"#f0eeeb" }}/>}</td>
                          <td style={TD}>{a.stock_tamanhos?.pecas?.nome||"—"}</td>
                          <td style={TD}>{a.stock_tamanhos?.tamanho||"—"}</td>
                          <td style={{ ...TD,whiteSpace:"nowrap",fontSize:"0.8rem" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={TD}><strong>{a.valor_aluguer}€</strong></td>
                          <td style={TD}><span style={BADGE(a.estado==="devolvido"?"green":a.estado==="ativo"?"orange":"gray")}>{ESTADO_LABEL_PT[a.estado] || a.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {tab === "reservas" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Reservas em espera</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{reservas.length} pendentes — deteção e notificação automáticas</p>
            <div style={CARD}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Peça","Cliente","Datas desejadas","Disponibilidade","Estado"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {reservas.length===0?<tr><td colSpan={5} style={{ textAlign:"center",color:"#888",padding:"2rem",fontSize:"0.85rem" }}>Sem reservas em espera</td></tr>
                    :reservas.map(r=>(
                      <tr key={r.id} style={{ background:"#fff" }}>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.6rem",alignItems:"center" }}>
                            <div style={{ width:44,height:56,flexShrink:0,background:"#f0eeeb",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              {r.stock_tamanhos?.pecas?.fotos?.[0] ? <img src={r.stock_tamanhos.pecas.fotos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span style={{ fontFamily:"var(--sans)",fontSize:"1.1rem",color:"#ccc",fontStyle:"italic" }}>NG</span>}
                            </div>
                            <div>
                              <div style={{ fontWeight:600 }}>{r.stock_tamanhos?.pecas?.nome||"—"}</div>
                              <div style={{ fontSize:"0.75rem",color:"#c4748a",fontWeight:600,fontFamily:"monospace" }}>{r.stock_tamanhos?.pecas?.codigo_referencia||"—"}</div>
                              <div style={{ fontSize:"0.72rem",color:"#888" }}>Tam: {r.stock_tamanhos?.tamanho}</div>
                            </div>
                          </div>
                        </td>
                        <td style={TD}>
                          <div style={{ fontWeight:600 }}>{r.clientes?.nome||"—"}</div>
                          <div style={{ fontSize:"0.75rem",color:"#888" }}>{r.clientes?.email}</div>
                          {r.clientes?.telefone && <div style={{ fontSize:"0.72rem",color:"#aaa" }}>{r.clientes.telefone}</div>}
                        </td>
                        <td style={{ ...TD,whiteSpace:"nowrap" }}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                        <td style={TD}>
                          {r.disponivelAgora ? (
                            <span style={{ fontSize:"0.7rem",color:"#27ae60",fontWeight:700 }}>✓ Disponível agora</span>
                          ) : (
                            <TimerReservaBackoffice dataDisponivel={r.dataDisponivel} />
                          )}
                        </td>
                        <td style={TD}>
                          <span style={BADGE(r.estado==="aguarda"?"orange":"green")}>{r.estado==="aguarda"?"A aguardar":"Notificado automaticamente"}</span>
                          {r.estado==="notificado" && r.prazo_confirmacao && (
                            <div style={{ fontSize:"0.75rem",color:"#888",marginTop:"0.2rem" }}>Prazo: {new Date(r.prazo_confirmacao).toLocaleString("pt-PT")}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "campanhas" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Campanhas</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Alertas e cupões para clientes</p>
            <div style={CARD}>
              <p style={CARD_T}>Nova campanha</p>
              <div style={COL2}>
                <div><label style={LBL}>Título * (PT)</label><input style={INP} value={novaCampanha.titulo} onChange={e=>setNovaCampanha(p=>({...p,titulo:e.target.value}))} placeholder="É o teu dia de sorte!" /></div>
                <div><label style={LBL}>Tipo</label>
                  <select style={INP} value={novaCampanha.tipo} onChange={e=>setNovaCampanha(p=>({...p,tipo:e.target.value}))}>
                    <option value="cupao">Cupão de desconto</option>
                    <option value="banner">Banner promoção</option>
                    <option value="novidade">Novidade de produto</option>
                    <option value="oferta">Oferta especial</option>
                  </select>
                </div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem * (PT)</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={novaCampanha.mensagem} onChange={e=>setNovaCampanha(p=>({...p,mensagem:e.target.value}))} /></div>
                <div><label style={LBL}>Título FR</label><input style={INP} value={novaCampanha.titulo_fr} onChange={e=>setNovaCampanha(p=>({...p,titulo_fr:e.target.value}))} placeholder="C'est votre jour de chance!" /></div>
                <div><label style={LBL}>Título LT</label><input style={INP} value={novaCampanha.titulo_lt} onChange={e=>setNovaCampanha(p=>({...p,titulo_lt:e.target.value}))} placeholder="Tai jūsų laimės diena!" /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem FR</label><textarea style={{ ...INP,resize:"vertical",minHeight:"60px" }} value={novaCampanha.mensagem_fr} onChange={e=>setNovaCampanha(p=>({...p,mensagem_fr:e.target.value}))} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem LT</label><textarea style={{ ...INP,resize:"vertical",minHeight:"60px" }} value={novaCampanha.mensagem_lt} onChange={e=>setNovaCampanha(p=>({...p,mensagem_lt:e.target.value}))} /></div>
                <div><label style={LBL}>Código desconto</label><input style={INP} value={novaCampanha.codigo} onChange={e=>setNovaCampanha(p=>({...p,codigo:e.target.value}))} placeholder="NORA15" /></div>
                <div><label style={LBL}>Descrição desconto</label><input style={INP} value={novaCampanha.desconto} onChange={e=>setNovaCampanha(p=>({...p,desconto:e.target.value}))} placeholder="15% em toda a loja" /></div>
                <div><label style={LBL}>Probabilidade (%)</label><input style={INP} type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e=>setNovaCampanha(p=>({...p,probabilidade:e.target.value}))} /></div>
                <div><label style={LBL}>Validade (opcional)</label><input style={INP} type="datetime-local" value={novaCampanha.validade} onChange={e=>setNovaCampanha(p=>({...p,validade:e.target.value}))} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>URL destino</label><input style={INP} value={novaCampanha.url_destino} onChange={e=>setNovaCampanha(p=>({...p,url_destino:e.target.value}))} /></div>
              </div>
              <button style={BTN("rosa")} onClick={criarCampanha}>✉ Criar campanha</button>
            </div>

            <div style={CARD}>
              <p style={CARD_T}>{campanhas.length} campanhas</p>
              {campanhas.length === 0 ? (
                <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem campanhas criadas ainda. Usa o formulário acima para criar a primeira.</p>
              ) : (
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Título / Mensagem","Tipo","Código","Prob.","Validade","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {campanhas.map(c=>(
                      <tr key={c.id} style={{ background:"#fff" }}>
                        <td style={TD}>
                          <div style={{ fontWeight:600 }}>{c.titulo}</div>
                          <div style={{ fontSize:"0.75rem",color:"#888",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.mensagem}</div>
                          <div style={{ display:"flex",gap:"0.3rem",marginTop:"0.3rem" }}>
                            {c.titulo_fr && <span style={{ fontSize:"0.72rem",background:"#e8f4f8",color:"#2980b9",padding:"0.1rem 0.35rem",borderRadius:2 }}>FR</span>}
                            {c.titulo_lt && <span style={{ fontSize:"0.72rem",background:"#e8f8ee",color:"#27ae60",padding:"0.1rem 0.35rem",borderRadius:2 }}>LT</span>}
                          </div>
                        </td>
                        <td style={TD}><span style={BADGE(c.tipo==="cupao"?"rosa":c.tipo==="banner"?"blue":"green")}>{c.tipo}</span></td>
                        <td style={{ ...TD,fontWeight:700,letterSpacing:"0.1em" }}>{c.codigo||"—"}</td>
                        <td style={TD}>{c.probabilidade}%</td>
                        <td style={{ ...TD,fontSize:"0.8rem" }}>{c.validade?new Date(c.validade).toLocaleDateString("pt-PT"):"Sem limite"}</td>
                        <td style={TD}><span style={BADGE(c.ativa?"green":"gray")}>{c.ativa?"Ativa":"Inativa"}</span></td>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.4rem" }}>
                            <button style={BTN(c.ativa?"outline":"rosa","sm")} onClick={async()=>{ await supabase.from("campanhas").update({ativa:!c.ativa}).eq("id",c.id); carregarDados(); }}>{c.ativa?"Pausar":"Ativar"}</button>
                            <button style={BTN("outline","sm")} onClick={()=>{ setCampanhaEditando(c); setEditCampanha({ titulo:c.titulo||"", mensagem:c.mensagem||"", tipo:c.tipo||"cupao", titulo_fr:c.titulo_fr||"", mensagem_fr:c.mensagem_fr||"", titulo_lt:c.titulo_lt||"", mensagem_lt:c.mensagem_lt||"", codigo:c.codigo||"", desconto:c.desconto||"", probabilidade:c.probabilidade||20, validade:c.validade?c.validade.slice(0,16):"", url_destino:c.url_destino||"" }); }}>Editar</button>
                            <button style={BTN("red","sm")} onClick={async()=>{ if(confirm("Apagar?")){ await supabase.from("campanhas").delete().eq("id",c.id); carregarDados(); } }}>Apagar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              )}
            </div>
          </>
        )}

        {tab === "mensagens" && (
          <MensagensBackoffice />
        )}

        {tab === "afiliados" && (
          <AfiliadosTab />
        )}

        {tab === "feed" && (
          <FeedBackoffice />
        )}

        {tab === "landing" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Landing Page</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Gerir vídeo e fotos da página inicial</p>

            <div style={CARD}>
              <p style={CARD_T}>Vídeo da landing page</p>
              <label style={{ display:"block",padding:"2rem",border:"2px dashed #e2dfda",background:"#f8f8f6",cursor:"pointer",textAlign:"center",marginBottom:"1rem" }}>
                <input type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={uploadVideo} style={{ display:"none" }} />
                {landingCfg.video_landing_url ? (
                  <div>
                    <video src={landingCfg.video_landing_url} style={{ maxWidth:"100%",maxHeight:200,marginBottom:"0.5rem" }} controls />
                    <div style={{ fontSize:"0.78rem",color:"#27ae60" }}>Vídeo atual — clica para substituir</div>
                  </div>
                ) : (
                  <div><div style={{ fontSize:"2rem" }}>🎬</div><div style={{ fontSize:"0.82rem",color:"#888",marginTop:"0.4rem" }}>{uploadingVideo ? "A carregar..." : "Clica para fazer upload do vídeo (mp4)"}</div></div>
                )}
              </label>
              {videoProgress && <p style={{ fontSize:"0.78rem",color:videoProgress.startsWith("✓")?"#27ae60":videoProgress.startsWith("❌")?"#e74c3c":"#c4748a",fontWeight:500 }}>{videoProgress}</p>}
            </div>

            <div style={CARD}>
              <p style={CARD_T}>Foto do Hero (banner principal)</p>
              <div style={{ display:"flex",gap:"1rem",alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <select style={INP} value={landingCfg.hero_peca_id} onChange={e => setLandingCfg(p => ({...p, hero_peca_id: e.target.value}))}>
                    <option value="">Automático (peça em destaque)</option>
                    {pecasComFoto.map(p => <option key={p.id} value={p.id}>{p.nome}{p.destaque?" ★":""}</option>)}
                  </select>
                  <div style={{ fontSize:"0.7rem",color:"#888",marginTop:"0.4rem" }}>
                    {landingCfg.hero_peca_id ? `Peça selecionada manualmente` : `A usar peça marcada como ★ Destaque automaticamente`}
                  </div>
                </div>
                {landingCfg.hero_peca_id && (() => {
                  const p = pecasComFoto.find(x => x.id === landingCfg.hero_peca_id);
                  return p?.fotos?.[0] ? <img src={p.fotos[0]} alt={p.nome} style={{ width:80,height:100,objectFit:"cover",flexShrink:0,border:"1px solid #e2dfda" }} /> : null;
                })()}
              </div>
            </div>

            <div style={CARD}>
              <p style={CARD_T}>Fotos das categorias</p>
              <div style={COL2}>
                {[
                  ["Festa", "categoria_festa_peca_id"],
                  ["Trabalho", "categoria_trabalho_peca_id"],
                  ["Férias", "categoria_ferias_peca_id"],
                  ["Jantar", "categoria_jantar_peca_id"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={LBL}>{label}</label>
                    <div style={{ display:"flex",gap:"0.75rem",alignItems:"center" }}>
                      <select style={{ ...INP,flex:1 }} value={landingCfg[key]} onChange={e => setLandingCfg(p => ({...p, [key]: e.target.value}))}>
                        <option value="">Automático</option>
                        {pecasComFoto.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                      {landingCfg[key] && (() => {
                        const p = pecasComFoto.find(x => x.id === landingCfg[key]);
                        return p?.fotos?.[0] ? <img src={p.fotos[0]} alt={p.nome} style={{ width:44,height:56,objectFit:"cover",flexShrink:0,border:"1px solid #e2dfda" }} /> : null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista da Selecção da semana */}
            <div style={CARD}>
              <p style={CARD_T}>Selecção da semana (homepage)</p>
              <p style={{ fontSize:"0.78rem",color:"#888",marginBottom:"1rem" }}>
                As primeiras {pecasComFoto.filter(p=>p.destaque).length > 0 ? pecasComFoto.filter(p=>p.destaque).length : "0"} peças com ★ Destaque aparecem primeiro na homepage. Completa até 6 com as mais recentes.
              </p>
              <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1rem" }}>
                {pecasComFoto.filter(p=>p.destaque).map(p => (
                  <div key={p.id} style={{ textAlign:"center",position:"relative" }}>
                    {p.fotos?.[0] && <img src={p.fotos[0]} alt={p.nome} style={{ width:64,height:80,objectFit:"cover",border:"2px solid #c4748a" }} />}
                    <div style={{ fontSize:"0.68rem",color:"#c4748a",marginTop:"0.2rem",fontWeight:600 }}>★ DESTAQUE</div>
                    <div style={{ fontSize:"0.68rem",color:"#555",maxWidth:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.nome}</div>
                  </div>
                ))}
                {pecasComFoto.filter(p=>p.destaque).length === 0 && (
                  <p style={{ fontSize:"0.8rem",color:"#b8860b",fontStyle:"italic" }}>Nenhuma peça com ★ Destaque. Vai ao Catálogo e activa o destaque nas peças que queres mostrar.</p>
                )}
              </div>
              <button style={BTN("outline","sm")} onClick={() => setTab("catalogo")}>Gerir destaques no Catálogo →</button>
            </div>

            <button style={BTN("black")} onClick={guardarLanding}>Guardar alterações</button>
          </>
        )}

        {tab === "estatisticas" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Estatísticas & AI</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Analytics completo + consultor inteligente</p>
            {!estatisticas?<div style={{ textAlign:"center",padding:"3rem",color:"#888" }}>A carregar dados...</div>:(
              <>
                <div style={COL4}>
                  {[{val:`${estatisticas.totalReceita.toFixed(0)}€`,lbl:"Receita total",cor:"#c4748a"},{val:estatisticas.totalAlugueres,lbl:"Total alugueres"},{val:`${estatisticas.ltv.toFixed(0)}€`,lbl:"LTV médio"},{val:`${estatisticas.taxaCancelamento}%`,lbl:"Taxa cancelamento"}].map((s,i)=>(
                    <div key={i} style={{ background:"#fff",padding:"1.5rem",borderTop:`3px solid ${s.cor||"#080808"}` }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"2rem",fontWeight:300,color:s.cor||"#080808" }}>{s.val}</div>
                      <div style={{ fontSize:"0.75rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginTop:"1rem" }}>
                  <div style={CARD}>
                    <p style={CARD_T}>Categorias mais alugadas</p>
                    {Object.entries(estatisticas.catCount).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{
                      const max = Math.max(...Object.values(estatisticas.catCount));
                      return (<div key={cat} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.25rem" }}><span>{cat}</span><strong>{count}</strong></div>
                        <div style={{ height:6,background:"#f0eeeb",borderRadius:3 }}><div style={{ height:"100%",width:`${(count/max)*100}%`,background:"#c4748a",borderRadius:3 }}/></div>
                      </div>);
                    })}
                  </div>
                  <div style={CARD}>
                    <p style={CARD_T}>Cidades</p>
                    {Object.entries(estatisticas.cidades).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cidade,count])=>{
                      const max = Math.max(...Object.values(estatisticas.cidades));
                      return (<div key={cidade} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.25rem" }}><span>{cidade}</span><strong>{count}</strong></div>
                        <div style={{ height:6,background:"#f0eeeb",borderRadius:3 }}><div style={{ height:"100%",width:`${(count/max)*100}%`,background:"#080808",borderRadius:3 }}/></div>
                      </div>);
                    })}
                  </div>
                </div>
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>ROI por peça</p>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead><tr>{["Peça","Valor peça","Vezes","Receita","ROI","Danos","Break-even"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                      <tbody>
                        {estatisticas.roiPecas.map(p=>(
                          <tr key={p.id} style={{ background:"#fff" }}>
                            <td style={TD}><strong>{p.nome}</strong></td>
                            <td style={TD}>{p.valor_peca}€</td>
                            <td style={TD}>{p.vezesAlugada}x</td>
                            <td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{p.receitaGerada.toFixed(0)}€</td>
                            <td style={TD}><span style={{ color:p.roi>=100?"#27ae60":p.roi>=50?"#f39c12":"#e74c3c",fontWeight:700 }}>{p.roi}%</span></td>
                            <td style={TD}>{p.danificada>0?<span style={{ color:"#e74c3c" }}>{p.danificada}x</span>:<span style={{ color:"#27ae60" }}>0</span>}</td>
                            <td style={{ ...TD,color:"#888" }}>{p.preco_aluguer_dia>0?`${Math.ceil(p.valor_peca/p.preco_aluguer_dia)} dias`:"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>Logística & Rotação de Stock</p>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1rem" }}>
                    {[
                      { val: `${estatisticas.mediaAtraso} dias`, lbl: "Atraso médio", cor: parseFloat(estatisticas.mediaAtraso) > 2 ? "#e74c3c" : "#27ae60" },
                      { val: `${estatisticas.medianaAtraso} dias`, lbl: "Mediana atraso", cor: "#f39c12" },
                      { val: `${estatisticas.mediaCiclo} dias`, lbl: "Ciclo médio peça", cor: "#080808" },
                      { val: `${estatisticas.rotacoesMes}x`, lbl: "Rotações/mês", cor: "#c4748a" },
                    ].map((s,i) => (
                      <div key={i} style={{ background:"#f8f8f6",padding:"1.25rem",borderTop:`3px solid ${s.cor}` }}>
                        <div style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:300,color:s.cor }}>{s.val}</div>
                        <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginTop:"0.4rem" }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:"0.75rem",color:"#888",fontStyle:"italic" }}>Baseado em {estatisticas.roiPecas?.filter(p=>p.vezesAlugada>0).length || 0} peças com histórico de devolução.</p>
                </div>

                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>Análise 80-20 (Pareto)</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem" }}>
                    <div style={{ background:"#fff8f0",padding:"1.5rem",borderLeft:"4px solid #c4748a" }}>
                      <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Peças que geram 80% receita</div>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"2.5rem",fontWeight:300,color:"#c4748a" }}>{estatisticas.pareto20Pecas}</div>
                      <div style={{ fontSize:"0.8rem",color:"#888" }}>de {estatisticas.totalPecas} peças totais ({estatisticas.totalPecas > 0 ? Math.round(estatisticas.pareto20Pecas/estatisticas.totalPecas*100) : 0}%)</div>
                    </div>
                    <div style={{ background:"#f0f8ff",padding:"1.5rem",borderLeft:"4px solid #080808" }}>
                      <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Clientes que geram 80% receita</div>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"2.5rem",fontWeight:300,color:"#080808" }}>{estatisticas.pareto20Clientes}</div>
                      <div style={{ fontSize:"0.8rem",color:"#888" }}>de {estatisticas.totalClientes} clientes totais ({estatisticas.totalClientes > 0 ? Math.round(estatisticas.pareto20Clientes/estatisticas.totalClientes*100) : 0}%)</div>
                    </div>
                  </div>
                  <div style={{ marginTop:"1rem" }}>
                    <p style={{ fontSize:"0.75rem",color:"#888",marginBottom:"0.75rem" }}>Top peças por receita:</p>
                    {estatisticas.roiPecas?.slice(0,5).map((p,i) => {
                      const pct = estatisticas.totalReceita > 0 ? (p.receitaGerada/estatisticas.totalReceita*100).toFixed(1) : 0;
                      return (
                        <div key={p.id} style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem" }}>
                          <span style={{ fontSize:"0.7rem",color:"#888",width:"1.5rem" }}>#{i+1}</span>
                          <span style={{ fontSize:"0.85rem",flex:1 }}>{p.nome}</span>
                          <span style={{ fontSize:"0.8rem",color:"#c4748a",fontWeight:600 }}>{p.receitaGerada.toFixed(0)}€</span>
                          <span style={{ fontSize:"0.7rem",color:"#888" }}>{pct}%</span>
                          <div style={{ width:80,height:6,background:"#f0eeeb",borderRadius:3 }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:"#c4748a",borderRadius:3 }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BREAKEVEN & CUSTOS */}
                <div style={{ ...CARD,marginTop:"1rem",borderTop:"3px solid #080808" }}>
                  <p style={CARD_T}>💰 Breakeven & Gestão financeira (média 3 meses)</p>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"#e2dfda",marginBottom:"1.5rem" }}>
                    {[
                      { val: `${Number(estatisticas.receitaMedia3M||0).toFixed(0)}€`, lbl: "Receita média/mês", cor:"#27ae60" },
                      { val: `${Number(estatisticas.despesasMedia3M||0).toFixed(0)}€`, lbl: "Custos médios/mês", cor:"#e74c3c" },
                      { val: `${Number(estatisticas.receitaMedia3M-estatisticas.despesasMedia3M||0).toFixed(0)}€`, lbl: "Resultado médio/mês", cor: (estatisticas.receitaMedia3M||0)>(estatisticas.despesasMedia3M||0)?"#27ae60":"#e74c3c" },
                      { val: `${estatisticas.margemOp||0}%`, lbl: "Margem operacional", cor: parseFloat(estatisticas.margemOp||0)>20?"#27ae60":parseFloat(estatisticas.margemOp||0)>0?"#f39c12":"#e74c3c" },
                    ].map((s,i)=>(
                      <div key={i} style={{ background:"#fff",padding:"1.25rem 1.5rem" }}>
                        <div style={{ fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:600,color:s.cor }}>{s.val}</div>
                        <div style={{ fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.4rem" }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {/* Breakeven visual */}
                  <div style={{ background:"#f8f8f6",padding:"1.25rem",marginBottom:"1rem" }}>
                    <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.75rem" }}>Dia estimado de breakeven neste mês</div>
                    {estatisticas.diaBreakeven ? (
                      <>
                        <div style={{ display:"flex",alignItems:"baseline",gap:"0.75rem",marginBottom:"0.75rem" }}>
                          <div style={{ fontFamily:"var(--sans)",fontSize:"3rem",fontWeight:300,color: estatisticas.diaBreakeven<=15?"#27ae60":estatisticas.diaBreakeven<=22?"#f39c12":"#e74c3c",lineHeight:1 }}>dia {estatisticas.diaBreakeven}</div>
                          <div style={{ fontSize:"0.78rem",color:"#888" }}>
                            {estatisticas.diaBreakeven<=15?"Excelente — cobre custos na 1ª quinzena":estatisticas.diaBreakeven<=22?"Aceitável — cobre custos na 3ª semana":"Atenção — cobre custos tarde no mês"}
                          </div>
                        </div>
                        <div style={{ height:8,background:"#e2dfda",borderRadius:4,overflow:"hidden",marginBottom:"0.4rem" }}>
                          <div style={{ height:"100%",width:`${Math.min(100,(estatisticas.diaBreakeven/30)*100)}%`,background:estatisticas.diaBreakeven<=15?"#27ae60":estatisticas.diaBreakeven<=22?"#f39c12":"#e74c3c",borderRadius:4 }}/>
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"#aaa" }}>
                          <span>Dia 1</span><span>Dia 15</span><span>Dia 30</span>
                        </div>
                        <p style={{ fontSize:"0.72rem",color:"#888",marginTop:"0.75rem" }}>
                          Receita diária média: <strong>{Number(estatisticas.receitaDiaria||0).toFixed(0)}€/dia</strong> · Custo diário total: <strong>{Number(estatisticas.custoDiario||0).toFixed(0)}€/dia</strong>
                        </p>
                        {estatisticas.temSeparacao && (
                          <div style={{ display:"flex",gap:"0.5rem",marginTop:"0.4rem",flexWrap:"wrap" }}>
                            <span style={{ fontSize:"0.75rem",padding:"0.15rem 0.5rem",background:"#f0f4ff",color:"#3f5fa3",borderRadius:2 }}>🏠 Fixos: <strong>{Number(estatisticas.despesasFixasMedia3M||0).toFixed(0)}€/mês</strong></span>
                            <span style={{ fontSize:"0.75rem",padding:"0.15rem 0.5rem",background:"#fff8f0",color:"#8a5a00",borderRadius:2 }}>📦 Variáveis: <strong>{Number(estatisticas.despesasVarMedia3M||0).toFixed(0)}€/mês</strong></span>
                            <span style={{ fontSize:"0.75rem",color:"#aaa",alignSelf:"center" }}>Breakeven calculado sobre custos fixos</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize:"0.82rem",color:"#888" }}>Regista despesas na Caixa para calcular o breakeven.</p>
                    )}
                  </div>
                  {/* Tendência mensal */}
                  <div style={{ fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.75rem" }}>Evolução dos últimos 6 meses</div>
                  <div style={{ display:"flex",gap:"2px",height:80,alignItems:"flex-end" }}>
                    {(() => {
                      const maxVal = Math.max(...(estatisticas.tendenciaMensal||[]).map(m=>Math.max(m.receita,m.despesas)),1);
                      return (estatisticas.tendenciaMensal||[]).map((m,i) => (
                        <div key={m.key} style={{ flex:1,display:"flex",gap:"1px",alignItems:"flex-end",position:"relative" }}>
                          <div title={`Receita: ${m.receita.toFixed(0)}€`} style={{ flex:1,background:"#27ae60",height:`${(m.receita/maxVal)*100}%`,minHeight:2 }}/>
                          <div title={`Custos: ${m.despesas.toFixed(0)}€`} style={{ flex:1,background:"#e74c3c",height:`${(m.despesas/maxVal)*100}%`,minHeight:2 }}/>
                          <div style={{ position:"absolute",bottom:-18,left:0,right:0,fontSize:"0.68rem",color:"#888",textAlign:"center",whiteSpace:"nowrap" }}>{m.label}</div>
                        </div>
                      ));
                    })()}
                  </div>
                  <div style={{ display:"flex",gap:"1rem",marginTop:"1.5rem",fontSize:"0.75rem",color:"#888" }}>
                    <span style={{ display:"flex",alignItems:"center",gap:"0.3rem" }}><span style={{ width:10,height:10,background:"#27ae60",display:"inline-block" }}/> Receita</span>
                    <span style={{ display:"flex",alignItems:"center",gap:"0.3rem" }}><span style={{ width:10,height:10,background:"#e74c3c",display:"inline-block" }}/> Custos</span>
                  </div>
                  <table style={{ width:"100%",borderCollapse:"collapse",marginTop:"1rem",fontSize:"0.78rem" }}>
                    <thead><tr>{["Mês","Receita","Custos","Resultado"].map(h=><th key={h} style={{ ...TH }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(estatisticas.tendenciaMensal||[]).slice().reverse().map(m=>(
                        <tr key={m.key} style={{ background:"#fff" }}>
                          <td style={TD}><strong>{m.label}</strong></td>
                          <td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{m.receita.toFixed(0)}€</td>
                          <td style={{ ...TD,color:"#e74c3c" }}>{m.despesas.toFixed(0)}€</td>
                          <td style={{ ...TD,fontWeight:700,color:m.lucro>=0?"#27ae60":"#e74c3c" }}>{m.lucro>=0?"+":""}{m.lucro.toFixed(0)}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PERFIL CLIENTES PARETO */}
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>👤 Perfil dos clientes que geram 80% da receita</p>
                  <p style={{ fontSize:"0.75rem",color:"#888",marginBottom:"1rem" }}>Top {Math.ceil((estatisticas.totalClientes||0)*0.2)} clientes ({Math.round(((estatisticas.pareto20Clientes||0)/(estatisticas.totalClientes||1))*100)}% da base) geram 80% da receita. Conhece-os.</p>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem" }}>
                    <div style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Idade média</div>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"2rem",fontWeight:300 }}>{estatisticas.idadeMediaPareto ? `${estatisticas.idadeMediaPareto} anos` : "—"}</div>
                    </div>
                    <div style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Género</div>
                      {Object.entries(estatisticas.generosPareto||{}).sort((a,b)=>b[1]-a[1]).map(([g,n])=>(
                        <div key={g} style={{ fontSize:"0.82rem",marginBottom:"0.2rem" }}>{g==="feminino"?"♀ Feminino":g==="masculino"?"♂ Masculino":g==="outro"?"⚧ Outro":"❓ Não definido"}: <strong>{n}</strong></div>
                      ))}
                    </div>
                    <div style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Cidades</div>
                      {(estatisticas.cidadesPareto||[]).map(([c,n])=>(
                        <div key={c} style={{ fontSize:"0.82rem",marginBottom:"0.2rem" }}>{c}: <strong>{n}</strong></div>
                      ))}
                    </div>
                    <div style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.5rem" }}>Profissões</div>
                      {(estatisticas.profissoesPareto||[]).length > 0 ? (estatisticas.profissoesPareto||[]).map(([p,n])=>(
                        <div key={p} style={{ fontSize:"0.82rem",marginBottom:"0.2rem" }}>{p}: <strong>{n}</strong></div>
                      )) : <span style={{ fontSize:"0.78rem",color:"#bbb" }}>Dados insuficientes</span>}
                    </div>
                  </div>
                  <p style={{ fontSize:"0.68rem",color:"#aaa",marginTop:"0.75rem",fontStyle:"italic" }}>
                    Quanto mais dados de perfil os clientes preencherem (cidade, género, profissão, data de nascimento), mais precisa é esta análise.
                  </p>
                </div>

                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>Pagamentos & Recibos ({estatisticas.totalRecibos} talões)</p>
                  <div style={COL4}>
                    {[
                      { val: `${estatisticas.receitaRecebida.toFixed(0)}€`, lbl: "Receita recebida", cor: "#27ae60" },
                      { val: `${estatisticas.receitaPendente.toFixed(0)}€`, lbl: "Receita pendente", cor: "#f39c12" },
                      { val: `${estatisticas.ticketMedioGeral}€`, lbl: "Ticket médio", cor: "#c4748a" },
                      { val: estatisticas.comprovativosPendentes.length, lbl: "Comprovativos a validar", cor: estatisticas.comprovativosPendentes.length > 0 ? "#e74c3c" : "#27ae60" },
                    ].map((s,i) => (
                      <div key={i} style={{ background:"#f8f8f6",padding:"1.25rem",borderTop:`3px solid ${s.cor}` }}>
                        <div style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:300,color:s.cor }}>{s.val}</div>
                        <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginTop:"0.4rem" }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ ...CARD_T,marginTop:"1.5rem" }}>Distribuição por método de pagamento</p>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead><tr>{["Método","Total","Pagos","Pendentes","Taxa conversão","Ticket médio"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                      <tbody>
                        {estatisticas.distribuicaoPagamento.map(d => (
                          <tr key={d.metodo} style={{ background:"#fff" }}>
                            <td style={TD}><strong style={{ textTransform:"capitalize" }}>{d.metodo}</strong></td>
                            <td style={TD}>{d.total}</td>
                            <td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{d.pagos}</td>
                            <td style={{ ...TD,color:"#f39c12",fontWeight:600 }}>{d.pendentes}</td>
                            <td style={TD}><span style={{ color:d.taxaConversao>=80?"#27ae60":d.taxaConversao>=50?"#f39c12":"#e74c3c",fontWeight:700 }}>{d.taxaConversao}%</span></td>
                            <td style={TD}>{d.ticketMedio}€</td>
                          </tr>
                        ))}
                        {estatisticas.distribuicaoPagamento.length === 0 && (
                          <tr><td colSpan={6} style={{ ...TD,textAlign:"center",color:"#888" }}>Sem dados de pagamento ainda</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {estatisticas.comprovativosPendentes.length > 0 && (
                    <>
                      <p style={{ ...CARD_T,marginTop:"1.5rem" }}>⚠️ Comprovativos à espera de validação</p>
                      {estatisticas.comprovativosPendentes.map(r => (
                        <div key={r.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.75rem 0",borderBottom:"1px solid #f8f8f6" }}>
                          <div>
                            <div style={{ fontWeight:600,fontSize:"0.85rem" }}>{r.clientes?.nome || "—"}</div>
                            <div style={{ fontSize:"0.72rem",color:"#888" }}>{r.numero} · {new Date(r.created_at).toLocaleDateString("pt-PT")} · {r.valor_total}€</div>
                          </div>
                          <a href={r.comprovativo_url} target="_blank" rel="noopener noreferrer" style={BTN("outline","sm")}>Ver comprovativo ↗</a>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginTop:"1rem" }}>
                  <div style={CARD}>
                    <p style={CARD_T}>Clientes mais ativos</p>
                    {estatisticas.clientesMaisAtivos.map((c,i)=>(
                      <div key={c.id} style={{ display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 0",borderBottom:"1px solid #f8f8f6" }}>
                        <div style={{ fontSize:"1.2rem",width:30 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                        <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:"0.88rem" }}>{c.nome}</div><div style={{ fontSize:"0.75rem",color:"#888" }}>{c.alugueresTotal}x · {c.totalGasto.toFixed(0)}€</div></div>
                        <span style={{ ...BADGE(""),background:c.nivel.cor+"22",color:c.nivel.cor }}>{c.nivel.icon} {c.nivel.nome}</span>
                      </div>
                    ))}
                  </div>
                  <div style={CARD}>
                    <p style={CARD_T}>Peças em espera</p>
                    {Object.keys(estatisticas.pecasEspera).length===0?<p style={{ color:"#888",fontSize:"0.85rem" }}>Nenhuma</p>
                      :Object.entries(estatisticas.pecasEspera).sort((a,b)=>b[1]-a[1]).map(([peca,count])=>(
                        <div key={peca} style={{ display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid #f8f8f6",fontSize:"0.88rem" }}>
                          <span>{peca}</span><span style={BADGE("orange")}>{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>AI Consulting — Análise inteligente</p>
                  <div ref={chatRef} style={{ height:320,overflowY:"auto",padding:"1rem",background:"#f8f8f6",marginBottom:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem" }}>
                    {aiChat.length===0&&<div style={{ color:"#888",fontSize:"0.85rem",textAlign:"center",paddingTop:"2rem" }}>Pergunta-me qualquer coisa sobre o teu negócio.</div>}
                    {aiChat.map((m,i)=>(<div key={i} style={{ padding:"0.75rem 1rem",maxWidth:"80%",fontSize:"0.88rem",lineHeight:1.5,whiteSpace:"pre-wrap",background:m.role==="user"?"#080808":"#fff",color:m.role==="user"?"#fff":"#080808",alignSelf:m.role==="user"?"flex-end":"flex-start",borderLeft:m.role==="assistant"?"3px solid #c4748a":"none" }}>{m.content}</div>))}
                    {aiLoading&&<div style={{ padding:"0.75rem 1rem",background:"#fff",alignSelf:"flex-start",color:"#888",borderLeft:"3px solid #c4748a" }}>A analisar...</div>}
                  </div>
                  <div style={{ display:"flex",gap:"0.75rem",marginBottom:"0.75rem" }}>
                    <input style={{ ...INP,flex:1 }} value={aiPergunta} onChange={e=>setAiPergunta(e.target.value)} onKeyDown={e=>e.key==="Enter"&&perguntarAI()} placeholder="Pergunta ao consultor AI..." />
                    <button style={BTN("black")} onClick={perguntarAI} disabled={aiLoading}>Enviar</button>
                  </div>
                  <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }}>
                    {["Que peças devo comprar mais?","Quais clientes em risco?","Onde focar o marketing?","Que preços ajustar?","Análise geral"].map(q=>(<button key={q} style={BTN("outline","sm")} onClick={()=>setAiPergunta(q)}>{q}</button>))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "lojistas" && (() => {

          const aprovarCandidatura = async (cliente) => {
            if (!confirm(`Aprovar candidatura de ${cliente.nome}?`)) return;
            // Gera código de loja baseado no nome
            const codigoBase = (cliente.lojista_candidatura_dados?.nome_loja || cliente.nome || "loja")
              .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").substring(0,20);
            const codigo = `${codigoBase}-${Math.random().toString(36).substring(2,6)}`;
            await supabase.from("clientes").update({
              modo_lojista: true,
              candidatura_lojista: "aprovada",
              lojista_estado: "teste",
              lojista_desde: new Date().toISOString(),
              codigo_cliente: cliente.codigo_cliente || codigo,
              lojista_iban: cliente.lojista_candidatura_dados?.iban || "",
            }).eq("id", cliente.id);
            setCandidaturasLojista(prev => prev.filter(c => c.id !== cliente.id));
          };

          const recusarCandidatura = async (cliente) => {
            if (!confirm(`Recusar candidatura de ${cliente.nome}?`)) return;
            await supabase.from("clientes").update({ candidatura_lojista: "recusada" }).eq("id", cliente.id);
            setCandidaturasLojista(prev => prev.filter(c => c.id !== cliente.id));
          };

          const toggleLojaVerificada = async (lj) => {
            const novoEstado = !lj.loja_verificada;
            await supabase.from("clientes").update({ loja_verificada: novoEstado }).eq("id", lj.id);
            setLojistasAprovados(prev => prev.map(l => l.id === lj.id ? {...l, loja_verificada: novoEstado} : l));
          };

          const depositos = alugueresLojista.filter(a => a.deposito_estado === "a_devolver");
          const pagamentos = alugueresLojista.filter(a => a.estado === "devolvido" && !a.liquidado_em);
          const disputas = alugueresLojista.filter(a => a.deposito_estado === "em_disputa");
          const subTabs = [
            { id: "depositos", label: `Depósitos a devolver (${depositos.length})` },
            { id: "pagamentos", label: `Pagamentos pendentes (${pagamentos.length})` },
            { id: "disputas", label: `Disputas (${disputas.length})` },
            { id: "todos", label: `Todos (${alugueresLojista.length})` },
            { id: "avaliacoes", label: `Avaliações (${lojistasAprovados.length})` },
          ];
          const lista = subTabLojistas === "depositos" ? depositos : subTabLojistas === "pagamentos" ? pagamentos : subTabLojistas === "disputas" ? disputas : alugueresLojista;

          const atribuirNotaPlataforma = async (lojistaId, nota, motivo) => {
            const agora = new Date().toISOString();
            // Insere avaliação manual da plataforma (sem aluguer_lojista_id específico — registo administrativo)
            await supabase.from("avaliacoes_lojista").insert({
              lojista_id: lojistaId,
              nota_plataforma: nota,
              motivo_plataforma: motivo || "Avaliação manual pela Nora Grei",
              created_at: agora,
            });
            // Recarrega avaliações
            const { data: avs } = await supabase.from("avaliacoes_lojista").select("lojista_id, nota_cliente_lojista, nota_plataforma, motivo_plataforma, created_at");
            if (avs) {
              const map = {};
              avs.forEach(av => { if (!map[av.lojista_id]) map[av.lojista_id] = []; map[av.lojista_id].push(av); });
              setAvaliacoesBackoffice(map);
            }
          };

          const confirmarDepositoDevolucao = async (id) => {
            await supabase.from("alugueres_lojista").update({ deposito_estado: "devolvido", deposito_devolvido_em: new Date().toISOString() }).eq("id", id);
            const { data: al } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone), pecas_lojista(nome), stock_lojista(tamanho)").order("created_at", { ascending: false });
            if (al) setAlugueresLojista(al);
          };

          const pagarLojista = async (a) => {
            const valor = a.valor_aluguer ? parseFloat((a.valor_aluguer * 0.9).toFixed(2)) : 0;
            await supabase.from("alugueres_lojista").update({ liquidado_em: new Date().toISOString(), valor_liquidacao: valor }).eq("id", a.id);
            const { data: al } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone), pecas_lojista(nome), stock_lojista(tamanho)").order("created_at", { ascending: false });
            if (al) setAlugueresLojista(al);
          };

          const resolverDisputa = async (id, decisao) => {
            const novoEstado = decisao === "lojista" ? "retido_lojista" : "devolvido";
            await supabase.from("alugueres_lojista").update({ deposito_estado: novoEstado, deposito_devolvido_em: new Date().toISOString() }).eq("id", id);
            const { data: al } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone), pecas_lojista(nome), stock_lojista(tamanho)").order("created_at", { ascending: false });
            if (al) setAlugueresLojista(al);
          };

          const aprovarPeca = async (peca) => {
            await supabase.from("pecas_lojista").update({ estado: "disponivel" }).eq("id", peca.id);
            // Criar feed_post automaticamente para que apareça no feed "Seguindo"
            await supabase.from("feed_posts").insert({
              cliente_id: peca.cliente_id,
              titulo: peca.nome,
              descricao: peca.descricao || null,
              imagem_url: peca.fotos?.[0] || null,
              estado: "publicado",
              publicado_em: new Date().toISOString(),
              likes: 0,
              visualizacoes: 0,
              boosted: false,
            });
            setPecasPendentes(prev => prev.filter(p => p.id !== peca.id));
          };
          const rejeitarPeca = async (peca) => {
            const motivo = prompt(`Motivo de rejeição para "${peca.nome}" (ficará invisível):`);
            if (motivo === null) return;
            await supabase.from("pecas_lojista").update({ estado: "rejeitado", motivo_rejeicao: motivo }).eq("id", peca.id);
            setPecasPendentes(prev => prev.filter(p => p.id !== peca.id));
          };

          return (
            <>
              {/* PEÇAS PENDENTES DE APROVAÇÃO */}
              {pecasPendentes.length > 0 && (
                <div style={{ ...CARD, border:"2px solid #e74c3c", background:"#fff8f8", marginBottom:"1.5rem" }}>
                  <p style={{ ...CARD_T, color:"#e74c3c" }}>📸 Peças a aprovar ({pecasPendentes.length})</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"1rem" }}>
                    {pecasPendentes.map(p => (
                      <div key={p.id} style={{ background:"#fff", border:"1px solid #f0eeeb", borderRadius:8, overflow:"hidden" }}>
                        <div style={{ aspectRatio:"2/3", background:"#f0eeeb", position:"relative" }}>
                          {p.fotos?.[0]
                            ? <img src={p.fotos[0]} alt={p.nome} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                            : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",fontSize:"2rem" }}>📷</div>
                          }
                          {p.fotos?.length > 1 && (
                            <div style={{ position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:"0.72rem",padding:"2px 6px",borderRadius:10,fontFamily:"'Jost',sans-serif" }}>+{p.fotos.length-1}</div>
                          )}
                        </div>
                        <div style={{ padding:"0.6rem 0.75rem" }}>
                          <div style={{ fontSize:"0.75rem",color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:"0.2rem" }}>{p.categoria||"—"}</div>
                          <div style={{ fontSize:"0.82rem",fontWeight:500,fontFamily:"'Jost',sans-serif",marginBottom:"0.15rem",lineHeight:1.3 }}>{p.nome}</div>
                          <div style={{ fontSize:"0.68rem",color:"#888",fontFamily:"'Jost',sans-serif",marginBottom:"0.6rem" }}>{p.clientes?.nome||"—"}</div>
                          <div style={{ display:"flex",gap:"0.4rem" }}>
                            <button onClick={() => aprovarPeca(p)} style={{ flex:1,padding:"0.45rem 0",fontSize:"0.75rem",background:"#27ae60",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500,letterSpacing:"0.06em" }}>✓ Aprovar</button>
                            <button onClick={() => rejeitarPeca(p)} style={{ flex:1,padding:"0.45rem 0",fontSize:"0.75rem",background:"#fff",color:"#e74c3c",border:"1px solid #e74c3c",borderRadius:4,cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em" }}>✕ Rejeitar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CANDIDATURAS PENDENTES */}
              {candidaturasLojista.length > 0 && (
                <div style={{ ...CARD, border:"2px solid #f39c12", background:"#fffbf0" }}>
                  <p style={{ ...CARD_T, color:"#f39c12" }}>⏳ Candidaturas pendentes ({candidaturasLojista.length})</p>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["Nome","Email","Loja","IBAN","Pagamento","NIF","Ações"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {candidaturasLojista.map(c => (
                        <tr key={c.id} style={{ background:"#fff",borderBottom:"1px solid #f0eeeb" }}>
                          <td style={TD}><div style={{ fontWeight:500 }}>{c.nome}</div><div style={{ fontSize:"0.7rem",color:"#888" }}>{c.telefone||"—"}</div></td>
                          <td style={TD}><span style={{ fontSize:"0.82rem" }}>{c.email}</span></td>
                          <td style={TD}>
                            <div style={{ fontWeight:500,fontSize:"0.85rem" }}>{c.lojista_candidatura_dados?.nome_loja||"—"}</div>
                            {c.lojista_candidatura_dados?.descricao && <div style={{ fontSize:"0.72rem",color:"#888",maxWidth:"180px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.lojista_candidatura_dados.descricao}</div>}
                          </td>
                          <td style={TD}><span style={{ fontFamily:"monospace",fontSize:"0.78rem" }}>{c.lojista_candidatura_dados?.iban||"—"}</span></td>
                          <td style={TD}><span style={BADGE("blue")}>{c.lojista_candidatura_dados?.tipo_pagamento||"—"}</span></td>
                          <td style={TD}>{c.nif||"—"}</td>
                          <td style={TD}>
                            <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                              <button style={BTN("green","sm")} onClick={() => aprovarCandidatura(c)}>✓ Aprovar</button>
                              <button style={BTN("red","sm")} onClick={() => recusarCandidatura(c)}>✗ Recusar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* GESTÃO DE FOTOS DE PEÇAS LOJISTA */}
              {pecasLojistaTodas.length > 0 && (
                <div style={CARD}>
                  <p style={CARD_T}>📷 Fotos das peças de lojistas</p>
                  {editFotosLojista && (
                    <div style={{ background:"#fff8f8",border:"1px solid #f0eeeb",padding:"1rem",marginBottom:"1rem",borderRadius:4 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem" }}>
                        <span style={{ fontFamily:"'Jost',sans-serif",fontWeight:500,fontSize:"0.88rem" }}>A editar fotos: {editFotosLojista.nome}</span>
                        <button onClick={()=>setEditFotosLojista(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"#888",fontSize:"1.1rem" }}>✕</button>
                      </div>
                      {editFotosLojista.fotos?.length > 0 ? (
                        <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }}>
                          {editFotosLojista.fotos.map((url, i) => (
                            <div key={i} style={{ position:"relative" }}>
                              <img src={url} alt="" style={{ width:80,height:100,objectFit:"cover",border:"1px solid #e2dfda" }} />
                              <button onClick={async () => {
                                const novas = editFotosLojista.fotos.filter((_,fi)=>fi!==i);
                                await supabase.from("pecas_lojista").update({ fotos: novas }).eq("id", editFotosLojista.id);
                                setEditFotosLojista(prev=>({...prev, fotos: novas}));
                                setPecasLojistaTodas(prev=>prev.map(p=>p.id===editFotosLojista.id?{...p,fotos:novas}:p));
                              }} style={{ position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#e74c3c",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.7rem",fontWeight:700 }}>✕</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize:"0.82rem",color:"#aaa" }}>Sem fotos — array vazio na BD.</p>
                      )}
                    </div>
                  )}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"0.75rem" }}>
                    {pecasLojistaTodas.map(p => (
                      <div key={p.id} style={{ background:"#f8f7f5",border:"1px solid #e8e5e0",overflow:"hidden",cursor:"pointer" }} onClick={()=>setEditFotosLojista(p)}>
                        <div style={{ aspectRatio:"2/3",background:"#e8e5e0",position:"relative",overflow:"hidden" }}>
                          {p.fotos?.[0]
                            ? <img src={p.fotos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                            : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",fontSize:"1.5rem" }}>📷</div>
                          }
                          {p.fotos?.length > 0 && <div style={{ position:"absolute",top:4,right:4,background:"rgba(0,0,0,0.55)",color:"#fff",fontSize:"0.62rem",padding:"1px 5px",borderRadius:8 }}>{p.fotos.length}</div>}
                        </div>
                        <div style={{ padding:"0.4rem 0.5rem" }}>
                          <div style={{ fontSize:"0.72rem",fontWeight:500,fontFamily:"'Jost',sans-serif",lineHeight:1.3,color:"#111" }}>{p.nome}</div>
                          <div style={{ fontSize:"0.62rem",color:"#b8964e",fontFamily:"'Jost',sans-serif" }}>{p.clientes?.nome||"—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={CARD}>
                <p style={CARD_T}>Gestão de Lojistas</p>
                <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.5rem" }}>
                  {subTabs.map(s => (
                    <button key={s.id} onClick={() => setSubTabLojistas(s.id)} style={{ padding:"0.4rem 0.9rem",fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",border:"none",background:subTabLojistas===s.id?"#080808":"#f0eeeb",color:subTabLojistas===s.id?"#fff":"#555",cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>{s.label}</button>
                  ))}
                </div>

                {subTabLojistas === "avaliacoes" && (() => {
                  if (lojistasAprovados.length === 0) return <p style={{ fontSize:"0.85rem",color:"#aaa",padding:"2rem 0",textAlign:"center" }}>Nenhum lojista aprovado.</p>;
                  return (
                    <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
                      {lojistasAprovados.map(lj => {
                        const avs = avaliacoesBackoffice[lj.id] || [];
                        const notasClientes = avs.filter(av => av.nota_cliente_lojista).map(av => av.nota_cliente_lojista);
                        const notasPlataforma = avs.filter(av => av.nota_plataforma).map(av => av.nota_plataforma);
                        const todasNotas = [...notasClientes, ...notasPlataforma];
                        const media = todasNotas.length ? (todasNotas.reduce((s,n)=>s+n,0)/todasNotas.length).toFixed(1) : null;
                        const mediaNum = media ? parseFloat(media) : 0;
                        const corMedia = mediaNum >= 4 ? "#27ae60" : mediaNum >= 3 ? "#f39c12" : mediaNum > 0 ? "#e74c3c" : "#aaa";
                        return (
                          <div key={lj.id} style={{ background:"#fff",border:"1px solid #f0eeeb",padding:"1rem 1.25rem",borderLeft:`3px solid ${corMedia}` }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.75rem" }}>
                              <div>
                                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                                  <span style={{ fontWeight:500,fontSize:"0.9rem",fontFamily:"'Jost',sans-serif" }}>{lj.nome}</span>
                                  {lj.is_marca_propria && <span style={{ fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",border:"1px solid rgba(196,116,138,0.4)",padding:"0.1rem 0.4rem" }}>Marca Oficial</span>}
                                  {!lj.is_marca_propria && lj.loja_verificada && <span style={{ fontSize:"0.52rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4a882",border:"1px solid rgba(196,168,130,0.4)",padding:"0.1rem 0.4rem" }}>✦ Verificada</span>}
                                </div>
                                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                                  <span style={{ fontSize:"0.72rem",color:"#888",fontFamily:"'Jost',sans-serif" }}>{lj.email} · @{lj.codigo_cliente||"—"}</span>
                                  {!lj.is_marca_propria && (
                                    <button onClick={() => toggleLojaVerificada(lj)} style={{ fontSize:"0.62rem",padding:"0.15rem 0.5rem",border:`1px solid ${lj.loja_verificada?"#c4a882":"#ddd"}`,background:lj.loja_verificada?"rgba(196,168,130,0.12)":"transparent",color:lj.loja_verificada?"#c4a882":"#888",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif" }}>
                                      {lj.loja_verificada ? "✦ Remover verificação" : "Marcar verificada"}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div style={{ display:"flex",alignItems:"center",gap:"0.75rem" }}>
                                {media ? (
                                  <div style={{ textAlign:"right" }}>
                                    <div style={{ display:"flex",alignItems:"baseline",gap:"0.3rem" }}>
                                      <span style={{ fontFamily:"serif",fontSize:"1.8rem",fontWeight:300,color:corMedia,lineHeight:1 }}>{media}</span>
                                      <span style={{ fontSize:"0.68rem",color:"#aaa" }}>/ 5</span>
                                    </div>
                                    <div style={{ display:"flex",gap:"0.1rem" }}>
                                      {[1,2,3,4,5].map(v=><span key={v} style={{fontSize:"0.85rem",color:v<=Math.round(mediaNum)?corMedia:"#e2dfda"}}>★</span>)}
                                    </div>
                                    <div style={{ fontSize:"0.62rem",color:"#aaa",marginTop:"0.1rem" }}>
                                      {notasClientes.length} cliente{notasClientes.length!==1?"s":""} · {notasPlataforma.length} plataforma
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize:"0.75rem",color:"#aaa",fontStyle:"italic" }}>Sem avaliações</span>
                                )}
                              </div>
                            </div>
                            {/* Histórico de notas da plataforma */}
                            {notasPlataforma.length > 0 && (
                              <div style={{ marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid #f0eeeb" }}>
                                <div style={{ fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.4rem" }}>Notas da plataforma</div>
                                <div style={{ display:"flex",flexDirection:"column",gap:"0.25rem" }}>
                                  {avs.filter(av => av.nota_plataforma).map((av, idx) => (
                                    <div key={idx} style={{ display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.75rem",fontFamily:"'Jost',sans-serif" }}>
                                      <span style={{ color:av.nota_plataforma<=2?"#e74c3c":av.nota_plataforma<=3?"#f39c12":"#27ae60",fontWeight:600 }}>{"★".repeat(av.nota_plataforma)}{"☆".repeat(5-av.nota_plataforma)}</span>
                                      <span style={{ color:"#555" }}>{av.motivo_plataforma||"—"}</span>
                                      <span style={{ color:"#bbb",fontSize:"0.68rem" }}>{av.created_at ? new Date(av.created_at).toLocaleDateString("pt-PT") : ""}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Atribuir nova nota da plataforma */}
                            <div style={{ marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid #f0eeeb" }}>
                              <div style={{ fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.5rem" }}>Atribuir nota da plataforma</div>
                              <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap",alignItems:"center" }}>
                                {[1,2,3,4,5].map(n => (
                                  <button key={n} style={BTN(n<=2?"red":n<=3?"outline":"green","sm")}
                                    onClick={async () => {
                                      const motivo = n === 1
                                        ? "Cancelamento por iniciativa do lojista"
                                        : n === 2
                                        ? "Atraso recorrente ou incidente logístico"
                                        : n === 3
                                        ? "Desempenho médio"
                                        : n === 4
                                        ? "Bom desempenho operacional"
                                        : "Desempenho excecional";
                                      const motFinal = prompt(`Motivo para ${n}★ (ou Enter para usar o padrão):`, motivo);
                                      if (motFinal === null) return;
                                      await atribuirNotaPlataforma(lj.id, n, motFinal || motivo);
                                    }}>
                                    {"★".repeat(n)} {n}★
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {subTabLojistas !== "avaliacoes" && (lista.length === 0 ? (
                  <p style={{ fontSize:"0.85rem",color:"#aaa",padding:"2rem 0",textAlign:"center" }}>Nenhum registo.</p>
                ) : (
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr>
                        {["Lojista","Peça","Tamanho","Estado","Depósito","Aluguer","Ações"].map(h => <th key={h} style={TH}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map(a => {
                        const estadoCor = { pendente:"orange", confirmado:"orange", enviado:"green", ativo:"green", em_devolucao:"rosa", devolvido:"green", devolvido_danificado:"red" };
                        const depCor = { pendente:"orange", recebido:"orange", a_devolver:"rosa", em_disputa:"red", devolvido:"green", retido_lojista:"red" };
                        return (
                          <tr key={a.id} style={{ background:"#fff",borderBottom:"1px solid #f0eeeb" }}>
                            <td style={TD}>
                              <div style={{ fontWeight:500,fontSize:"0.85rem" }}>{a.clientes?.nome || "—"}</div>
                              <div style={{ fontSize:"0.72rem",color:"#888" }}>{a.clientes?.email}</div>
                            </td>
                            <td style={TD}>{a.pecas_lojista?.nome || "—"}</td>
                            <td style={TD}>{a.stock_lojista?.tamanho || "—"}</td>
                            <td style={TD}><span style={BADGE(estadoCor[a.estado]||"gray")}>{a.estado}</span></td>
                            <td style={TD}><span style={BADGE(depCor[a.deposito_estado]||"gray")}>{a.deposito_estado || "—"}</span></td>
                            <td style={TD}>{a.valor_aluguer ? `${a.valor_aluguer}€` : "—"}</td>
                            <td style={TD}>
                              <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                                {a.deposito_estado === "a_devolver" && (
                                  <button style={BTN("green","sm")} onClick={() => confirmarDepositoDevolucao(a.id)}>✓ Devolver depósito</button>
                                )}
                                {a.estado === "devolvido" && !a.liquidado_em && (
                                  <button style={BTN("rosa","sm")} onClick={() => pagarLojista(a)}>
                                    Pagar {a.valor_aluguer ? `${(a.valor_aluguer*0.9).toFixed(2)}€` : "lojista"}
                                  </button>
                                )}
                                {a.deposito_estado === "em_disputa" && (
                                  <>
                                    <button style={BTN("red","sm")} onClick={() => resolverDisputa(a.id, "lojista")}>Reter depósito</button>
                                    <button style={BTN("green","sm")} onClick={() => resolverDisputa(a.id, "cliente")}>Devolver ao cliente</button>
                                  </>
                                )}
                                {a.liquidado_em && (
                                  <span style={{ fontSize:"0.68rem",color:"#27ae60" }}>✓ Pago {a.valor_liquidacao}€</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ))}
              </div>
            </>
          );
        })()}

        {tab === "suporte" && (() => {
          const [boTickets, setBoTickets] = React.useState(null);
          const [boTicketAtivo, setBoTicketAtivo] = React.useState(null);
          const [boMsgs, setBoMsgs] = React.useState([]);
          const [boResposta, setBoResposta] = React.useState("");
          const [boEnviando, setBoEnviando] = React.useState(false);
          const [boFiltro, setBoFiltro] = React.useState("todos");

          React.useEffect(() => {
            supabase.from("tickets_lojista").select("*, clientes:lojista_id(nome, codigo_loja)").order("prioridade", { ascending: true }).order("created_at", { ascending: false }).then(({ data }) => {
              if (data) setBoTickets(data);
            });
          }, []);

          const abrirTicketBo = async (tk) => {
            setBoTicketAtivo(tk);
            const { data } = await supabase.from("tickets_mensagens").select("*").eq("ticket_id", tk.id).order("created_at", { ascending: true });
            if (data) setBoMsgs(data);
          };

          const responderTicket = async () => {
            if (!boResposta.trim() || !boTicketAtivo) return;
            setBoEnviando(true);
            const adminId = "2f6afc17-8e46-41a7-9b9f-4f407c76919f";
            await supabase.from("tickets_mensagens").insert({ ticket_id: boTicketAtivo.id, remetente_id: adminId, texto: boResposta, is_admin: true });
            if (boTicketAtivo.estado === "aberto") {
              await supabase.from("tickets_lojista").update({ estado: "em_curso", updated_at: new Date().toISOString() }).eq("id", boTicketAtivo.id);
              setBoTicketAtivo(p => ({ ...p, estado: "em_curso" }));
              setBoTickets(prev => prev.map(t => t.id === boTicketAtivo.id ? { ...t, estado: "em_curso" } : t));
            }
            setBoResposta("");
            const { data } = await supabase.from("tickets_mensagens").select("*").eq("ticket_id", boTicketAtivo.id).order("created_at", { ascending: true });
            if (data) setBoMsgs(data);
            setBoEnviando(false);
          };

          const fecharTicket = async () => {
            await supabase.from("tickets_lojista").update({ estado: "fechado", updated_at: new Date().toISOString() }).eq("id", boTicketAtivo.id);
            setBoTicketAtivo(p => ({ ...p, estado: "fechado" }));
            setBoTickets(prev => prev.map(t => t.id === boTicketAtivo.id ? { ...t, estado: "fechado" } : t));
          };

          const reabrirTicket = async () => {
            await supabase.from("tickets_lojista").update({ estado: "aberto", updated_at: new Date().toISOString() }).eq("id", boTicketAtivo.id);
            setBoTicketAtivo(p => ({ ...p, estado: "aberto" }));
            setBoTickets(prev => prev.map(t => t.id === boTicketAtivo.id ? { ...t, estado: "aberto" } : t));
          };

          const PRIO_COR = { urgente: "#e74c3c", normal: "#f39c12", baixa: "#3498db" };
          const EST_COR = { aberto: "#e74c3c", em_curso: "#f39c12", fechado: "#27ae60" };
          const EST_LABEL = { aberto: "Aberto", em_curso: "Em curso", fechado: "Fechado" };
          const PRIO_LABEL = { urgente: "Urgente", normal: "Normal", baixa: "Baixa" };
          const CAT_LABEL = { bug: "Bug técnico", pagamento: "Pagamento", conta: "Conta", stock: "Stock", envios: "Envios", outro: "Outro" };

          const ticketsFiltrados = (boTickets || []).filter(t => boFiltro === "todos" || t.estado === boFiltro);

          if (boTicketAtivo) return (
            <div>
              <button onClick={() => { setBoTicketAtivo(null); setBoMsgs([]); }} style={{ background:"none",border:"none",cursor:"pointer",fontSize:"0.78rem",color:"#888",fontFamily:"var(--sans)",letterSpacing:"0.05em",padding:"0 0 1rem",display:"flex",alignItems:"center",gap:"0.4rem" }}>← Todos os tickets</button>
              <div style={CARD}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap" }}>
                  <div>
                    <p style={{ fontFamily:"var(--sans)",fontSize:"1.1rem",fontWeight:600,margin:"0 0 0.25rem" }}>{boTicketAtivo.assunto}</p>
                    <p style={{ fontSize:"0.78rem",color:"#888",margin:"0 0 0.1rem" }}>{boTicketAtivo.referencia} · {boTicketAtivo.clientes?.nome || "Lojista"} · {CAT_LABEL[boTicketAtivo.categoria]}</p>
                    <p style={{ fontSize:"0.72rem",color:"#aaa",margin:0 }}>{new Date(boTicketAtivo.created_at).toLocaleString("pt-PT")}</p>
                  </div>
                  <div style={{ display:"flex",gap:"0.4rem",alignItems:"center",flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:PRIO_COR[boTicketAtivo.prioridade]+"22",color:PRIO_COR[boTicketAtivo.prioridade],padding:"0.2rem 0.5rem",borderRadius:3 }}>{PRIO_LABEL[boTicketAtivo.prioridade]}</span>
                    <span style={{ fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:EST_COR[boTicketAtivo.estado]+"22",color:EST_COR[boTicketAtivo.estado],padding:"0.2rem 0.5rem",borderRadius:3 }}>{EST_LABEL[boTicketAtivo.estado]}</span>
                    {boTicketAtivo.estado !== "fechado"
                      ? <button onClick={fecharTicket} style={BTN("outline","sm")}>✓ Fechar ticket</button>
                      : <button onClick={reabrirTicket} style={BTN("outline","sm")}>↺ Reabrir</button>
                    }
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",margin:"1rem 0" }}>
                {boMsgs.map(m => (
                  <div key={m.id} style={{ display:"flex",flexDirection:"column",alignItems:m.is_admin?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"75%",background:m.is_admin?"#1a1816":"#f0ece6",color:m.is_admin?"#f8f7f5":"#1a1816",padding:"0.75rem 1rem",borderRadius:m.is_admin?"8px 0 8px 8px":"0 8px 8px 8px",fontSize:"0.85rem",lineHeight:1.5 }}>
                      {m.texto}
                    </div>
                    <span style={{ fontSize:"0.65rem",color:"#aaa",marginTop:"0.2rem" }}>{m.is_admin?"Nora Grei (admin)":"Lojista"} · {new Date(m.created_at).toLocaleString("pt-PT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                ))}
              </div>
              {boTicketAtivo.estado !== "fechado" && (
                <div style={{ display:"flex",gap:"0.5rem" }}>
                  <textarea value={boResposta} onChange={e=>setBoResposta(e.target.value)} placeholder="Resposta ao lojista..." rows={3} style={{ flex:1,padding:"0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",resize:"vertical" }}/>
                  <button onClick={responderTicket} disabled={boEnviando||!boResposta.trim()} style={{ ...BTN("black"),alignSelf:"flex-end",opacity:boEnviando||!boResposta.trim()?0.5:1 }}>Responder</button>
                </div>
              )}
            </div>
          );

          return (
            <div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,margin:0 }}>Suporte Lojistas</h1>
                <div style={{ display:"flex",gap:"0.4rem" }}>
                  {[["todos","Todos"],["aberto","Abertos"],["em_curso","Em curso"],["fechado","Fechados"]].map(([v,l]) => (
                    <button key={v} onClick={()=>setBoFiltro(v)} style={{ padding:"0.35rem 0.75rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",background:boFiltro===v?"#1a1816":"none",color:boFiltro===v?"#fff":"#888",border:"1px solid #ddd",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)" }}>{l}</button>
                  ))}
                </div>
              </div>
              {boTickets === null ? (
                <p style={{ color:"#888",fontSize:"0.85rem" }}>A carregar…</p>
              ) : ticketsFiltrados.length === 0 ? (
                <p style={{ color:"#888",fontSize:"0.85rem" }}>Sem tickets {boFiltro !== "todos" ? EST_LABEL[boFiltro]?.toLowerCase() + "s" : ""}.</p>
              ) : (
                <div style={CARD}>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr>{["Ref.","Lojista","Assunto","Categoria","Prioridade","Estado","Data"].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {ticketsFiltrados.map(tk => (
                        <tr key={tk.id} onClick={()=>abrirTicketBo(tk)} style={{ cursor:"pointer",borderBottom:"1px solid #f0eeeb",transition:"background 0.1s" }} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                          <td style={TD}><span style={{ fontSize:"0.72rem",fontFamily:"var(--sans)",color:"#888" }}>{tk.referencia}</span></td>
                          <td style={TD}><span style={{ fontWeight:500 }}>{tk.clientes?.nome || "—"}</span></td>
                          <td style={{ ...TD,maxWidth:200 }}><span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block" }}>{tk.assunto}</span></td>
                          <td style={TD}><span style={{ fontSize:"0.72rem",color:"#888" }}>{CAT_LABEL[tk.categoria]}</span></td>
                          <td style={TD}><span style={{ fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:PRIO_COR[tk.prioridade]+"22",color:PRIO_COR[tk.prioridade],padding:"0.15rem 0.4rem",borderRadius:3 }}>{PRIO_LABEL[tk.prioridade]}</span></td>
                          <td style={TD}><span style={{ fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:EST_COR[tk.estado]+"22",color:EST_COR[tk.estado],padding:"0.15rem 0.4rem",borderRadius:3 }}>{EST_LABEL[tk.estado]}</span></td>
                          <td style={TD}><span style={{ fontSize:"0.72rem",color:"#aaa" }}>{new Date(tk.created_at).toLocaleDateString("pt-PT",{day:"2-digit",month:"short"})}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {tab === "relatorio" && (() => {
          const [periodo, setPeriodo] = React.useState("mes");
          const [relData, setRelData] = React.useState(null);
          const [carregando, setCarregando] = React.useState(false);

          const periodos = [
            { v: "dia", l: "Hoje" },
            { v: "semana", l: "Esta semana" },
            { v: "mes", l: "Este mês" },
            { v: "trimestre", l: "Este trimestre" },
          ];

          const getRange = (p) => {
            const agora = new Date();
            const fim = agora.toISOString();
            if (p === "dia") {
              const inicio = new Date(agora); inicio.setHours(0,0,0,0);
              const antInicio = new Date(inicio); antInicio.setDate(antInicio.getDate()-1);
              const antFim = new Date(inicio); antFim.setMilliseconds(-1);
              return { inicio: inicio.toISOString(), fim, antInicio: antInicio.toISOString(), antFim: antFim.toISOString(), label: "ontem" };
            }
            if (p === "semana") {
              const inicio = new Date(agora); inicio.setDate(agora.getDate() - agora.getDay()); inicio.setHours(0,0,0,0);
              const antInicio = new Date(inicio); antInicio.setDate(antInicio.getDate()-7);
              const antFim = new Date(inicio); antFim.setMilliseconds(-1);
              return { inicio: inicio.toISOString(), fim, antInicio: antInicio.toISOString(), antFim: antFim.toISOString(), label: "semana passada" };
            }
            if (p === "mes") {
              const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
              const antInicio = new Date(agora.getFullYear(), agora.getMonth()-1, 1);
              const antFim = new Date(inicio); antFim.setMilliseconds(-1);
              return { inicio: inicio.toISOString(), fim, antInicio: antInicio.toISOString(), antFim: antFim.toISOString(), label: "mês passado" };
            }
            // trimestre
            const q = Math.floor(agora.getMonth()/3);
            const inicio = new Date(agora.getFullYear(), q*3, 1);
            const antInicio = new Date(agora.getFullYear(), q*3-3, 1);
            const antFim = new Date(inicio); antFim.setMilliseconds(-1);
            return { inicio: inicio.toISOString(), fim, antInicio: antInicio.toISOString(), antFim: antFim.toISOString(), label: "trimestre passado" };
          };

          const carregar = async (p) => {
            setCarregando(true);
            const { inicio, fim, antInicio, antFim } = getRange(p);

            const [
              alRes, alAntRes,
              clientesRes, clientesAntRes, clientesTodosRes,
              recibosRes, recibosAntRes,
              reservasRes,
              pecasRes,
              lojistasRes,
              alLojRes,
              feedRes,
              ticketsRes,
            ] = await Promise.all([
              supabase.from("alugueres").select("id, estado, valor_aluguer, created_at, cliente_id, stock_tamanho_id").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("alugueres").select("id, estado, valor_aluguer, created_at, cliente_id").gte("created_at", antInicio).lte("created_at", antFim),
              supabase.from("clientes").select("id, created_at, ultimo_acesso, total_pecas_alugadas, cidade, modo_lojista").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("clientes").select("id, created_at").gte("created_at", antInicio).lte("created_at", antFim),
              supabase.from("clientes").select("id, created_at, ultimo_acesso, total_pecas_alugadas, modo_lojista, cidade"),
              supabase.from("recibos").select("valor_aluguer, valor_higienizacao, valor_deposito, created_at").eq("estado", "pago").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("recibos").select("valor_aluguer, valor_higienizacao, created_at").eq("estado", "pago").gte("created_at", antInicio).lte("created_at", antFim),
              supabase.from("reservas_espera").select("id, estado, created_at").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("stock_tamanhos").select("id, pecas(nome, categoria_id, categorias(nome)), quantidade_total, quantidade_disponivel"),
              supabase.from("clientes").select("id, nome, codigo_loja, created_at").eq("modo_lojista", true),
              supabase.from("alugueres_lojista").select("id, estado, preco_venda, lojista_id, created_at").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("feed_posts").select("id, created_at, likes_count").gte("created_at", inicio).lte("created_at", fim),
              supabase.from("tickets_lojista").select("id, estado, prioridade, created_at").gte("created_at", inicio).lte("created_at", fim),
            ]);

            const al = alRes.data || [];
            const alAnt = alAntRes.data || [];
            const clientes = clientesRes.data || [];
            const clientesAnt = clientesAntRes.data || [];
            const clientesTodos = clientesTodosRes.data || [];
            const recibos = recibosRes.data || [];
            const recibosAnt = recibosAntRes.data || [];
            const pecas = pecasRes.data || [];
            const alLoj = alLojRes.data || [];
            const feed = feedRes.data || [];
            const tickets = ticketsRes.data || [];

            // Receita
            const receita = recibos.reduce((s,r) => s + (r.valor_aluguer||0) + (r.valor_higienizacao||0), 0);
            const receitaAnt = recibosAnt.reduce((s,r) => s + (r.valor_aluguer||0) + (r.valor_higienizacao||0), 0);
            const receitaVar = receitaAnt > 0 ? Math.round((receita - receitaAnt) / receitaAnt * 100) : null;

            // Alugueres
            const numAl = al.length;
            const numAlAnt = alAnt.length;
            const alVar = numAlAnt > 0 ? Math.round((numAl - numAlAnt) / numAlAnt * 100) : null;
            const alCancelados = al.filter(a => a.estado === "cancelado").length;
            const taxaCancel = numAl > 0 ? Math.round(alCancelados / numAl * 100) : 0;

            // Clientes novos / activos / perdidos
            const novos = clientes.filter(c => !c.modo_lojista).length;
            const novosAnt = clientesAnt.length;
            const novosVar = novosAnt > 0 ? Math.round((novos - novosAnt) / novosAnt * 100) : null;
            const limiteInativo = new Date(); limiteInativo.setDate(limiteInativo.getDate() - 30);
            const ativos = clientesTodos.filter(c => !c.modo_lojista && c.ultimo_acesso && new Date(c.ultimo_acesso) > limiteInativo).length;
            const inativos30 = clientesTodos.filter(c => !c.modo_lojista && (!c.ultimo_acesso || new Date(c.ultimo_acesso) <= limiteInativo)).length;
            const totalClientes = clientesTodos.filter(c => !c.modo_lojista).length;
            const churn = totalClientes > 0 ? Math.round(inativos30 / totalClientes * 100) : 0;

            // Ticket médio
            const ticketMedio = numAl > 0 ? (receita / numAl).toFixed(0) : 0;
            const ticketMedioAnt = numAlAnt > 0 ? (receitaAnt / numAlAnt).toFixed(0) : 0;

            // Stock
            const totalStock = pecas.reduce((s,p) => s + (p.quantidade_total||0), 0);
            const dispStock = pecas.reduce((s,p) => s + (p.quantidade_disponivel||0), 0);
            const ocupacao = totalStock > 0 ? Math.round((totalStock - dispStock) / totalStock * 100) : 0;

            // Categorias em procura (por nº de alugueres neste período)
            const catMap = {};
            for (const a of al) {
              const peca = pecas.find(p => p.id === a.stock_tamanho_id);
              const cat = peca?.pecas?.categorias?.nome || peca?.categorias?.nome || "Outra";
              catMap[cat] = (catMap[cat]||0) + 1;
            }
            const topCats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

            // Lojistas activos (com vendas no período)
            const lojistasAtivos = new Set(alLoj.map(a => a.lojista_id)).size;
            const receitaLojistas = alLoj.filter(a=>a.estado!=="cancelado").reduce((s,a)=>s+(a.preco_venda||0),0);

            // Reservas (lista espera)
            const reservas = reservasRes.data || [];
            const reservasAguarda = reservas.filter(r => r.estado === "aguarda").length;

            // Cidades com mais actividade
            const cidadesMap = {};
            clientes.filter(c=>c.cidade).forEach(c => { cidadesMap[c.cidade] = (cidadesMap[c.cidade]||0)+1; });
            const topCidades = Object.entries(cidadesMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

            // Break-even estimado (simplificado: custos fixos assumidos ~2000€/mês, ajustável)
            const custoFixoMes = 2000;
            const diasPeriodo = p === "dia" ? 1 : p === "semana" ? 7 : p === "mes" ? 30 : 90;
            const custoEstimado = custoFixoMes * diasPeriodo / 30;
            const margemOp = receita - custoEstimado;
            const bePct = custoEstimado > 0 ? Math.round(receita / custoEstimado * 100) : 0;

            // Tickets suporte urgentes abertos
            const ticketsUrgentes = tickets.filter(t => t.prioridade === "urgente" && t.estado !== "fechado").length;

            // Feed engagement
            const totalLikes = feed.reduce((s,p)=>s+(p.likes_count||0),0);

            // Sinais de alerta
            const alertas = [];
            if (churn > 40) alertas.push({ tipo: "danger", msg: `Churn elevado: ${churn}% dos clientes inativos há +30 dias` });
            if (taxaCancel > 15) alertas.push({ tipo: "danger", msg: `Taxa de cancelamento alta: ${taxaCancel}% neste período` });
            if (ocupacao < 30) alertas.push({ tipo: "warn", msg: `Stock pouco utilizado: apenas ${ocupacao}% em aluguer` });
            if (receitaVar !== null && receitaVar < -10) alertas.push({ tipo: "warn", msg: `Receita caiu ${Math.abs(receitaVar)}% vs. ${antFim.slice(0,7)}` });
            if (novos < 3) alertas.push({ tipo: "warn", msg: `Poucos clientes novos: apenas ${novos} registos neste período` });
            if (ticketsUrgentes > 0) alertas.push({ tipo: "danger", msg: `${ticketsUrgentes} ticket(s) urgentes por resolver` });
            if (reservasAguarda > 5) alertas.push({ tipo: "info", msg: `${reservasAguarda} clientes em lista de espera — oportunidade de stock` });
            if (margemOp > 0 && bePct > 150) alertas.push({ tipo: "ok", msg: `Operação sólida: ${bePct}% do break-even coberto` });

            // Decisões sugeridas
            const decisoes = [];
            if (churn > 30) decisoes.push("Activar campanha de reactivação: email/WhatsApp para clientes sem aluguer há +30 dias.");
            if (topCats.length > 0) decisoes.push(`Reforçar stock em "${topCats[0][0]}" — categoria mais procurada este período.`);
            if (ocupacao < 40) decisoes.push("Promover peças disponíveis com desconto temporário no feed e campanhas.");
            if (reservasAguarda > 3) decisoes.push("Há reservas em espera — acelerar publicação de novas peças nessas categorias.");
            if (lojistasAtivos < (lojistasRes.data||[]).length * 0.5) decisoes.push("Mais de metade dos lojistas sem vendas neste período — contactar e apoiar.");
            if (ticketsUrgentes > 0) decisoes.push("Resolver tickets urgentes de suporte antes de qualquer outra prioridade.");

            setRelData({ receita, receitaVar, numAl, alVar, novos, novosVar, ativos, inativos30, churn, ticketMedio, ocupacao, totalStock, dispStock, topCats, topCidades, lojistasAtivos, totalLojistas:(lojistasRes.data||[]).length, receitaLojistas, reservasAguarda, taxaCancel, margemOp, bePct, custoEstimado, ticketsUrgentes, totalLikes, alertas, decisoes, periodo: p, inicio, fim });
            setCarregando(false);
          };

          React.useEffect(() => { carregar(periodo); }, [periodo]);

          const VAR = (v) => v === null ? null : (
            <span style={{ fontSize:"0.72rem",fontWeight:600,color:v>=0?"#27ae60":"#e74c3c",marginLeft:"0.4rem" }}>
              {v>=0?"+":""}{v}%
            </span>
          );

          const KPI = ({ val, lbl, var: v, cor="#1a1816", sub }) => (
            <div style={{ background:"#fff",padding:"1.25rem 1.5rem",borderTop:`3px solid ${cor}` }}>
              <div style={{ fontFamily:"var(--sans)",fontSize:"1.8rem",fontWeight:300,color:cor }}>{val}{VAR(v)}</div>
              <div style={{ fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginTop:"0.35rem" }}>{lbl}</div>
              {sub && <div style={{ fontSize:"0.72rem",color:"#aaa",marginTop:"0.15rem" }}>{sub}</div>}
            </div>
          );

          const BARRA = ({ pct, cor="#c4748a" }) => (
            <div style={{ height:5,background:"#f0eeeb",borderRadius:3,marginTop:"0.3rem" }}>
              <div style={{ height:"100%",width:`${Math.min(pct,100)}%`,background:cor,borderRadius:3,transition:"width 0.5s" }}/>
            </div>
          );

          if (carregando || !relData) return (
            <div style={{ textAlign:"center",padding:"4rem",color:"#888" }}>
              <div style={{ fontSize:"2rem",marginBottom:"1rem" }}>📋</div>
              <div style={{ fontFamily:"var(--sans)",fontSize:"0.85rem",letterSpacing:"0.1em" }}>A compilar relatório…</div>
            </div>
          );

          const d = relData;

          return (
            <div>
              {/* CABEÇALHO */}
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem" }}>
                <div>
                  <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,margin:"0 0 0.25rem" }}>Relatório Executivo</h1>
                  <p style={{ fontSize:"0.78rem",color:"#888",margin:0 }}>
                    {new Date(d.inicio).toLocaleDateString("pt-PT",{day:"numeric",month:"long"})} – {new Date().toLocaleDateString("pt-PT",{day:"numeric",month:"long",year:"numeric"})}
                  </p>
                </div>
                <div style={{ display:"flex",gap:"0.35rem",flexWrap:"wrap" }}>
                  {periodos.map(p => (
                    <button key={p.v} onClick={()=>setPeriodo(p.v)} style={{ padding:"0.4rem 0.9rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",background:periodo===p.v?"#1a1816":"#fff",color:periodo===p.v?"#fff":"#888",border:"1px solid #ddd",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)" }}>{p.l}</button>
                  ))}
                </div>
              </div>

              {/* ALERTAS */}
              {d.alertas.length > 0 && (
                <div style={{ display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"1.5rem" }}>
                  {d.alertas.map((a,i) => {
                    const cores = { danger:["#fff5f5","#e74c3c"], warn:["#fffbf0","#f39c12"], ok:["#f0fff4","#27ae60"], info:["#f0f4ff","#3498db"] };
                    const [bg,cor] = cores[a.tipo]||cores.info;
                    return <div key={i} style={{ background:bg,borderLeft:`3px solid ${cor}`,padding:"0.6rem 1rem",fontSize:"0.82rem",color:cor,fontWeight:500 }}>{a.msg}</div>;
                  })}
                </div>
              )}

              {/* KPIs PRINCIPAIS */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"#e2dfda",marginBottom:"1.5rem" }}>
                <KPI val={`${d.receita.toFixed(0)}€`} lbl="Receita" var={d.receitaVar} cor="#c4748a"/>
                <KPI val={d.numAl} lbl="Alugueres" var={d.alVar}/>
                <KPI val={`${d.ticketMedio}€`} lbl="Ticket médio"/>
                <KPI val={`${d.ocupacao}%`} lbl="Ocupação stock" cor={d.ocupacao<40?"#e74c3c":d.ocupacao>70?"#27ae60":"#f39c12"}/>
              </div>

              {/* UTILIZADORES */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem" }}>
                <div style={CARD}>
                  <p style={CARD_T}>Utilizadores</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem" }}>
                    <div style={{ textAlign:"center",padding:"0.75rem",background:"#f0fff4",borderRadius:4 }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.8rem",fontWeight:300,color:"#27ae60" }}>{d.novos}{VAR(d.novosVar)}</div>
                      <div style={{ fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888" }}>Novos registos</div>
                    </div>
                    <div style={{ textAlign:"center",padding:"0.75rem",background:"#f0f4ff",borderRadius:4 }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.8rem",fontWeight:300,color:"#3498db" }}>{d.ativos}</div>
                      <div style={{ fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888" }}>Activos (30d)</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.75rem",background:d.churn>40?"#fff5f5":"#fafafa",borderRadius:4,border:`1px solid ${d.churn>40?"#e74c3c":"#f0eeeb"}` }}>
                    <span style={{ fontSize:"0.82rem" }}>Churn (inativos +30d)</span>
                    <span style={{ fontFamily:"var(--sans)",fontSize:"1.4rem",fontWeight:300,color:d.churn>40?"#e74c3c":d.churn>25?"#f39c12":"#27ae60" }}>{d.churn}%</span>
                  </div>
                  <BARRA pct={100-d.churn} cor={d.churn>40?"#e74c3c":d.churn>25?"#f39c12":"#27ae60"}/>
                  <p style={{ fontSize:"0.72rem",color:"#aaa",marginTop:"0.5rem" }}>{d.inativos30} clientes sem actividade há mais de 30 dias.</p>
                </div>

                <div style={CARD}>
                  <p style={CARD_T}>Lojistas</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem" }}>
                    <div style={{ textAlign:"center",padding:"0.75rem",background:"#f8f7f5",borderRadius:4 }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.8rem",fontWeight:300 }}>{d.lojistasAtivos}</div>
                      <div style={{ fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888" }}>Com vendas</div>
                    </div>
                    <div style={{ textAlign:"center",padding:"0.75rem",background:"#f8f7f5",borderRadius:4 }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.8rem",fontWeight:300 }}>{d.totalLojistas}</div>
                      <div style={{ fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888" }}>Total lojistas</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem" }}>
                    <span style={{ fontSize:"0.82rem" }}>Receita gerada lojistas</span>
                    <span style={{ fontFamily:"var(--sans)",fontSize:"1.2rem",fontWeight:300,color:"#c4748a" }}>{d.receitaLojistas.toFixed(0)}€</span>
                  </div>
                  <BARRA pct={d.totalLojistas>0?Math.round(d.lojistasAtivos/d.totalLojistas*100):0} cor="#c4748a"/>
                  <p style={{ fontSize:"0.72rem",color:"#aaa",marginTop:"0.5rem" }}>{d.totalLojistas>0?Math.round(d.lojistasAtivos/d.totalLojistas*100):0}% dos lojistas activos neste período.</p>
                </div>
              </div>

              {/* PRODUTOS + GEOGRAFIA */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem" }}>
                <div style={CARD}>
                  <p style={CARD_T}>Categorias mais procuradas</p>
                  {d.topCats.length === 0 ? <p style={{ fontSize:"0.82rem",color:"#aaa" }}>Sem dados neste período.</p> : d.topCats.map(([cat,n],i) => {
                    const max = d.topCats[0][1];
                    return (
                      <div key={cat} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.2rem" }}>
                          <span style={{ display:"flex",alignItems:"center",gap:"0.4rem" }}><span style={{ fontSize:"0.7rem",color:"#aaa",width:"1rem" }}>#{i+1}</span>{cat}</span>
                          <strong>{n} aluguer{n!==1?"es":""}</strong>
                        </div>
                        <BARRA pct={Math.round(n/max*100)} cor={["#c4748a","#1a1816","#3498db","#27ae60","#f39c12"][i]}/>
                      </div>
                    );
                  })}
                </div>
                <div style={CARD}>
                  <p style={CARD_T}>Novos clientes por cidade</p>
                  {d.topCidades.length === 0 ? <p style={{ fontSize:"0.82rem",color:"#aaa" }}>Sem dados de localização.</p> : d.topCidades.map(([cidade,n],i) => {
                    const max = d.topCidades[0][1];
                    return (
                      <div key={cidade} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.2rem" }}>
                          <span>{cidade}</span><strong>{n}</strong>
                        </div>
                        <BARRA pct={Math.round(n/max*100)} cor="#1a1816"/>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OPERACIONAL + BREAK-EVEN */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem" }}>
                <div style={CARD}>
                  <p style={CARD_T}>Operacional</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
                    {[
                      { lbl:"Taxa de cancelamento", val:`${d.taxaCancel}%`, cor:d.taxaCancel>15?"#e74c3c":d.taxaCancel>8?"#f39c12":"#27ae60" },
                      { lbl:"Reservas em lista de espera", val:d.reservasAguarda, cor:d.reservasAguarda>5?"#3498db":"#888" },
                      { lbl:"Tickets suporte urgentes", val:d.ticketsUrgentes, cor:d.ticketsUrgentes>0?"#e74c3c":"#27ae60" },
                      { lbl:"Posts no feed", val:d.totalLikes ? `${d.totalLikes} likes` : "—", cor:"#888" },
                    ].map((r,i) => (
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid #f0eeeb" }}>
                        <span style={{ fontSize:"0.82rem",color:"#555" }}>{r.lbl}</span>
                        <span style={{ fontFamily:"var(--sans)",fontSize:"1.1rem",fontWeight:300,color:r.cor }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={CARD}>
                  <p style={CARD_T}>Break-even estimado</p>
                  <div style={{ textAlign:"center",padding:"1rem 0" }}>
                    <div style={{ fontFamily:"var(--sans)",fontSize:"3rem",fontWeight:300,color:d.bePct>=100?"#27ae60":d.bePct>=70?"#f39c12":"#e74c3c" }}>{d.bePct}%</div>
                    <div style={{ fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888",marginBottom:"1rem" }}>do ponto de equilíbrio</div>
                  </div>
                  <BARRA pct={d.bePct} cor={d.bePct>=100?"#27ae60":d.bePct>=70?"#f39c12":"#e74c3c"}/>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginTop:"1rem" }}>
                    <div style={{ padding:"0.75rem",background:"#f8f7f5",borderRadius:4,textAlign:"center" }}>
                      <div style={{ fontSize:"0.68rem",color:"#888",letterSpacing:"0.1em",textTransform:"uppercase" }}>Custo estimado</div>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.2rem",fontWeight:300,marginTop:"0.2rem" }}>{d.custoEstimado.toFixed(0)}€</div>
                    </div>
                    <div style={{ padding:"0.75rem",background:d.margemOp>=0?"#f0fff4":"#fff5f5",borderRadius:4,textAlign:"center" }}>
                      <div style={{ fontSize:"0.68rem",color:"#888",letterSpacing:"0.1em",textTransform:"uppercase" }}>Margem op.</div>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.2rem",fontWeight:300,marginTop:"0.2rem",color:d.margemOp>=0?"#27ae60":"#e74c3c" }}>{d.margemOp>=0?"+":""}{d.margemOp.toFixed(0)}€</div>
                    </div>
                  </div>
                  <p style={{ fontSize:"0.65rem",color:"#bbb",marginTop:"0.75rem",fontStyle:"italic" }}>Custo fixo base: 2000€/mês. Ajustável em Config.</p>
                </div>
              </div>

              {/* DECISÕES SUGERIDAS */}
              {d.decisoes.length > 0 && (
                <div style={{ ...CARD,borderTop:"3px solid #1a1816",marginBottom:"1.5rem" }}>
                  <p style={CARD_T}>Decisões recomendadas para este período</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:"0.6rem" }}>
                    {d.decisoes.map((dec,i) => (
                      <div key={i} style={{ display:"flex",gap:"0.75rem",alignItems:"flex-start",padding:"0.75rem",background:"#f8f7f5",borderRadius:4 }}>
                        <span style={{ fontFamily:"var(--sans)",fontSize:"0.78rem",fontWeight:700,color:"#c4748a",minWidth:"1.5rem" }}>{i+1}.</span>
                        <span style={{ fontSize:"0.85rem",lineHeight:1.5,color:"#1a1816" }}>{dec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RODAPÉ */}
              <p style={{ fontSize:"0.68rem",color:"#bbb",textAlign:"right",letterSpacing:"0.08em" }}>
                Relatório gerado em {new Date().toLocaleString("pt-PT")} · Dados em tempo real via Supabase
              </p>
            </div>
          );
        })()}

        {tab === "loja" && (() => {
          const ADMIN_ID = "2f6afc17-8e46-41a7-9b9f-4f407c76919f";
          const [ngPecas, setNgPecas] = React.useState(null);
          const [ngStats, setNgStats] = React.useState(null);
          const [ngFiltro, setNgFiltro] = React.useState("todas");
          const [ngForm, setNgForm] = React.useState(null); // null | "nova" | {id,...} editar
          const [ngLoading, setNgLoading] = React.useState(false);
          const [ngMsg, setNgMsg] = React.useState("");
          const [ngPeca, setNgPeca] = React.useState({ nome:"", descricao:"", categoria:"", cor:"", condicao:"novo", preco_aluguer_dia:"", preco_venda:"", valor_peca:"", material:"", marca:"Nora Grei", tamanhos:[{tamanho:"M",quantidade:1}], ocasioes:[], higienizacao_ativa:false, higienizacao_valor:"" });
          const CATS_NG = ["Vestido","Fato","Casaco","Calças","Saia","Blusa","Acessório","Outra"];
          const CONDICOES = [{v:"novo",l:"Novo / Etiqueta"},{v:"como_novo",l:"Como novo"},{v:"bom",l:"Bom estado"},{v:"usado",l:"Usado"}];
          React.useEffect(() => {
            if (ngPecas !== null) return;
            Promise.all([
              supabase.from("pecas_lojista").select("*").eq("lojista_id", ADMIN_ID).order("created_at", { ascending: false }),
              supabase.from("alugueres_lojista").select("valor_lojista, created_at").eq("lojista_id", ADMIN_ID).neq("estado","cancelado"),
            ]).then(([{data:pecas},{data:als}]) => {
              setNgPecas(pecas||[]);
              const receita = (als||[]).reduce((s,a) => s+(a.valor_lojista||0), 0);
              const mes = new Date(); mes.setDate(1); mes.setHours(0,0,0,0);
              const receitaMes = (als||[]).filter(a => new Date(a.created_at) >= mes).reduce((s,a) => s+(a.valor_lojista||0), 0);
              setNgStats({ total: pecas?.length||0, ativos: pecas?.filter(p=>p.estado==="disponivel").length||0, alugadas: pecas?.filter(p=>p.estado==="alugada").length||0, receita: receita.toFixed(0), receitaMes: receitaMes.toFixed(0), als: als?.length||0 });
            });
          }, []);
          const salvarPeca = async () => {
            if (!ngPeca.nome.trim() || !ngPeca.categoria) { setNgMsg("Preenche nome e categoria."); return; }
            setNgLoading(true); setNgMsg("");
            const payload = { lojista_id: ADMIN_ID, nome: ngPeca.nome.trim(), descricao: ngPeca.descricao||null, categoria: ngPeca.categoria, cor: ngPeca.cor||null, condicao: ngPeca.condicao, preco_aluguer_dia: ngPeca.preco_aluguer_dia ? parseFloat(ngPeca.preco_aluguer_dia) : null, preco_venda: ngPeca.preco_venda ? parseFloat(ngPeca.preco_venda) : null, valor_peca: ngPeca.valor_peca ? parseFloat(ngPeca.valor_peca) : null, material: ngPeca.material||null, marca: "Nora Grei", estado: "disponivel", tipo: ngPeca.preco_aluguer_dia && !ngPeca.preco_venda ? "alugar" : ngPeca.preco_venda && !ngPeca.preco_aluguer_dia ? "vender" : "ambos", higienizacao_ativa: ngPeca.higienizacao_ativa, higienizacao_valor: ngPeca.higienizacao_valor ? parseFloat(ngPeca.higienizacao_valor) : null };
            if (ngForm === "nova") {
              const { data, error } = await supabase.from("pecas_lojista").insert([payload]).select().single();
              if (!error && ngPeca.tamanhos?.length > 0) await supabase.from("stock_tamanhos").insert(ngPeca.tamanhos.map(t => ({ peca_lojista_id: data.id, tamanho: t.tamanho, quantidade: parseInt(t.quantidade)||1 })));
              if (!error) { setNgPecas(prev => [data, ...(prev||[])]);  setNgMsg("Peça adicionada com sucesso!"); setNgForm(null); }
              else setNgMsg("Erro ao guardar. Tenta novamente.");
            } else {
              const { error } = await supabase.from("pecas_lojista").update(payload).eq("id", ngForm.id);
              if (!error) { setNgPecas(prev => (prev||[]).map(p => p.id===ngForm.id ? {...p,...payload} : p)); setNgMsg("Peça actualizada!"); setNgForm(null); }
              else setNgMsg("Erro ao actualizar.");
            }
            setNgLoading(false);
          };
          const mudarEstado = async (peca, estado) => {
            await supabase.from("pecas_lojista").update({ estado }).eq("id", peca.id);
            setNgPecas(prev => (prev||[]).map(p => p.id===peca.id ? {...p,estado} : p));
          };
          const filtradas = (ngPecas||[]).filter(p => ngFiltro==="todas" || p.estado===ngFiltro);
          const EST_COR = { disponivel:"#27ae60", alugada:"#f39c12", indisponivel:"#e74c3c", vendida:"#8e44ad" };
          const EST_LBL = { disponivel:"Disponível", alugada:"Alugada", indisponivel:"Indisponível", vendida:"Vendida" };
          return (
            <div>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem" }}>
                <div>
                  <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>✦ Loja Nora Grei</h1>
                  <p style={{ fontSize:"0.82rem",color:"#888" }}>Gestão do stock oficial da marca — peças novas para aluguer e venda</p>
                </div>
                <button onClick={() => { setNgForm("nova"); setNgPeca({ nome:"", descricao:"", categoria:"", cor:"", condicao:"novo", preco_aluguer_dia:"", preco_venda:"", valor_peca:"", material:"", marca:"Nora Grei", tamanhos:[{tamanho:"M",quantidade:1}], ocasioes:[], higienizacao_ativa:false, higienizacao_valor:"" }); setNgMsg(""); }} style={{ ...BTN("primary","md"), display:"flex",alignItems:"center",gap:"0.4rem" }}>+ Nova peça</button>
              </div>

              {/* KPIs */}
              {ngStats && (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"0.75rem",marginBottom:"1.75rem" }}>
                  {[
                    { v: ngStats.total, l:"Total de peças", c:"#c4748a" },
                    { v: ngStats.ativos, l:"Disponíveis", c:"#27ae60" },
                    { v: ngStats.alugadas, l:"Em aluguer agora", c:"#f39c12" },
                    { v: `${ngStats.receitaMes}€`, l:"Receita este mês", c:"#9b59b6" },
                    { v: `${ngStats.receita}€`, l:"Receita total", c:"#2980b9" },
                    { v: ngStats.als, l:"Alugueres totais", c:"#16a085" },
                  ].map((k,idx) => (
                    <div key={idx} style={{ background:"#fff",padding:"1rem 1.1rem",borderTop:`3px solid ${k.c}`,borderRadius:"0 0 4px 4px" }}>
                      <div style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:700,color:k.c,lineHeight:1 }}>{k.v}</div>
                      <div style={{ fontSize:"0.7rem",color:"#888",marginTop:"0.25rem",letterSpacing:"0.05em" }}>{k.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {ngMsg && <div style={{ padding:"0.75rem 1rem",marginBottom:"1rem",background: ngMsg.includes("Erro")?"#fef5f5":"#f0f7f0",border:`1px solid ${ngMsg.includes("Erro")?"#f5c6cb":"#b8dbb8"}`,color:ngMsg.includes("Erro")?"#c0392b":"#27ae60",fontSize:"0.85rem",borderRadius:"4px" }}>{ngMsg}</div>}

              {/* Formulário nova / editar peça */}
              {ngForm && (
                <div style={{ background:"#fafaf8",border:"1px solid #e2dfda",padding:"1.5rem",marginBottom:"1.75rem",borderRadius:"4px" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem" }}>
                    <h2 style={{ fontFamily:"var(--sans)",fontSize:"1rem",fontWeight:600,margin:0 }}>{ngForm==="nova" ? "Nova peça Nora Grei" : `Editar: ${ngForm.nome}`}</h2>
                    <button onClick={() => { setNgForm(null); setNgMsg(""); }} style={{ background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",color:"#888" }}>✕</button>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem" }}>
                    {[
                      { label:"Nome da peça *", field:"nome", placeholder:"Ex: Vestido Celestine" },
                      { label:"Categoria *", field:"categoria", type:"select", opts:CATS_NG },
                      { label:"Cor", field:"cor", placeholder:"Ex: Marfim, Preto" },
                      { label:"Material", field:"material", placeholder:"Ex: Seda, Linho" },
                      { label:"Aluguer por dia (€)", field:"preco_aluguer_dia", placeholder:"Ex: 45" },
                      { label:"Preço de venda (€)", field:"preco_venda", placeholder:"Deixar vazio = só aluguer" },
                      { label:"Valor de mercado (€)", field:"valor_peca", placeholder:"Preço original" },
                    ].map(({label,field,placeholder,type,opts}) => (
                      <div key={field}>
                        <label style={{ fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",display:"block",marginBottom:"0.3rem",fontFamily:"var(--sans)" }}>{label}</label>
                        {type==="select" ? (
                          <select value={ngPeca[field]} onChange={e => setNgPeca(p=>({...p,[field]:e.target.value}))} style={{ width:"100%",padding:"0.6rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.85rem",borderRadius:"2px" }}>
                            <option value="">— Selecionar —</option>
                            {opts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={field.includes("preco")||field.includes("valor")?"number":"text"} value={ngPeca[field]} onChange={e => setNgPeca(p=>({...p,[field]:e.target.value}))} placeholder={placeholder} style={{ width:"100%",padding:"0.6rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.85rem",borderRadius:"2px",boxSizing:"border-box" }} />
                        )}
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",display:"block",marginBottom:"0.3rem",fontFamily:"var(--sans)" }}>Estado</label>
                      <select value={ngPeca.condicao} onChange={e => setNgPeca(p=>({...p,condicao:e.target.value}))} style={{ width:"100%",padding:"0.6rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.85rem",borderRadius:"2px" }}>
                        {CONDICOES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:"1rem" }}>
                    <label style={{ fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",display:"block",marginBottom:"0.3rem",fontFamily:"var(--sans)" }}>Descrição</label>
                    <textarea value={ngPeca.descricao} onChange={e => setNgPeca(p=>({...p,descricao:e.target.value}))} placeholder="Descrição da peça, ocasiões, detalhes..." rows={3} style={{ width:"100%",padding:"0.6rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.85rem",resize:"vertical",borderRadius:"2px",boxSizing:"border-box" }} />
                  </div>
                  <div style={{ marginBottom:"1rem" }}>
                    <label style={{ fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",display:"block",marginBottom:"0.5rem",fontFamily:"var(--sans)" }}>Tamanhos disponíveis</label>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.5rem" }}>
                      {(ngPeca.tamanhos||[]).map((t,idx) => (
                        <div key={idx} style={{ display:"flex",alignItems:"center",gap:"0.4rem",background:"#fff",border:"1px solid #e2dfda",padding:"0.35rem 0.6rem",borderRadius:"2px" }}>
                          <select value={t.tamanho} onChange={e => setNgPeca(p=>({...p,tamanhos:p.tamanhos.map((tt,ii)=>ii===idx?{...tt,tamanho:e.target.value}:tt)}))} style={{ border:"none",background:"none",fontFamily:"var(--sans)",fontSize:"0.82rem",padding:"0" }}>
                            {["XS","S","M","L","XL","XXL","34","36","38","40","42","44","46","Único"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                          <span style={{ fontSize:"0.75rem",color:"#aaa" }}>×</span>
                          <input type="number" min="1" value={t.quantidade} onChange={e => setNgPeca(p=>({...p,tamanhos:p.tamanhos.map((tt,ii)=>ii===idx?{...tt,quantidade:e.target.value}:tt)}))} style={{ width:"2.5rem",border:"none",background:"none",fontFamily:"var(--sans)",fontSize:"0.82rem",textAlign:"center" }} />
                          <button onClick={() => setNgPeca(p=>({...p,tamanhos:p.tamanhos.filter((_,ii)=>ii!==idx)}))} style={{ background:"none",border:"none",cursor:"pointer",color:"#c0392b",fontSize:"0.85rem",padding:"0",lineHeight:1 }}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setNgPeca(p=>({...p,tamanhos:[...(p.tamanhos||[]),{tamanho:"M",quantidade:1}]}))} style={{ ...BTN("outline","sm") }}>+ Tamanho</button>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem" }}>
                    <input type="checkbox" id="ng-hig" checked={ngPeca.higienizacao_ativa} onChange={e => setNgPeca(p=>({...p,higienizacao_ativa:e.target.checked}))} />
                    <label htmlFor="ng-hig" style={{ fontSize:"0.85rem",fontFamily:"var(--sans)" }}>Cobrar higienização</label>
                    {ngPeca.higienizacao_ativa && <input type="number" value={ngPeca.higienizacao_valor} onChange={e => setNgPeca(p=>({...p,higienizacao_valor:e.target.value}))} placeholder="€" style={{ width:"5rem",padding:"0.4rem 0.6rem",border:"1px solid #e2dfda",fontFamily:"var(--sans)",fontSize:"0.85rem",borderRadius:"2px" }} />}
                  </div>
                  <div style={{ display:"flex",gap:"0.75rem" }}>
                    <button onClick={salvarPeca} disabled={ngLoading} style={{ ...BTN("primary","md"), opacity:ngLoading?0.6:1 }}>{ngLoading?"A guardar...":(ngForm==="nova"?"Publicar peça":"Guardar alterações")}</button>
                    <button onClick={() => { setNgForm(null); setNgMsg(""); }} style={BTN("outline","md")}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Filtro */}
              <div style={{ display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap" }}>
                {["todas","disponivel","alugada","indisponivel","vendida"].map(f => (
                  <button key={f} onClick={() => setNgFiltro(f)} style={{ padding:"0.4rem 0.85rem",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"var(--sans)",border:`1px solid ${ngFiltro===f?"#c4748a":"#e2dfda"}`,background:ngFiltro===f?"#c4748a":"#fff",color:ngFiltro===f?"#fff":"#5a5855",cursor:"pointer",borderRadius:"2px" }}>
                    {f==="todas"?"Todas":EST_LBL[f]}
                  </button>
                ))}
              </div>

              {/* Lista de peças */}
              {ngPecas === null ? (
                <div style={{ padding:"3rem",textAlign:"center",color:"#aaa" }}>A carregar...</div>
              ) : filtradas.length === 0 ? (
                <div style={{ padding:"3rem",textAlign:"center" }}>
                  <p style={{ color:"#aaa",marginBottom:"0.75rem",fontSize:"0.9rem" }}>{ngFiltro==="todas" ? "Ainda não há peças na loja Nora Grei." : `Nenhuma peça com estado "${EST_LBL[ngFiltro]}".`}</p>
                  {ngFiltro==="todas" && <button onClick={() => setNgForm("nova")} style={BTN("primary","sm")}>Adicionar a primeira peça</button>}
                </div>
              ) : (
                <div style={{ background:"#fff",borderRadius:"4px",overflow:"hidden",border:"1px solid #e2dfda" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#fafaf8",borderBottom:"2px solid #e2dfda" }}>
                        {["Peça","Categoria","Estado","Aluguer/dia","Venda",""].map(h => (
                          <th key={h} style={{ padding:"0.75rem 1rem",textAlign:"left",fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#888",fontFamily:"var(--sans)",fontWeight:600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((p,idx) => (
                        <tr key={p.id} style={{ borderBottom:"1px solid #f0ece6",background:idx%2===0?"#fff":"#fdfcfb" }}>
                          <td style={{ padding:"0.85rem 1rem" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:"0.65rem" }}>
                              {p.fotos?.[0] ? <img src={p.fotos[0]} alt={p.nome} style={{ width:"2.5rem",height:"3rem",objectFit:"cover",flexShrink:0,borderRadius:"2px" }} /> : <div style={{ width:"2.5rem",height:"3rem",background:"#f0ece6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRadius:"2px",fontSize:"1rem" }}>✦</div>}
                              <div>
                                <div style={{ fontFamily:"var(--sans)",fontWeight:600,fontSize:"0.85rem" }}>{p.nome}</div>
                                {p.condicao && <div style={{ fontSize:"0.72rem",color:"#aaa",marginTop:"0.1rem" }}>{CONDICOES.find(c=>c.v===p.condicao)?.l||p.condicao}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"0.85rem 1rem",fontSize:"0.82rem",color:"#5a5855" }}>{p.categoria||"—"}</td>
                          <td style={{ padding:"0.85rem 1rem" }}>
                            <select value={p.estado} onChange={e => mudarEstado(p, e.target.value)} style={{ padding:"0.3rem 0.5rem",border:`1px solid ${EST_COR[p.estado]||"#e2dfda"}`,background:"#fff",color:EST_COR[p.estado]||"#5a5855",fontSize:"0.75rem",fontFamily:"var(--sans)",borderRadius:"2px",cursor:"pointer",fontWeight:600 }}>
                              {Object.entries(EST_LBL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          </td>
                          <td style={{ padding:"0.85rem 1rem",fontSize:"0.85rem",fontWeight:600,color:"#c4748a" }}>{p.preco_aluguer_dia ? `${p.preco_aluguer_dia}€` : "—"}</td>
                          <td style={{ padding:"0.85rem 1rem",fontSize:"0.85rem",color:"#5a5855" }}>{p.preco_venda ? `${p.preco_venda}€` : "—"}</td>
                          <td style={{ padding:"0.85rem 1rem" }}>
                            <div style={{ display:"flex",gap:"0.4rem" }}>
                              <button onClick={() => { setNgForm(p); setNgPeca({...p, tamanhos:p.tamanhos||[{tamanho:"M",quantidade:1}]}); setNgMsg(""); }} style={BTN("outline","sm")}>Editar</button>
                              <a href={`/catalogo/${p.id}`} target="_blank" style={{ ...BTN("ghost","sm"), textDecoration:"none" }}>Ver →</a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {tab === "config" && (
          <>
            <h1 style={{ fontFamily:"var(--sans)",fontSize:"1.6rem",fontWeight:600,marginBottom:"0.25rem" }}>Configurações</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Preços e contactos</p>
            <div style={CARD}>
              <p style={CARD_T}>Preços e taxas</p>
              <div style={{ maxWidth:300 }}><label style={LBL}>Taxa higienização (€)</label><input style={INP} type="number" value={config.higienizacao} onChange={e=>setConfig(c=>({...c,higienizacao:e.target.value}))} /></div>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Contactos</p>
              <div style={{ ...COL2,maxWidth:600,marginBottom:"1rem" }}>
                <div><label style={LBL}>WhatsApp</label><input style={INP} value={config.whatsapp} onChange={e=>setConfig(c=>({...c,whatsapp:e.target.value}))} placeholder="+351 912 345 678" /></div>
                <div><label style={LBL}>Email suporte</label><input style={INP} type="email" value={config.email_suporte} onChange={e=>setConfig(c=>({...c,email_suporte:e.target.value}))} placeholder="suporte@noragrei.com" /></div>
              </div>
              <button style={BTN("black")} onClick={()=>alert("Guardado!")}>Guardar</button>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Sistema de níveis de confiança</p>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Nível","Alugueres","Desconto caução","Caução paga"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {[["🥉 Bronze","0–4","0%","100%"],["🥈 Prata","5–9","25%","75%"],["🥇 Ouro","10–19","50%","50%"],["💎 Platina","20+ sem danos","100%","0%"]].map(([n,a,d,c])=>(
                    <tr key={n} style={{ background:"#fff",borderBottom:"1px solid #f0eeeb" }}>
                      <td style={TD}><strong>{n}</strong></td><td style={TD}>{a}</td><td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{d}</td><td style={TD}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {campanhaEditando && editCampanha && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",overflowY:"auto" }}>
          <div style={{ background:"#fff",padding:"2rem",maxWidth:"640px",width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative" }}>
            <button onClick={()=>{ setCampanhaEditando(null); setEditCampanha(null); }} style={{ position:"absolute",top:"1rem",right:"1rem",background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"#888" }}>✕</button>
            <h2 style={{ fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:300,marginBottom:"1.5rem" }}>Editar campanha</h2>
            <div style={COL2}>
              <div><label style={LBL}>Título * (PT)</label><input style={INP} value={editCampanha.titulo} onChange={e=>setEditCampanha(p=>({...p,titulo:e.target.value}))} /></div>
              <div><label style={LBL}>Tipo</label>
                <select style={INP} value={editCampanha.tipo} onChange={e=>setEditCampanha(p=>({...p,tipo:e.target.value}))}>
                  <option value="cupao">Cupão de desconto</option>
                  <option value="banner">Banner promoção</option>
                  <option value="novidade">Novidade de produto</option>
                  <option value="oferta">Oferta especial</option>
                </select>
              </div>
              <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem * (PT)</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={editCampanha.mensagem} onChange={e=>setEditCampanha(p=>({...p,mensagem:e.target.value}))} /></div>
              <div><label style={LBL}>Título FR</label><input style={INP} value={editCampanha.titulo_fr} onChange={e=>setEditCampanha(p=>({...p,titulo_fr:e.target.value}))} /></div>
              <div><label style={LBL}>Título LT</label><input style={INP} value={editCampanha.titulo_lt} onChange={e=>setEditCampanha(p=>({...p,titulo_lt:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem FR</label><textarea style={{ ...INP,resize:"vertical",minHeight:"60px" }} value={editCampanha.mensagem_fr} onChange={e=>setEditCampanha(p=>({...p,mensagem_fr:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem LT</label><textarea style={{ ...INP,resize:"vertical",minHeight:"60px" }} value={editCampanha.mensagem_lt} onChange={e=>setEditCampanha(p=>({...p,mensagem_lt:e.target.value}))} /></div>
              <div><label style={LBL}>Código desconto</label><input style={INP} value={editCampanha.codigo} onChange={e=>setEditCampanha(p=>({...p,codigo:e.target.value}))} /></div>
              <div><label style={LBL}>Descrição desconto</label><input style={INP} value={editCampanha.desconto} onChange={e=>setEditCampanha(p=>({...p,desconto:e.target.value}))} /></div>
              <div><label style={LBL}>Probabilidade (%)</label><input style={INP} type="number" min="1" max="100" value={editCampanha.probabilidade} onChange={e=>setEditCampanha(p=>({...p,probabilidade:e.target.value}))} /></div>
              <div><label style={LBL}>Validade (opcional)</label><input style={INP} type="datetime-local" value={editCampanha.validade} onChange={e=>setEditCampanha(p=>({...p,validade:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={LBL}>URL destino</label><input style={INP} value={editCampanha.url_destino} onChange={e=>setEditCampanha(p=>({...p,url_destino:e.target.value}))} /></div>
            </div>
            <div style={{ display:"flex",gap:"0.75rem",marginTop:"1.5rem" }}>
              <button style={BTN("rosa")} onClick={guardarEdicaoCampanha}>Guardar alterações</button>
              <button style={BTN("outline")} onClick={()=>{ setCampanhaEditando(null); setEditCampanha(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {aluguerParaEnviar && (
        <ModalEnvio
          aluguer={aluguerParaEnviar}
          onClose={() => setAluguerParaEnviar(null)}
          onEnviado={() => { setAluguerParaEnviar(null); carregarDados(); }}
        />
      )}
      {modalAvaliacao && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"400px",width:"100%"}}>
            <h3 style={{fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:300,marginBottom:"0.5rem"}}>Avaliar cliente</h3>
            <p style={{fontSize:"0.8rem",color:"#5a5855",marginBottom:"1.5rem"}}>{modalAvaliacao.cliente_nome}</p>
            <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={()=>setNotaEmpresa(s)} style={{fontSize:"1.8rem",background:"none",border:"none",cursor:"pointer",color:s<=notaEmpresa?"#c4748a":"#e2dfda"}}>★</button>
              ))}
            </div>
            <textarea value={comentarioEmpresa} onChange={e=>setComentarioEmpresa(e.target.value)} placeholder="Nota interna (opcional)..." style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",fontFamily:"'Jost',sans-serif",fontSize:"0.85rem",resize:"vertical",minHeight:"80px",outline:"none",marginBottom:"1rem"}} />
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button onClick={guardarAvaliacaoEmpresa} disabled={notaEmpresa===0} style={{flex:1,padding:"0.85rem",background:"#080808",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:notaEmpresa===0?"not-allowed":"pointer",opacity:notaEmpresa===0?0.5:1,fontFamily:"'Jost',sans-serif"}}>Guardar</button>
              <button onClick={()=>setModalAvaliacao(null)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid #e2dfda",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>Saltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}