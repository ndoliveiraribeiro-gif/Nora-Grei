"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SENHA = process.env.NEXT_PUBLIC_BACKOFFICE_SENHA || "noragrei2024admin";
const ADMIN_ID = "2f6afc17-8e46-41a7-9b9f-4f407c76919f";

const CATEGORIAS = ["Vestidos","Conjuntos","Casacos","Calças","Saias","Blusas","Malhas","Fatos","Malas","Acessórios","Calçado","Outra"];
const CONDICOES = ["novo","como_novo","muito_bom","bom","usado"];
const CONDICOES_LABEL = { novo:"Novo (c/ etiqueta)", como_novo:"Como novo", muito_bom:"Muito bom", bom:"Bom estado", usado:"Usado" };
const TIPOS = ["alugar","comprar","ambos"];
const TIPOS_LABEL = { alugar:"Aluguer", comprar:"Venda", ambos:"Aluguer + Venda" };

export default function AdminLoja() {
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [tab, setTab] = useState("pecas"); // pecas | loja | pedidos
  const [pecas, setPecas] = useState([]);
  const [lojaInfo, setLojaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // form nova peça
  const [form, setForm] = useState({ titulo: "", categoria: "", condicao: "bom", tipo: "alugar", preco_aluguer_dia: "", preco_venda: "", descricao: "" });
  const [fotos, setFotos] = useState([]);
  const [fotosPrev, setFotosPrev] = useState([]);
  const [subindo, setSubindo] = useState(false);
  const inputFotoRef = useRef(null);
  const inputCameraRef = useRef(null);
  const inputLojaFotoRef = useRef(null);

  const entrar = () => {
    if (senha === SENHA) { setAutenticado(true); carregar(); }
    else { setErroSenha(true); }
  };

  const carregar = async () => {
    setLoading(true);
    const [{ data: loja }, { data: listaPecas }] = await Promise.all([
      supabase.from("clientes").select("id,nome,nome_publico,foto_perfil,descricao,cidade,pais,codigo_cliente").eq("id", ADMIN_ID).single(),
      supabase.from("pecas_lojista").select("id,titulo,categoria,condicao,tipo,preco_aluguer_dia,preco_venda,fotos,ativo,created_at").eq("cliente_id", ADMIN_ID).order("created_at", { ascending: false })
    ]);
    setLojaInfo(loja);
    setPecas(listaPecas || []);
    setLoading(false);
  };

  const adicionarFotos = (files) => {
    const arr = Array.from(files).slice(0, 8 - fotos.length);
    setFotos(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const r = new FileReader();
      r.onload = e => setFotosPrev(prev => [...prev, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const removerFoto = (i) => {
    setFotos(prev => prev.filter((_,j) => j !== i));
    setFotosPrev(prev => prev.filter((_,j) => j !== i));
  };

  const submeterPeca = async () => {
    if (!form.titulo.trim()) { setMsg("Falta o título."); return; }
    if (!form.categoria) { setMsg("Falta a categoria."); return; }
    if (form.tipo !== "comprar" && !form.preco_aluguer_dia) { setMsg("Falta o preço de aluguer/dia."); return; }
    if (form.tipo !== "alugar" && !form.preco_venda) { setMsg("Falta o preço de venda."); return; }
    setSubindo(true); setMsg("");
    try {
      const { data: novaPeca, error } = await supabase.from("pecas_lojista").insert({
        cliente_id: ADMIN_ID,
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        condicao: form.condicao,
        tipo: form.tipo,
        preco_aluguer_dia: form.tipo !== "comprar" ? parseFloat(form.preco_aluguer_dia) : null,
        preco_venda: form.tipo !== "alugar" ? parseFloat(form.preco_venda) : null,
        descricao: form.descricao.trim(),
        ativo: true,
        marca: "Nora Grei",
      }).select().single();
      if (error) throw error;

      // upload fotos
      const urls = [];
      for (let i = 0; i < fotos.length; i++) {
        const f = fotos[i];
        const path = `${ADMIN_ID}/${novaPeca.id}/${Date.now()}_${i}.webp`;
        const { error: upErr } = await supabase.storage.from("pecas_lojista").upload(path, f, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from("pecas_lojista").getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      }
      if (urls.length > 0) await supabase.from("pecas_lojista").update({ fotos: urls }).eq("id", novaPeca.id);

      setMsg("✓ Peça adicionada!");
      setForm({ titulo: "", categoria: "", condicao: "bom", tipo: "alugar", preco_aluguer_dia: "", preco_venda: "", descricao: "" });
      setFotos([]); setFotosPrev([]);
      carregar();
    } catch (e) { setMsg("Erro: " + e.message); }
    setSubindo(false);
  };

  const toggleAtivo = async (peca) => {
    await supabase.from("pecas_lojista").update({ ativo: !peca.ativo }).eq("id", peca.id);
    setPecas(prev => prev.map(p => p.id === peca.id ? { ...p, ativo: !p.ativo } : p));
  };

  const eliminarPeca = async (id) => {
    if (!confirm("Eliminar esta peça?")) return;
    await supabase.from("pecas_lojista").delete().eq("id", id);
    setPecas(prev => prev.filter(p => p.id !== id));
  };

  const uploadFotoLoja = async (file) => {
    if (!file) return;
    setMsg("A fazer upload...");
    const path = `perfil/${ADMIN_ID}/avatar_${Date.now()}.webp`;
    const { error } = await supabase.storage.from("pecas_lojista").upload(path, file, { upsert: true });
    if (error) { setMsg("Erro no upload: " + error.message); return; }
    const { data } = supabase.storage.from("pecas_lojista").getPublicUrl(path);
    await supabase.from("clientes").update({ foto_perfil: data.publicUrl }).eq("id", ADMIN_ID);
    setLojaInfo(prev => ({ ...prev, foto_perfil: data.publicUrl }));
    setMsg("✓ Foto actualizada!");
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────
  if (!autenticado) return (
    <div style={{ minHeight:"100dvh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');`}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"#f8f7f5", textAlign:"center", marginBottom:"0.25rem" }}>Nora Grei</div>
        <div style={{ fontSize:"0.62rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c4748a", textAlign:"center", marginBottom:"2.5rem" }}>Gestão da Loja</div>
        <input
          type="password" placeholder="Password" value={senha}
          onChange={e => { setSenha(e.target.value); setErroSenha(false); }}
          onKeyDown={e => e.key==="Enter" && entrar()}
          autoFocus
          style={{ width:"100%", padding:"0.9rem 1rem", background:"#1a1614", border: erroSenha?"1.5px solid #e74c3c":"1.5px solid #2a2420", color:"#f8f7f5", fontSize:"1rem", fontFamily:"'Jost',sans-serif", outline:"none", marginBottom:"0.75rem", borderRadius:0 }}
        />
        {erroSenha && <div style={{ color:"#e74c3c", fontSize:"0.75rem", marginBottom:"0.75rem" }}>Password incorrecta.</div>}
        <button onClick={entrar} style={{ width:"100%", padding:"0.9rem", background:"#c4748a", color:"#fff", border:"none", fontSize:"0.75rem", letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:"'Jost',sans-serif", cursor:"pointer" }}>Entrar</button>
      </div>
    </div>
  );

  // ─── INTERFACE PRINCIPAL ──────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100dvh", background:"#f8f7f5", fontFamily:"'Jost',sans-serif", paddingBottom:"5rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input,textarea,select{font-family:'Jost',sans-serif}
        .pill{display:inline-block;padding:0.45rem 0.9rem;border:1px solid #d5d2cd;font-size:0.72rem;letter-spacing:0.08em;cursor:pointer;background:#fff;color:#5a5855;transition:all 0.15s}
        .pill.on{background:#1a1816;color:#f8f7f5;border-color:#1a1816}
        .campo{width:100%;border:1px solid #d5d2cd;padding:0.75rem 1rem;font-size:0.85rem;color:#1a1816;outline:none;background:#fff;margin-bottom:0.75rem}
        .campo:focus{border-color:#c4748a}
        .btn-rosa{background:#c4748a;color:#fff;border:none;padding:0.85rem 1.5rem;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;font-family:'Jost',sans-serif;width:100%}
        .btn-ghost{background:transparent;color:#5a5855;border:1px solid #d5d2cd;padding:0.6rem 1rem;font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;font-family:'Jost',sans-serif}
        .sec-label{font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:#c4748a;margin-bottom:0.6rem}
        .peca-row{background:#fff;border:1px solid #e8e5e0;padding:0.9rem;margin-bottom:0.6rem;display:flex;gap:0.75rem;align-items:flex-start}
        .peca-thumb{width:52px;height:52px;object-fit:cover;flex-shrink:0;background:#e8e5e0}
        .foto-prev{width:72px;height:72px;object-fit:cover;border:1px solid #d5d2cd;position:relative}
        .foto-del{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#e74c3c;color:#fff;border:none;font-size:0.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
      `}</style>

      {/* HEADER */}
      <div style={{ background:"#080808", padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontWeight:300, color:"#f8f7f5", lineHeight:1 }}>Nora Grei</div>
          <div style={{ fontSize:"0.55rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(248,247,245,0.4)", marginTop:"0.15rem" }}>Admin Loja</div>
        </div>
        <a href="/backoffice" style={{ fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(196,116,138,0.8)", textDecoration:"none" }}>Backoffice →</a>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", borderBottom:"1px solid #e8e5e0", background:"#fff", position:"sticky", top:"3.5rem", zIndex:40 }}>
        {[["pecas","Peças"],["loja","Loja"],["pedidos","Pedidos"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"0.85rem 0", fontSize:"0.68rem", letterSpacing:"0.15em", textTransform:"uppercase", border:"none", background:"none", cursor:"pointer", color: tab===k ? "#c4748a" : "#5a5855", borderBottom: tab===k ? "2px solid #c4748a" : "2px solid transparent", fontFamily:"'Jost',sans-serif" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:"1.25rem" }}>
        {msg && <div style={{ background: msg.startsWith("✓") ? "#f0faf4" : "#fef2f2", border: `1px solid ${msg.startsWith("✓") ? "#a7d8b8" : "#fca5a5"}`, color: msg.startsWith("✓") ? "#166534" : "#991b1b", padding:"0.75rem 1rem", fontSize:"0.78rem", marginBottom:"1rem" }}>{msg}</div>}

        {/* ── TAB: PEÇAS ── */}
        {tab === "pecas" && (
          <div>
            {/* Formulário nova peça */}
            <div style={{ background:"#fff", border:"1px solid #e8e5e0", padding:"1.25rem", marginBottom:"1.5rem" }}>
              <div className="sec-label">Nova peça</div>

              <input className="campo" placeholder="Título *" value={form.titulo} onChange={e => setForm(p=>({...p,titulo:e.target.value}))} />

              <div className="sec-label" style={{marginTop:"0.5rem"}}>Categoria</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"0.75rem" }}>
                {CATEGORIAS.map(c => <button key={c} className={`pill${form.categoria===c?" on":""}`} onClick={() => setForm(p=>({...p,categoria:c}))}>{c}</button>)}
              </div>

              <div className="sec-label">Condição</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"0.75rem" }}>
                {CONDICOES.map(c => <button key={c} className={`pill${form.condicao===c?" on":""}`} onClick={() => setForm(p=>({...p,condicao:c}))}>{CONDICOES_LABEL[c]}</button>)}
              </div>

              <div className="sec-label">Tipo</div>
              <div style={{ display:"flex", gap:"0.4rem", marginBottom:"0.75rem" }}>
                {TIPOS.map(t => <button key={t} className={`pill${form.tipo===t?" on":""}`} onClick={() => setForm(p=>({...p,tipo:t}))}>{TIPOS_LABEL[t]}</button>)}
              </div>

              {form.tipo !== "comprar" && <input className="campo" type="number" placeholder="Preço aluguer/dia (€) *" value={form.preco_aluguer_dia} onChange={e => setForm(p=>({...p,preco_aluguer_dia:e.target.value}))} />}
              {form.tipo !== "alugar" && <input className="campo" type="number" placeholder="Preço de venda (€) *" value={form.preco_venda} onChange={e => setForm(p=>({...p,preco_venda:e.target.value}))} />}

              <textarea className="campo" placeholder="Descrição (opcional)" rows={3} value={form.descricao} onChange={e => setForm(p=>({...p,descricao:e.target.value}))} style={{ resize:"vertical" }} />

              {/* Fotos */}
              <div className="sec-label">Fotos</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"0.75rem" }}>
                {fotosPrev.map((src,i) => (
                  <div key={i} style={{ position:"relative" }}>
                    <img src={src} className="foto-prev" alt="" />
                    <button className="foto-del" onClick={() => removerFoto(i)}>×</button>
                  </div>
                ))}
                {fotos.length < 8 && (
                  <>
                    <button onClick={() => inputCameraRef.current?.click()} style={{ width:72, height:72, border:"2px dashed #d5d2cd", background:"#f8f7f5", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.2rem", cursor:"pointer", color:"#5a5855", fontSize:"0.6rem", letterSpacing:"0.1em" }}>
                      <span style={{ fontSize:"1.4rem" }}>📷</span>Câmara
                    </button>
                    <button onClick={() => inputFotoRef.current?.click()} style={{ width:72, height:72, border:"2px dashed #d5d2cd", background:"#f8f7f5", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.2rem", cursor:"pointer", color:"#5a5855", fontSize:"0.6rem", letterSpacing:"0.1em" }}>
                      <span style={{ fontSize:"1.4rem" }}>🖼️</span>Galeria
                    </button>
                  </>
                )}
              </div>
              <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" multiple style={{ display:"none" }} onChange={e => adicionarFotos(e.target.files)} />
              <input ref={inputFotoRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => adicionarFotos(e.target.files)} />

              <button className="btn-rosa" onClick={submeterPeca} disabled={subindo}>
                {subindo ? "A publicar..." : "+ Publicar Peça"}
              </button>
            </div>

            {/* Lista de peças */}
            <div className="sec-label">Peças publicadas ({pecas.length})</div>
            {loading ? <div style={{ color:"#8a8783", fontSize:"0.78rem" }}>A carregar...</div> : pecas.map(p => (
              <div key={p.id} className="peca-row">
                {p.fotos?.[0] ? <img src={p.fotos[0]} className="peca-thumb" alt="" /> : <div className="peca-thumb" />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"0.88rem", fontWeight:500, color:"#1a1816", marginBottom:"0.2rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.titulo}</div>
                  <div style={{ fontSize:"0.68rem", color:"#8a8783", marginBottom:"0.4rem" }}>{p.categoria} · {CONDICOES_LABEL[p.condicao] || p.condicao}</div>
                  <div style={{ fontSize:"0.75rem", color:"#5a5855", marginBottom:"0.5rem" }}>
                    {p.preco_aluguer_dia && <span>{p.preco_aluguer_dia}€/dia </span>}
                    {p.preco_venda && <span>· {p.preco_venda}€ venda</span>}
                  </div>
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    <button className="btn-ghost" onClick={() => toggleAtivo(p)} style={{ fontSize:"0.6rem" }}>
                      {p.ativo ? "✓ Activa" : "Inactiva"}
                    </button>
                    <button className="btn-ghost" onClick={() => eliminarPeca(p.id)} style={{ fontSize:"0.6rem", color:"#e74c3c", borderColor:"#e74c3c" }}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: LOJA ── */}
        {tab === "loja" && lojaInfo && (
          <div>
            <div style={{ background:"#fff", border:"1px solid #e8e5e0", padding:"1.25rem", marginBottom:"1rem" }}>
              <div className="sec-label">Foto da loja</div>
              <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", overflow:"hidden", background:"#e8e5e0", border:"2px solid #d5d2cd", flexShrink:0 }}>
                  {lojaInfo.foto_perfil
                    ? <img src={lojaInfo.foto_perfil} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", color:"#c4748a" }}>NG</div>
                  }
                </div>
                <div>
                  <button className="btn-ghost" onClick={() => inputLojaFotoRef.current?.click()} style={{ marginBottom:"0.4rem", display:"block" }}>📷 Câmara</button>
                  <input ref={inputLojaFotoRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e => uploadFotoLoja(e.target.files?.[0])} />
                  <div style={{ fontSize:"0.62rem", color:"#8a8783" }}>Foto da loja Nora Grei</div>
                </div>
              </div>
            </div>

            <div style={{ background:"#fff", border:"1px solid #e8e5e0", padding:"1.25rem" }}>
              <div className="sec-label">Informações da loja</div>
              <div style={{ fontSize:"0.78rem", color:"#5a5855", marginBottom:"0.4rem" }}><strong>Nome público:</strong> {lojaInfo.nome_publico || lojaInfo.nome}</div>
              <div style={{ fontSize:"0.78rem", color:"#5a5855", marginBottom:"0.4rem" }}><strong>Slug:</strong> /loja/{lojaInfo.codigo_cliente}</div>
              <div style={{ fontSize:"0.78rem", color:"#5a5855", marginBottom:"0.4rem" }}><strong>Localização:</strong> {[lojaInfo.cidade, lojaInfo.pais].filter(Boolean).join(", ")}</div>
              {lojaInfo.descricao && <div style={{ fontSize:"0.78rem", color:"#5a5855", marginTop:"0.75rem", lineHeight:1.5 }}>{lojaInfo.descricao}</div>}
              <a href="/backoffice" style={{ display:"inline-block", marginTop:"1rem", fontSize:"0.62rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#c4748a", textDecoration:"none" }}>Editar no backoffice →</a>
            </div>
          </div>
        )}

        {/* ── TAB: PEDIDOS ── */}
        {tab === "pedidos" && (
          <PedidosLoja />
        )}
      </div>
    </div>
  );
}

function PedidosLoja() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase
        .from("alugueres")
        .select("id,estado,data_inicio,data_fim,total_pago,created_at,pecas_lojista(titulo,fotos)")
        .eq("lojista_id", ADMIN_ID)
        .order("created_at", { ascending: false })
        .limit(30);
      setPedidos(data || []);
      setLoading(false);
    };
    carregar();
  }, []);

  const COR_ESTADO = { pendente:"#f59e0b", confirmado:"#3b82f6", ativo:"#10b981", concluido:"#6b7280", cancelado:"#ef4444" };

  if (loading) return <div style={{ color:"#8a8783", fontSize:"0.78rem" }}>A carregar...</div>;
  if (pedidos.length === 0) return <div style={{ color:"#8a8783", fontSize:"0.85rem", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", textAlign:"center", paddingTop:"2rem" }}>Sem pedidos ainda.</div>;

  return (
    <div>
      <div style={{ fontSize:"0.6rem", letterSpacing:"0.28em", textTransform:"uppercase", color:"#c4748a", marginBottom:"0.75rem" }}>
        Últimos pedidos ({pedidos.length})
      </div>
      {pedidos.map(p => (
        <div key={p.id} style={{ background:"#fff", border:"1px solid #e8e5e0", padding:"0.9rem", marginBottom:"0.6rem", display:"flex", gap:"0.75rem" }}>
          {p.pecas_lojista?.fotos?.[0]
            ? <img src={p.pecas_lojista.fotos[0]} style={{ width:48, height:48, objectFit:"cover", flexShrink:0 }} alt="" />
            : <div style={{ width:48, height:48, background:"#e8e5e0", flexShrink:0 }} />
          }
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"0.85rem", fontWeight:500, color:"#1a1816", marginBottom:"0.2rem" }}>{p.pecas_lojista?.titulo || "—"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.2rem" }}>
              <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: COR_ESTADO[p.estado] || "#ccc" }} />
              <span style={{ fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"#5a5855" }}>{p.estado}</span>
            </div>
            <div style={{ fontSize:"0.72rem", color:"#8a8783" }}>
              {p.data_inicio && p.data_fim ? `${p.data_inicio} → ${p.data_fim}` : "Sem datas"}
              {p.total_pago && <span style={{ marginLeft:"0.5rem", color:"#1a1816", fontWeight:500 }}>{p.total_pago}€</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
