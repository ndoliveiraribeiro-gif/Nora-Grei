"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: { titulo: "Criar conta", nome: "Nome completo", email: "Email", password: "Password", confirmar: "Confirmar password", btn: "Criar conta", jatem: "Já tem conta?", link: "Entrar", erroPass: "As passwords não coincidem.", erroMin: "A password deve ter pelo menos 6 caracteres.", sucesso: "Conta criada! Verifique o seu email." },
  fr: { titulo: "Créer un compte", nome: "Nom complet", email: "Email", password: "Mot de passe", confirmar: "Confirmer le mot de passe", btn: "Créer un compte", jatem: "Vous avez déjà un compte ?", link: "Se connecter", erroPass: "Les mots de passe ne correspondent pas.", erroMin: "Le mot de passe doit avoir au moins 6 caractères.", sucesso: "Compte créé ! Vérifiez votre email." },
  lt: { titulo: "Sukurti paskyrą", nome: "Pilnas vardas", email: "El. paštas", password: "Slaptažodis", confirmar: "Patvirtinti slaptažodį", btn: "Sukurti paskyrą", jatem: "Jau turite paskyrą?", link: "Prisijungti", erroPass: "Slaptažodžiai nesutampa.", erroMin: "Slaptažodis turi būti bent 6 simbolių.", sucesso: "Paskyra sukurta! Patikrinkite el. paštą." },
};

export default function Registar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
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
      options: { data: { nome } }
    });
    if (error) { setErro(error.message); setLoading(false); return; }
    setSucesso(true);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb; --grey-200: #e2dfda; --grey-400: #888580; --grey-700: #3a3936; --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif; }
        body { background: var(--white); font-family: var(--sans); font-weight: 300; -webkit-font-smoothing: antialiased; }
        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left { background: var(--black); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; }
        .left-logo { font-family: var(--serif); font-size: 2.5rem; font-weight: 300; letter-spacing: 0.25em; text-transform: uppercase; color: var(--white); margin-bottom: 0.5rem; }
        .left-tag { font-size: 0.55rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .left-steps { margin-top: 4rem; display: flex; flex-direction: column; gap: 2rem; width: 100%; max-width: 280px; }
        .left-step { display: flex; align-items: flex-start; gap: 1rem; }
        .left-step-num { font-family: var(--serif); font-size: 1.5rem; font-weight: 300; color: rgba(255,255,255,0.3); line-height: 1; flex-shrink: 0; }
        .left-step-text { font-size: 0.82rem; color: rgba(255,255,255,0.5); line-height: 1.7; font-weight: 300; }
        .right { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; }
        .form-wrap { width: 100%; max-width: 380px; }
        .form-title { font-family: var(--serif); font-size: 2.5rem; font-weight: 300; margin-bottom: 2.5rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-400); margin-bottom: 0.5rem; font-weight: 400; }
        .form-input { width: 100%; padding: 0.9rem 1rem; border: 1px solid var(--grey-200); background: var(--white); font-size: 0.95rem; font-family: var(--sans); font-weight: 300; color: var(--black); outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--black); }
        .form-erro { font-size: 0.8rem; color: #c0392b; margin-bottom: 1rem; font-weight: 400; }
        .form-sucesso { font-size: 0.88rem; color: #27ae60; margin-bottom: 1rem; font-weight: 400; padding: 1rem; border: 1px solid #27ae60; background: #f0fff4; }
        .form-btn { width: 100%; padding: 1rem; background: var(--black); color: var(--white); border: none; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; font-family: var(--sans); font-weight: 400; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
        .form-btn:hover { background: var(--grey-700); }
        .form-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-links { display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-top: 1.5rem; }
        .form-link { font-size: 0.78rem; color: var(--grey-400); text-decoration: none; font-weight: 400; transition: color 0.2s; }
        .form-link:hover { color: var(--black); }
        .form-link.destaque { color: var(--black); border-bottom: 1px solid var(--black); padding-bottom: 1px; }
        .form-divider { height: 1px; background: var(--grey-200); margin: 2rem 0; }
        .back-link { position: fixed; top: 1.5rem; left: 1.5rem; font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--white); text-decoration: none; font-weight: 400; opacity: 0.6; transition: opacity 0.2s; z-index: 10; }
        .back-link:hover { opacity: 1; }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 2rem 1.5rem; }
        }
      `}</style>

      <a href="/" className="back-link">← Nora Grei</a>

      <div className="page">
        <div className="left">
          <div className="left-logo">Nora Grei</div>
          <div className="left-tag">Alugar ou Comprar</div>
          <div className="left-steps">
            {[
              { num: "01", text: "Crie a sua conta em segundos" },
              { num: "02", text: "Escolha a ocasião e a peça ideal" },
              { num: "03", text: "Receba em casa, use, devolva" },
            ].map(s => (
              <div key={s.num} className="left-step">
                <span className="left-step-num">{s.num}</span>
                <span className="left-step-text">{s.text}</span>
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
                  <input className="form-input" type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.email}</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.password}</label>
                  <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.confirmar}</label>
                  <input className="form-input" type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required autoComplete="new-password" />
                </div>
                {erro && <p className="form-erro">{erro}</p>}
                <button className="form-btn" type="submit" disabled={loading}>
                  {loading ? "..." : i.btn}
                </button>
              </form>
            )}

            <div className="form-divider"></div>
            <div className="form-links">
              <span className="form-link">{i.jatem}</span>
              <a href="/entrar" className="form-link destaque">{i.link}</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}