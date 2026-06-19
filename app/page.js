const carregarConteudo = async () => {
    // Buscar configuração manual da landing primeiro
    const { data: cfg } = await supabase.from("configuracoes").select("*").maybeSingle();
    if (cfg?.video_landing_url) setVideoUrl(cfg.video_landing_url);

    const { data: todasPecas } = await supabase
      .from("pecas").select("id, nome, fotos, ocasioes, preco_aluguer_dia, destaque")
      .not("fotos", "is", null);

    // HERO: prioridade — escolha manual > destaque > primeira disponível
    if (cfg?.hero_peca_id) {
      const escolhida = todasPecas?.find(p => p.id === cfg.hero_peca_id);
      if (escolhida?.fotos?.[0]) setHeroPeca(escolhida);
    } else {
      const destaque = todasPecas?.find(p => p.destaque && p.fotos?.[0]);
      if (destaque) setHeroPeca(destaque);
      else if (todasPecas?.[0]?.fotos?.[0]) setHeroPeca(todasPecas[0]);
    }

    if (todasPecas) {
      const mapa = {};
      const mapaCampos = {
        Festa: cfg?.categoria_festa_peca_id,
        Trabalho: cfg?.categoria_trabalho_peca_id,
        Férias: cfg?.categoria_ferias_peca_id,
        Jantar: cfg?.categoria_jantar_peca_id,
      };
      const ocasioesAlvo = ["Festa", "Trabalho", "Férias", "Jantar"];

      ocasioesAlvo.forEach(oc => {
        // Prioridade 1: escolha manual no backoffice
        const idEscolhido = mapaCampos[oc];
        if (idEscolhido) {
          const escolhida = todasPecas.find(p => p.id === idEscolhido);
          if (escolhida?.fotos?.[0]) { mapa[oc] = escolhida.fotos[0]; return; }
        }
        // Prioridade 2: automático por ocasião
        const encontrada = todasPecas.find(p => p.ocasioes?.includes(oc) && p.fotos?.[0]);
        if (encontrada) mapa[oc] = encontrada.fotos[0];
      });

      const restantes = todasPecas.filter(p => p.fotos?.[0]);
      let idx = 0;
      ocasioesAlvo.forEach(oc => {
        if (!mapa[oc] && restantes[idx]) { mapa[oc] = restantes[idx].fotos[0]; idx++; }
      });
      setCategoriaFotos(mapa);
    }
  };