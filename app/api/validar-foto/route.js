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
        max_tokens: 300,
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
                text: `Analisa esta imagem para uma plataforma de moda de luxo em segunda mão. Responde APENAS com JSON válido, sem texto adicional.

Avalia estes critérios — qualquer falha torna a imagem inválida:

CONTEÚDO (obrigatório):
- Deve mostrar uma peça de roupa, acessório ou calçado real
- Não aceitar: screenshots, memes, texto, paisagens, comida, animais, rostos sem roupa, ilustrações digitais, catálogos escaneados, imagens de produto de loja online (fundo branco puro com mannequin digital)

QUALIDADE (critérios exigentes — rejeitar se qualquer um falhar):
- Nitidez: imagem bem focada e nítida. REJEITAR se desfocada, tremida ou com motion blur
- Iluminação: luz natural ou artificial equilibrada, cores reais visíveis. REJEITAR se escura, amarelada/alaranjada (luz incandescente), sobreexposta ou com sombras fortes que escondam detalhes
- Resolução: detalhe suficiente para ver textura, costuras e cor real da peça
- Enquadramento: peça centrada e bem visível, ocupando pelo menos 40% da imagem. REJEITAR se cortada, muito ao longe, torcida ou mostrada de forma que dificulte a avaliação
- Fundo: fundo neutro ou simples preferível. REJEITAR se o fundo está muito desarrumado e distrai da peça
- Apresentação: peça deve estar estendida, dobrada cuidadosamente, num cabide ou vestida numa pessoa. REJEITAR se atirada no chão de qualquer maneira ou amachucada

SEGURANÇA (obrigatório):
- Sem conteúdo adulto, violento ou ofensivo
- Sem marcas d'água de outros sites de venda

Responde com este JSON exato (sem texto adicional):
{"valida": true/false, "categoria": "roupa|acessorio|calcado|outro", "motivo": "descrição curta em português — se inválida, explica o problema principal", "cor": "cor principal em português (ex: preto, branco, azul, vermelho, bege, verde, rosa, multicor, etc.) ou null se não aplicável", "material": "material principal em português (ex: algodão, seda, linho, lã, denim, couro, sintético, malha, etc.) ou null se não identificável"}

Exemplos:
{"valida": true, "categoria": "roupa", "motivo": "Camisola de malha, boa iluminação e foco", "cor": "branco", "material": "malha"}
{"valida": true, "categoria": "roupa", "motivo": "Camisa floral com várias cores", "cor": "multicor", "material": "algodão"}
{"valida": true, "categoria": "calcado", "motivo": "Sapatos de couro, bom enquadramento", "cor": "preto", "material": "couro"}
{"valida": false, "categoria": "roupa", "motivo": "Imagem muito escura, peça quase invisível", "cor": null, "material": null}
{"valida": false, "categoria": "outro", "motivo": "Screenshot de página web", "cor": null, "material": null}`,
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
