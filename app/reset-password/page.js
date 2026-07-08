"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const t = {
  pt: {
    titulo: "Nova password",
    nova: "Nova password",
    confirmar: "Confirmar password",
    btn: "Guardar password",
    sucesso: "Password alterada com sucesso!",
    erroMatch: "As passwords não coincidem.",
    erroMin: "A password deve ter pelo menos 6 caracteres.",
    erroGeral: "Erro ao alterar a password. Tenta novamente.",
    entrar: "Ir para o login",
    tokenInvalido: "Link inválido ou expirado. Pede um novo link de recuperação.",
  },
  fr: {
    titulo: "Nouveau mot de passe",
    nova: "Nouveau mot de passe",
    confirmar: "Confirmer le mot de passe",
    btn: "Enregistrer",
    sucesso: "Mot de passe modifié avec succès !",
    erroMatch: "Les mots de passe ne correspondent pas.",
    erroMin: "Le mot de passe doit contenir au moins 6 caractères.",
    erroGeral: "Erreur lors de la modification. Réessayez.",
    entrar: "Aller à la connexion",
    tokenInvalido: "Lien invalide ou expiré. Demandez un nouveau lien.",
  },
  lt: {
    titulo: "Naujas slaptažodis",
    nova: "Naujas slaptažodis",
    confirmar: "Patvirtinti slaptažodį",
    btn: "Išsaugoti",
    sucesso: "Slaptažodis sėkmingai pakeistas!",
    erroMatch: "Slaptažodžiai nesutampa.",
    erroMin: "Slaptažodis turi būti bent 6 simbolių.",
    erroGeral: "Klaida keičiant slaptažodį. Bandykite dar kartą.",
    entrar: "Eiti į prisijungimą",
    tokenInvalido: "Negaliojanti arba pasibaigusi nuoroda.",
  },
};

export default function ResetPassword() {
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const lang = typeof window !== "undefined" ? (localStorage.getItem("ng_lang") || "pt") : "pt";
  const i = t[lang] || t.pt;

  useEffect(() => {
    // Supabase processa o token do URL automaticamente via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setTokenValido(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    if (nova.length < 6) { setErro(i.erroMin); return; }
    if (nova !== confirmar) { setErro(i.erroMatch); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: nova });
    if (error) { setErro(i.erroGeral); setLoading(false); return; }
    setSucesso(true);
    setLoading(false);
    setTimeout(() => { window.location.href = "/entrar"; }, 2500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #f8f7f5; font-family: 'Jost', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left { background: #080808; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; }
        .left-logo { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 300; letter-spacing: 0.25em; text-transform: uppercase; color: #f8f7f5; margin-bottom: 0.5rem; }
        .left-tag { font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .left-quote { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-style: italic; color: rgba(255,255,255,0.5); margin-top: 4rem; text-align: center; line-height: 1.6; max-width: 28ch; }
        .right { display: flex; align-items: center; justify-content: center; padding: 4rem; background: #f8f7f5; }
        .form-wrap { width: 100%; max-width: 400px; }
        .form-title { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 300; color: #080808; margin-bottom: 2.5rem; line-height: 1; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase; color: #080808; margin-bottom: 0.6rem; font-weight: 500; }
        .form-input { width: 100%; padding: 1rem 1.1rem; border: 2px solid #2e2d2b; background: #f8f7f5; font-size: 1.1rem; font-family: 'Jost', sans-serif; font-weight: 400; color: #080808; outline: none; transition: border-color 0.2s; border-radius: 0; -webkit-appearance: none; }
        .form-input:focus { border-color: #080808; background: #fff; }
        .form-input::placeholder { color: #aaa89f; }
        .form-erro { font-size: 0.95rem; color: #c0392b; margin-bottom: 1rem; font-weight: 500; padding: 0.75rem 1rem; background: #fff5f5; border: 2px solid #f5c6cb; }
        .form-sucesso { font-size: 0.95rem; color: #1a7a4a; margin-bottom: 1rem; font-weight: 500; padding: 0.75rem 1rem; background: #f0fff4; border: 2px solid #9ae6b4; }
        .form-btn { width: 100%; padding: 1.15rem; background: #080808; color: #f8f7f5; border: none; font-size: 0.85rem; letter-spacing: 0.2em; text-transform: uppercase; font-family: 'Jost', sans-serif; font-weight: 500; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; -webkit-appearance: none; }
        .form-btn:hover { background: #2e2d2b; }
        .form-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-link-small { display: block; text-align: center; margin-top: 1.5rem; font-size: 0.95rem; color: #2e2d2b; text-decoration: none; }
        .form-link-small:hover { color: #080808; }
        .token-invalido { text-align: center; }
        .token-invalido p { font-size: 1rem; color: #5a5855; line-height: 1.7; margin-bottom: 2rem; }
        .back-link { position: fixed; top: 1.25rem; left: 1.25rem; font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: #f8f7f5; text-decoration: none; font-weight: 500; z-index: 10; }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .back-link { color: #080808; top: 1rem; left: 1rem; }
          .right { padding: 0; align-items: flex-start; }
          .form-wrap { padding: 4rem 1.5rem 3rem; }
          .form-title { font-size: 3rem; margin-bottom: 2rem; }
          .form-input { font-size: 1.15rem; padding: 1.1rem; }
          .form-btn { font-size: 0.9rem; padding: 1.2rem; }
        }
      `}</style>

      <a href="/" className="back-link">← Nora Grei</a>

      <div className="page">
        <div className="left">
          <div className="left-logo">Nora Grei</div>
          <div className="left-tag">Alugar ou Comprar</div>
          <p className="left-quote">A peça certa, para o momento certo.</p>
        </div>
        <div className="right">
          <div className="form-wrap">
            <h1 className="form-title">{i.titulo}</h1>

            {!tokenValido ? (
              <div className="token-invalido">
                <p>{i.tokenInvalido}</p>
                <a href="/entrar" className="form-link-small">{i.entrar}</a>
              </div>
            ) : sucesso ? (
              <div className="form-sucesso">{i.sucesso}</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">{i.nova}</label>
                  <input className="form-input" type="password" value={nova} onChange={e => setNova(e.target.value)} required placeholder="••••••••" autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">{i.confirmar}</label>
                  <input className="form-input" type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required placeholder="••••••••" autoComplete="new-password" />
                </div>
                {erro && <p className="form-erro">{erro}</p>}
                <button className="form-btn" type="submit" disabled={loading}>{loading ? "..." : i.btn}</button>
                <a href="/entrar" className="form-link-small">{i.entrar}</a>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}