"use client";
import { useState, useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "351912345678"; // número da Nora Grei

const t = {
  pt: {
    titulo: "Ajuda Nora Grei",
    subtitulo: "Respondemos em segundos",
    placeholder: "Escreve a tua dúvida...",
    enviar: "Enviar",
    whatsapp: "Falar com pessoa",
    typing: "A escrever...",
    bemVindo: "Olá! Sou o assistente da Nora Grei. Como posso ajudar?",
    sugestoes: ["Como funciona o aluguer?", "Quanto custa o depósito?", "Como devolver uma peça?", "Ver os meus pontos"],
    humano: "Preferes falar com alguém da nossa equipa?",
    abrirWhatsapp: "Abrir WhatsApp",
  },
  fr: {
    titulo: "Aide Nora Grei",
    subtitulo: "Nous répondons en quelques secondes",
    placeholder: "Écrivez votre question...",
    enviar: "Envoyer",
    whatsapp: "Parler à quelqu'un",
    typing: "En train d'écrire...",
    bemVindo: "Bonjour ! Je suis l'assistant Nora Grei. Comment puis-je vous aider ?",
    sugestoes: ["Comment fonctionne la location ?", "Combien coûte le dépôt ?", "Comment retourner une pièce ?", "Voir mes points"],
    humano: "Préférez-vous parler à notre équipe ?",
    abrirWhatsapp: "Ouvrir WhatsApp",
  },
  lt: {
    titulo: "Nora Grei pagalba",
    subtitulo: "Atsakome per kelias sekundes",
    placeholder: "Parašykite savo klausimą...",
    enviar: "Siųsti",
    whatsapp: "Kalbėti su žmogumi",
    typing: "Rašoma...",
    bemVindo: "Sveiki! Aš esu Nora Grei asistentas. Kaip galiu padėti?",
    sugestoes: ["Kaip veikia nuoma?", "Kiek kainuoja užstatas?", "Kaip grąžinti drabužį?", "Žiūrėti mano taškus"],
    humano: "Pageidaujate kalbėti su mūsų komanda?",
    abrirWhatsapp: "Atidaryti WhatsApp",
  },
};

const systemPrompt = `És o assistente virtual da Nora Grei, uma plataforma premium de aluguer de moda de luxo em Portugal.

Informações importantes:
- Aluguer de roupa e acessórios de luxo por dia
- Taxa de higienização: 9€ por peça
- Depósito de caução = valor da peça (devolvido após inspeção)
- Métodos de depósito: cartão, transferência, cheque visado, dinheiro (presencial)
- Métodos de pagamento: cartão, MB Way, transferência, dinheiro, cheque visado
- Entrega: envio para casa ou levantamento presencial
- Devolução: por correio ou presencial
- Programa de fidelização: 10 alugueres = 1 grátis
- Peças indisponíveis podem ser reservadas com notificação automática

Responde sempre de forma elegante, concisa e útil. Máximo 3 frases por resposta.
Se não souberes responder ou for um problema complexo, sugere falar com a equipa humana.
Nunca inventes informações sobre preços específicos de peças.`;

export default function ChatWidget({ lang = "pt" }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarHumano, setMostrarHumano] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const i = t[lang] || t.pt;

  useEffect(() => {
    if (aberto && !iniciado) {
      setMensagens([{ role: "assistant", content: i.bemVindo }]);
      setIniciado(true);
    }
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [aberto]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, loading]);

  const enviar = async (texto) => {
    const msg = texto || input.trim();
    if (!msg) return;
    setInput("");
    setMostrarHumano(false);

    const novasMensagens = [...mensagens, { role: "user", content: msg }];
    setMensagens(novasMensagens);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: novasMensagens.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const resposta = data.content?.[0]?.text || "";
      setMensagens(prev => [...prev, { role: "assistant", content: resposta }]);

      // Após 2 respostas do AI, oferecer humano
      const respostasAI = novasMensagens.filter(m => m.role === "assistant").length;
      if (respostasAI >= 2) setMostrarHumano(true);

    } catch(e) {
      setMensagens(prev => [...prev, { role: "assistant", content: "Ocorreu um erro. Por favor tenta novamente." }]);
    }
    setLoading(false);
  };

  const abrirWhatsApp = () => {
    const conversa = mensagens.map(m => `${m.role === "user" ? "Cliente" : "AI"}: ${m.content}`).join("\n");
    const texto = encodeURIComponent(`Olá! Preciso de ajuda com a Nora Grei.\n\n[Conversa anterior]\n${conversa}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, "_blank");
  };

  return (
    <>
      <style>{`
        .chat-fab {
          position: fixed;
          bottom: calc(80px + env(safe-area-inset-bottom));
          right: 1rem;
          z-index: 300;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #c4748a;
          color: #f8f7f5;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(196,116,138,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          font-size: 1.3rem;
        }
        .chat-fab:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }

        .chat-window {
          position: fixed;
          bottom: calc(160px + env(safe-area-inset-bottom));
          right: 1.25rem;
          z-index: 299;
          width: 360px;
          max-height: 520px;
          background: #f8f7f5;
          border: 1px solid #e2dfda;
          box-shadow: 0 12px 48px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.25s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header {
          background: #c4748a;
          color: #f8f7f5;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .chat-header-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .chat-header-titulo { font-family: 'Cormorant', serif; font-size: 1rem; font-weight: 400; letter-spacing: 0.1em; }
        .chat-header-sub { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); font-family: 'Jost', sans-serif; font-weight: 400; }
        .chat-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #27ae60; display: inline-block; margin-right: 0.4rem; }
        .chat-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 1.1rem; padding: 0; transition: color 0.2s; }
        .chat-close:hover { color: #f8f7f5; }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat-msg {
          max-width: 85%;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          line-height: 1.6;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
        }

        .chat-msg-ai {
          background: #f0eeeb;
          color: #080808;
          align-self: flex-start;
          border-radius: 0 8px 8px 8px;
        }

        .chat-msg-user {
          background: #080808;
          color: #f8f7f5;
          align-self: flex-end;
          border-radius: 8px 0 8px 8px;
        }

        .chat-typing {
          align-self: flex-start;
          padding: 0.75rem 1rem;
          background: #f0eeeb;
          border-radius: 0 8px 8px 8px;
          display: flex;
          gap: 0.3rem;
          align-items: center;
        }

        .chat-typing-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #aaa89f;
          animation: bounce 1.2s infinite;
        }
        .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

        .chat-sugestoes {
          padding: 0 1rem 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .chat-sugestao {
          font-size: 0.72rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid #e2dfda;
          background: #f8f7f5;
          color: #4a4845;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          transition: all 0.2s;
          border-radius: 20px;
        }
        .chat-sugestao:hover { border-color: #080808; color: #080808; }

        .chat-humano {
          margin: 0 1rem 0.75rem;
          padding: 0.75rem 1rem;
          background: #f0eeeb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .chat-humano-text { font-size: 0.78rem; color: #4a4845; font-family: 'Jost', sans-serif; font-weight: 400; }
        .chat-humano-btn { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; background: #25D366; color: #fff; border: none; padding: 0.5rem 0.85rem; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 500; white-space: nowrap; border-radius: 4px; }

        .chat-input-area {
          padding: 0.75rem 1rem;
          border-top: 1px solid #e2dfda;
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2dfda;
          background: #f8f7f5;
          font-size: 0.9rem;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          color: #080808;
          outline: none;
          border-radius: 0;
          -webkit-appearance: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: #080808; }

        .chat-send {
          width: 44px; height: 44px;
          background: #080808;
          color: #f8f7f5;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .chat-send:hover { background: #2a2926; }
        .chat-send:disabled { background: #e2dfda; cursor: not-allowed; }

        @media (max-width: 768px) {
          .chat-window { right: 0; left: 0; bottom: calc(130px + env(safe-area-inset-bottom)); width: 100%; max-height: 55vh; border-left: none; border-right: none; }
          .chat-fab { bottom: calc(80px + env(safe-area-inset-bottom)); right: 1rem; }
        }
      `}</style>

      {/* FAB BUTTON */}
      <button className="chat-fab" onClick={() => setAberto(!aberto)} aria-label="Chat">
        {aberto ? "✕" : "💬"}
      </button>

      {/* CHAT WINDOW */}
      {aberto && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-header-titulo">
                <span className="chat-header-dot"></span>
                {i.titulo}
              </span>
              <span className="chat-header-sub">{i.subtitulo}</span>
            </div>
            <button className="chat-close" onClick={() => setAberto(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {mensagens.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.role === "assistant" ? "chat-msg-ai" : "chat-msg-user"}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-typing">
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* SUGESTÕES */}
          {mensagens.length <= 1 && (
            <div className="chat-sugestoes">
              {i.sugestoes.map((s, idx) => (
                <button key={idx} className="chat-sugestao" onClick={() => enviar(s)}>{s}</button>
              ))}
            </div>
          )}

          {/* OPÇÃO HUMANO */}
          {mostrarHumano && (
            <div className="chat-humano">
              <span className="chat-humano-text">{i.humano}</span>
              <button className="chat-humano-btn" onClick={abrirWhatsApp}>
                {i.abrirWhatsapp}
              </button>
            </div>
          )}

          {/* INPUT */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && enviar()}
              placeholder={i.placeholder}
              disabled={loading}
            />
            <button className="chat-send" onClick={() => enviar()} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}