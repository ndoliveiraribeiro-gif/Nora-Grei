import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }) {
  const { codigo } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: lojista } = await supabase
    .from("clientes")
    .select("nome")
    .eq("codigo_cliente", codigo)
    .maybeSingle();

  const nome = lojista?.nome || codigo;
  const url = `https://noragrei.com/loja/${codigo}`;

  return {
    title: `${nome} · Nora Grei`,
    description: `Descobre as peças de ${nome} na plataforma Nora Grei. Aluga ou compra moda de luxo.`,
    openGraph: {
      title: nome,
      description: `Moda de luxo por ${nome}`,
      url,
      siteName: "Nora Grei",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: nome,
      description: `Moda de luxo por ${nome}`,
    },
  };
}

export default function LojaLayout({ children }) {
  return children;
}
