"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useSearchParams } from "next/navigation";

const t = {
  pt: {
    peca: "A tua peça", datas: "Datas de aluguer", dataInicio: "Data de início", dataFim: "Data de fim",
    dias: (n) => `${n} dia${n !== 1 ? "s" : ""}`,
    entrega: "Método de entrega",
    entregaOpcoes: [
      { id: "envio", label: "Envio para casa", desc: "Entrega em 1-2 dias úteis" },
      { id: "presencial", label: "Levantamento presencial", desc: "Junto do lojista" },
    ],
    pagamento: "Método de pagamento",
    pagamentoOpcoes: [
      { id: "cartao", label: "Cartão crédito/débito", desc: "Confirmação imediata", automatico: true },
      { id: "mbway", label: "MB Way", desc: "Confirmação imediata", automatico: true },
      { id: "transferencia", label: "Transferência bancária", desc: "Confirmamos em até 1 dia útil", automatico: false },
      { id: "dinheiro", label: "Dinheiro (presencial)", desc: "Pago no levantamento", automatico: false },
    ],
    deposito: "Depósito de caução", depositoOpcoes: [
      { id: "cartao", label: "Cartão crédito/débito", desc: "Devolvido automaticamente", automatico: true },
      { id: "transferencia", label: "Transferência bancária", desc: "Devolvemos em 2 dias úteis", automatico: false },
      { id: "dinheiro", label: "Dinheiro (presencial)", desc: "Pago e devolvido em mãos", automatico: false },
    ],
    resumo: "Resumo", aluguer: "Aluguer", higienizacao: "Taxa de higienização", depositoVal: "Depósito (devolvido)",
    total: "Total a pagar agora", totalSemDeposito: "* O depósito será devolvido após inspeção da peça",
    confirmar: "Pagar agora", confirmarPendente: "Confirmar pedido",
    login: "Precisa de fazer login para continuar", fazerLogin: "Fazer login",
    tamanho: "Tamanho", voltar: "← Loja",
    sucessoPago: "Pagamento confirmado!", sucessoPendente: "Pedido registado!",
    avisoTransferenciaFinal: "Envia o comprovativo ao lojista. O pedido fica reservado por 24h.",
    avisoDinheiroFinal: "Paga em dinheiro no momento do levantamento presencial.",
    verPedidos: "Ver os meus pedidos",
    avisoPendenteResumo: "⏳ O teu pedido fica pendente até o lojista confirmar o pagamento.",
    avisoMbway: "📱 A aguardar confirmação no MB Way...",
    obrigatorio: "Por favor preencha todos os campos",
    conflito: "Esta peça já está reservada para essas datas. Escolhe outro período.",
    formCartaoNumero: "Número do cartão", formCartaoNome: "Nome no cartão",
    formCartaoValidade: "Validade", formCartaoCvc: "CVC",
    formCartaoNota: "🔒 Pagamento simulado para fins de demonstração.",
    formMbwayTelefone: "Número de telefone associado ao MB Way",
    formMbwayQrTexto: "Confirma o pagamento na app MB Way no teu telemóvel",
    formMbwayNota: "🔒 Pagamento simulado para fins de demonstração.",
    ibanLabel: "IBAN do lojista", ibanValor: "Valor a transferir",
    ibanReferencia: "Referência", ibanReferenciaTexto: "Indica o teu nome completo",
    comprovativoLabel: "Comprovativo de transferência *",
    comprovativoVazio: "📎 Clica para anexar o comprovativo (imagem ou PDF)",
    comprovativoErro: "Anexa o comprovativo da transferência",
    comprovativoErroDeposito: "Anexa o comprovativo da transferência do depósito",
    transferenciaAviso: "O teu pedido fica pendente até o lojista confirmar o comprovativo. Reservamos a peça por 24h.",
    dinheiroAviso: "Paga em dinheiro no momento do levantamento presencial junto do lojista.",
    imediato: "Imediato", confirmacaoManual: "Confirmação manual", aProcessar: "A processar...",
    semCaucao: "Sem caução",
    erroNumCartao: "Número de cartão inválido", erroNomeCartao: "Nome obrigatório",
    erroValidadeCartao: "Validade inválida", erroCvcCartao: "CVC inválido",
    erroTelefone: "Telefone inválido",
  },
  fr: {
    peca: "Votre pièce", datas: "Dates de location", dataInicio: "Date de début", dataFim: "Date de fin",
    dias: (n) => `${n} jour${n !== 1 ? "s" : ""}`,
    entrega: "Mode de livraison",
    entregaOpcoes: [
      { id: "envio", label: "Livraison à domicile", desc: "Livraison en 1-2 jours ouvrés" },
      { id: "presencial", label: "Retrait en boutique", desc: "Chez le vendeur" },
    ],
    pagamento: "Mode de paiement",
    pagamentoOpcoes: [
      { id: "cartao", label: "Carte crédit/débit", desc: "Confirmation immédiate", automatico: true },
      { id: "mbway", label: "MB Way", desc: "Confirmation immédiate", automatico: true },
      { id: "transferencia", label: "Virement bancaire", desc: "Confirmé sous 1 jour ouvré", automatico: false },
      { id: "dinheiro", label: "Espèces (en personne)", desc: "Payé au retrait", automatico: false },
    ],
    deposito: "Dépôt de garantie", depositoOpcoes: [
      { id: "cartao", label: "Carte crédit/débit", desc: "Remboursé automatiquement", automatico: true },
      { id: "transferencia", label: "Virement bancaire", desc: "Remboursé sous 2 jours", automatico: false },
      { id: "dinheiro", label: "Espèces (en personne)", desc: "Payé et remboursé en main propre", automatico: false },
    ],
    resumo: "Résumé", aluguer: "Location", higienizacao: "Frais d'hygiène", depositoVal: "Dépôt (remboursé)",
    total: "Total à payer maintenant", totalSemDeposito: "* Le dépôt sera remboursé après inspection",
    confirmar: "Payer maintenant", confirmarPendente: "Confirmer la commande",
    login: "Vous devez vous connecter pour continuer", fazerLogin: "Se connecter",
    tamanho: "Taille", voltar: "← Boutique",
    sucessoPago: "Paiement confirmé!", sucessoPendente: "Commande enregistrée!",
    avisoTransferenciaFinal: "Envoyez le justificatif au vendeur. La commande est réservée 24h.",
    avisoDinheiroFinal: "Payez en espèces lors du retrait.",
    verPedidos: "Voir mes commandes",
    avisoPendenteResumo: "⏳ Votre commande est en attente de confirmation du vendeur.",
    avisoMbway: "📱 En attente de confirmation MB Way...",
    obrigatorio: "Veuillez remplir tous les champs",
    conflito: "Cette pièce est déjà réservée pour ces dates.",
    formCartaoNumero: "Numéro de carte", formCartaoNome: "Nom sur la carte",
    formCartaoValidade: "Validité", formCartaoCvc: "CVC",
    formCartaoNota: "🔒 Paiement simulé à des fins de démonstration.",
    formMbwayTelefone: "Numéro de téléphone MB Way",
    formMbwayQrTexto: "Confirmez le paiement dans l'app MB Way",
    formMbwayNota: "🔒 Paiement simulé à des fins de démonstration.",
    ibanLabel: "IBAN du vendeur", ibanValor: "Montant à virer",
    ibanReferencia: "Référence", ibanReferenciaTexto: "Indiquez votre nom complet",
    comprovativoLabel: "Justificatif de virement *",
    comprovativoVazio: "📎 Cliquez pour joindre le justificatif",
    comprovativoErro: "Joignez le justificatif du virement",
    comprovativoErroDeposito: "Joignez le justificatif du dépôt",
    transferenciaAviso: "Votre commande est en attente de confirmation. Réservée 24h.",
    dinheiroAviso: "Payez en espèces lors du retrait chez le vendeur.",
    imediato: "Immédiat", confirmacaoManual: "Confirmation manuelle", aProcessar: "Traitement...",
    semCaucao: "Sans caution",
    erroNumCartao: "Numéro de carte invalide", erroNomeCartao: "Nom obligatoire",
    erroValidadeCartao: "Validité invalide", erroCvcCartao: "CVC invalide",
    erroTelefone: "Téléphone invalide",
  },
  lt: {
    peca: "Jūsų drabužis", datas: "Nuomos datos", dataInicio: "Pradžios data", dataFim: "Pabaigos data",
    dias: (n) => `${n} diena${n !== 1 ? "s" : ""}`,
    entrega: "Pristatymo būdas",
    entregaOpcoes: [
      { id: "envio", label: "Pristatymas į namus", desc: "1-2 darbo dienų" },
      { id: "presencial", label: "Atsiėmimas pas pardavėją", desc: "Pas pardavėją" },
    ],
    pagamento: "Mokėjimo būdas",
    pagamentoOpcoes: [
      { id: "cartao", label: "Kredito/debeto kortelė", desc: "Patvirtinimas iš karto", automatico: true },
      { id: "mbway", label: "MB Way", desc: "Patvirtinimas iš karto", automatico: true },
      { id: "transferencia", label: "Banko pavedimas", desc: "Patvirtinimas per 1 darbo dieną", automatico: false },
      { id: "dinheiro", label: "Grynaisiais", desc: "Mokama atsiimant", automatico: false },
    ],
    deposito: "Užstatas", depositoOpcoes: [
      { id: "cartao", label: "Kredito/debeto kortelė", desc: "Grąžinama automatiškai", automatico: true },
      { id: "transferencia", label: "Banko pavedimas", desc: "Grąžinama per 2 darbo dienas", automatico: false },
      { id: "dinheiro", label: "Grynaisiais", desc: "Mokama ir grąžinama asmeniškai", automatico: false },
    ],
    resumo: "Santrauka", aluguer: "Nuoma", higienizacao: "Valymo mokestis", depositoVal: "Užstatas (grąžinamas)",
    total: "Iš viso mokėti dabar", totalSemDeposito: "* Užstatas bus grąžintas po patikrinimo",
    confirmar: "Mokėti dabar", confirmarPendente: "Patvirtinti užsakymą",
    login: "Reikia prisijungti", fazerLogin: "Prisijungti",
    tamanho: "Dydis", voltar: "← Parduotuvė",
    sucessoPago: "Mokėjimas patvirtintas!", sucessoPendente: "Užsakymas užregistruotas!",
    avisoTransferenciaFinal: "Siųskite patvirtinimą pardavėjui. Užsakymas rezervuotas 24 val.",
    avisoDinheiroFinal: "Mokėkite grynaisiais atsiimant.",
    verPedidos: "Žiūrėti užsakymus",
    avisoPendenteResumo: "⏳ Užsakymas laukia pardavėjo patvirtinimo.",
    avisoMbway: "📱 Laukiama MB Way patvirtinimo...",
    obrigatorio: "Užpildykite visus laukus",
    conflito: "Šis drabužis jau rezervuotas toms datoms.",
    formCartaoNumero: "Kortelės numeris", formCartaoNome: "Vardas ant kortelės",
    formCartaoValidade: "Galiojimas", formCartaoCvc: "CVC",
    formCartaoNota: "🔒 Mokėjimas imituojamas demonstracijos tikslais.",
    formMbwayTelefone: "MB Way telefono numeris",
    formMbwayQrTexto: "Patvirtinkite mokėjimą MB Way programoje",
    formMbwayNota: "🔒 Mokėjimas imituojamas demonstracijos tikslais.",
    ibanLabel: "Pardavėjo IBAN", ibanValor: "Pervedama suma",
    ibanReferencia: "Nuoroda", ibanReferenciaTexto: "Nurodykite savo pilną vardą",
    comprovativoLabel: "Pavedimo patvirtinimas *",
    comprovativoVazio: "📎 Spustelėkite, kad pridėtumėte patvirtinimą",
    comprovativoErro: "Pridėkite pavedimo patvirtinimą",
    comprovativoErroDeposito: "Pridėkite užstato pavedimo patvirtinimą",
    transferenciaAviso: "Užsakymas laukia patvirtinimo. Rezervuota 24 val.",
    dinheiroAviso: "Mokėkite grynaisiais atsiimant pas pardavėją.",
    imediato: "Iš karto", confirmacaoManual: "Rankinis patvirtinimas", aProcessar: "Apdorojama...",
    semCaucao: "Be užstato",
    erroNumCartao: "Neteisingas kortelės numeris", erroNomeCartao: "Vardas privalomas",
    erroValidadeCartao: "Neteisingas galiojimas", erroCvcCartao: "Neteisingas CVC",
    erroTelefone: "Neteisingas telefono numeris",
  },
};

const HIGIENIZACAO = 5;

function gerarNumeroRecibo() {
  const ano = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LJ-${ano}-${rand}`;
}

function FormularioCartao({ dados, setDados, erro, i }) {
  const formatarNumero = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  const formatarValidade = (v) => { const l = v.replace(/\D/g, "").slice(0, 4); if (l.length >= 3) return l.slice(0,2)+"/"+l.slice(2); return l; };
  return (
    <div className="form-pag">
      <div className="fg"><label className="lbl">{i.formCartaoNumero}</label><input className="inp" placeholder="1234 5678 9012 3456" value={dados.numero||""} onChange={e=>setDados(d=>({...d,numero:formatarNumero(e.target.value)}))} maxLength={19}/></div>
      <div className="fg"><label className="lbl">{i.formCartaoNome}</label><input className="inp" placeholder="MARIA SILVA" value={dados.nome||""} onChange={e=>setDados(d=>({...d,nome:e.target.value.toUpperCase()}))}/></div>
      <div className="row2">
        <div className="fg"><label className="lbl">{i.formCartaoValidade}</label><input className="inp" placeholder="MM/AA" value={dados.validade||""} onChange={e=>setDados(d=>({...d,validade:formatarValidade(e.target.value)}))} maxLength={5}/></div>
        <div className="fg"><label className="lbl">{i.formCartaoCvc}</label><input className="inp" placeholder="123" value={dados.cvc||""} onChange={e=>setDados(d=>({...d,cvc:e.target.value.replace(/\D/g,"").slice(0,3)}))} maxLength={3}/></div>
      </div>
      {erro && <p className="erro-campo">{erro}</p>}
      <p className="nota-seguranca">{i.formCartaoNota}</p>
    </div>
  );
}

function FormularioMBWay({ telefone, setTelefone, qrAtivo, erro, i }) {
  return (
    <div className="form-pag">
      <div className="fg"><label className="lbl">{i.formMbwayTelefone}</label><input className="inp" placeholder="+351 912 345 678" value={telefone} onChange={e=>setTelefone(e.target.value)}/></div>
      {erro && <p className="erro-campo">{erro}</p>}
      {qrAtivo && (<div className="qr-box"><div className="qr-placeholder"><svg viewBox="0 0 100 100" width="120" height="120"><rect width="100" height="100" fill="#fff"/><rect x="5" y="5" width="20" height="20" fill="#080808"/><rect x="30" y="5" width="10" height="10" fill="#080808"/><rect x="75" y="5" width="20" height="20" fill="#080808"/><rect x="5" y="75" width="20" height="20" fill="#080808"/><rect x="45" y="20" width="10" height="10" fill="#080808"/><rect x="60" y="35" width="15" height="15" fill="#080808"/><rect x="20" y="45" width="10" height="30" fill="#080808"/><rect x="45" y="55" width="20" height="10" fill="#080808"/><rect x="75" y="50" width="15" height="15" fill="#080808"/><rect x="50" y="75" width="25" height="10" fill="#080808"/></svg></div><p className="qr-texto">{i.formMbwayQrTexto}</p></div>)}
      <p className="nota-seguranca">{i.formMbwayNota}</p>
    </div>
  );
}

function InfoTransferencia({ valor, iban, comprovativo, setComprovativo, erro, i }) {
  return (
    <div className="form-pag">
      <div className="iban-box">
        <p className="iban-label">{i.ibanLabel}</p>
        <p className="iban-val">{iban || "—"}</p>
        <p className="iban-label" style={{marginTop:"0.75rem"}}>{i.ibanValor}</p>
        <p className="iban-val">{typeof valor === "number" ? valor.toFixed(2) : valor}€</p>
        <p className="iban-label" style={{marginTop:"0.75rem"}}>{i.ibanReferencia}</p>
        <p className="iban-val">{i.ibanReferenciaTexto}</p>
      </div>
      <div className="fg">
        <label className="lbl">{i.comprovativoLabel}</label>
        <label className="upload-box">
          <input type="file" accept="image/*,.pdf" onChange={e=>setComprovativo(e.target.files?.[0]||null)} style={{display:"none"}}/>
          {comprovativo ? <span className="upload-ok">✓ {comprovativo.name}</span> : <span className="upload-vazio">{i.comprovativoVazio}</span>}
        </label>
        {erro && <p className="erro-campo">{erro}</p>}
      </div>
      <p className="nota-aviso">{i.transferenciaAviso}</p>
    </div>
  );
}

function InfoDinheiro({ i }) {
  return <div className="form-pag"><p className="nota-aviso">{i.dinheiroAviso}</p></div>;
}

function Talao({ recibo, peca, tamanhoNome, dataInicio, dataFim, valorAluguer, valorDeposito, automatico, i, nomeLojista }) {
  return (
    <div className="talao">
      <div className="talao-header">
        <span className="talao-logo">{nomeLojista || "LOJA"}</span>
        <span className="talao-num">{recibo.numero}</span>
      </div>
      <div className="talao-linha"><span>Data</span><span>{new Date(recibo.created_at).toLocaleString("pt-PT")}</span></div>
      <div className="talao-linha"><span>{i.peca}</span><span>{peca?.nome}</span></div>
      {tamanhoNome && <div className="talao-linha"><span>{i.tamanho}</span><span>{tamanhoNome}</span></div>}
      <div className="talao-linha"><span>{dataInicio} → {dataFim}</span></div>
      <div className="talao-linha"><span>{i.pagamento}</span><span style={{textTransform:"capitalize"}}>{recibo.metodo_pagamento}</span></div>
      <div className="talao-sep"/>
      <div className="talao-linha"><span>{i.aluguer}</span><span>{valorAluguer.toFixed(2)}€</span></div>
      <div className="talao-linha"><span>{i.higienizacao}</span><span>{HIGIENIZACAO}€</span></div>
      <div className="talao-linha"><span>{i.depositoVal}</span><span>{valorDeposito.toFixed(2)}€</span></div>
      <div className="talao-sep"/>
      <div className="talao-total"><span>{i.total}</span><span>{recibo.valor_total.toFixed(2)}€</span></div>
      <div className="talao-estado" style={{color:automatico?"#27ae60":"#f39c12"}}>{automatico?"✓":"⏳"}</div>
    </div>
  );
}

function CheckoutLojaContent() {
  const { codigo } = useParams();
  const searchParams = useSearchParams();
  const pecaId = searchParams.get("peca");
  const tamanhoParam = searchParams.get("tamanho");
  const modoCompra = searchParams.get("modo") === "comprar_usada";

  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [peca, setPeca] = useState(null);
  const [lojista, setLojista] = useState(null);
  const [tamanhoNome, setTamanhoNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entrega, setEntrega] = useState("presencial");
  const [pagamento, setPagamento] = useState("cartao");
  const [deposito, setDeposito] = useState("cartao");
  const [dadosCartao, setDadosCartao] = useState({});
  const [telefoneMbway, setTelefoneMbway] = useState("");
  const [qrAtivo, setQrAtivo] = useState(false);
  const [comprovativoPagamento, setComprovativoPagamento] = useState(null);
  const [comprovativoDeposito, setComprovativoDeposito] = useState(null);
  const [erroComprovativo, setErroComprovativo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [erroCampo, setErroCampo] = useState("");
  const [recibo, setRecibo] = useState(null);

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && t[saved]) setLang(saved);
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    // Buscar lojista
    if (codigo) {
      const { data: cli } = await supabase.from("clientes").select("id, nome, iban").eq("codigo_cliente", codigo).maybeSingle();
      if (cli) setLojista(cli);
    }

    // Buscar peça do lojista
    if (pecaId) {
      const { data } = await supabase.from("pecas_lojista").select("*, stock_lojista(id, tamanho)").eq("id", pecaId).maybeSingle();
      if (data) {
        setPeca(data);
        if (tamanhoParam) {
          const st = data.stock_lojista?.find(s => s.id === tamanhoParam);
          if (st) setTamanhoNome(st.tamanho);
        }
      }
    }
  };

  const i = t[lang] || t.pt;

  const numDias = dataInicio && dataFim ? Math.max(1, Math.ceil((new Date(dataFim) - new Date(dataInicio)) / 86400000)) : 0;
  const valorAluguer = peca ? (peca.preco_aluguer_dia || 0) * numDias : 0;
  const valorDepositoBase = peca ? (peca.preco_venda || 0) : 0;
  const valorDeposito = valorDepositoBase > 0 ? Math.round(valorDepositoBase * 0.3) : 0; // 30% do valor de venda como caução

  const pagamentoSelecionado = i.pagamentoOpcoes.find(p => p.id === pagamento);
  const depositoSelecionado = i.depositoOpcoes.find(p => p.id === deposito);
  const tudoAutomatico = pagamentoSelecionado?.automatico && (valorDeposito === 0 || depositoSelecionado?.automatico);

  const totalAgora = valorAluguer + HIGIENIZACAO + (deposito === "cartao" ? valorDeposito : 0);

  const validarFormularioPagamento = () => {
    if (pagamento === "cartao") {
      if (!dadosCartao.numero || dadosCartao.numero.replace(/\s/g,"").length < 16) { setErroCampo(i.erroNumCartao); return false; }
      if (!dadosCartao.nome) { setErroCampo(i.erroNomeCartao); return false; }
      if (!dadosCartao.validade || dadosCartao.validade.length < 5) { setErroCampo(i.erroValidadeCartao); return false; }
      if (!dadosCartao.cvc || dadosCartao.cvc.length < 3) { setErroCampo(i.erroCvcCartao); return false; }
    }
    if (pagamento === "mbway") {
      if (!telefoneMbway || telefoneMbway.replace(/\D/g,"").length < 9) { setErroCampo(i.erroTelefone); return false; }
    }
    if (pagamento === "transferencia" && !comprovativoPagamento) { setErroComprovativo(i.comprovativoErro); return false; }
    if (deposito === "transferencia" && !comprovativoDeposito && pagamento !== "transferencia") { setErroComprovativo(i.comprovativoErroDeposito); return false; }
    setErroCampo(""); setErroComprovativo("");
    return true;
  };

  const confirmar = async () => {
    if (!modoCompra && (!dataInicio || !dataFim)) { setErro(i.obrigatorio); return; }
    if (!user) { window.location.href = `/entrar?redirect=/loja/${codigo}/checkout?peca=${pecaId}&tamanho=${tamanhoParam}`; return; }
    if (pagamento === "mbway" && !qrAtivo) {
      if (!validarFormularioPagamento()) return;
      setQrAtivo(true); setLoading(true);
      setTimeout(() => { finalizar(); }, 2500);
      return;
    }
    if (!validarFormularioPagamento()) return;
    setLoading(true); setErro("");
    if (pagamento === "cartao") { setTimeout(() => { finalizar(); }, 1200); return; }
    finalizar();
  };

  const finalizar = async () => {
    try {
      const pagamentoAutomatico = pagamentoSelecionado?.automatico;
      const depositoAutomatico = valorDeposito === 0 || depositoSelecionado?.automatico;
      const tudoConfirmado = pagamentoAutomatico && depositoAutomatico;
      const estadoInicial = tudoConfirmado ? "confirmado" : "pendente";

      let urlComprovativo = null;
      if (comprovativoPagamento) {
        const ext = comprovativoPagamento.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-loja-pag.${ext}`;
        const { error: upErr } = await supabase.storage.from("comprovativos").upload(path, comprovativoPagamento, { upsert: true });
        if (!upErr) { const { data } = supabase.storage.from("comprovativos").getPublicUrl(path); urlComprovativo = data.publicUrl; }
      }

      const valorFinal = modoCompra ? (peca?.preco_avulso || 0) : valorAluguer;

      // Registar aluguer na tabela de alugueres do lojista
      const { data: novoAluguer, error } = await supabase.from("alugueres_lojista").insert({
        cliente_id: user.id,
        lojista_id: lojista?.id,
        peca_lojista_id: pecaId,
        stock_lojista_id: tamanhoParam || null,
        ...(modoCompra ? {} : { data_inicio: dataInicio, data_fim: dataFim }),
        tipo: modoCompra ? "compra_usada" : "avulso",
        estado: estadoInicial,
        metodo_entrega: entrega,
        metodo_pagamento: pagamento,
        valor_aluguer: valorFinal,
        ...(modoCompra ? { deposito_valor: 0, deposito_estado: "nao_aplicavel" } : {
          deposito_valor: valorDeposito,
          deposito_modalidade: deposito,
          deposito_estado: depositoAutomatico ? "recebido" : "pendente",
        }),
      }).select().single();
      if (error) throw error;

      const numeroRecibo = gerarNumeroRecibo();
      const { data: reciboData } = await supabase.from("recibos").insert({
        numero: numeroRecibo,
        aluguer_id: null,
        aluguer_lojista_id: novoAluguer.id,
        cliente_id: user.id,
        metodo_pagamento: pagamento,
        valor_aluguer: valorAluguer,
        valor_higienizacao: HIGIENIZACAO,
        valor_deposito: valorDeposito,
        valor_total: totalAgora,
        estado: tudoConfirmado ? "pago" : "pendente",
        comprovativo_url: urlComprovativo,
        detalhes: { entrega, deposito_modalidade: deposito, peca_nome: peca?.nome, tamanho: tamanhoNome, loja: codigo },
      }).select().single();

      setRecibo(reciboData);
    } catch(e) { setErro(e.message); }
    setLoading(false); setQrAtivo(false);
  };

  if (recibo) {
    const automatico = recibo.estado === "pago";
    return (
      <div className="pagina-sucesso">
        <style>{ESTILOS}</style>
        <div className="sucesso-icon">{automatico ? "🎉" : "⏳"}</div>
        <h1 className="sucesso-titulo">{automatico ? i.sucessoPago : i.sucessoPendente}</h1>
        <Talao recibo={recibo} peca={peca} tamanhoNome={tamanhoNome} dataInicio={dataInicio} dataFim={dataFim} valorAluguer={valorAluguer} valorDeposito={valorDeposito} automatico={automatico} i={i} nomeLojista={lojista?.nome?.toUpperCase()} />
        {!automatico && pagamento === "transferencia" && <div className="aviso-final aviso-amarelo">{i.avisoTransferenciaFinal}</div>}
        {!automatico && pagamento === "dinheiro" && <div className="aviso-final aviso-cinza">{i.avisoDinheiroFinal}</div>}
        <a href="/pedidos" className="btn-pedidos">{i.verPedidos}</a>
      </div>
    );
  }

  return (
    <>
      <style>{ESTILOS}</style>
      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href={`/loja/${codigo}`} className="nav-back">{i.voltar}</a>
      </nav>
      <div className="page">
        <div>
          <div className="sec">
            <p className="sec-t">{i.peca}</p>
            {peca && (
              <div className="peca-row">
                {peca.fotos?.[0] && <img src={peca.fotos[0]} alt={peca.nome} className="peca-img"/>}
                <div>
                  {lojista && <p className="peca-cat">Loja de {lojista.nome}</p>}
                  <p className="peca-nome">{peca.nome}</p>
                  {tamanhoNome && <p className="peca-tam">{i.tamanho}: {tamanhoNome}</p>}
                  {modoCompra
                    ? <p style={{fontSize:"1rem",color:"var(--black)",fontWeight:500,marginTop:"0.3rem"}}>{peca.preco_avulso}€ — peça usada</p>
                    : peca.preco_aluguer_dia && <p style={{fontSize:"1rem",color:"var(--black)",fontWeight:500,marginTop:"0.3rem"}}>{peca.preco_aluguer_dia}€ {i.dias(1)}</p>
                  }
                </div>
              </div>
            )}
          </div>

          {!modoCompra && <div className="sec">
            <p className="sec-t">{i.datas}</p>
            <div className="dates">
              <div>
                <label className="lbl">{i.dataInicio}</label>
                <input className="inp" type="date" min={hoje} value={dataInicio} onChange={e=>{setDataInicio(e.target.value);if(dataFim&&e.target.value>dataFim)setDataFim("");setErro("");}}/>
              </div>
              <div>
                <label className="lbl">{i.dataFim}</label>
                <input className="inp" type="date" min={dataInicio||hoje} value={dataFim} onChange={e=>{setDataFim(e.target.value);setErro("");}}/>
              </div>
            </div>
            {numDias > 0 && <p style={{fontSize:"0.9rem",color:"#5a5855",marginTop:"0.75rem"}}>{i.dias(numDias)} — {valorAluguer.toFixed(2)}€</p>}
          </div>}

          <div className="sec">
            <p className="sec-t">{i.entrega}</p>
            <div className="opts">
              {i.entregaOpcoes.map(op => (
                <div key={op.id} className={`opt${entrega===op.id?" on":""}`} onClick={()=>setEntrega(op.id)}>
                  <div className="opt-radio"/>
                  <div><div className="opt-label">{op.label}</div><div className="opt-desc">{op.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <p className="sec-t">{i.pagamento}</p>
            <div className="opts">
              {i.pagamentoOpcoes.map(op => (
                <div key={op.id} className={`opt${pagamento===op.id?" on":""}`} onClick={()=>{setPagamento(op.id);setQrAtivo(false);setErroCampo("");setErroComprovativo("");}}>
                  <div className="opt-radio"/>
                  <div>
                    <div className="opt-label">{op.label}<span className={op.automatico?"badge-auto":"badge-manual"}>{op.automatico?i.imediato:i.confirmacaoManual}</span></div>
                    <div className="opt-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {pagamento==="cartao" && <FormularioCartao dados={dadosCartao} setDados={setDadosCartao} erro={erroCampo} i={i}/>}
            {pagamento==="mbway" && <FormularioMBWay telefone={telefoneMbway} setTelefone={setTelefoneMbway} qrAtivo={qrAtivo} erro={erroCampo} i={i}/>}
            {pagamento==="transferencia" && <InfoTransferencia valor={totalAgora} iban={lojista?.iban} comprovativo={comprovativoPagamento} setComprovativo={setComprovativoPagamento} erro={erroComprovativo} i={i}/>}
            {pagamento==="dinheiro" && <InfoDinheiro i={i}/>}
          </div>

          {!modoCompra && valorDeposito > 0 && (
            <div className="sec">
              <p className="sec-t">{i.deposito}</p>
              <div className="opts">
                {i.depositoOpcoes.map(op => (
                  <div key={op.id} className={`opt${deposito===op.id?" on":""}`} onClick={()=>setDeposito(op.id)}>
                    <div className="opt-radio"/>
                    <div>
                      <div className="opt-label">{op.label}<span className={op.automatico?"badge-auto":"badge-manual"}>{op.automatico?i.imediato:i.confirmacaoManual}</span></div>
                      <div className="opt-desc">{op.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {deposito==="transferencia" && pagamento!=="transferencia" && <InfoTransferencia valor={valorDeposito} iban={lojista?.iban} comprovativo={comprovativoDeposito} setComprovativo={setComprovativoDeposito} erro={erroComprovativo} i={i}/>}
            </div>
          )}
        </div>

        <div className="resumo">
          <p className="sec-t">{i.resumo}</p>
          {!user ? (
            <div className="login-box">
              <p>{i.login}</p>
              <a href={`/entrar?redirect=/loja/${codigo}/checkout?peca=${pecaId}&tamanho=${tamanhoParam}`}>{i.fazerLogin}</a>
            </div>
          ) : (
            <>
              {!tudoAutomatico && <div className="aviso-pendente">{i.avisoPendenteResumo}</div>}
              {qrAtivo && <div className="aviso-pendente" style={{background:"#e3f2fd",borderColor:"#1976d2",color:"#1565c0"}}>{i.avisoMbway}</div>}
              {modoCompra ? (
                <>
                  <div className="r-linha"><span>Peça usada</span><span>{(peca?.preco_avulso||0).toFixed(2)}€</span></div>
                  <div className="r-linha"><span>Entrega</span><span>{entrega==="envio"?"A calcular":"Grátis"}</span></div>
                  <div className="r-total"><span>{i.total}</span><span>{(peca?.preco_avulso||0).toFixed(2)}€</span></div>
                </>
              ) : (
                <>
                  <div className="r-linha"><span>{i.aluguer} {numDias>0?`(${i.dias(numDias)})`:""}</span><span>{valorAluguer.toFixed(2)}€</span></div>
                  <div className="r-linha"><span>{i.higienizacao}</span><span>{HIGIENIZACAO}€</span></div>
                  <div className="r-linha"><span>{i.depositoVal}</span><span>{valorDeposito}€</span></div>
                  <div className="r-total"><span>{i.total}</span><span>{totalAgora.toFixed(2)}€</span></div>
                  <p className="r-nota">{i.totalSemDeposito}</p>
                </>
              )}
              {erro && <div className="erro">{erro}</div>}
              <button className="btn" onClick={confirmar} disabled={loading||(!modoCompra&&(!dataInicio||!dataFim))}>
                {loading ? i.aProcessar : (tudoAutomatico ? i.confirmar : i.confirmarPendente)}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
  body{background:var(--g1);font-family:var(--sans);font-weight:400;font-size:17px;-webkit-font-smoothing:antialiased}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
  .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
  .nav-back{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;text-decoration:none}
  .page{padding:6rem 4rem 4rem;max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:2rem;align-items:start}
  .sec{background:var(--white);padding:2rem;margin-bottom:1.5rem}
  .sec-t{font-size:0.78rem;letter-spacing:0.25em;text-transform:uppercase;color:#5a5855;font-weight:500;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--g1)}
  .peca-row{display:flex;gap:1.25rem;align-items:center}
  .peca-img{width:72px;height:90px;object-fit:cover;background:var(--g1);flex-shrink:0}
  .peca-nome{font-family:var(--sans);font-size:1.2rem;font-weight:500;color:var(--black);margin-bottom:0.3rem}
  .peca-cat{font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855}
  .peca-tam{font-size:0.82rem;color:#5a5855;margin-top:0.3rem}
  .dates{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  .lbl{display:block;font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a18;margin-bottom:0.5rem;font-weight:500}
  .inp{width:100%;padding:0.9rem 1rem;border:1.5px solid var(--g2);background:var(--white);font-size:1rem;font-family:var(--sans);color:var(--black);outline:none;transition:border-color 0.2s}
  .inp:focus{border-color:var(--black)}
  .opts{display:flex;flex-direction:column;gap:0.75rem}
  .opt{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border:1.5px solid var(--g2);cursor:pointer;transition:border-color 0.2s;background:var(--white)}
  .opt.on{border-color:var(--black);background:var(--g1)}
  .opt-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--g2);flex-shrink:0;display:flex;align-items:center;justify-content:center}
  .opt.on .opt-radio{border-color:var(--black);background:var(--black)}
  .opt.on .opt-radio::after{content:'';width:6px;height:6px;border-radius:50%;background:var(--white)}
  .opt-label{font-size:0.95rem;font-weight:500;color:var(--black);margin-bottom:0.2rem;display:flex;align-items:center;gap:0.5rem}
  .opt-desc{font-size:0.8rem;color:#5a5855}
  .badge-auto{font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.4rem;background:#e8f5e9;color:#27ae60;font-weight:600}
  .badge-manual{font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.4rem;background:#fff8e1;color:#f39c12;font-weight:600}
  .resumo{background:var(--white);padding:2rem;position:sticky;top:6rem}
  .r-linha{display:flex;justify-content:space-between;font-size:0.95rem;padding:0.6rem 0;border-bottom:1px solid var(--g1);color:#5a5855}
  .r-total{display:flex;justify-content:space-between;font-size:1.1rem;font-weight:500;padding:1rem 0 0;color:var(--black);border-top:2px solid var(--black);margin-top:0.5rem}
  .r-nota{font-size:0.75rem;color:#5a5855;margin-top:0.75rem;line-height:1.5;font-style:italic}
  .btn{width:100%;padding:1.15rem;background:#c4748a;color:#fff;border:none;font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);font-weight:500;cursor:pointer;transition:background 0.2s;margin-top:1.25rem}
  .btn:hover{background:#b5637a}
  .btn:disabled{opacity:0.6;cursor:not-allowed}
  .erro{color:#c0392b;font-size:0.9rem;margin-top:0.75rem;padding:0.75rem;background:#fff5f5;border:1px solid #f5c6cb}
  .erro-campo{color:#c0392b;font-size:0.82rem;margin-top:0.25rem}
  .login-box{text-align:center;padding:3rem}
  .login-box p{font-size:1rem;color:#5a5855;margin-bottom:1.5rem}
  .login-box a{display:inline-block;padding:1rem 2.5rem;background:#c4748a;color:#fff;text-decoration:none;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;font-family:var(--sans);font-weight:500}
  .aviso-pendente{background:#fff8e1;padding:0.85rem 1rem;border-left:3px solid #f39c12;font-size:0.82rem;color:#946200;margin-bottom:1rem;line-height:1.5}
  .form-pag{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--g1);display:flex;flex-direction:column;gap:1rem}
  .fg{display:flex;flex-direction:column;gap:0.4rem}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  .nota-seguranca{font-size:0.72rem;color:#5a5855;font-style:italic}
  .nota-aviso{font-size:0.82rem;color:#946200;background:#fff8e1;padding:0.85rem 1rem;border-left:3px solid #f39c12;line-height:1.5}
  .qr-box{display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:1.5rem;background:var(--g1)}
  .qr-placeholder{background:#fff;padding:0.5rem}
  .qr-texto{font-size:0.82rem;color:#5a5855;text-align:center}
  .iban-box{background:var(--g1);padding:1.25rem}
  .iban-label{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855}
  .iban-val{font-family:var(--sans);font-size:1.1rem;font-weight:500;color:var(--black);margin-top:0.2rem}
  .upload-box{display:block;padding:1rem;border:2px dashed var(--g2);background:var(--g1);cursor:pointer;text-align:center;transition:border-color 0.2s}
  .upload-box:hover{border-color:var(--black)}
  .upload-vazio{font-size:0.82rem;color:#5a5855}
  .upload-ok{font-size:0.82rem;color:#27ae60;font-weight:500}
  .pagina-sucesso{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;padding:3rem 1.5rem;font-family:var(--sans);text-align:center;background:var(--g1)}
  .sucesso-icon{font-size:3rem}
  .sucesso-titulo{font-family:var(--serif);font-size:2.2rem;font-weight:300;color:var(--black)}
  .talao{background:#fff;padding:1.75rem;max-width:380px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  .talao-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:2px dashed var(--g2)}
  .talao-logo{font-family:var(--serif);font-size:1.1rem;letter-spacing:0.15em;text-transform:uppercase}
  .talao-num{font-size:0.68rem;color:#5a5855;font-family:monospace}
  .talao-linha{display:flex;justify-content:space-between;font-size:0.85rem;padding:0.35rem 0;color:#1a1a18}
  .talao-sep{border-top:1px dashed var(--g2);margin:0.5rem 0}
  .talao-total{display:flex;justify-content:space-between;font-size:1.1rem;font-weight:600;padding:0.5rem 0}
  .talao-estado{text-align:center;font-size:1.2rem;font-weight:700;margin-top:0.75rem;padding-top:0.75rem;border-top:2px dashed var(--g2)}
  .aviso-final{max-width:380px;font-size:0.82rem;padding:0.85rem 1rem;line-height:1.5}
  .aviso-amarelo{background:#fff8e1;color:#946200;border-left:3px solid #f39c12}
  .aviso-cinza{background:#f0eeeb;color:#5a5855;border-left:3px solid #888}
  .btn-pedidos{background:#c4748a;color:#fff;padding:1rem 2.5rem;text-decoration:none;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;font-family:var(--sans);font-weight:500;margin-top:0.5rem}
  @media(max-width:768px){
    .nav{padding:1rem 1.25rem}
    .page{grid-template-columns:1fr;padding:5rem 1.25rem 6rem;gap:1rem}
    .resumo{position:static}
    .dates{grid-template-columns:1fr}
    .sec{padding:1.5rem 1.25rem}
    .row2{grid-template-columns:1fr}
  }
`;

export default function CheckoutLoja() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif",fontSize:"0.8rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888"}}>...</div>}>
      <CheckoutLojaContent/>
    </Suspense>
  );
}
