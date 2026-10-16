import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgPeca({ params }) {
  const { codigo, id } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: peca } = await supabase
    .from("pecas_lojista")
    .select("nome, fotos, preco_aluguer_dia, preco_venda, tipo, descricao")
    .eq("id", id)
    .maybeSingle();

  const { data: lojista } = await supabase
    .from("clientes")
    .select("nome")
    .eq("codigo_cliente", codigo)
    .maybeSingle();

  const foto = peca?.fotos?.[0];
  const nome = peca?.nome || "Peça";
  const nomeLoja = lojista?.nome || codigo;

  const precoTexto = peca?.tipo === "comprar"
    ? `${peca.preco_venda}€`
    : peca?.preco_aluguer_dia
      ? `${peca.preco_aluguer_dia}€/dia`
      : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#f0eeeb",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Foto da peça */}
        <div style={{ width: "420px", overflow: "hidden", display: "flex", flexShrink: 0 }}>
          {foto
            ? <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            : <div style={{ width: "100%", background: "#e2dfda", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "80px", color: "#c4c0bb" }}>👗</span>
              </div>
          }
        </div>

        {/* Conteúdo */}
        <div style={{
          flex: 1,
          background: "#f8f7f5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 60px",
          borderLeft: "1px solid #e2dfda",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#5a5855", marginBottom: "12px" }}>
            {nomeLoja} · via Nora Grei
          </div>
          <div style={{ fontSize: "54px", fontWeight: 300, color: "#080808", lineHeight: 1.1, marginBottom: "28px" }}>
            {nome}
          </div>
          {precoTexto && (
            <div style={{ fontSize: "30px", color: "#080808", fontWeight: 400, marginBottom: "20px" }}>
              {precoTexto}
            </div>
          )}
          {peca?.descricao && (
            <div style={{ fontSize: "15px", color: "#5a5855", lineHeight: 1.6, maxWidth: "480px" }}>
              {peca.descricao.slice(0, 100)}{peca.descricao.length > 100 ? "..." : ""}
            </div>
          )}
          <div style={{ marginTop: "auto", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a" }}>
            noragrei.com/loja/{codigo}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
