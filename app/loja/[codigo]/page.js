import { createClient } from "@supabase/supabase-js";
import LojaCliente from "./LojaCliente";

async function getLoja(codigo) {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabaseServer
    .from("clientes")
    .select("id, nome, codigo_cliente, cidade, pais, foto_perfil, descricao, created_at")
    .eq("codigo_cliente", codigo)
    .maybeSingle();
  console.log("[getLoja] codigo:", codigo, "data:", data, "error:", error);
  return data || null;
}

async function getPecas(clienteId) {
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data } = await supabaseServer
    .from("pecas_lojista")
    .select("id, nome, fotos, preco_aluguer_dia, preco_venda, cor")
    .eq("cliente_id", clienteId)
    .not("fotos", "is", null)
    .neq("fotos", "{}")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }) {
  const { codigo } = await params;
  const loja = await getLoja(codigo);

  if (!loja) {
    return {
      title: "Loja não encontrada — Nora Grei",
      description: "Esta loja não existe na plataforma Nora Grei.",
    };
  }

  const titulo = `${loja.nome} — Nora Grei`;
  const descricao = loja.descricao
    ? loja.descricao.slice(0, 155)
    : `Descobre as peças de ${loja.nome} na plataforma Nora Grei — alugar ou comprar moda exclusiva.`;
  const url = `https://noragrei.com/loja/${loja.codigo_cliente}`;
  const imagem = loja.foto_perfil || "https://noragrei.com/og-default.jpg";

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: "Nora Grei",
      images: [{ url: imagem, width: 800, height: 800, alt: loja.nome }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [imagem],
    },
    alternates: { canonical: url },
  };
}

export default async function LojaPage({ params }) {
  const { codigo } = await params;
  const loja = await getLoja(codigo);
  const pecas = loja ? await getPecas(loja.id) : [];

  return <LojaCliente lojaInicial={loja} pecasIniciais={pecas} />;
}
