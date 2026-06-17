"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const t = {
  pt: { titulo: "Entrar", email: "Email", password: "Password", btn: "Entrar", registar: "Ainda não tem conta?", link: "Criar conta", erro: "Email ou password incorretos.", esquecer: "Esqueceu a password?" },
  fr: { titulo: "Connexion", email: "Email", password: "Mot de passe", btn: "Se connecter", registar: "Pas encore de compte ?", link: "Créer un compte", erro: "Email ou mot de passe incorrect.", esquecer: "Mot de passe oublié ?" },
  lt: { titulo: "Prisijungti", email: "El. paštas", password: "Slaptažodis", btn: "Prisijungti", registar: "Dar neturite paskyros?", link: "Sukurti paskyrą", erro: "Neteisingas el. paštas arba slaptažodis.", esquecer: "Pamiršote slaptažodį?" },
};

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const lang = typeof window !== "undefined" ? (localStorage.getItem("ng_lang") || "pt") : "pt";
  const i = t[lang] || t.pt;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErro(i.erro); setLoading(false); return; }
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #f8f7f5; font-family: 'Jost', Arial, sans-serif; -webkit-font-smoothing: antialiased; }

        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        .left { background: #080808; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; }
        .left-logo { font-family: 'Cormorant', serif; font-size: 2.5rem; font-weight: 400; letter-spacing: 0.25em; text-transform: uppercase; color: #f8f7f5; margin-bottom: 0.5rem; }
        .left-tag { font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .left-quote { font-family: 'Cormorant', serif; font-size: 1.6rem; font-style: italic; color: rgba(255,255,255,0.5); margin-top: 4rem; text-align: center; line-height: 1.6; max-width: 28ch; }

        .right { display: flex; align-items: center; justify-content: center; padding: 4rem; background: #f8f7f5; }
        .form-wrap { width: 100%; max-width: 400px; }

        .form-title { font-family: 'Cormorant', serif; font-size: 3.5rem; font-weight: 400; color: #080808; margin-bottom: 2.5rem; line-height: 1; }

        .form-group { margin-bottom: 1.5rem; }

        .form-label { display: block; font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase; color: #080808; margin-bottom: 0.6rem; font-weight: 500; }

        .form-input {
          width: 100%; padding: 1rem 1.1rem;
          border: 2px solid #2e2d2b;
          background: #f8f7f5;
          font-size: 1.1rem; font-family: 'Jost', sans-serif; font-weight: 400;
          color: #080808; outline: none;
          transition: border-color 0.2s;
          border-radius: 0; -webkit-appearance: none;
        }
        .form-input:focus { border-color: #080808; background: #fff; }
        .form-input::placeholder { color: #aaa89f; }

        .form-erro { font-size: 0.95rem; color: #c0392b; margin-bottom: 1rem; font-weight: 500; padding: 0.75rem 1rem; background: #fff5f5; border: 2px solid #f5c6cb; }

        .form-btn {
          width: 100%; padding: 1.15rem;
          background: #080808; color: #f8f7f5;
          border: none; font-size: 0.85rem; letter-spacing: 0.2em; text-transform: uppercase;
          font-family: 'Jost', sans-serif; font-weight: 500;
          cursor: pointer; transition: background 0.2s; margin-top: 0.5rem;
          -webkit-appearance: none;
        }
        .form-btn:hover { background: #2e2d2b; }
        .form-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-divider { height: 2px; background: #e2dfda; margin: 2rem 0; }

        .form-links { display: flex; justify-content: space-between; align-items: center; }
        .form-link-text { font-size: 1rem; color: #2e2d2b; font-weight: 400; }
        .form-link { font-size: 1rem; color: #080808; text-decoration: none; font-weight: 600; border-bottom: 2px solid #080808; padding-bottom: 1px; }
        .form-link-small { display: block; text-align: center; margin-top: 1.25rem; font-size: 0.95rem; color: #2e2d2b; text-decoration: none; font-weight: 400; }
        .form-link-small:hover { color: #080808; }

        .back-link { position: fixed; top: 1.25rem; left: 1.25rem; font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: #f8f7f5; text-decoration: none; font-weight: 500; z-index: 10; }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .back-link { color: #080808; top: 1rem; left: 1rem; }
          .right { padding: 0; align-items: flex-start; }
          .form-wrap { padding: 4rem 1.5rem 3rem; }
          .form-title { font-size: 3rem; margin-bottom: 2rem; }
          .form-label { font-size: 0.85rem; color: #080808; }
          .form-input { font-size: 1.15rem; padding: 1.1rem; border-color: #2e2d2b; }
          .form-btn { font-size: 0.9rem; padding: 1.2rem; }
          .form-link-text { font-size: 1.05rem; color: #080808; }
          .form-link { font-size: 1.05rem; }
          .form-link-small { font-size: 1rem; color: #2e2d2b; }
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
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">{i.email}</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="nome@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">{i.password}</label>
                <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
              </div>
              {erro && <p className="form-erro">{erro}</p>}
              <button className="form-btn" type="submit" disabled={loading}>{loading ? "..." : i.btn}</button>
            </form>
            <div className="form-divider"></div>
            <div className="form-links">
              <span className="form-link-text">{i.registar}</span>
              <a href="/registar" className="form-link">{i.link}</a>
            </div>
            <a href="#" className="form-link-small">{i.esquecer}</a>
          </div>
        </div>
      </div>
    </>
  );
}