import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { imagem, tipo } = await request.json();
    // imagem: base64 string (sem prefixo data:...)
    // tipo: mime type, ex: "image/jpeg"

    if (!imagem) {
      return NextResponse.json({ error: "Imagem em falta" }, { status: 400 });
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
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: tipo || "image/jpeg",
                  data: imagem,
                },
              },
              {
                type: "text",
                text: `Analisa esta imagem e responde APENAS com JSON válido, sem texto adicional.

Verifica:
1. A imagem mostra uma peça de roupa, acessório ou calçado real (não uma ilustração digital, screenshot, meme, imagem de texto, rosto sem roupa, paisagem, comida, animal, ou qualquer outra coisa)?
2. A imagem tem qualidade suficiente para uma loja de moda (não é desfocada, muito escura, ou com conteúdo inadequado)?

Responde com este JSON exato:
{"valida": true/false, "categoria": "roupa|acessorio|calcado|outro", "motivo": "descrição curta em português do que vês na imagem"}

Exemplos de resposta:
{"valida": true, "categoria": "roupa", "motivo": "Vestido de noite azul em fundo neutro"}
{"valida": false, "categoria": "outro", "motivo": "Screenshot de ecrã com texto"}
{"valida": false, "categoria": "outro", "motivo": "Fotografia de paisagem"}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      // Em caso de erro da API, deixar passar para não bloquear o lojista
      return NextResponse.json({ valida: true, categoria: "desconhecido", motivo: "Validação indisponível", erro: true });
    }

    const data = await response.json();
    const texto = data.content?.[0]?.text || "{}";

    let resultado;
    try {
      // Extrair JSON da resposta (às vezes o modelo adiciona texto à volta)
      const match = texto.match(/\{[\s\S]*\}/);
      resultado = match ? JSON.parse(match[0]) : { valida: false, categoria: "outro", motivo: "Resposta inválida" };
    } catch {
      resultado = { valida: false, categoria: "outro", motivo: "Erro ao processar resposta" };
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("validar-foto error:", error);
    // Em caso de erro inesperado, deixar passar
    return NextResponse.json({ valida: true, categoria: "desconhecido", motivo: "Validação indisponível", erro: true });
  }
}
