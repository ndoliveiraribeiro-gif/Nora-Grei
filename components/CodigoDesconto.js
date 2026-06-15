"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: {
    btnFicar: "Quero ficar com esta peça",
    titulo: "Código de desconto",
    desc: (valor) => `Tens ${valor}€ de desconto para usar em www.noragrei.com`,
    instrucoes: "Copia o código e aplica no checkout do site da Nora Grei. Válido por 30 dias.",
    copiar: "Copiar código",
    copiado: "Copiado! ✓",
    irSite: "Ir para www.noragrei.com",
    jatem: "Código já gerado",
    expira: (data) => `Expira em ${data}`,
    gerar: "A gerar código...",
  },
  fr: {
    btnFicar: "Je veux garder cette pièce",
    titulo: "Code de réduction",
    desc: (valor) => `Vous avez ${valor}€ de réduction à utiliser sur www.noragrei.com`,
    instrucoes: "Copiez le code et appliquez-le au checkout du site Nora Grei. Valable 30 jours.",
    copiar: "Copier le code",
    copiado: "Copié ! ✓",
    irSite: "Aller sur www.noragrei.com",
    jatem: "Code déjà généré",
    expira: (data) => `Expire le ${data}`,
    gerar: "Génération du code...",
  },
  lt: {
    btnFicar: "Noriu pasilikti šį drabužį",
    titulo: "Nuolaidos kodas",
    desc: (valor) => `Turite ${valor}€ nuolaidą naudoti www.noragrei.com`,
    instrucoes: "Nukopijuokite kodą ir pritaikykite Nora Grei svetainės apmokėjime. Galioja 30 dienų.",
    copiar: "Kopijuoti kodą",
    copiado: "Nukopijuota! ✓",
    irSite: "Eiti į www.noragrei.com",
    jatem: "Kodas jau sugeneruotas",
    expira: (data) => `Galioja iki ${data}`,
    gerar: "Generuojamas kodas...",
  },
};

export default function CodigoDesconto({ aluguer, clienteId, lang = "pt" }) {
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const i = t[lang] || t.pt;

  const valorAluguer = aluguer?.valor_aluguer || 0;
  const nomePeca = aluguer?.stock_tamanhos?.pecas?.nome || "Peça";

  const gerarCodigo = async () => {
    setLoading(true);
    try {
      // Verificar se já existe código para este aluguer
      const { data: existing } = await supabase
        .from("codigos_desconto")
        .select("*")
        .eq("aluguer_id", aluguer.id)
        .single();

      if (existing) {
        setCodigo(existing);
        setAberto(true);
        setLoading(false);
        return;
      }

      // Gerar novo código
      const { data, error } = await supabase.rpc("gerar_codigo_desconto", {
        p_cliente_id: clienteId,
        p_aluguer_id: aluguer.id,
        p_valor: valorAluguer,
      });

      if (error) throw error;

      // Buscar o código gerado
      const { data: novoCodigo } = await supabase
        .from("codigos_desconto")
        .select("*")
        .eq("aluguer_id", aluguer.id)
        .single();

      setCodigo(novoCodigo);
      setAberto(true);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copiar = () => {
    if (codigo?.codigo) {
      navigator.clipboard.writeText(codigo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  const expiresFormatted = codigo?.expires_at
    ? new Date(codigo.expires_at).toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "lt" ? "lt-LT" : "pt-PT")
    : "";

  return (
    <div>
      {/* BOTÃO PRINCIPAL */}
      {!aberto && (
        <button
          onClick={gerarCodigo}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "1.5px solid #c4748a",
            color: "#c4748a",
            padding: "0.6rem 1rem",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            marginTop: "0.5rem",
          }}
        >
          {loading ? i.gerar : i.btnFicar}
        </button>
      )}

      {/* MODAL COM CÓDIGO */}
      {aberto && codigo && (
        <div style={{
          marginTop: "0.75rem",
          padding: "1.25rem",
          background: "#fff0f3",
          border: "1.5px solid #c4748a",
        }}>
          <p style={{
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c4748a",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 500,
            marginBottom: "0.6rem",
          }}>✦ {i.titulo}</p>

          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "#1a1a18",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}>{i.desc(valorAluguer)}</p>

          {/* CÓDIGO */}
          <div style={{
            background: "#fff",
            border: "2px dashed #c4748a",
            padding: "1rem",
            textAlign: "center",
            marginBottom: "1rem",
          }}>
            <p style={{
              fontFamily: "'Jost', monospace",
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "#080808",
              letterSpacing: "0.2em",
            }}>{codigo.codigo}</p>
            {expiresFormatted && (
              <p style={{fontSize: "0.72rem", color: "#5a5855", marginTop: "0.3rem"}}>{i.expira(expiresFormatted)}</p>
            )}
          </div>

          <p style={{fontSize: "0.82rem", color: "#5a5855", marginBottom: "1rem", lineHeight: 1.6}}>{i.instrucoes}</p>

          <div style={{display: "flex", gap: "0.75rem", flexWrap: "wrap"}}>
            <button
              onClick={copiar}
              style={{
                flex: 1,
                padding: "0.85rem",
                background: copiado ? "#27ae60" : "#c4748a",
                color: "#fff",
                border: "none",
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {copiado ? i.copiado : i.copiar}
            </button>
            <a
              href="https://www.noragrei.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: "0.85rem",
                background: "#080808",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {i.irSite} ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}