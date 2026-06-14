"use client";
import { useState } from "react";

const occasions = [
  { icon: "✈️", label: "Férias" },
  { icon: "🎵", label: "Concerto" },
  { icon: "💫", label: "Gala" },
  { icon: "🥂", label: "Festa" },
  { icon: "💍", label: "Casamento" },
  { icon: "💼", label: "Trabalho" },
  { icon: "🌙", label: "Jantar" },
  { icon: "🎭", label: "Teatro" },
];

export default function Home() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black: #0a0a0a;
          --white: #fafafa;
          --grey-100: #f2f2f0;
          --grey-300: #d4d4d0;
          --grey-500: #8a8a86;
          --grey-700: #3a3a38;
          --accent: #b8a99a;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--white);
          color: var(--black);
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300;
          font-size: 15px;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(250,250,250,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--grey-300);
        }

        .logo {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--black);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-sub {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--accent);
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }

        .nav-links a {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--grey-700);
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--black); }

        .nav-cta {
          background: var(--black) !important;
          color: var(--white) !important;
          padding: 0.6rem 1.4rem;
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          padding-top: 72px;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 5rem 3rem 5rem 5rem;
        }

        .eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(3rem, 4.5vw, 5rem);
          font-weight: 300;
          line-height: 1.05;
          margin-bottom: 1.5rem;
        }

        .hero-title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero-sub {
          font-size: 0.95rem;
          color: var(--grey-500);
          max-width: 40ch;
          margin-bottom: 3rem;
          line-height: 1.9;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-block;
          background: var(--black);
          color: var(--white);
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 1rem 2.5rem;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-primary:hover { background: var(--grey-700); }

        .btn-ghost {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--grey-500);
          text-decoration: none;
          border-bottom: 1px solid var(--grey-300);
          padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }

        .btn-ghost:hover { color: var(--black); border-color: var(--black); }

        .hero-right {
          background: linear-gradient(160deg, #e8e4e0 0%, #cfc9c3 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero-right-label {
          position: absolute;
          top: 2rem; left: 2rem;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--grey-700);
        }

        .hero-tag {
          background: rgba(250,250,250,0.92);
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .hero-tag-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-style: italic;
        }

        .hero-tag-price {
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--grey-500);
          white-space: nowrap;
        }

        /* STRIP */
        .strip {
          background: var(--black);
          color: var(--white);
          padding: 0.85rem 0;
          overflow: hidden;
        }

        .strip-inner {
          display: flex;
          gap: 4rem;
          animation: marquee 22s linear infinite;
          white-space: nowrap;
        }

        .strip-item {
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .strip-dot { color: var(--accent); margin: 0 1rem; }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ONDE VAS */
        .onde-section {
          padding: 7rem 5rem;
          background: var(--white);
        }

        .onde-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3rem;
        }

        .onde-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
        }

        .onde-title em { font-style: italic; color: var(--accent); }

        .onde-sub {
          font-size: 0.85rem;
          color: var(--grey-500);
          max-width: 30ch;
          text-align: right;
          line-height: 1.7;
        }

        .occasions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .occasion-card {
          border: 1px solid var(--grey-300);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--white);
        }

        .occasion-card:hover {
          border-color: var(--black);
          background: var(--grey-100);
        }

        .occasion-card.active {
          border-color: var(--black);
          background: var(--black);
          color: var(--white);
        }

        .occasion-icon { font-size: 1.5rem; }

        .occasion-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .occasion-cta {
          text-align: center;
          margin-top: 1rem;
        }

        .occasion-cta-text {
          font-size: 0.85rem;
          color: var(--grey-500);
          margin-bottom: 1.5rem;
        }

        .occasion-cta-text span {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-style: italic;
          color: var(--black);
        }

        /* COMO FUNCIONA */
        .section { padding: 7rem 5rem; }

        .section-label {
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1rem;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3.5rem);
          font-weight: 300;
          line-height: 1.15;
          max-width: 20ch;
          margin-bottom: 4rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2.5rem;
        }

        .step { border-top: 1px solid var(--grey-300); padding-top: 2rem; }

        .step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--grey-300);
          line-height: 1;
          margin-bottom: 1rem;
        }

        .step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 400;
          margin-bottom: 0.75rem;
        }

        .step-desc { font-size: 0.88rem; color: var(--grey-500); line-height: 1.8; }

        /* CATEGORIAS */
        .categories-section {
          background: var(--grey-100);
          padding: 7rem 5rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .category-card {
          background: var(--white);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: var(--black);
        }

        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.07);
        }

        .category-icon { font-size: 2rem; margin-bottom: 0.5rem; }

        .category-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
        }

        .category-count {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--grey-500);
        }

        /* PLANOS — discretos */
        .plans-section {
          padding: 6rem 5rem;
          border-top: 1px solid var(--grey-300);
        }

        .plans-intro {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
          margin-bottom: 4rem;
        }

        .plans-intro-text {
          font-size: 0.9rem;
          color: var(--grey-500);
          line-height: 1.9;
          max-width: 45ch;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .plan-card {
          padding: 2rem;
          border: 1px solid var(--grey-300);
          position: relative;
          transition: border-color 0.2s;
        }

        .plan-card:hover { border-color: var(--black); }
        .plan-card.featured { border-color: var(--black); background: var(--black); color: var(--white); }

        .plan-badge {
          position: absolute;
          top: -1px; right: 1.5rem;
          background: var(--accent);
          color: var(--white);
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.25rem 0.7rem;
        }

        .plan-name {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--grey-500);
          margin-bottom: 1rem;
        }

        .plan-card.featured .plan-name { color: var(--grey-300); }

        .plan-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .plan-period { font-size: 0.75rem; color: var(--grey-500); margin-bottom: 1.5rem; }
        .plan-card.featured .plan-period { color: var(--grey-300); }

        .plan-divider { height: 1px; background: var(--grey-200); margin-bottom: 1.5rem; }
        .plan-card.featured .plan-divider { background: var(--grey-700); }

        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
        .plan-features li { font-size: 0.82rem; color: var(--grey-700); display: flex; align-items: center; gap: 0.6rem; }
        .plan-card.featured .plan-features li { color: var(--grey-300); }
        .plan-features li::before { content: ''; width: 12px; height: 1px; background: var(--accent); flex-shrink: 0; }

        .plan-btn {
          display: block;
          text-align: center;
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.8rem;
          text-decoration: none;
          border: 1px solid var(--black);
          color: var(--black);
          transition: background 0.2s, color 0.2s;
        }

        .plan-btn:hover { background: var(--black); color: var(--white); }
        .plan-card.featured .plan-btn { border-color: var(--white); color: var(--white); }
        .plan-card.featured .plan-btn:hover { background: var(--white); color: var(--black); }

        /* DEPÓSITO */
        .deposit-section {
          padding: 5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
          background: var(--grey-100);
        }

        .deposit-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 2.5vw, 2.8rem);
          font-weight: 300;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .deposit-text { color: var(--grey-500); line-height: 1.9; margin-bottom: 2rem; font-size: 0.9rem; }

        .deposit-methods { display: flex; flex-direction: column; gap: 0.75rem; }

        .deposit-method {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1px solid var(--grey-300);
          background: var(--white);
        }

        .deposit-method-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 1rem;
        }

        .deposit-method-name { font-size: 0.82rem; font-weight: 400; margin-bottom: 0.15rem; }
        .deposit-method-desc { font-size: 0.74rem; color: var(--grey-500); }

        /* CTA */
        .cta-section {
          padding: 9rem 5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 300;
          line-height: 1.1;
          max-width: 18ch;
          margin-bottom: 2rem;
        }

        .cta-title em { font-style: italic; color: var(--accent); }
        .cta-sub { color: var(--grey-500); margin-bottom: 3rem; max-width: 45ch; font-size: 0.9rem; }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--grey-300);
          padding: 3rem 5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: center;
        }

        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .footer-links { display: flex; gap: 2rem; list-style: none; }
        .footer-links a { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-500); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--black); }
        .footer-copy { grid-column: 1 / -1; font-size: 0.68rem; color: var(--grey-500); padding-top: 1.5rem; border-top: 1px solid var(--grey-100); }

        /* MOBILE */
        @media (max-width: 768px) {
          .nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .hero { grid-template-columns: 1fr; min-height: auto; }
          .hero-left { padding: 3rem 1.5rem 2rem; }
          .hero-right { min-height: 60vw; }
          .onde-section { padding: 4rem 1.5rem; }
          .onde-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .onde-sub { text-align: left; }
          .occasions-grid { grid-template-columns: repeat(2, 1fr); }
          .section { padding: 4rem 1.5rem; }
          .steps { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .categories-section { padding: 4rem 1.5rem; }
          .categories-grid { grid-template-columns: 1fr; }
          .plans-section { padding: 4rem 1.5rem; }
          .plans-intro { grid-template-columns: 1fr; gap: 2rem; }
          .plans-grid { grid-template-columns: 1fr; }
          .deposit-section { grid-template-columns: 1fr; padding: 3rem 1.5rem; gap: 2rem; }
          .cta-section { padding: 5rem 1.5rem; }
          footer { grid-template-columns: 1fr; padding: 2rem 1.5rem; }
          .footer-links { flex-wrap: wrap; gap: 1rem; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="nav">
        <a href="#" className="logo">
          Nora Grei
          <span className="logo-sub">Rent or Buy</span>
        </a>
        <ul className="nav-links">
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#como-funciona">Como funciona</a></li>
          <li><a href="#planos">Planos</a></li>
          <li><a href="#" className="nav-cta">Entrar</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="eyebrow">Moda de Luxo · Rent or Buy</p>
          <h1 className="hero-title">
            A peça certa,<br />
            para o momento<br />
            <em>certo.</em>
          </h1>
          <p className="hero-sub">
            Alugue peças únicas da Nora Grei para qualquer ocasião.
            Sem compromisso, sem armário cheio — só o look perfeito quando precisa.
          </p>
          <div className="hero-actions">
            <a href="#onde-vas" className="btn-primary">Onde vais hoje?</a>
            <a href="#catalogo" className="btn-ghost">Ver catálogo</a>
          </div>
        </div>
        <div className="hero-right">
          <span className="hero-right-label">Nova coleção disponível</span>
          <div className="hero-tag">
            <span className="hero-tag-name">Vestido Seda Noite</span>
            <span className="hero-tag-price">Alugar · 35€/dia</span>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-inner">
          {[1,2].map(i => (
            <span key={i} style={{display:'flex', gap:'4rem', flexShrink:0}}>
              <span className="strip-item">Envio gratuito <span className="strip-dot">·</span></span>
              <span className="strip-item">Depósito 100% devolvido <span className="strip-dot">·</span></span>
              <span className="strip-item">Roupa inspecionada e limpa <span className="strip-dot">·</span></span>
              <span className="strip-item">Cancele quando quiser <span className="strip-dot">·</span></span>
              <span className="strip-item">Rent or Buy <span className="strip-dot">·</span></span>
            </span>
          ))}
        </div>
      </div>

      {/* ONDE VAS HOJE */}
      <section className="onde-section" id="onde-vas">
        <div className="onde-header">
          <h2 className="onde-title">
            Onde vais<br /><em>hoje?</em>
          </h2>
          <p className="onde-sub">
            Diz-nos a ocasião e sugerimos o look perfeito para ti — roupa e acessórios incluídos.
          </p>
        </div>

        <div className="occasions-grid">
          {occasions.map((o) => (
            <div
              key={o.label}
              className={`occasion-card${selected === o.label ? ' active' : ''}`}
              onClick={() => setSelected(o.label)}
            >
              <span className="occasion-icon">{o.icon}</span>
              <span className="occasion-label">{o.label}</span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="occasion-cta">
            <p className="occasion-cta-text">
              Perfeito! Vamos encontrar o look ideal para <span>{selected}</span>.
            </p>
            <a href="#catalogo" className="btn-primary">Ver sugestões para {selected}</a>
          </div>
        )}
      </section>

      {/* COMO FUNCIONA */}
      <section className="section" id="como-funciona" style={{background:'var(--grey-100)'}}>
        <p className="section-label">O processo</p>
        <h2 className="section-title">De casa até ao evento — em 4 passos.</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3 className="step-title">Escolhe a ocasião</h3>
            <p className="step-desc">Diz-nos onde vais. Filtramos o catálogo com sugestões personalizadas para o teu momento.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3 className="step-title">Seleciona as datas</h3>
            <p className="step-desc">Escolhe os dias de que precisas no calendário. Vês a disponibilidade em tempo real.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3 className="step-title">Recebe em casa</h3>
            <p className="step-desc">A peça chega limpa e pronta a usar. Ou levanta presencialmente se preferires.</p>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <h3 className="step-title">Devolve</h3>
            <p className="step-desc">Envie de volta pelo correio. O depósito é devolvido assim que inspecionamos a peça.</p>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="categories-section" id="catalogo">
        <p className="section-label">Catálogo</p>
        <h2 className="section-title">Roupa e acessórios para cada momento.</h2>
        <div className="categories-grid">
          {[
            { icon: '👗', name: 'Vestidos', count: 'Ver coleção' },
            { icon: '🧥', name: 'Casacos', count: 'Ver coleção' },
            { icon: '👔', name: 'Conjuntos', count: 'Ver coleção' },
            { icon: '👜', name: 'Acessórios', count: 'Ver coleção' },
            { icon: '👡', name: 'Calçado', count: 'Ver coleção' },
            { icon: '✨', name: 'Novidades', count: 'Ver coleção' },
          ].map((cat) => (
            <a key={cat.name} href="#" className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* PLANOS — discretos */}
      <section className="plans-section" id="planos">
        <div className="plans-intro">
          <div>
            <p className="section-label">Subscrição</p>
            <h2 className="section-title">Aluga com frequência? Poupa com um plano.</h2>
          </div>
          <p className="plans-intro-text">
            Os planos de subscrição são opcionais — podes sempre alugar peça a peça sem compromisso.
            Mas se usas a Nora Grei regularmente, um plano mensal dá-te acesso a mais peças por menos.
          </p>
        </div>
        <div className="plans-grid">
          <div className="plan-card">
            <p className="plan-name">Basic</p>
            <div className="plan-price">29<sup style={{fontSize:'1.2rem'}}>,90€</sup></div>
            <p className="plan-period">por mês</p>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              <li>1 peça por mês</li>
              <li>Envio incluído</li>
              <li>Todo o catálogo</li>
            </ul>
            <a href="#" className="plan-btn">Saber mais</a>
          </div>
          <div className="plan-card featured">
            <div className="plan-badge">Popular</div>
            <p className="plan-name">Premium</p>
            <div className="plan-price">69<sup style={{fontSize:'1.2rem'}}>,90€</sup></div>
            <p className="plan-period">por mês</p>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              <li>3 peças por mês</li>
              <li>Envio incluído</li>
              <li>Acesso prioritário</li>
              <li>Styling notes</li>
            </ul>
            <a href="#" className="plan-btn">Saber mais</a>
          </div>
          <div className="plan-card">
            <p className="plan-name">VIP</p>
            <div className="plan-price">99<sup style={{fontSize:'1.2rem'}}>,90€</sup></div>
            <p className="plan-period">por mês</p>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              <li>5 peças por mês</li>
              <li>Envio expresso</li>
              <li>Acesso antecipado</li>
              <li>Consultation mensal</li>
            </ul>
            <a href="#" className="plan-btn">Saber mais</a>
          </div>
        </div>
      </section>

      {/* DEPÓSITO */}
      <section className="deposit-section">
        <div>
          <p className="section-label">Transparência total</p>
          <h2 className="deposit-title">O depósito protege a peça — e devolve-se sozinho.</h2>
          <p className="deposit-text">
            Ao alugar, reservamos um depósito equivalente ao valor da peça.
            É devolvido na íntegra quando a peça regressa em bom estado.
            Escolha como prefere pagar — adaptamos a si.
          </p>
        </div>
        <div className="deposit-methods">
          {[
            { icon: '💳', name: 'Cartão de crédito ou débito', desc: 'Reservado via Stripe. Devolvido automaticamente.' },
            { icon: '🏦', name: 'Transferência bancária', desc: 'Envie comprovativo. Devolvemos em 2 dias úteis.' },
            { icon: '📄', name: 'Cheque visado', desc: 'Entregue presencialmente na recolha.' },
            { icon: '💵', name: 'Dinheiro', desc: 'Pago e devolvido em mãos — sempre presencial.' },
          ].map((m) => (
            <div key={m.name} className="deposit-method">
              <div className="deposit-method-icon">{m.icon}</div>
              <div>
                <div className="deposit-method-name">{m.name}</div>
                <div className="deposit-method-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <h2 className="cta-title">O look perfeito<br /><em>começa aqui.</em></h2>
        <p className="cta-sub">Diz-nos onde vais e tratamos do resto. Sem subscrição obrigatória, sem complicações.</p>
        <a href="#onde-vas" className="btn-primary">Onde vais hoje?</a>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="footer-logo">Nora Grei</div>
          <div style={{fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', marginTop:'0.3rem'}}>Rent or Buy</div>
        </div>
        <ul className="footer-links">
          <li><a href="#">Catálogo</a></li>
          <li><a href="#">Planos</a></li>
          <li><a href="#">Como funciona</a></li>
          <li><a href="#">Contacto</a></li>
          <li><a href="#">Termos</a></li>
          <li><a href="#">Privacidade</a></li>
        </ul>
        <p className="footer-copy">© 2025 Nora Grei. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}