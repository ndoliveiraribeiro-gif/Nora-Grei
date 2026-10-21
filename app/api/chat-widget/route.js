import { NextResponse } from "next/server";

const systemPrompt = `És o assistente virtual da Nora Grei, uma plataforma premium de aluguer de moda de luxo em Portugal.

Informações importantes:
- Aluguer de roupa e acessórios de luxo por dia
- Taxa de higienização: 9€ por peça
- Depósito de caução = valor da peça (devolvido após inspeção)
- Métodos de depósito: cartão, transferência, cheque visado, dinheiro (presencial)
- Métodos de pagamento: cartão, MB Way, transferência, dinheiro, cheque visado
- Entrega: envio para casa ou levantamento presencial
- Devolução: por correio ou presencial
- Programa de fidelização: 10 alugueres = 1 grátis
- Peças indisponíveis podem ser reservadas com notificação automática

Responde sempre de forma elegante, concisa e útil. Máximo 3 frases por resposta.
Se não souberes responder ou for um problema complexo, sugere falar com a equipa humana.
Nunca inventes informações sobre preços específicos de peças.`;

export async function POST(request) {
  try {
    const { mensagens } = await request.json();
    if (!mensagens || !Array.isArray(mensagens)) {
      return NextResponse.json({ error: "Mensagens em falta" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: systemPrompt,
        messages: mensagens.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    const resposta = data.content?.[0]?.text || "";
    return NextResponse.json({ resposta });
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
