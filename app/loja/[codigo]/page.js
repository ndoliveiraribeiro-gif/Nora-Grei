import { createClient } from "@supabase/supabase-js";
import LojaCliente from "./LojaCliente";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sbServer = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function withRetry(fn, tentativas = 3, espera = 600) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const result = await fn();
      if (result !== null && result !== undefined) return result;
    } catch {}
    if (i < tentativas - 1) await new Promise(r => setTimeout(r, espera * (i + 1)));
  }
  return null;
}

async function getLoja(codigo) {
  return withRetry(async () => {
    const { data, error } = await sbServer()
      .from("clientes")
      .select("id, nome, nome_publico, codigo_cliente, cidade, pais, avatar_url, descricao, created_at")
      .eq("codigo_cliente", codigo)
      .maybeSingle();
    console.log("[getLoja] codigo:", codigo, "data:", JSON.stringify(data), "error:", JSON.stringify(error));
    return data || null;
  });
}

async function getPecas(clienteId) {
  const result = await withRetry(async () => {
    const { data } = await sbServer()
      .from("pecas_lojista")
      .select("id, nome, fotos, preco_aluguer_dia, preco_venda, cor")
      .eq("cliente_id", clienteId)
      .not("fotos", "is", null)
      .neq("fotos", "{}")
      .order("created_at", { ascending: false });
    return data?.length ? data : null;
  });
  return result || [];
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

  const nomeVis = loja.nome_publico || loja.nome;
  const titulo = `${nomeVis} — Nora Grei`;
  const descricao = loja.descricao
    ? loja.descricao.slice(0, 155)
    : `Descobre as peças de ${nomeVis} na plataforma Nora Grei — alugar ou comprar moda exclusiva.`;
  const url = `https://noragrei.com/loja/${loja.codigo_cliente}`;
  const imagem = loja.avatar_url || "https://noragrei.com/og-default.jpg";

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: "Nora Grei",
      images: [{ url: imagem, width: 800, height: 800, alt: nomeVis }],
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
