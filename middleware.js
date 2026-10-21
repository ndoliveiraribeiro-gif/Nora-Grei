import { NextResponse } from "next/server";

/**
 * Middleware de deteção automática de idioma — Nora Grei
 *
 * Na primeira visita (sem cookie ng_lang), lê o header Accept-Language
 * e define o cookie ng_lang para que todas as páginas possam servir
 * o conteúdo no idioma correto.
 *
 * Idiomas suportados: pt (padrão), fr, lt
 * Matching: verifica prefixo primário (ex: "fr-FR" → "fr", "lt-LT" → "lt")
 */

const LANGS_SUPPORTED = ["pt", "fr", "lt"];
const LANG_DEFAULT = "pt";

function detectLang(acceptLanguage) {
  if (!acceptLanguage) return LANG_DEFAULT;

  // Parse Accept-Language: "fr-FR,fr;q=0.9,pt;q=0.8,en;q=0.7"
  const langs = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, q] = entry.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of langs) {
    const prefix = tag.split("-")[0]; // "fr-FR" → "fr"
    if (LANGS_SUPPORTED.includes(prefix)) return prefix;
  }

  return LANG_DEFAULT;
}

export function middleware(request) {
  const response = NextResponse.next();

  // Se já tem cookie, não altera
  const existing = request.cookies.get("ng_lang");
  if (existing?.value && LANGS_SUPPORTED.includes(existing.value)) {
    return response;
  }

  const acceptLang = request.headers.get("accept-language") || "";
  const lang = detectLang(acceptLang);

  // Define cookie por 1 ano (editável pelo utilizador nas preferências)
  response.cookies.set("ng_lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

// Aplica a todas as rotas exceto assets estáticos e API routes internas
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|api/).*)",
  ],
};
