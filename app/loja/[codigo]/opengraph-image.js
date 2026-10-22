import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgLoja({ params }) {
  const { codigo } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: lojista } = await supabase
    .from("clientes")
    .select("nome, nome_publico, foto_perfil")
    .eq("codigo_cliente", codigo)
    .maybeSingle();

  const { data: pecas } = await supabase
    .from("pecas_lojista")
    .select("fotos, nome, preco_aluguer_dia")
    .eq("codigo_cliente_id", lojista?.id)
    .limit(3);

  const nome = lojista?.nome_publico || lojista?.nome || codigo;
  const fotos = pecas?.flatMap(p => p.fotos?.[0] ? [p.fotos[0]] : []).slice(0, 3) || [];

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
        {/* Fotos das peças */}
        <div style={{ display: "flex", flex: 1, gap: "4px" }}>
          {fotos.length > 0 ? fotos.map((f, i) => (
            <div key={i} style={{ flex: 1, overflow: "hidden", display: "flex" }}>
              <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            </div>
          )) : (
            <div style={{ flex: 1, background: "#e2dfda", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "80px", color: "#c4c0bb" }}>👗</span>
            </div>
          )}
        </div>

        {/* Painel direito */}
        <div style={{
          width: "380px",
          background: "#f8f7f5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "50px 40px",
          borderLeft: "1px solid #e2dfda",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#5a5855", marginBottom: "16px" }}>
            via Nora Grei
          </div>
          <div style={{ fontSize: "48px", fontWeight: 300, color: "#080808", lineHeight: 1.1, marginBottom: "24px" }}>
            {nome}
          </div>
          {pecas?.length > 0 && (
            <div style={{ fontSize: "14px", color: "#5a5855", lineHeight: 1.6 }}>
              {pecas.slice(0, 2).map((p, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  {p.nome}{p.preco_aluguer_dia ? ` — ${p.preco_aluguer_dia}€/dia` : ""}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: "auto", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a" }}>
            noragrei.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
