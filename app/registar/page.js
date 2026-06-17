"use client";
import { useState } from "react";
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
  },
};

export default function Registar() {
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
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const lang = typeof window !== "undefined" ? (localStorage.getItem("ng_lang") || "pt") : "pt";
  const i = t[lang] || t.pt;

  const handleRegistar = async (e) => {
    e.preventDefault();
    setErro("");
    if (password.length < 6) { setErro(i.erroMin); return; }
    if (password !== confirmar) { setErro(i.erroPass); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, telefone, data_nascimento: dataNasc, genero } }
    });
    if (error) { setErro(error.message); setLoading(false); return; }
    // Criar registo na tabela clientes
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("clientes").upsert({
          id: user.id,
          email,
          nome,
          telefone,
          data_nascimento: dataNasc || null,
          genero: genero || null,
          pais: pais || null,
          cidade: cidade || null,
        });
      }
    } catch(e) {}
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
        .left-tag { font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 400; }
        .left-steps { margin-top: 4rem; display: flex; flex-direction: column; gap: 2rem; width: 100%; max-width: 280px; }
        .left-step { display: flex; align-items: flex-start; gap: 1rem; }
        .left-step-num { font-family: var(--serif); font-size: 1.5rem; font-weight: 300; color: rgba(255,255,255,0.3); line-height: 1; flex-shrink: 0; }
        .left-step-text { font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.7; font-weight: 400; }
        .right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; overflow-y: auto; }
        .form-wrap { width: 100%; max-width: 400px; }
        .form-title { font-family: var(--serif); font-size: 3rem; font-weight: 400; color: var(--black); margin-bottom: 2rem; line-height: 1; }
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-700); margin-bottom: 0.6rem; font-weight: 500; }
        .form-input { width: 100%; padding: 1rem 1.1rem; border: 1.5px solid var(--grey-200); background: var(--white); font-size: 1.05rem; font-family: var(--sans); font-weight: 400; color: var(--black); outline: none; transition: border-color 0.2s; border-radius: 0; -webkit-appearance: none; }
        .form-input:focus { border-color: var(--black); }
        .form-input::placeholder { color: var(--grey-200); }
        .form-erro { font-size: 0.9rem; color: #c0392b; margin-bottom: 1rem; font-weight: 400; padding: 0.75rem 1rem; background: #fff5f5; border: 1px solid #f5c6cb; }
        .form-sucesso { font-size: 0.95rem; color: #27ae60; padding: 1.25rem; border: 1px solid #27ae60; background: #f0fff4; line-height: 1.6; font-weight: 400; }
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
                  <label className="form-label">Data de nascimento</label>
                  <input className="form-input" type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Género</label>
                  <select className="form-input" value={genero} onChange={e => setGenero(e.target.value)} style={{cursor:'pointer'}}>
                    <option value="">Prefiro não especificar</option>
                    <option value="Mulher">Mulher</option>
                    <option value="Homem">Homem</option>
                    <option value="Não-binário">Não-binário</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">País</label>
                  <select className="form-input" value={pais} onChange={e => setPais(e.target.value)} style={{cursor:'pointer'}}>
                    <option value="">Selecionar país</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="França">🇫🇷 França</option>
                    <option value="Lituânia">🇱🇹 Lituânia</option>
                    <option value="Espanha">🇪🇸 Espanha</option>
                    <option value="Brasil">🇧🇷 Brasil</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Lisboa, Porto, Paris..." />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.password}</label>
                  <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.confirmar}</label>
                  <input className="form-input" type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required autoComplete="new-password" placeholder="••••••••" />
                </div>
                {erro && <p className="form-erro">{erro}</p>}
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