import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("foto");

    if (!file) {
      return NextResponse.json({ error: "Foto em falta" }, { status: 400 });
    }

    // Verificar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Foto demasiado grande (máx 5MB)" }, { status: 400 });
    }

    // Verificar tipo
    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json({ error: "Formato não suportado (use JPG, PNG ou WebP)" }, { status: 400 });
    }

    // Converter para base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = file.type;

    const prompt = `Analisa esta peça de roupa/acessório de moda e devolve um JSON com os seguintes campos:

{
  "tipo": string | null,           // uma das opções: "VestidoNoite"|"Vestido"|"Fato"|"Jumpsuit"|"Saia"|"Calças"|"Jeans"|"Blusa"|"Camisa"|"Camisola"|"Bodysuit"|"Casaco"|"Blazer"|"Pele"|"MalaLuxo"|"MalaOmbro"|"Clutch"|"Mochila"|"Sapatos"|"Sapatilhas"|"Botas"|"Sandalias"|"Cinto"|"Lenco"|"OculosSol"|"Chapeu"|"Relogio"|"Joia"
  "tipo_confianca": number,         // 0.0 a 1.0
  "cor": string | null,             // cor principal em português (ex: "preto", "bege", "azul marinho")
  "cor_confianca": number,          // 0.0 a 1.0
  "material": string | null,        // material provável em português (ex: "seda", "algodão", "couro", "ganga", "lã", "sintético")
  "material_confianca": number,     // 0.0 a 1.0
  "marca": string | null,           // marca se identificável com certeza (logo visível, padrão icónico), senão null
  "marca_confianca": number,        // 0.0 a 1.0
  "estado": string | null,          // "comEtiqueta"|"bom"|"usado"|"defeito" baseado no estado visual
  "estado_confianca": number        // 0.0 a 1.0
}

Regras importantes:
- Devolve APENAS o JSON, sem texto adicional
- Se não conseguires detectar um campo com confiança mínima de 0.4, coloca null
- Para a marca: só preenche se vires claramente um logo, padrão icónico (ex: monograma LV, xadrez Burberry) ou silhueta inconfundível. Em caso de dúvida, null.
- O estado baseia-se apenas no aspecto visual da peça na foto`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Erro na análise da imagem" }, { status: 500 });
    }

    const data = await response.json();
    const texto = data.content?.[0]?.text || "";

    // Extrair JSON da resposta
    let resultado;
    try {
      // Limpar possíveis markdown code blocks
      const jsonStr = texto.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      resultado = JSON.parse(jsonStr);
    } catch {
      console.error("Erro a parsear resposta:", texto);
      return NextResponse.json({ error: "Erro a interpretar resposta da IA" }, { status: 500 });
    }

    // Filtrar campos com confiança insuficiente (< 0.4)
    const CONFIANCA_MINIMA = 0.4;
    const campos = ["tipo", "cor", "material", "marca", "estado"];
    for (const campo of campos) {
      if ((resultado[`${campo}_confianca`] || 0) < CONFIANCA_MINIMA) {
        resultado[campo] = null;
      }
    }

    return NextResponse.json(resultado);

  } catch (error) {
    console.error("Erro analisar-peca:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
