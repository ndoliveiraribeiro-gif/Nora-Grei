import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }) {
  const { codigo, id } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: peca } = await supabase
    .from("pecas_lojista")
    .select("nome, preco_aluguer_dia, preco_venda, tipo, fotos")
    .eq("id", id)
    .maybeSingle();

  const { data: lojista } = await supabase
    .from("clientes")
    .select("nome")
    .eq("codigo_cliente", codigo)
    .maybeSingle();

  const nome = peca?.nome || "Peça";
  const nomeLoja = lojista?.nome || codigo;
  const preco = peca?.tipo === "comprar"
    ? `${peca.preco_venda}€`
    : peca?.preco_aluguer_dia
      ? `a partir de ${peca.preco_aluguer_dia}€/dia`
      : "";
  const url = `https://noragrei.com/loja/${codigo}/peca/${id}`;

  return {
    title: `${nome} — ${nomeLoja} · Nora Grei`,
    description: `${nome} por ${nomeLoja}${preco ? ` — ${preco}` : ""}. Disponível na Nora Grei.`,
    openGraph: {
      title: `${nome} — ${nomeLoja}`,
      description: preco ? `${preco} · Disponível na Nora Grei` : `Disponível na Nora Grei`,
      url,
      siteName: "Nora Grei",
      type: "website",
      images: peca?.fotos?.[0] ? [{ url: peca.fotos[0], width: 800, height: 1000, alt: nome }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${nome} — ${nomeLoja}`,
      description: preco ? `${preco} · Nora Grei` : "Nora Grei",
    },
  };
}

export default function PecaLojaLayout({ children }) {
  return children;
}
