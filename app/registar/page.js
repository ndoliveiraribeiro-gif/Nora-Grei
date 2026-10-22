"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const t = {
  pt: {
    titulo: "Criar conta",
    nome: "Nome completo",
    email: "Email",
    password: "Password",
    confirmar: "Confirmar password",
    telefone: "Telefone (opcional)",
    btn: "Criar conta",
    jatem: "Já tem conta?",
    link: "Entrar",
    erroPass: "As passwords não coincidem.",
    erroMin: "A password deve ter pelo menos 6 caracteres.",
    sucesso: "Conta criada! Verifique o seu email para confirmar.",
    passos: ["Crie a sua conta em segundos", "Escolha a ocasião e a peça ideal", "Receba em casa, use, devolva"],
    dataNasc: "Data de nascimento",
    genero: "Género",
    generoOpcoes: { vazio: "Prefiro não especificar", mulher: "Mulher", homem: "Homem", naoBinario: "Não-binário" },
    pais: "País",
    paisPlaceholder: "Selecionar país",
    cidade: "Cidade",
    cidadePlaceholder: "Lisboa, Porto, Paris...",
    paises: { pt:"Portugal", fr:"França", lt:"Lituânia", es:"Espanha", br:"Brasil", outro:"Outro" },
    mostrarPass: "Mostrar",
    ocultarPass: "Ocultar",
    forcaPass: ["Muito fraca", "Fraca", "Razoável", "Boa", "Excelente"],
    erroJaExiste: "Este email já tem conta.",
    erroJaExisteLink: "Entrar na conta",
    erroEmailInvalido: "Email inválido.",
    erroGeral: "Ocorreu um erro. Tenta novamente.",
    erroEmailNaoConfirmado: "Este email já foi registado mas ainda não confirmado. Verifica a tua caixa de entrada ou tenta entrar directamente.",
    erroPassFraca: "A password é demasiado fraca. Usa pelo menos 6 caracteres.",
  },
  fr: {
    titulo: "Créer un compte",
    nome: "Nom complet",
    email: "Email",
    password: "Mot de passe",
    confirmar: "Confirmer le mot de passe",
    telefone: "Téléphone (optionnel)",
    btn: "Créer un compte",
    jatem: "Vous avez déjà un compte ?",
    link: "Se connecter",
    erroPass: "Les mots de passe ne correspondent pas.",
    erroMin: "Le mot de passe doit avoir au moins 6 caractères.",
    sucesso: "Compte créé ! Vérifiez votre email.",
    passos: ["Créez votre compte en quelques secondes", "Choisissez l'occasion et la pièce idéale", "Recevez, portez, retournez"],
    dataNasc: "Date de naissance",
    genero: "Genre",
    generoOpcoes: { vazio: "Préfère ne pas préciser", mulher: "Femme", homem: "Homme", naoBinario: "Non-binaire" },
    pais: "Pays",
    paisPlaceholder: "Sélectionner le pays",
    cidade: "Ville",
    cidadePlaceholder: "Lisbonne, Paris...",
    paises: { pt:"Portugal", fr:"France", lt:"Lituanie", es:"Espagne", br:"Brésil", outro:"Autre" },
    mostrarPass: "Afficher",
    ocultarPass: "Masquer",
    forcaPass: ["Très faible", "Faible", "Correcte", "Bonne", "Excellente"],
    erroJaExiste: "Cet email a déjà un compte.",
    erroJaExisteLink: "Se connecter",
    erroEmailInvalido: "Email invalide.",
    erroGeral: "Une erreur s'est produite. Réessayez.",
    erroEmailNaoConfirmado: "Cet email a déjà été enregistré mais pas encore confirmé. Vérifiez votre boîte de réception ou essayez de vous connecter directement.",
    erroPassFraca: "Le mot de passe est trop faible. Utilisez au moins 6 caractères.",
  },
  lt: {
    titulo: "Sukurti paskyrą",
    nome: "Pilnas vardas",
    email: "El. paštas",
    password: "Slaptažodis",
    confirmar: "Patvirtinti slaptažodį",
    telefone: "Telefonas (neprivaloma)",
    btn: "Sukurti paskyrą",
    jatem: "Jau turite paskyrą?",
    link: "Prisijungti",
    erroPass: "Slaptažodžiai nesutampa.",
    erroMin: "Slaptažodis turi būti bent 6 simbolių.",
    sucesso: "Paskyra sukurta! Patikrinkite el. paštą.",
    passos: ["Sukurkite paskyrą per kelias sekundes", "Pasirinkite progą ir idealų drabužį", "Gaukite, dėvėkite, grąžinkite"],
    dataNasc: "Gimimo data",
    genero: "Lytis",
    generoOpcoes: { vazio: "Nenoriu nurodyti", mulher: "Moteris", homem: "Vyras", naoBinario: "Nebinarinis" },
    pais: "Šalis",
    paisPlaceholder: "Pasirinkite šalį",
    cidade: "Miestas",
    cidadePlaceholder: "Vilnius, Kaunas...",
    paises: { pt:"Portugalija", fr:"Prancūzija", lt:"Lietuva", es:"Ispanija", br:"Brazilija", outro:"Kita" },
    mostrarPass: "Rodyti",
    ocultarPass: "Slėpti",
    forcaPass: ["Labai silpnas", "Silpnas", "Vidutinis", "Geras", "Puikus"],
    erroJaExiste: "Šis el. paštas jau turi paskyrą.",
    erroJaExisteLink: "Prisijungti",
    erroEmailInvalido: "Neteisingas el. paštas.",
    erroGeral: "Įvyko klaida. Bandykite dar kartą.",
    erroEmailNaoConfirmado: "Šis el. paštas jau užregistruotas, bet dar nepatvirtintas. Patikrinkite savo pašto dėžutę arba bandykite prisijungti tiesiogiai.",
    erroPassFraca: "Slaptažodis per silpnas. Naudokite bent 6 simbolius.",
  },
};

function RegistarInner() {
  const searchParams = useSearchParams();
  const refCodigo = searchParams.get("ref"); // codigo_cliente do referidor

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [genero, setGenero] = useState("");
  const [pais, setPais] = useState("");
  const [cidade, setCidade] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [erroTipo, setErroTipo] = useState(""); // "jaexiste" | "naoconfirmado" | ""
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const lang = typeof window !== "undefined" ? (localStorage.getItem("ng_lang") || "pt") : "pt";
  const i = t[lang] || t.pt;

  // Força da password: 0-4
  const calcForca = (p) => {
    if (!p) return -1;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(4, score - 1 < 0 ? 0 : score - 1);
  };
  const forca = calcForca(password);
  const forcaCores = ["#e74c3c", "#e67e22", "#f1c40f", "#27ae60", "#1a8a4c"];

  // Mapear erros Supabase → mensagens traduzidas
  const traduzirErro = (msg) => {
    const m = (msg || "").toLowerCase();
    if (m.includes("user already registered") || m.includes("already been registered") || m.includes("already exists")) {
      setErroTipo("jaexiste");
      return i.erroJaExiste;
    }
    if (m.includes("email not confirmed") || m.includes("email link is invalid") || m.includes("for security purposes")) {
      setErroTipo("naoconfirmado");
      return i.erroEmailNaoConfirmado;
    }
    if (m.includes("invalid email") || m.includes("unable to validate email")) {
      return i.erroEmailInvalido;
    }
    if (m.includes("password should be") || m.includes("password is too short") || m.includes("weak password")) {
      return i.erroPassFraca;
    }
    return i.erroGeral;
  };

  const handleRegistar = async (e) => {
    e.preventDefault();
    setErro("");
    setErroTipo("");
    if (password.length < 6) { setErro(i.erroMin); return; }
    if (password !== confirmar) { setErro(i.erroPass); return; }
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, telefone, data_nascimento: dataNasc, genero } }
    });
    if (error) { setErro(traduzirErro(error.message)); setLoading(false); return; }
    // Supabase pode devolver user sem erro mesmo quando o email já existe (modo silencioso)
    // Nesse caso identities estará vazio
    if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      setErro(traduzirErro("User already registered"));
      setLoading(false);
      return;
    }

    // Usar o user devolvido diretamente pelo signUp (getUser() pode falhar
    // se a confirmação de email estiver ativa e a sessão ainda não existir)
    const novoUser = signUpData?.user;
    if (novoUser) {
      const { error: erroClientes } = await supabase.from("clientes").upsert({
        id: novoUser.id,
        email,
        nome,
        telefone,
        data_nascimento: dataNasc || null,
        genero: genero || null,
        pais: pais || null,
        cidade: cidade || null,
      });
      if (erroClientes) {
        console.error("Erro ao criar registo de cliente:", erroClientes);
        setErro("Conta criada, mas houve um problema ao guardar o perfil. Contacta o suporte.");
        setLoading(false);
        return;
      }

      // ── Processar referido ────────────────────────────────────
      if (refCodigo) {
        try {
          // Encontrar o referidor pelo seu codigo_cliente
          const { data: referidor } = await supabase
            .from("clientes")
            .select("id, nome")
            .eq("codigo_cliente", refCodigo.toLowerCase())
            .neq("id", novoUser.id)
            .maybeSingle();

          if (referidor) {
            // Registar a relação de referido
            await supabase.from("referrals").insert({
              referidor_id: referidor.id,
              referido_id: novoUser.id,
              ref_codigo: refCodigo.toLowerCase(),
              status: "pendente", // activa quando o referido faz 1.º aluguer
              comissao_gerada: 0,
              comissao_paga: false,
            });

            // Crédito de boas-vindas ao referidor (€5 por novo registo)
            await supabase.from("creditos_afiliado").insert({
              cliente_id: referidor.id,
              valor: 5.00,
              motivo: `Registo via referido — ${nome}`,
              ref_tipo: "registo",
              ref_id: novoUser.id,
              usado: false,
            });
          }
        } catch (errRef) {
          console.error("Erro ao processar referido:", errRef);
          // Não bloquear o registo por erro no referral
        }
      }
      // ─────────────────────────────────────────────────────────
    } else {
      console.error("signUp não devolveu user — registo em clientes não foi criado");
    }
    setSucesso(true);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f5;
          --grey-100: #f0eeeb; --grey-200: #e2dfda;
          --grey-500: #5a5855; --grey-700: #2e2d2b;
          --serif: 'Cormorant', Georgia, serif;
          --sans: 'Jost', Arial, sans-serif;
        }
        html, body { height: 100%; }
        body { background: var(--white); font-family: var(--sans); font-weight: 400; font-size: 17px; -webkit-font-smoothing: antialiased; }
        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left { background: var(--black); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; }
        .left-logo { font-family: var(--serif); font-size: 2.5rem; font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; color: var(--white); margin-bottom: 0.5rem; }
        .left-tag { font-size: 0.78rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 400; }
        .left-steps { margin-top: 4rem; display: flex; flex-direction: column; gap: 2rem; width: 100%; max-width: 280px; }
        .left-step { display: flex; align-items: flex-start; gap: 1rem; }
        .left-step-num { font-family: var(--serif); font-size: 1.5rem; font-weight: 300; color: rgba(255,255,255,0.3); line-height: 1; flex-shrink: 0; }
        .left-step-text { font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.7; font-weight: 400; }
        .right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; overflow-y: auto; }
        .form-wrap { width: 100%; max-width: 400px; }
        .form-title { font-family: var(--sans); font-size: 2.5rem; font-weight: 600; color: var(--black); margin-bottom: 2rem; line-height: 1; }
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.85rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-700); margin-bottom: 0.6rem; font-weight: 500; }
        .form-input { width: 100%; padding: 1rem 1.1rem; border: 1.5px solid var(--grey-200); background: var(--white); font-size: 1.05rem; font-family: var(--sans); font-weight: 400; color: var(--black); outline: none; transition: border-color 0.2s; border-radius: 0; -webkit-appearance: none; }
        .form-input:focus { border-color: var(--black); }
        .form-input::placeholder { color: var(--grey-200); }
        .form-erro { font-size: 0.9rem; color: #c0392b; margin-bottom: 1rem; font-weight: 400; padding: 0.75rem 1rem; background: #fff5f5; border: 1px solid #f5c6cb; line-height: 1.5; }
        .form-erro a { color: #c0392b; font-weight: 600; }
        .form-sucesso { font-size: 0.95rem; color: #27ae60; padding: 1.25rem; border: 1px solid #27ae60; background: #f0fff4; line-height: 1.6; font-weight: 400; }
        .pass-wrap { position: relative; }
        .pass-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-500); font-family: var(--sans); font-weight: 500; padding: 0; }
        .forca-bar { display: flex; gap: 3px; margin-top: 0.5rem; height: 3px; }
        .forca-seg { flex: 1; border-radius: 2px; background: var(--grey-200); transition: background 0.3s; }
        .forca-label { font-size: 0.72rem; color: var(--grey-500); margin-top: 0.35rem; letter-spacing: 0.05em; }
        .form-btn { width: 100%; padding: 1.1rem; background: var(--black); color: var(--white); border: none; font-size: 0.78rem; letter-spacing: 0.2em; text-transform: uppercase; font-family: var(--sans); font-weight: 500; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; -webkit-appearance: none; }
        .form-btn:hover { background: var(--grey-700); }
        .form-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-divider { height: 1px; background: var(--grey-200); margin: 1.75rem 0; }
        .form-links { display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
        .form-link-text { font-size: 0.95rem; color: var(--grey-500); font-weight: 400; }
        .form-link { font-size: 0.95rem; color: var(--black); text-decoration: none; font-weight: 500; border-bottom: 1.5px solid var(--black); padding-bottom: 1px; }
        .back-link { position: fixed; top: 1.25rem; left: 1.25rem; font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--white); text-decoration: none; font-weight: 400; opacity: 0.7; transition: opacity 0.2s; z-index: 10; }
        .back-link:hover { opacity: 1; }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .back-link { color: var(--black); }
          .right { padding: 0; align-items: stretch; justify-content: flex-start; }
          .form-wrap { max-width: 100%; padding: 5rem 1.5rem 3rem; }
          .form-title { font-size: 2.8rem; margin-bottom: 1.75rem; }
          .form-label { font-size: 0.78rem; color: var(--black); }
          .form-input { font-size: 1.1rem; padding: 1.1rem; }
          .form-btn { font-size: 0.85rem; padding: 1.2rem; margin-top: 1rem; }
          .form-link-text { font-size: 1rem; color: var(--grey-700); }
          .form-link { font-size: 1rem; }
        }
      `}</style>

      <a href="/" className="back-link">← Nora Grei</a>

      <div className="page">
        <div className="left">
          <div className="left-logo">Nora Grei</div>
          <div className="left-tag">Alugar ou Comprar</div>
          <div className="left-steps">
            {i.passos.map((p, idx) => (
              <div key={idx} className="left-step">
                <span className="left-step-num">0{idx + 1}</span>
                <span className="left-step-text">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="form-wrap">
            <h1 className="form-title">{i.titulo}</h1>
            {sucesso ? (
              <div className="form-sucesso">{i.sucesso}</div>
            ) : (
              <form onSubmit={handleRegistar}>
                <div className="form-group">
                  <label className="form-label">{i.nome}</label>
                  <input className="form-input" type="text" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Maria Silva" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.email}</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="maria@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.dataNasc}</label>
                  <input className="form-input" type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.genero}</label>
                  <select className="form-input" value={genero} onChange={e => setGenero(e.target.value)} style={{cursor:'pointer'}}>
                    <option value="">{i.generoOpcoes.vazio}</option>
                    <option value="Mulher">{i.generoOpcoes.mulher}</option>
                    <option value="Homem">{i.generoOpcoes.homem}</option>
                    <option value="Não-binário">{i.generoOpcoes.naoBinario}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{i.pais}</label>
                  <select className="form-input" value={pais} onChange={e => setPais(e.target.value)} style={{cursor:'pointer'}}>
                    <option value="">{i.paisPlaceholder}</option>
                    <option value="Portugal">🇵🇹 {i.paises.pt}</option>
                    <option value="França">🇫🇷 {i.paises.fr}</option>
                    <option value="Lituânia">🇱🇹 {i.paises.lt}</option>
                    <option value="Espanha">🇪🇸 {i.paises.es}</option>
                    <option value="Brasil">🇧🇷 {i.paises.br}</option>
                    <option value="Outro">{i.paises.outro}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{i.cidade}</label>
                  <input className="form-input" type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder={i.cidadePlaceholder} />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.password}</label>
                  <div className="pass-wrap">
                    <input className="form-input" type={verPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="••••••••" style={{paddingRight:"5rem"}} />
                    <button type="button" className="pass-toggle" onClick={() => setVerPass(v => !v)}>{verPass ? i.ocultarPass : i.mostrarPass}</button>
                  </div>
                  {password.length > 0 && (
                    <>
                      <div className="forca-bar">
                        {[0,1,2,3,4].map(n => (
                          <div key={n} className="forca-seg" style={{background: n <= forca ? forcaCores[forca] : undefined}} />
                        ))}
                      </div>
                      <div className="forca-label">{i.forcaPass[forca]}</div>
                    </>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">{i.confirmar}</label>
                  <div className="pass-wrap">
                    <input className="form-input" type={verConfirmar ? "text" : "password"} value={confirmar} onChange={e => setConfirmar(e.target.value)} required autoComplete="new-password" placeholder="••••••••" style={{paddingRight:"5rem"}} />
                    <button type="button" className="pass-toggle" onClick={() => setVerConfirmar(v => !v)}>{verConfirmar ? i.ocultarPass : i.mostrarPass}</button>
                  </div>
                </div>
                {erro && (
                  <p className="form-erro">
                    {erro}
                    {erroTipo === "jaexiste" && <> — <a href="/entrar">{i.erroJaExisteLink}</a></>}
                    {erroTipo === "naoconfirmado" && <> — <a href="/entrar">{i.erroJaExisteLink}</a></>}
                  </p>
                )}
                <button className="form-btn" type="submit" disabled={loading}>
                  {loading ? "..." : i.btn}
                </button>
              </form>
            )}
            <div className="form-divider"></div>
            <div className="form-links">
              <span className="form-link-text">{i.jatem}</span>
              <a href="/entrar" className="form-link">{i.link}</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Registar() {
  return (
    <Suspense fallback={null}>
      <RegistarInner />
    </Suspense>
  );
}