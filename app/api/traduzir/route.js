import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LINGUAS = { pt: "português", fr: "francês", lt: "lituano", en: "inglês", es: "espanhol" };

export async function POST(req) {
  try {
    const { texto, paraLingua } = await req.json();
    if (!texto?.trim() || !LINGUAS[paraLingua]) {
      return Response.json({ erro: "Parâmetros inválidos" }, { status: 400 });
    }
    // Limitar tamanho para controlar custos
    const textoLimitado = texto.slice(0, 500);
    const msg = await client.messages.create({
      model: "claude-haiku-3-5",
      max_tokens: 256,
      messages: [{
        role: "user",
        content: `Traduz para ${LINGUAS[paraLingua]}. Responde APENAS com a tradução, sem explicações:\n\n${textoLimitado}`,
      }],
    });
    const traducao = msg.content[0]?.text?.trim() || "";
    return Response.json({ traducao });
  } catch (e) {
    return Response.json({ erro: "Erro na tradução" }, { status: 500 });
  }
}
