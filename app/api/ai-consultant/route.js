import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { pergunta, contexto, historico } = await request.json();

    if (!pergunta) {
      return NextResponse.json({ error: "Pergunta em falta" }, { status: 400 });
    }

    const systemPrompt = `És um consultor de negócios especializado em moda, aluguer de roupa de luxo e análise de comportamento do consumidor. Trabalhas para a Nora Grei, uma plataforma portuguesa de aluguer e compra de peças de moda exclusivas.

O teu papel é:
1. Analisar dados reais do negócio e dar insights concretos e acionáveis
2. Aplicar o princípio 80-20 (Pareto) — identificar os 20% que geram 80% do valor
3. Construir personas de consumidor com base em dados: cidade, idade, profissão, peças alugadas, ocasiões
4. Prever comportamentos futuros de compra e aluguer
5. Recomendar estratégias de marketing, stock, preços e expansão física
6. Interpretar dados económicos e estatísticos de forma clara e útil para decisões

Dados atuais do negócio:
${contexto}

Responde sempre em português, de forma concisa, direta e útil. Usa dados concretos quando disponíveis. Quando aplicares o 80-20, identifica claramente quais são os 20% prioritários.`;

    const messages = [
      ...(historico || []),
      { role: "user", content: pergunta }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "Erro API" }, { status: 500 });
    }

    const data = await response.json();
    const resposta = data.content?.[0]?.text || "Sem resposta.";

    return NextResponse.json({ resposta });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}