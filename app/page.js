"use client";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const { t, lang, changeLang } = useTranslation();

  const occasionKeys = ["ferias", "concerto", "gala", "festa", "casamento", "trabalho", "jantar", "teatro"];

  if (!t) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black: #080808;
          --white: #f8f7f5;
          --grey-100: #f0eeeb;
          --grey-200: #e2dfda;
          --grey-400: #aaa89f;
          --grey-600: #6b6960;
          --grey-800: #2a2926;
          --serif: 'Cormorant', 'Didot', Georgia, serif;
          --sans: 'Jost', 'Helvetica Neue', Arial, sans-serif;
        }

        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: var(--sans); font-weight: 300; -webkit-font-smoothing: antialiased; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 4rem; background: rgba(248,247,245,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--grey-200); }
        .logo { display: flex; flex-direction: column; text-decoration: none; color: var(--black); }
        .logo-name { font-family: var(--serif); font-size: 1.35rem; font-weight: 300; letter-spacing: 0.25em; text-transform: uppercase; line-height: 1; }
        .logo-tagline { font-size: 0.52rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--grey-400); margin-top: 0.2rem; font-weight: 300; }
        .nav-links { display: flex; align-items: center; gap: 3rem; list-style: none; }
        .nav-links a { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-600); text-decoration: none; font-weight: 300; transition: color 0.3s; }
        .nav-links a:hover { color: var(--black); }
        .nav-lang { display: flex; gap: 0.5rem; align-items: center; }
        .lang-btn { font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-400); background: none; border: none; cursor: pointer; font-family: var(--sans); font-weight: 300; transition: color 0.2s; padding: 0; }
        .lang-btn:hover, .lang-btn.active { color: var(--black); }
        .lang-sep { color: var(--grey-200); font-size: 0.6rem; }
        .nav-cta { font-size: 0.62rem !important; letter-spacing: 0.2em !important; color: var(--black) !important; border: 1px solid var(--black) !important; padding: 0.6rem 1.5rem !important; transition: all 0.3s !important; }
        .nav-cta:hover { background: var(--black) !important; color: var(--white) !important; }

        .hero { min-height: 100vh; display: grid; grid-template-columns: 55% 45%; padding-top: 80px; }
        .hero-left { display: flex; flex-direction: column; justify-content: center; padding: 6rem 4rem 6rem 6rem; }
        .hero-eyebrow { font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--grey-400); margin-bottom: 2.5rem; font-weight: 300; }
        .hero-title { font-family: var(--serif); font-size: clamp(3.5rem, 5.5vw, 6rem); font-weight: 300; line-height: 1.02; margin-bottom: 2.5rem; }
        .hero-title em { font-style: italic; color: var(--grey-600); display: block; }
        .hero-divider { width: 40px; height: 1px; background: var(--grey-400); margin-bottom: 2rem; }
        .hero-sub { font-size: 0.88rem; color: var(--grey-600); max-width: 42ch; line-height: 2; margin-bottom: 3.5rem; font-weight: 300; }
        .hero-actions { display: flex; align-items: center; gap: 2.5rem; }
        .btn-primary { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; background: var(--black); color: var(--white); padding: 1rem 2.5rem; text-decoration: none; font-weight: 300; transition: background 0.3s; font-family: var(--sans); display: inline-block; }
        .btn-primary:hover { background: var(--grey-800); }
        .btn-text { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-600); text-decoration: none; font-weight: 300; border-bottom: 1px solid var(--grey-200); padding-bottom: 2px; transition: color 0.2s, border-color 0.2s; }
        .btn-text:hover { color: var(--black); border-color: var(--black); }
        .hero-right { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; }
        .hero-right img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .hero-caption { position: relative; z-index: 2; background: rgba(248,247,245,0.92); padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--grey-200); }
        .hero-caption-name { font-family: var(--serif); font-size: 1rem; font-style: italic; font-weight: 300; }
        .hero-caption-price { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-600); }
        .hero-caption-tag { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-400); margin-top: 0.2rem; text-align: right; }

        .strip { background: var(--black); padding: 0.9rem 0; overflow: hidden; }
        .strip-track { display: flex; white-space: nowrap; animation: marquee 25s linear infinite; }
        .strip-item { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.5); padding: 0 3rem; flex-shrink: 0; font-weight: 300; }
        .strip-item::after { content: '—'; margin-left: 3rem; color: rgba(255,255,255,0.15); }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .section-label { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--grey-400); margin-bottom: 1rem; font-weight: 300; }
        .section-title { font-family: var(--serif); font-size: clamp(2.5rem, 4vw, 4.5rem); font-weight: 300; line-height: 1.08; margin-bottom: 4rem; }
        .section-title em { font-style: italic; color: var(--grey-600); }

        .onde-section { padding: 8rem 6rem; }
        .onde-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; }
        .onde-sub { font-size: 0.85rem; color: var(--grey-600); max-width: 32ch; text-align: right; line-height: 2; font-weight: 300; }
        .occasions-grid { display: grid; grid-template-columns: repeat(8, 1fr); border: 1px solid var(--grey-200); }
        .occasion-btn { padding: 2.5rem 1rem; text-align: center; cursor: pointer; border: none; border-right: 1px solid var(--grey-200); background: var(--white); font-family: var(--serif); font-size: 1.15rem; font-weight: 300; color: var(--grey-600); transition: all 0.25s; }
        .occasion-btn:last-child { border-right: none; }
        .occasion-btn:hover { background: var(--grey-100); color: var(--black); }
        .occasion-btn.active { background: var(--black); color: var(--white); }
        .onde-result { margin-top: 2rem; padding: 2rem 2.5rem; border: 1px solid var(--grey-200); display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
        .onde-result-text { font-family: var(--serif); font-size: 1.3rem; font-style: italic; color: var(--grey-600); }
        .onde-result-text strong { color: var(--black); font-style: normal; font-weight: 400; }

        .process-section { background: var(--grey-100); padding: 8rem 6rem; }
        .process-grid { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 4rem; }
        .process-step { padding: 0 2.5rem 0 0; border-right: 1px solid var(--grey-200); }
        .process-step:last-child { border-right: none; padding-right: 0; }
        .process-step:not(:first-child) { padding-left: 2.5rem; }
        .process-num { font-family: var(--serif); font-size: 4rem; font-weight: 300; color: var(--grey-200); line-height: 1; margin-bottom: 1.5rem; }
        .process-title { font-family: var(--serif); font-size: 1.3rem; font-weight: 400; margin-bottom: 1rem; }
        .process-desc { font-size: 0.82rem; color: var(--grey-600); line-height: 2; font-weight: 300; }

        .catalog-section { padding: 8rem 6rem; }
        .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
        .catalog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--grey-200); }
        .catalog-card { background: var(--white); padding: 3rem 2.5rem; display: flex; flex-direction: column; gap: 0.75rem; cursor: pointer; transition: background 0.25s; text-decoration: none; color: var(--black); }
        .catalog-card:hover { background: var(--grey-100); }
        .catalog-card-num { font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--grey-400); font-weight: 300; }
        .catalog-card-name { font-family: var(--serif); font-size: 1.8rem; font-weight: 300; }
        .catalog-card-arrow { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-400); margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--grey-200); font-weight: 300; }

        .plans-section { background: var(--grey-100); padding: 8rem 6rem; }
        .plans-intro { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: end; margin-bottom: 4rem; }
        .plans-intro-sub { font-size: 0.85rem; color: var(--grey-600); line-height: 2; font-weight: 300; }
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--grey-200); }
        .plan-card { background: var(--white); padding: 2.5rem; position: relative; }
        .plan-card.featured { background: var(--black); color: var(--white); }
        .plan-tag { position: absolute; top: 0; right: 2rem; font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase; background: var(--grey-600); color: var(--white); padding: 0.25rem 0.75rem; font-weight: 300; }
        .plan-name { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--grey-400); margin-bottom: 1.5rem; font-weight: 300; }
        .plan-card.featured .plan-name { color: var(--grey-600); }
        .plan-price { font-family: var(--serif); font-size: 3rem; font-weight: 300; line-height: 1; }
        .plan-period { font-size: 0.65rem; color: var(--grey-400); letter-spacing: 0.1em; margin-top: 0.25rem; margin-bottom: 2rem; font-weight: 300; }
        .plan-card.featured .plan-period { color: var(--grey-600); }
        .plan-line { height: 1px; background: var(--grey-200); margin-bottom: 1.5rem; }
        .plan-card.featured .plan-line { background: #2a2926; }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
        .plan-features li { font-size: 0.78rem; color: var(--grey-600); display: flex; align-items: center; gap: 1rem; font-weight: 300; }
        .plan-card.featured .plan-features li { color: var(--grey-400); }
        .plan-features li::before { content: ''; width: 20px; height: 1px; background: var(--grey-400); flex-shrink: 0; }
        .plan-btn { display: block; text-align: center; font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 0.85rem; text-decoration: none; border: 1px solid var(--grey-800); color: var(--grey-800); transition: all 0.25s; font-weight: 300; font-family: var(--sans); }
        .plan-btn:hover { background: var(--black); color: var(--white); border-color: var(--black); }
        .plan-card.featured .plan-btn { border-color: var(--grey-600); color: var(--grey-400); }
        .plan-card.featured .plan-btn:hover { background: var(--white); color: var(--black); border-color: var(--white); }

        .deposit-section { padding: 8rem 6rem; display: grid; grid-template-columns: 1fr 1fr; gap: 8rem; align-items: start; border-top: 1px solid var(--grey-200); }
        .deposit-title { font-family: var(--serif); font-size: clamp(1.8rem, 2.5vw, 3rem); font-weight: 300; line-height: 1.2; margin-bottom: 1.5rem; }
        .deposit-text { font-size: 0.85rem; color: var(--grey-600); line-height: 2; font-weight: 300; }
        .deposit-methods { display: flex; flex-direction: column; border: 1px solid var(--grey-200); }
        .deposit-method { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--grey-200); display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .deposit-method:last-child { border-bottom: none; }
        .deposit-method-name { font-size: 0.82rem; font-weight: 300; }
        .deposit-method-desc { font-size: 0.68rem; color: var(--grey-400); letter-spacing: 0.05em; text-align: right; font-weight: 300; }

        .cta-section { background: var(--black); color: var(--white); padding: 10rem 6rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .cta-title { font-family: var(--serif); font-size: clamp(3rem, 6vw, 6rem); font-weight: 300; line-height: 1.05; max-width: 16ch; margin-bottom: 2.5rem; }
        .cta-title em { font-style: italic; color: var(--grey-600); }
        .cta-sub { font-size: 0.82rem; color: var(--grey-600); margin-bottom: 3.5rem; max-width: 50ch; line-height: 2; font-weight: 300; }
        .btn-inv { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.3); color: var(--white); padding: 1rem 3rem; text-decoration: none; font-weight: 300; transition: all 0.3s; font-family: var(--sans); }
        .btn-inv:hover { background: var(--white); color: var(--black); border-color: var(--white); }

        footer { padding: 3rem 6rem; border-top: 1px solid var(--grey-200); display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 2rem; }
        .footer-logo { font-family: var(--serif); font-size: 1rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 300; }
        .footer-sub { font-size: 0.52rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--grey-400); margin-top: 0.3rem; font-weight: 300; }
        .footer-links { display: flex; gap: 2.5rem; list-style: none; }
        .footer-links a { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--grey-400); text-decoration: none; font-weight: 300; transition: color 0.2s; }
        .footer-links a:hover { color: var(--black); }
        .footer-copy { grid-column: 1 / -1; font-size: 0.6rem; color: var(--grey-400); padding-top: 1.5rem; border-top: 1px solid var(--grey-100); font-weight: 300; }

        @media (max-width: 900px) {
          nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; min-height: auto; }
          .hero-left { padding: 3rem 1.5rem; }
          .hero-right { height: 70vw; }
          .onde-section, .catalog-section, .cta-section, .process-section, .plans-section { padding: 5rem 1.5rem; }
          .deposit-section { padding: 5rem 1.5rem; grid-template-columns: 1fr; gap: 3rem; }
          .occasions-grid { grid-template-columns: repeat(4, 1fr); }
          .occasion-btn { padding: 1.5rem 0.5rem; font-size: 0.95rem; }
          .onde-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .onde-sub { text-align: left; }
          .process-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
          .process-step { border-right: none; padding: 0; }
          .catalog-grid, .plans-grid { grid-template-columns: 1fr; }
          .plans-intro { grid-template-columns: 1fr; gap: 2rem; }
          .catalog-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          footer { grid-template-columns: 1fr; padding: 2rem 1.5rem; }
          .footer-links { flex-wrap: wrap; gap: 1.5rem; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="#" className="logo">
          <span className="logo-name">{t.marca}</span>
          <span className="logo-tagline">{t.slogan}</span>
        </a>
        <ul className="nav-links">
          <li><a href="#catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#como-funciona">{t.nav.comoFunciona}</a></li>
          <li><a href="#planos">{t.nav.planos}</a></li>
          <li>
            <div className="nav-lang">
              <button className={"lang-btn" + (lang === "pt" ? " active" : "")} onClick={() => changeLang("pt")}>PT</button>
              <span className="lang-sep">/</span>
              <button className={"lang-btn" + (lang === "fr" ? " active" : "")} onClick={() => changeLang("fr")}>FR</button>
              <span className="lang-sep">/</span>
              <button className={"lang-btn" + (lang === "lt" ? " active" : "")} onClick={() => changeLang("lt")}>LT</button>
            </div>
          </li>
          <li><a href="#" className="nav-cta">{t.nav.entrar}</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-title">
            {t.hero.titulo1}<br />
            {t.hero.titulo2}<br />
            <em>{t.hero.titulo3}</em>
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">{t.hero.subtitulo}</p>
          <div className="hero-actions">
            <a href="#onde-vas" className="btn-primary">{t.hero.ctaPrincipal}</a>
            <a href="#catalogo" className="btn-text">{t.hero.ctaSecundario}</a>
          </div>
        </div>
        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
            alt="Nora Grei"
          />
          <div className="hero-caption">
            <span className="hero-caption-name">{t.hero.pecaExemplo}</span>
            <div>
              <div className="hero-caption-price">{t.hero.pecaPreco}</div>
              <div className="hero-caption-tag">{t.hero.novaColecao}</div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="strip-item">
              {[t.strip.item1, t.strip.item2, t.strip.item3, t.strip.item4, t.strip.item5][i % 5]}
            </span>
          ))}
        </div>
      </div>

      {/* ONDE VAS */}
      <section className="onde-section" id="onde-vas">
        <div className="onde-header">
          <div>
            <p className="section-label">Consulting de estilo</p>
            <h2 className="section-title" style={{marginBottom:0}}>
              {t.ondeVas.titulo1}<br /><em>{t.ondeVas.titulo2}</em>
            </h2>
          </div>
          <p className="onde-sub">{t.ondeVas.subtitulo}</p>
        </div>
        <div style={{marginTop:'3rem'}}>
          <div className="occasions-grid">
            {occasionKeys.map((key) => (
              <button
                key={key}
                className={"occasion-btn" + (selected === key ? " active" : "")}
                onClick={() => setSelected(key)}
              >
                {t.ondeVas.ocasioes[key]}
              </button>
            ))}
          </div>
          {selected && (
            <div className="onde-result">
              <p className="onde-result-text">
                {t.ondeVas.sugestao} <strong>{t.ondeVas.ocasioes[selected]}</strong>
              </p>
              <a href="#catalogo" className="btn-primary">{t.ondeVas.ctaSugestao} {t.ondeVas.ocasioes[selected]}</a>
            </div>
          )}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="process-section" id="como-funciona">
        <p className="section-label">{t.comoFunciona.label}</p>
        <h2 className="section-title">{t.comoFunciona.titulo}</h2>
        <div className="process-grid">
          {t.comoFunciona.passos.map((step) => (
            <div key={step.num} className="process-step">
              <div className="process-num">{step.num}</div>
              <h3 className="process-title">{step.titulo}</h3>
              <p className="process-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="catalog-section" id="catalogo">
        <div className="catalog-header">
          <div>
            <p className="section-label">{t.catalogo.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>{t.catalogo.titulo}</h2>
          </div>
          <a href="#" className="btn-text">{t.catalogo.verColecao}</a>
        </div>
        <div className="catalog-grid">
          {Object.entries(t.catalogo.categorias).map(([key, name], i) => (
            <a key={key} href="#" className="catalog-card">
              <span className="catalog-card-num">0{i+1}</span>
              <span className="catalog-card-name">{name}</span>
              <span className="catalog-card-arrow">{t.catalogo.verColecao}</span>
            </a>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section className="plans-section" id="planos">
        <div className="plans-intro">
          <div>
            <p className="section-label">{t.planos.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>{t.planos.titulo}</h2>
          </div>
          <p className="plans-intro-sub">{t.planos.subtitulo}</p>
        </div>
        <div className="plans-grid">
          {t.planos.lista.map((plan, i) => (
            <div key={plan.nome} className={"plan-card" + (i === 1 ? " featured" : "")}>
              {i === 1 && <div className="plan-tag">{t.planos.popular}</div>}
              <p className="plan-name">{plan.nome}</p>
              <div className="plan-price">{plan.preco}</div>
              <p className="plan-period">{t.planos.porMes}</p>
              <div className="plan-line"></div>
              <ul className="plan-features">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <a href="#" className="plan-btn">{t.planos.saberMais}</a>
            </div>
          ))}
        </div>
      </section>

      {/* DEPÓSITO */}
      <section className="deposit-section">
        <div>
          <p className="section-label">{t.deposito.label}</p>
          <h2 className="deposit-title">{t.deposito.titulo}</h2>
          <p className="deposit-text">{t.deposito.texto}</p>
        </div>
        <div className="deposit-methods">
          {t.deposito.metodos.map((m) => (
            <div key={m.nome} className="deposit-method">
              <span className="deposit-method-name">{m.nome}</span>
              <span className="deposit-method-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">{t.cta.titulo1}<br /><em>{t.cta.titulo2}</em></h2>
        <p className="cta-sub">{t.cta.subtitulo}</p>
        <a href="#onde-vas" className="btn-inv">{t.cta.botao}</a>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="footer-logo">{t.marca}</div>
          <div className="footer-sub">{t.slogan}</div>
        </div>
        <ul className="footer-links">
          {Object.entries(t.footer.links).map(([key, label]) => (
            <li key={key}><a href="#">{label}</a></li>
          ))}
        </ul>
        <p className="footer-copy">{t.footer.direitos}</p>
      </footer>
    </>
  );
}