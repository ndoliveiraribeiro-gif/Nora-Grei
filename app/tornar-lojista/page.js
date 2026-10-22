"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const t = {
  pt: {
    voltar: "← Nora Grei",
    eyebrow: "Torna-te lojista",
    titulo: "Abre a tua loja.",
    sub: "Aluga ou vende as tuas peças através da Nora Grei. Preenche os dados abaixo para activarmos a tua loja.",
    // secções
    secDados: "Dados da loja",
    secMorada: "Morada de recolha",
    secFinanceiros: "Dados financeiros",
    // campos
    nomeLoja: "Nome público da loja",
    nomeLojaPh: "Ex: Atelier Maria, Vintage Lisboa…",
    nomeLojaDica: "É o nome que os clientes vão ver. Podes usar o teu nome pessoal.",
    descricao: "Descrição da loja (opcional)",
    descricaoPh: "Conta um pouco sobre o que vendes e o teu estilo…",
    morada: "Morada *",
    moradaPh: "Rua de Exemplo, 10",
    numero: "Nº / Andar",
    numeroPh: "2º Esq.",
    cp: "Código postal *",
    cpPh: "1000-001",
    cidade: "Cidade *",
    cidadePh: "Lisboa",
    pais: "País",
    nif: "NIF *",
    nifPh: "123 456 789",
    iban: "IBAN *",
    ibanPh: "PT50 0000 0000 0000 0000 0000 0",
    ibanDica: "Necessário para receberes os ganhos das vendas e alugueres.",
    // termos
    termos: "Li e aceito os",
    termosLink: "Termos de lojista",
    // botão
    btn: "Submeter candidatura",
    loading: "A submeter…",
    // estados
    semSessao: "Tens de ter sessão iniciada para te tornares lojista.",
    semSessaoLink: "Entrar ou criar conta →",
    jaLojista: "A tua loja já está activa.",
    jaLojistaLink: "Ver a minha loja →",
    pendente: "A tua candidatura está em análise. Entraremos em contacto em breve.",
    // erros
    erroNome: "Indica o nome da loja.",
    erroMorada: "Preenche a morada completa.",
    erroCp: "Indica o código postal.",
    erroCidade: "Indica a cidade.",
    erroNif: "Indica o teu NIF.",
    erroIban: "Indica o teu IBAN.",
    erroTermos: "Tens de aceitar os termos.",
    erroGeral: "Ocorreu um erro. Tenta novamente.",
    // sucesso
    sucessoTitulo: "Candidatura enviada!",
    sucessoSub: "Vamos analisar os teus dados e activar a loja em breve. Receberás uma confirmação por email.",
    sucessoBtn: "Ir para o meu perfil →",
    // passos laterais
    passos: [
      { num: "01", titulo: "Preenche o formulário", desc: "Dados da loja, morada de recolha e informação bancária." },
      { num: "02", titulo: "Análise rápida", desc: "Verificamos os dados em 24-48h e activamos a tua conta." },
      { num: "03", titulo: "Começa a publicar", desc: "Adicionas as tuas peças e começam a aparecer no catálogo." },
    ],
  },
  fr: {
    voltar: "← Nora Grei",
    eyebrow: "Devenir vendeur",
    titulo: "Ouvrez votre boutique.",
    sub: "Louez ou vendez vos pièces via Nora Grei. Remplissez le formulaire ci-dessous pour activer votre boutique.",
    secDados: "Données de la boutique",
    secMorada: "Adresse de collecte",
    secFinanceiros: "Données financières",
    nomeLoja: "Nom public de la boutique",
    nomeLojaPh: "Ex: Atelier Marie, Vintage Paris…",
    nomeLojaDica: "C'est le nom que les clients verront. Vous pouvez utiliser votre prénom.",
    descricao: "Description de la boutique (optionnel)",
    descricaoPh: "Parlez de ce que vous vendez et de votre style…",
    morada: "Adresse *",
    moradaPh: "Rue Exemple, 10",
    numero: "N° / Étage",
    numeroPh: "2ème gauche",
    cp: "Code postal *",
    cpPh: "75001",
    cidade: "Ville *",
    cidadePh: "Paris",
    pais: "Pays",
    nif: "Numéro fiscal *",
    nifPh: "123 456 789",
    iban: "IBAN *",
    ibanPh: "FR76 0000 0000 0000 0000 0000 000",
    ibanDica: "Nécessaire pour recevoir vos gains de ventes et locations.",
    termos: "J'ai lu et j'accepte les",
    termosLink: "Conditions vendeur",
    btn: "Soumettre la candidature",
    loading: "En cours…",
    semSessao: "Vous devez être connecté pour devenir vendeur.",
    semSessaoLink: "Se connecter ou créer un compte →",
    jaLojista: "Votre boutique est déjà active.",
    jaLojistaLink: "Voir ma boutique →",
    pendente: "Votre candidature est en cours d'examen. Nous vous contacterons bientôt.",
    erroNome: "Indiquez le nom de la boutique.",
    erroMorada: "Remplissez l'adresse complète.",
    erroCp: "Indiquez le code postal.",
    erroCidade: "Indiquez la ville.",
    erroNif: "Indiquez votre numéro fiscal.",
    erroIban: "Indiquez votre IBAN.",
    erroTermos: "Vous devez accepter les conditions.",
    erroGeral: "Une erreur s'est produite. Réessayez.",
    sucessoTitulo: "Candidature envoyée !",
    sucessoSub: "Nous examinerons vos données et activerons votre boutique sous peu. Vous recevrez une confirmation par email.",
    sucessoBtn: "Aller à mon profil →",
    passos: [
      { num: "01", titulo: "Remplissez le formulaire", desc: "Données de boutique, adresse de collecte et informations bancaires." },
      { num: "02", titulo: "Examen rapide", desc: "Nous vérifions les données en 24-48h et activons votre compte." },
      { num: "03", titulo: "Commencez à publier", desc: "Ajoutez vos pièces et elles apparaîtront dans le catalogue." },
    ],
  },
  lt: {
    voltar: "← Nora Grei",
    eyebrow: "Tapti pardavėju",
    titulo: "Atidarykite parduotuvę.",
    sub: "Nuomokite ar parduokite savo drabužius per Nora Grei. Užpildykite formą žemiau, kad aktyvuotume jūsų parduotuvę.",
    secDados: "Parduotuvės duomenys",
    secMorada: "Surinkimo adresas",
    secFinanceiros: "Finansiniai duomenys",
    nomeLoja: "Viešas parduotuvės pavadinimas",
    nomeLojaPh: "Pvz: Atelier Marta, Vintage Vilnius…",
    nomeLojaDica: "Tai pavadinimas, kurį matys klientai. Galite naudoti savo vardą.",
    descricao: "Parduotuvės aprašymas (neprivaloma)",
    descricaoPh: "Papasakokite apie save ir ką parduodate…",
    morada: "Adresas *",
    moradaPh: "Pavyzdžio g. 10",
    numero: "Nr. / Aukštas",
    numeroPh: "2 kairė",
    cp: "Pašto kodas *",
    cpPh: "LT-00001",
    cidade: "Miestas *",
    cidadePh: "Vilnius",
    pais: "Šalis",
    nif: "Mokesčių kodas *",
    nifPh: "123 456 789",
    iban: "IBAN *",
    ibanPh: "LT00 0000 0000 0000 0000",
    ibanDica: "Reikalingas pajamoms iš pardavimų ir nuomų gauti.",
    termos: "Perskaičiau ir sutinku su",
    termosLink: "Pardavėjo sąlygomis",
    btn: "Pateikti paraišką",
    loading: "Siunčiama…",
    semSessao: "Turite prisijungti, kad taptumėte pardavėju.",
    semSessaoLink: "Prisijungti arba sukurti paskyrą →",
    jaLojista: "Jūsų parduotuvė jau aktyvi.",
    jaLojistaLink: "Peržiūrėti mano parduotuvę →",
    pendente: "Jūsų paraiška nagrinėjama. Netrukus susisieksime.",
    erroNome: "Nurodykite parduotuvės pavadinimą.",
    erroMorada: "Užpildykite pilną adresą.",
    erroCp: "Nurodykite pašto kodą.",
    erroCidade: "Nurodykite miestą.",
    erroNif: "Nurodykite mokesčių kodą.",
    erroIban: "Nurodykite savo IBAN.",
    erroTermos: "Turite sutikti su sąlygomis.",
    erroGeral: "Įvyko klaida. Bandykite dar kartą.",
    sucessoTitulo: "Paraiška išsiųsta!",
    sucessoSub: "Peržiūrėsime jūsų duomenis ir netrukus aktyvuosime parduotuvę. Gausite patvirtinimą el. paštu.",
    sucessoBtn: "Eiti į mano profilį →",
    passos: [
      { num: "01", titulo: "Užpildykite formą", desc: "Parduotuvės duomenys, surinkimo adresas ir banko informacija." },
      { num: "02", titulo: "Greita peržiūra", desc: "Patikriname duomenis per 24-48 val. ir aktyvuojame paskyrą." },
      { num: "03", titulo: "Pradėkite skelbti", desc: "Pridėkite savo drabužius ir jie pasirodys kataloge." },
    ],
  },
};

export default function TornarLojista() {
  const [lang, setLang] = useState("pt");
  const [sessao, setSessao] = useState(null); // null=a carregar, false=sem sessão, {id,nome,...}=logado
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // campos
  const [nomeLoja, setNomeLoja] = useState("");
  const [descricao, setDescricao] = useState("");
  const [morada, setMorada] = useState("");
  const [numero, setNumero] = useState("");
  const [cp, setCp] = useState("");
  const [cidade, setCidade] = useState("");
  const [pais, setPais] = useState("Portugal");
  const [nif, setNif] = useState("");
  const [iban, setIban] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  useEffect(() => {
    const l = localStorage.getItem("ng_lang");
    if (l && t[l]) setLang(l);

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setSessao(false); return; }
      supabase.from("clientes").select("id,nome,nome_publico,morada,numero_porta,codigo_postal,cidade,pais,nif,iban,lojista,lojista_pendente").eq("id", data.user.id).maybeSingle().then(({ data: perfil }) => {
        setSessao(data.user);
        setPerfilAtual(perfil);
        // Pré-preencher com dados já existentes
        if (perfil?.nome_publico) setNomeLoja(perfil.nome_publico);
        if (perfil?.morada) setMorada(perfil.morada);
        if (perfil?.numero_porta) setNumero(perfil.numero_porta);
        if (perfil?.codigo_postal) setCp(perfil.codigo_postal);
        if (perfil?.cidade) setCidade(perfil.cidade);
        if (perfil?.pais) setPais(perfil.pais);
        if (perfil?.nif) setNif(perfil.nif);
        if (perfil?.iban) setIban(perfil.iban);
      });
    });
  }, []);

  const i = t[lang] || t.pt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    if (!nomeLoja.trim()) { setErro(i.erroNome); return; }
    if (!morada.trim()) { setErro(i.erroMorada); return; }
    if (!cp.trim()) { setErro(i.erroCp); return; }
    if (!cidade.trim()) { setErro(i.erroCidade); return; }
    if (!nif.trim()) { setErro(i.erroNif); return; }
    if (!iban.trim()) { setErro(i.erroIban); return; }
    if (!aceitouTermos) { setErro(i.erroTermos); return; }

    setLoading(true);
    const { error } = await supabase.from("clientes").update({
      nome_publico: nomeLoja.trim(),
      descricao_loja: descricao.trim() || null,
      morada: morada.trim(),
      numero_porta: numero.trim() || null,
      codigo_postal: cp.trim(),
      cidade: cidade.trim(),
      pais: pais || "Portugal",
      nif: nif.trim(),
      iban: iban.trim(),
      lojista_pendente: true,
    }).eq("id", sessao.id);

    setLoading(false);
    if (error) { setErro(i.erroGeral); return; }
    setSucesso(true);
  };

  // A carregar sessão
  if (sessao === null) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f5;
          --grey-100: #f0eeeb; --grey-200: #e2dfda;
          --grey-500: #5a5855; --grey-700: #2e2d2b;
          --accent: #c4748a;
          --serif: 'Cormorant', Georgia, serif;
          --sans: 'Jost', Arial, sans-serif;
        }
        html, body { height: 100%; }
        body { background: var(--white); font-family: var(--sans); font-weight: 400; font-size: 16px; -webkit-font-smoothing: antialiased; }

        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        /* Painel esquerdo */
        .left { background: var(--black); display: flex; flex-direction: column; justify-content: center; padding: 4rem; position: sticky; top: 0; height: 100vh; }
        .left-logo { font-family: var(--serif); font-size: 2rem; font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; color: var(--white); margin-bottom: 0.35rem; }
        .left-eyebrow { font-size: 0.72rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent); margin-bottom: 3rem; }
        .left-titulo { font-family: var(--serif); font-size: 2.8rem; font-weight: 300; color: var(--white); line-height: 1.15; margin-bottom: 1rem; }
        .left-titulo em { font-style: italic; }
        .left-sub { font-size: 0.92rem; color: rgba(255,255,255,0.5); line-height: 1.75; max-width: 300px; margin-bottom: 3.5rem; }
        .left-passos { display: flex; flex-direction: column; gap: 1.75rem; }
        .left-passo { display: flex; gap: 1.25rem; align-items: flex-start; }
        .left-passo-num { font-family: var(--serif); font-size: 1.4rem; font-weight: 300; color: rgba(255,255,255,0.2); line-height: 1; flex-shrink: 0; width: 2rem; }
        .left-passo-corpo {}
        .left-passo-titulo { font-size: 0.85rem; font-weight: 500; color: var(--white); letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .left-passo-desc { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.6; }

        /* Painel direito */
        .right { display: flex; flex-direction: column; align-items: center; padding: 4rem 4rem 4rem; overflow-y: auto; }
        .form-wrap { width: 100%; max-width: 440px; }

        .sec-label { font-size: 0.68rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent); font-weight: 500; margin-bottom: 1.25rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--grey-200); }
        .sec-wrap { margin-bottom: 2.5rem; }

        .form-group { margin-bottom: 1.1rem; }
        .form-label { display: block; font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-700); margin-bottom: 0.5rem; font-weight: 500; }
        .form-input { width: 100%; padding: 0.9rem 1rem; border: 1.5px solid var(--grey-200); background: var(--white); font-size: 1rem; font-family: var(--sans); color: var(--black); outline: none; transition: border-color 0.2s; border-radius: 0; -webkit-appearance: none; }
        .form-input:focus { border-color: var(--black); }
        .form-input::placeholder { color: #ccc; }
        .form-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
        .form-dica { font-size: 0.78rem; color: var(--grey-500); margin-top: 0.35rem; line-height: 1.5; }
        .form-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem; }

        .form-erro { font-size: 0.88rem; color: #c0392b; padding: 0.85rem 1rem; background: #fff5f5; border: 1px solid #f5c6cb; margin-bottom: 1.25rem; line-height: 1.5; }

        .termos-row { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.5rem; cursor: pointer; }
        .termos-check { width: 18px; height: 18px; border: 1.5px solid var(--grey-200); flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s, background 0.2s; }
        .termos-check.on { border-color: var(--black); background: var(--black); }
        .termos-text { font-size: 0.88rem; color: var(--grey-500); line-height: 1.6; }
        .termos-link { color: var(--black); font-weight: 500; text-decoration: underline; }

        .form-btn { width: 100%; padding: 1.1rem; background: var(--black); color: var(--white); border: none; font-size: 0.78rem; letter-spacing: 0.2em; text-transform: uppercase; font-family: var(--sans); font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .form-btn:hover { background: var(--grey-700); }
        .form-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back-link { position: fixed; top: 1.25rem; left: 1.25rem; font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--white); text-decoration: none; opacity: 0.6; transition: opacity 0.2s; z-index: 10; }
        .back-link:hover { opacity: 1; }

        /* Estado sem sessão / já lojista */
        .estado-wrap { text-align: center; padding: 3rem 0; }
        .estado-titulo { font-family: var(--serif); font-size: 1.8rem; font-weight: 300; margin-bottom: 0.75rem; }
        .estado-sub { font-size: 0.92rem; color: var(--grey-500); margin-bottom: 1.5rem; line-height: 1.6; }
        .estado-link { display: inline-block; padding: 0.9rem 2rem; background: var(--black); color: var(--white); text-decoration: none; font-size: 0.78rem; letter-spacing: 0.2em; text-transform: uppercase; font-family: var(--sans); font-weight: 500; }

        /* Sucesso */
        .sucesso-wrap { text-align: center; padding: 3rem 0; }
        .sucesso-icone { width: 56px; height: 56px; border-radius: 50%; background: #f0fff4; border: 1.5px solid #27ae60; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .sucesso-titulo { font-family: var(--serif); font-size: 2rem; font-weight: 300; margin-bottom: 0.75rem; }
        .sucesso-sub { font-size: 0.92rem; color: var(--grey-500); line-height: 1.7; margin-bottom: 2rem; }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .back-link { color: var(--black); }
          .right { padding: 5rem 1.5rem 3rem; align-items: stretch; }
          .form-wrap { max-width: 100%; }
          .form-grid-2 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <a href="/" className="back-link">{i.voltar}</a>

      <div className="page">
        {/* Painel esquerdo */}
        <div className="left">
          <div className="left-logo">Nora Grei</div>
          <div className="left-eyebrow">{i.eyebrow}</div>
          <h1 className="left-titulo">{i.titulo}</h1>
          <p className="left-sub">{i.sub}</p>
          <div className="left-passos">
            {i.passos.map((p, idx) => (
              <div key={idx} className="left-passo">
                <span className="left-passo-num">{p.num}</span>
                <div className="left-passo-corpo">
                  <p className="left-passo-titulo">{p.titulo}</p>
                  <p className="left-passo-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel direito */}
        <div className="right">
          <div className="form-wrap">

            {/* Sem sessão */}
            {sessao === false && (
              <div className="estado-wrap">
                <p className="estado-sub">{i.semSessao}</p>
                <a href="/entrar?next=/tornar-lojista" className="estado-link">{i.semSessaoLink}</a>
              </div>
            )}

            {/* Já lojista activo */}
            {sessao && perfilAtual?.lojista === true && (
              <div className="estado-wrap">
                <p className="estado-sub">{i.jaLojista}</p>
                <a href={`/loja/${perfilAtual.codigo_cliente || ""}`} className="estado-link">{i.jaLojistaLink}</a>
              </div>
            )}

            {/* Candidatura pendente */}
            {sessao && perfilAtual?.lojista_pendente === true && perfilAtual?.lojista !== true && !sucesso && (
              <div className="estado-wrap">
                <p className="estado-sub">{i.pendente}</p>
                <a href="/perfil" className="estado-link" style={{marginTop:"1rem",display:"inline-block"}}>{i.sucessoBtn}</a>
              </div>
            )}

            {/* Sucesso após submissão */}
            {sucesso && (
              <div className="sucesso-wrap">
                <div className="sucesso-icone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="sucesso-titulo">{i.sucessoTitulo}</h2>
                <p className="sucesso-sub">{i.sucessoSub}</p>
                <a href="/perfil" className="form-btn" style={{display:"block",textAlign:"center",textDecoration:"none"}}>{i.sucessoBtn}</a>
              </div>
            )}

            {/* Formulário principal */}
            {sessao && perfilAtual?.lojista !== true && perfilAtual?.lojista_pendente !== true && !sucesso && (
              <form onSubmit={handleSubmit} noValidate>

                {erro && <div className="form-erro">{erro}</div>}

                {/* Dados da loja */}
                <div className="sec-wrap">
                  <p className="sec-label">{i.secDados}</p>
                  <div className="form-group">
                    <label className="form-label">{i.nomeLoja}</label>
                    <input className="form-input" type="text" value={nomeLoja} onChange={e => setNomeLoja(e.target.value)} placeholder={i.nomeLojaPh} />
                    <p className="form-dica">{i.nomeLojaDica}</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{i.descricao}</label>
                    <textarea className="form-input form-textarea" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder={i.descricaoPh} />
                  </div>
                </div>

                {/* Morada */}
                <div className="sec-wrap">
                  <p className="sec-label">{i.secMorada}</p>
                  <div className="form-group">
                    <label className="form-label">{i.morada}</label>
                    <input className="form-input" type="text" value={morada} onChange={e => setMorada(e.target.value)} placeholder={i.moradaPh} required />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{i.cp}</label>
                      <input className="form-input" type="text" value={cp} onChange={e => setCp(e.target.value)} placeholder={i.cpPh} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{i.numero}</label>
                      <input className="form-input" type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder={i.numeroPh} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{i.cidade}</label>
                    <input className="form-input" type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder={i.cidadePh} required />
                  </div>
                </div>

                {/* Financeiros */}
                <div className="sec-wrap">
                  <p className="sec-label">{i.secFinanceiros}</p>
                  <div className="form-group">
                    <label className="form-label">{i.nif}</label>
                    <input className="form-input" type="text" value={nif} onChange={e => setNif(e.target.value)} placeholder={i.nifPh} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{i.iban}</label>
                    <input className="form-input" type="text" value={iban} onChange={e => setIban(e.target.value)} placeholder={i.ibanPh} required />
                    <p className="form-dica">{i.ibanDica}</p>
                  </div>
                </div>

                {/* Termos */}
                <div className="termos-row" onClick={() => setAceitouTermos(v => !v)}>
                  <div className={`termos-check${aceitouTermos ? " on" : ""}`}>
                    {aceitouTermos && <svg viewBox="0 0 12 12" fill="none" stroke="#f8f7f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="10 2 5 8 2 5"/></svg>}
                  </div>
                  <span className="termos-text">
                    {i.termos}{" "}
                    <a href="/termos-lojista" className="termos-link" onClick={e => e.stopPropagation()}>{i.termosLink}</a>.
                  </span>
                </div>

                <button type="submit" className="form-btn" disabled={loading}>
                  {loading ? i.loading : i.btn}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
