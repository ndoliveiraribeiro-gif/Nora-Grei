"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    titulo:"Publicar no Feed", voltar:"← Voltar",
    passo1:"Fotos", passo2:"Detalhes", passo3:"Boost",
    addFoto:"Toca para adicionar foto", addMais:"+ Adicionar outra foto",
    titulo_label:"Título *", titulo_ph:"Ex: Vestido Seda Verde — Disponível agora",
    desc_label:"Descrição", desc_ph:"Conta a história desta peça — ocasião, como usar, porquê a escolheste...",
    peca_label:"Peça do catálogo (opcional)", peca_ph:"Ligar a uma peça para alugar",
    tipo_label:"Tipo de post",
    tipos: [{ v:"peca", l:"Peça disponível" }, { v:"look", l:"Inspiração / Look" }, { v:"promocao", l:"Promoção especial" }],
    publicar:"Publicar agora", publicando:"A publicar...",
    boostTitulo:"Destaca este post 🚀", boostSub:"O teu post aparece no topo do feed durante 7 dias e é visto por mais clientes.",
    boostValor:"10€ por 7 dias de destaque",
    boostSim:"Destacar por 10€", boostNao:"Publicar sem destaque",
    boostInfo:"Podes destacar mais tarde no teu perfil.",
    sucessoTitulo:"Post publicado! 🎉", sucessoSub:"O teu post está em revisão. Será publicado em breve.",
    verFeed:"Ver feed", publicarOutro:"Publicar outro",
    semFotos:"Adiciona pelo menos uma foto.",
    semTitulo:"O título é obrigatório.",
    erroUpload:"Erro ao fazer upload da foto. Tenta de novo.",
    login:"Precisas de estar autenticado para publicar.",
    entrar:"Entrar",
    boost_pendente:"Pedido de boost enviado! A Nora Grei irá confirmar o pagamento.",
  },
  fr: {
    titulo:"Publier sur le Feed", voltar:"← Retour",
    passo1:"Photos", passo2:"Détails", passo3:"Boost",
    addFoto:"Appuyez pour ajouter une photo", addMais:"+ Ajouter une autre photo",
    titulo_label:"Titre *", titulo_ph:"Ex: Robe en soie verte — Disponible maintenant",
    desc_label:"Description", desc_ph:"Racontez l'histoire de cette pièce...",
    peca_label:"Pièce du catalogue (optionnel)", peca_ph:"Lier à une pièce à louer",
    tipo_label:"Type de post",
    tipos: [{ v:"peca", l:"Pièce disponible" }, { v:"look", l:"Inspiration / Look" }, { v:"promocao", l:"Promotion spéciale" }],
    publicar:"Publier maintenant", publicando:"Publication en cours...",
    boostTitulo:"Mettez ce post en avant 🚀", boostSub:"Votre post apparaît en haut du feed pendant 7 jours.",
    boostValor:"10€ pour 7 jours de mise en avant",
    boostSim:"Mettre en avant pour 10€", boostNao:"Publier sans mise en avant",
    boostInfo:"Vous pouvez mettre en avant plus tard.",
    sucessoTitulo:"Post publié! 🎉", sucessoSub:"Votre post est en cours de révision.",
    verFeed:"Voir le feed", publicarOutro:"Publier un autre",
    semFotos:"Ajoutez au moins une photo.", semTitulo:"Le titre est obligatoire.",
    erroUpload:"Erreur lors du téléchargement.", login:"Vous devez être connecté pour publier.", entrar:"Se connecter",
    boost_pendente:"Demande de boost envoyée!",
  },
};

export default function PublicarPage() {
  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [passo, setPasso] = useState(1); // 1=fotos, 2=detalhes, 3=boost/sucesso
  const [fotos, setFotos] = useState([]); // { file, url }
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("peca");
  const [pecaId, setPecaId] = useState("");
  const [pecas, setPecas] = useState([]);
  const [publicando, setPublicando] = useState(false);
  const [erro, setErro] = useState("");
  const [postCriado, setPostCriado] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [boostPedido, setBoostPedido] = useState(false);
  const inputRef = useRef();
  const t = T[lang] || T.pt;

  useEffect(() => {
    const l = localStorage.getItem("ng_lang") || "pt";
    setLang(["pt","fr"].includes(l) ? l : "pt");
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    supabase.from("pecas").select("id, nome, fotos, preco_aluguer_dia").eq("ativo", true).order("nome").limit(50).then(({ data }) => setPecas(data || []));
  }, []);

  const adicionarFotos = (files) => {
    const arr = Array.from(files).slice(0, 5 - fotos.length);
    const novas = arr.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setFotos(prev => [...prev, ...novas].slice(0, 5));
  };

  const removerFoto = (i) => setFotos(prev => prev.filter((_, j) => j !== i));

  const publicar = async () => {
    setErro("");
    if (!fotos.length) { setErro(t.semFotos); return; }
    if (!titulo.trim()) { setErro(t.semTitulo); return; }
    if (!user) { setErro(t.login); return; }
    setPublicando(true);
    try {
      // Upload fotos
      const fotoUrls = [];
      for (const f of fotos) {
        const ext = f.file.name.split(".").pop();
        const path = `feed/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("feed").upload(path, f.file, { contentType: f.file.type });
        if (upErr) throw new Error(t.erroUpload);
        const { data: { publicUrl } } = supabase.storage.from("feed").getPublicUrl(path);
        fotoUrls.push(publicUrl);
      }
      // Criar post
      const { data: post, error: postErr } = await supabase.from("feed_posts").insert({
        lojista_id: user.id,
        peca_id: pecaId || null,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        fotos: fotoUrls,
        tipo,
        estado: "pendente",
        publicado_em: new Date().toISOString(),
      }).select().single();
      if (postErr) throw postErr;
      setPostCriado(post);
      setPasso(3);
    } catch (e) {
      setErro(e.message || "Erro ao publicar.");
    }
    setPublicando(false);
  };

  const pedirBoost = async () => {
    if (!postCriado) return;
    await supabase.from("boost_pagamentos").insert({
      post_id: postCriado.id,
      lojista_id: user.id,
      valor: 10,
      dias: 7,
      metodo: "mbway",
      estado: "pendente",
    });
    setBoostPedido(true);
    setSucesso(true);
  };

  const semBoost = () => setSucesso(true);

  if (!user) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", fontFamily:"'Jost',sans-serif", background:"#f7f5f2" }}>
      <p style={{ fontSize:"0.9rem", color:"#5a5855" }}>{t.login}</p>
      <a href="/entrar" style={{ background:"#1a1a1a", color:"#fff", padding:"0.75rem 2rem", borderRadius:"8px", textDecoration:"none", fontSize:"0.85rem", fontWeight:600 }}>{t.entrar}</a>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f7f5f2", fontFamily:"'Jost',sans-serif", maxWidth:"500px", margin:"0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .pub-header{background:#fff;padding:0.75rem 1rem;display:flex;align-items:center;gap:1rem;border-bottom:1px solid #e8e4df;position:sticky;top:0;z-index:10}
        .pub-steps{display:flex;gap:0;margin-left:auto}
        .pub-step{width:28px;height:4px;border-radius:2px;background:#e8e4df;margin:0 2px;transition:background 0.3s}
        .pub-step.done{background:#1a1a1a}
        .pub-step.active{background:#c4a882}
        .pub-body{padding:1rem}
        .pub-section{background:#fff;border-radius:12px;padding:1rem;margin-bottom:1rem}
        .pub-label{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#9c9894;font-weight:600;margin-bottom:0.5rem;display:block}
        .pub-input{width:100%;border:1.5px solid #e8e4df;border-radius:8px;padding:0.65rem 0.85rem;font-size:0.9rem;font-family:'Jost',sans-serif;background:#fff;outline:none;transition:border 0.15s}
        .pub-input:focus{border-color:#1a1a1a}
        .pub-textarea{min-height:90px;resize:vertical}
        .pub-btn{width:100%;background:#1a1a1a;color:#fff;border:none;padding:0.9rem;border-radius:10px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:'Jost',sans-serif;letter-spacing:0.03em;margin-top:0.5rem}
        .pub-btn:disabled{opacity:0.5}
        .pub-btn-outline{background:#fff;color:#1a1a1a;border:1.5px solid #1a1a1a}
        .fotos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.5rem}
        .foto-thumb{aspect-ratio:1;border-radius:8px;overflow:hidden;position:relative;background:#e8e4df}
        .foto-thumb img{width:100%;height:100%;object-fit:cover}
        .foto-remove{position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:22px;height:22px;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .foto-add{aspect-ratio:1;border-radius:8px;border:2px dashed #c8c4bf;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:0.3rem;color:#9c9894;font-size:0.72rem;text-align:center;padding:0.5rem;transition:border-color 0.15s}
        .foto-add:hover{border-color:#1a1a1a;color:#1a1a1a}
        .tipo-btns{display:flex;gap:0.4rem;flex-wrap:wrap}
        .tipo-btn{padding:0.4rem 0.75rem;border-radius:20px;border:1.5px solid #e8e4df;font-size:0.75rem;cursor:pointer;font-family:'Jost',sans-serif;background:#fff;color:#5a5855;transition:all 0.15s}
        .tipo-btn.active{background:#1a1a1a;color:#fff;border-color:#1a1a1a}
        .boost-card{background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border-radius:16px;padding:1.5rem;color:#fff;text-align:center;margin-bottom:1rem}
        .boost-icon{font-size:2rem;margin-bottom:0.75rem}
        .boost-titulo{font-family:'Playfair Display',serif;font-size:1.2rem;margin-bottom:0.5rem}
        .boost-sub{font-size:0.8rem;color:#c8c4bf;line-height:1.5;margin-bottom:1.2rem}
        .boost-valor{background:rgba(196,168,130,0.2);border:1px solid #c4a882;border-radius:8px;padding:0.6rem;color:#c4a882;font-size:0.85rem;font-weight:600;margin-bottom:1rem}
        .btn-boost{width:100%;background:#c4a882;color:#1a1a1a;border:none;padding:0.9rem;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'Jost',sans-serif;margin-bottom:0.6rem}
        .btn-sem-boost{width:100%;background:transparent;color:#9c9894;border:1px solid #444;padding:0.75rem;border-radius:10px;font-size:0.8rem;cursor:pointer;font-family:'Jost',sans-serif}
        .sucesso-card{text-align:center;padding:2rem 1rem}
        .sucesso-icon{font-size:3rem;margin-bottom:1rem}
        .sucesso-titulo{font-family:'Playfair Display',serif;font-size:1.4rem;color:#1a1a1a;margin-bottom:0.5rem}
        .sucesso-sub{font-size:0.85rem;color:#5a5855;line-height:1.5;margin-bottom:1.5rem}
        .select-peca{width:100%;border:1.5px solid #e8e4df;border-radius:8px;padding:0.65rem 0.85rem;font-size:0.85rem;font-family:'Jost',sans-serif;background:#fff;outline:none;appearance:none}
      `}</style>

      <header className="pub-header">
        <a href="/feed" style={{ color:"#5a5855", textDecoration:"none", fontSize:"0.8rem" }}>{t.voltar}</a>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#1a1a1a" }}>{t.titulo}</span>
        <div className="pub-steps">
          {[1,2,3].map(s => <div key={s} className={`pub-step${passo > s ? " done" : passo === s ? " active" : ""}`} />)}
        </div>
      </header>

      <div className="pub-body">

        {/* PASSO 1 — FOTOS */}
        {passo === 1 && (
          <>
            <div className="pub-section">
              <span className="pub-label">{t.passo1}</span>
              <div className="fotos-grid">
                {fotos.map((f, i) => (
                  <div key={i} className="foto-thumb">
                    <img src={f.url} alt="" />
                    <button className="foto-remove" onClick={() => removerFoto(i)}>✕</button>
                  </div>
                ))}
                {fotos.length < 5 && (
                  <div className="foto-add" onClick={() => inputRef.current?.click()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span>{fotos.length === 0 ? t.addFoto : t.addMais}</span>
                  </div>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" multiple capture="environment" style={{ display:"none" }} onChange={e => adicionarFotos(e.target.files)} />
            </div>
            {erro && <p style={{ color:"#e74c3c", fontSize:"0.8rem", marginBottom:"0.75rem", textAlign:"center" }}>{erro}</p>}
            <button className="pub-btn" onClick={() => { if (!fotos.length) { setErro(t.semFotos); return; } setErro(""); setPasso(2); }}
              disabled={fotos.length === 0}>
              Continuar →
            </button>
          </>
        )}

        {/* PASSO 2 — DETALHES */}
        {passo === 2 && (
          <>
            <div className="pub-section">
              <label className="pub-label">{t.titulo_label}</label>
              <input className="pub-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={t.titulo_ph} maxLength={80} />
            </div>

            <div className="pub-section">
              <label className="pub-label">{t.desc_label}</label>
              <textarea className="pub-input pub-textarea" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder={t.desc_ph} maxLength={500} />
            </div>

            <div className="pub-section">
              <label className="pub-label">{t.tipo_label}</label>
              <div className="tipo-btns">
                {t.tipos.map(tp => (
                  <button key={tp.v} className={`tipo-btn${tipo === tp.v ? " active" : ""}`} onClick={() => setTipo(tp.v)}>{tp.l}</button>
                ))}
              </div>
            </div>

            {pecas.length > 0 && (
              <div className="pub-section">
                <label className="pub-label">{t.peca_label}</label>
                <select className="select-peca" value={pecaId} onChange={e => setPecaId(e.target.value)}>
                  <option value="">{t.peca_ph}</option>
                  {pecas.map(p => <option key={p.id} value={p.id}>{p.nome}{p.preco_aluguer_dia ? ` — ${p.preco_aluguer_dia}€/dia` : ""}</option>)}
                </select>
              </div>
            )}

            {erro && <p style={{ color:"#e74c3c", fontSize:"0.8rem", marginBottom:"0.75rem", textAlign:"center" }}>{erro}</p>}

            <div style={{ display:"flex", gap:"0.5rem" }}>
              <button className="pub-btn pub-btn-outline" style={{ flex:"0 0 auto", width:"auto", padding:"0.9rem 1.2rem" }} onClick={() => setPasso(1)}>←</button>
              <button className="pub-btn" style={{ flex:1 }} onClick={publicar} disabled={publicando}>
                {publicando ? t.publicando : t.publicar}
              </button>
            </div>
          </>
        )}

        {/* PASSO 3 — BOOST ou SUCESSO */}
        {passo === 3 && !sucesso && (
          <>
            <div className="boost-card">
              <div className="boost-icon">🚀</div>
              <p className="boost-titulo">{t.boostTitulo}</p>
              <p className="boost-sub">{t.boostSub}</p>
              <div className="boost-valor">{t.boostValor}</div>
              <button className="btn-boost" onClick={pedirBoost}>{t.boostSim}</button>
              <button className="btn-sem-boost" onClick={semBoost}>{t.boostNao}</button>
            </div>
            <p style={{ fontSize:"0.72rem", color:"#9c9894", textAlign:"center" }}>{t.boostInfo}</p>
          </>
        )}

        {sucesso && (
          <div className="pub-section sucesso-card">
            <div className="sucesso-icon">🎉</div>
            <p className="sucesso-titulo">{t.sucessoTitulo}</p>
            <p className="sucesso-sub">{boostPedido ? t.boost_pendente + " " : ""}{t.sucessoSub}</p>
            <a href="/feed" style={{ display:"block", background:"#1a1a1a", color:"#fff", padding:"0.85rem", borderRadius:"10px", textDecoration:"none", fontWeight:600, fontSize:"0.9rem", textAlign:"center", marginBottom:"0.6rem" }}>{t.verFeed}</a>
            <button style={{ width:"100%", background:"#fff", border:"1.5px solid #e8e4df", padding:"0.75rem", borderRadius:"10px", font:"600 0.85rem 'Jost',sans-serif", cursor:"pointer", color:"#1a1a1a" }}
              onClick={() => { setFotos([]); setTitulo(""); setDescricao(""); setTipo("peca"); setPecaId(""); setPasso(1); setSucesso(false); setPostCriado(null); setBoostPedido(false); }}>
              {t.publicarOutro}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
