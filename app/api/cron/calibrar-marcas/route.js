// app/api/cron/calibrar-marcas/route.js
// Cron semanal: actualiza taxas de apreciação por marca no Supabase
// Chamado pelo Vercel Cron (vercel.json) ou manualmente via /api/cron/calibrar-marcas
// Fontes: WatchCharts (relógios), Vestiaire Collective trends, índices públicos

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Taxas base de referência por marca ──────────────────────────────────────
// Estrutura: { marca_key, marca_display, taxa_anual, tier, categoria, fonte }
// taxa_anual: valor positivo = aprecia, 0 = neutro, negativo = deprecia
// Actualizar aqui quando houver novos dados de mercado — o cron propaga automaticamente
const TAXAS_REFERENCIA = [
  // ── RELÓGIOS — os que mais apreciam ────────────────────────────────────
  { marca_key:"rolex",               marca_display:"Rolex",               taxa_anual:0.0820, tier:"investimento", categoria:"relogio", fonte:"Knight Frank Luxury Index 2024" },
  { marca_key:"patek philippe",      marca_display:"Patek Philippe",       taxa_anual:0.0950, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"audemars piguet",     marca_display:"Audemars Piguet",      taxa_anual:0.0710, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"richard mille",       marca_display:"Richard Mille",        taxa_anual:0.0650, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"fp journe",           marca_display:"F.P. Journe",          taxa_anual:0.0880, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"f.p. journe",         marca_display:"F.P. Journe",          taxa_anual:0.0880, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"greubel forsey",      marca_display:"Greubel Forsey",       taxa_anual:0.0600, tier:"investimento", categoria:"relogio", fonte:"manual" },
  { marca_key:"mb&f",                marca_display:"MB&F",                 taxa_anual:0.0450, tier:"investimento", categoria:"relogio", fonte:"manual" },
  { marca_key:"vacheron constantin", marca_display:"Vacheron Constantin",  taxa_anual:0.0420, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"jaeger-lecoultre",    marca_display:"Jaeger-LeCoultre",     taxa_anual:0.0280, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"jaeger lecoultre",    marca_display:"Jaeger-LeCoultre",     taxa_anual:0.0280, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"a. lange & söhne",   marca_display:"A. Lange & Söhne",    taxa_anual:0.0380, tier:"investimento", categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"blancpain",           marca_display:"Blancpain",            taxa_anual:0.0220, tier:"investimento", categoria:"relogio", fonte:"manual" },
  { marca_key:"breguet",             marca_display:"Breguet",              taxa_anual:0.0200, tier:"investimento", categoria:"relogio", fonte:"manual" },
  { marca_key:"omega",               marca_display:"Omega",                taxa_anual:0.0120, tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"tudor",               marca_display:"Tudor",                taxa_anual:0.0180, tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"tag heuer",           marca_display:"TAG Heuer",            taxa_anual:0.0050, tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"breitling",           marca_display:"Breitling",            taxa_anual:0.0040, tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"iwc",                 marca_display:"IWC",                  taxa_anual:0.0080, tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"panerai",             marca_display:"Panerai",              taxa_anual:0.0030, tier:"premium",      categoria:"relogio", fonte:"manual" },
  { marca_key:"hublot",              marca_display:"Hublot",               taxa_anual:-0.0050,tier:"premium",      categoria:"relogio", fonte:"WatchCharts 2024" },
  { marca_key:"longines",            marca_display:"Longines",             taxa_anual:0.0000, tier:"premium",      categoria:"relogio", fonte:"manual" },
  { marca_key:"tissot",              marca_display:"Tissot",               taxa_anual:-0.0020,tier:"premium",      categoria:"relogio", fonte:"manual" },
  { marca_key:"seiko",               marca_display:"Seiko",                taxa_anual:0.0100, tier:"alta",         categoria:"relogio", fonte:"manual" }, // Seiko vintage valoriza
  { marca_key:"casio",               marca_display:"Casio",                taxa_anual:0.0050, tier:"alta",         categoria:"relogio", fonte:"manual" }, // G-Shock raros valorizam
  { marca_key:"baume & mercier",     marca_display:"Baume & Mercier",      taxa_anual:-0.0030,tier:"premium",      categoria:"relogio", fonte:"manual" },

  // ── MALAS — comportamento diferente por sub-marca ───────────────────────
  { marca_key:"hermès",              marca_display:"Hermès",               taxa_anual:0.0750, tier:"investimento", categoria:"mala",    fonte:"Vestiaire Collective 2024" },
  { marca_key:"hermes",              marca_display:"Hermès",               taxa_anual:0.0750, tier:"investimento", categoria:"mala",    fonte:"Vestiaire Collective 2024" },
  { marca_key:"chanel",              marca_display:"Chanel",               taxa_anual:0.0550, tier:"investimento", categoria:"mala",    fonte:"Vestiaire Collective 2024" },
  { marca_key:"louis vuitton",       marca_display:"Louis Vuitton",        taxa_anual:0.0300, tier:"investimento", categoria:"mala",    fonte:"Vestiaire Collective 2024" },
  { marca_key:"lv",                  marca_display:"Louis Vuitton",        taxa_anual:0.0300, tier:"investimento", categoria:"mala",    fonte:"Vestiaire Collective 2024" },
  { marca_key:"delvaux",             marca_display:"Delvaux",              taxa_anual:0.0250, tier:"investimento", categoria:"mala",    fonte:"manual" },
  { marca_key:"goyard",              marca_display:"Goyard",               taxa_anual:0.0220, tier:"investimento", categoria:"mala",    fonte:"manual" },
  { marca_key:"bottega veneta",      marca_display:"Bottega Veneta",       taxa_anual:0.0100, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"gucci",               marca_display:"Gucci",                taxa_anual:0.0000, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"prada",               marca_display:"Prada",                taxa_anual:0.0000, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"dior",                marca_display:"Dior",                 taxa_anual:0.0050, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"christian dior",      marca_display:"Christian Dior",       taxa_anual:0.0050, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"saint laurent",       marca_display:"Saint Laurent",        taxa_anual:0.0000, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"ysl",                 marca_display:"Saint Laurent",        taxa_anual:0.0000, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"celine",              marca_display:"Celine",               taxa_anual:-0.0050,tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"céline",              marca_display:"Céline",               taxa_anual:-0.0050,tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"balenciaga",          marca_display:"Balenciaga",           taxa_anual:-0.0100,tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" },
  { marca_key:"fendi",               marca_display:"Fendi",                taxa_anual:0.0020, tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"loewe",               marca_display:"Loewe",                taxa_anual:0.0150, tier:"premium",      categoria:"mala",    fonte:"Vestiaire 2024" }, // Puzzle bag valoriza
  { marca_key:"mulberry",            marca_display:"Mulberry",             taxa_anual:-0.0050,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"burberry",            marca_display:"Burberry",             taxa_anual:-0.0020,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"michael kors",        marca_display:"Michael Kors",         taxa_anual:-0.0150,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"coach",               marca_display:"Coach",                taxa_anual:-0.0100,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"longchamp",           marca_display:"Longchamp",            taxa_anual:-0.0080,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"furla",               marca_display:"Furla",                taxa_anual:-0.0120,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"tory burch",          marca_display:"Tory Burch",           taxa_anual:-0.0100,tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"polene",              marca_display:"Polène",               taxa_anual:0.0050, tier:"premium",      categoria:"mala",    fonte:"manual" },
  { marca_key:"polène",              marca_display:"Polène",               taxa_anual:0.0050, tier:"premium",      categoria:"mala",    fonte:"manual" },

  // ── JOALHARIA ───────────────────────────────────────────────────────────
  { marca_key:"cartier",             marca_display:"Cartier",              taxa_anual:0.0380, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"van cleef & arpels",  marca_display:"Van Cleef & Arpels",   taxa_anual:0.0450, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"van cleef",           marca_display:"Van Cleef & Arpels",   taxa_anual:0.0450, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"bulgari",             marca_display:"Bulgari",              taxa_anual:0.0220, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"bvlgari",             marca_display:"Bulgari",              taxa_anual:0.0220, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"tiffany",             marca_display:"Tiffany & Co.",        taxa_anual:0.0180, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"tiffany & co",        marca_display:"Tiffany & Co.",        taxa_anual:0.0180, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"harry winston",       marca_display:"Harry Winston",        taxa_anual:0.0350, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"graff",               marca_display:"Graff",                taxa_anual:0.0300, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"chopard",             marca_display:"Chopard",              taxa_anual:0.0150, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"boucheron",           marca_display:"Boucheron",            taxa_anual:0.0200, tier:"investimento", categoria:"joalharia",fonte:"manual" },
  { marca_key:"piaget",              marca_display:"Piaget",               taxa_anual:0.0180, tier:"investimento", categoria:"joalharia",fonte:"manual" },

  // ── ROUPA — praticamente nada aprecia (excepção: peças vintage iconicas) ──
  { marca_key:"valentino",           marca_display:"Valentino",            taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" },
  { marca_key:"versace",             marca_display:"Versace",              taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" },
  { marca_key:"givenchy",            marca_display:"Givenchy",             taxa_anual:-0.0050,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"jacquemus",           marca_display:"Jacquemus",            taxa_anual:0.0050, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" },
  { marca_key:"isabel marant",       marca_display:"Isabel Marant",        taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"loro piana",          marca_display:"Loro Piana",           taxa_anual:0.0100, tier:"premium",      categoria:"roupa",   fonte:"manual" }, // qualidade excepcional
  { marca_key:"brunello cucinelli",  marca_display:"Brunello Cucinelli",   taxa_anual:0.0080, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"max mara",            marca_display:"Max Mara",             taxa_anual:0.0050, tier:"premium",      categoria:"roupa",   fonte:"manual" }, // casacos retêm valor
  { marca_key:"vivienne westwood",   marca_display:"Vivienne Westwood",    taxa_anual:0.0100, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" }, // vintage valoriza
  { marca_key:"marni",               marca_display:"Marni",                taxa_anual:0.0030, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"miu miu",             marca_display:"Miu Miu",              taxa_anual:0.0200, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" }, // trend 2023-24
  { marca_key:"off-white",           marca_display:"Off-White",            taxa_anual:0.0050, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"off white",           marca_display:"Off-White",            taxa_anual:0.0050, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"alexander mcqueen",   marca_display:"Alexander McQueen",    taxa_anual:0.0050, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"stella mccartney",    marca_display:"Stella McCartney",     taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"balmain",             marca_display:"Balmain",              taxa_anual:-0.0050,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"dsquared2",           marca_display:"Dsquared2",            taxa_anual:-0.0080,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"roberto cavalli",     marca_display:"Roberto Cavalli",      taxa_anual:-0.0100,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"dolce & gabbana",     marca_display:"Dolce & Gabbana",      taxa_anual:-0.0080,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"d&g",                 marca_display:"Dolce & Gabbana",      taxa_anual:-0.0080,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"giorgio armani",      marca_display:"Giorgio Armani",       taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"emporio armani",      marca_display:"Emporio Armani",       taxa_anual:-0.0050,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"ralph lauren",        marca_display:"Ralph Lauren",         taxa_anual:0.0000, tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"sandro",              marca_display:"Sandro",               taxa_anual:-0.0050,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"maje",                marca_display:"Maje",                 taxa_anual:-0.0060,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"ba&sh",               marca_display:"Ba&sh",                taxa_anual:-0.0050,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"zara",                marca_display:"Zara",                 taxa_anual:-0.0200,tier:"alta",         categoria:"roupa",   fonte:"manual" }, // deprecia depressa
  { marca_key:"mango",               marca_display:"Mango",                taxa_anual:-0.0180,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"cos",                 marca_display:"COS",                  taxa_anual:-0.0100,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"massimo dutti",       marca_display:"Massimo Dutti",        taxa_anual:-0.0120,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"hugo boss",           marca_display:"Hugo Boss",            taxa_anual:-0.0100,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"calvin klein",        marca_display:"Calvin Klein",         taxa_anual:-0.0120,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"tommy hilfiger",      marca_display:"Tommy Hilfiger",       taxa_anual:-0.0100,tier:"alta",         categoria:"roupa",   fonte:"manual" },
  { marca_key:"lacoste",             marca_display:"Lacoste",              taxa_anual:-0.0080,tier:"alta",         categoria:"roupa",   fonte:"manual" },

  // ── CALÇADO ─────────────────────────────────────────────────────────────
  { marca_key:"christian louboutin", marca_display:"Christian Louboutin",  taxa_anual:0.0100, tier:"premium",      categoria:"calcado", fonte:"Vestiaire 2024" },
  { marca_key:"louboutin",           marca_display:"Christian Louboutin",  taxa_anual:0.0100, tier:"premium",      categoria:"calcado", fonte:"Vestiaire 2024" },
  { marca_key:"jimmy choo",          marca_display:"Jimmy Choo",           taxa_anual:-0.0050,tier:"premium",      categoria:"calcado", fonte:"manual" },
  { marca_key:"manolo blahnik",      marca_display:"Manolo Blahnik",       taxa_anual:0.0050, tier:"premium",      categoria:"calcado", fonte:"manual" },
  { marca_key:"gianvito rossi",      marca_display:"Gianvito Rossi",       taxa_anual:0.0000, tier:"premium",      categoria:"calcado", fonte:"manual" },
  { marca_key:"aquazzura",           marca_display:"Aquazzura",            taxa_anual:0.0000, tier:"premium",      categoria:"calcado", fonte:"manual" },
  { marca_key:"roger vivier",        marca_display:"Roger Vivier",         taxa_anual:0.0050, tier:"premium",      categoria:"calcado", fonte:"manual" },
  { marca_key:"nike",                marca_display:"Nike",                 taxa_anual:0.0200, tier:"alta",         categoria:"calcado", fonte:"manual" }, // Jordans/colabs valorizam
  { marca_key:"adidas",              marca_display:"Adidas",               taxa_anual:0.0150, tier:"alta",         categoria:"calcado", fonte:"manual" }, // Yeezys/Stan Smith raros
  { marca_key:"new balance",         marca_display:"New Balance",          taxa_anual:0.0100, tier:"alta",         categoria:"calcado", fonte:"manual" },
  { marca_key:"converse",            marca_display:"Converse",             taxa_anual:-0.0050,tier:"alta",         categoria:"calcado", fonte:"manual" },
  { marca_key:"vans",                marca_display:"Vans",                 taxa_anual:-0.0050,tier:"alta",         categoria:"calcado", fonte:"manual" },
  { marca_key:"ugg",                 marca_display:"UGG",                  taxa_anual:-0.0100,tier:"alta",         categoria:"calcado", fonte:"manual" },
  { marca_key:"clarks",              marca_display:"Clarks",               taxa_anual:-0.0080,tier:"alta",         categoria:"calcado", fonte:"manual" },

  // ── SPORTSWEAR ──────────────────────────────────────────────────────────
  { marca_key:"lululemon",           marca_display:"Lululemon",            taxa_anual:0.0050, tier:"premium",      categoria:"sportswear",fonte:"manual" },
  { marca_key:"gymshark",            marca_display:"Gymshark",             taxa_anual:-0.0100,tier:"alta",         categoria:"sportswear",fonte:"manual" },
  { marca_key:"stone island",        marca_display:"Stone Island",         taxa_anual:0.0200, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" }, // streetwear premium
  { marca_key:"moncler",             marca_display:"Moncler",              taxa_anual:0.0100, tier:"premium",      categoria:"roupa",   fonte:"Vestiaire 2024" },
  { marca_key:"canada goose",        marca_display:"Canada Goose",         taxa_anual:-0.0050,tier:"premium",      categoria:"roupa",   fonte:"manual" },
  { marca_key:"patagonia",           marca_display:"Patagonia",            taxa_anual:0.0050, tier:"alta",         categoria:"roupa",   fonte:"manual" },

  // ── NORA GREI — marca própria ────────────────────────────────────────────
  { marca_key:"nora grei",           marca_display:"Nora Grei",            taxa_anual:0.0400, tier:"investimento", categoria:"roupa",   fonte:"plataforma" },
  { marca_key:"nora grey",           marca_display:"Nora Grei",            taxa_anual:0.0400, tier:"investimento", categoria:"roupa",   fonte:"plataforma" },
  { marca_key:"noragrei",            marca_display:"Nora Grei",            taxa_anual:0.0400, tier:"investimento", categoria:"roupa",   fonte:"plataforma" },
  { marca_key:"noragrey",            marca_display:"Nora Grei",            taxa_anual:0.0400, tier:"investimento", categoria:"roupa",   fonte:"plataforma" },
];

export async function GET(request) {
  // Verificar autorização (Vercel Cron secret ou admin)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resultados = { atualizadas: 0, erros: [], total: TAXAS_REFERENCIA.length };

    // Upsert em lote — actualiza se existir, insere se não existir
    const { error } = await supabase
      .from("marca_aprec_rates")
      .upsert(
        TAXAS_REFERENCIA.map(r => ({
          ...r,
          ultima_atualizacao: new Date().toISOString(),
        })),
        { onConflict: "marca_key" }
      );

    if (error) {
      console.error("[calibrar-marcas] Erro upsert:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    resultados.atualizadas = TAXAS_REFERENCIA.length;

    console.log(`[calibrar-marcas] ✅ ${resultados.atualizadas} marcas actualizadas`);
    return Response.json({
      success: true,
      ...resultados,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("[calibrar-marcas] Erro inesperado:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
