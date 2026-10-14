import { useState, useEffect, useRef } from "react";
import { getChatbotResponse, getSuggestedQuestions, getPortfolioName } from "../utils/chatbotLogic";
import { askAI } from "../utils/aiChat";
import "../styles/ChatBot.css";

/* Render **bold** markdown from bot replies without a heavy parser */
function renderRichText(text) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => (
    <span key={lineIdx}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
      {lineIdx < lines.length - 1 && <br />}
    </span>
  ));
}

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! 👋 I'm ${getPortfolioName()}'s AI assistant — grounded in his real portfolio facts. Ask me about his skills, projects, education, experience, or how to hire him!`,
      sender: "bot",
      source: "glm",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const idRef = useRef(2);
  const suggestedQuestions = getSuggestedQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    const text = message.trim();
    if (!text || isLoading) return;

    const userMessage = { id: idRef.current++, text, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Build conversation history for the GLM endpoint
    const history = [
      ...messages.slice(-8).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: text },
    ];

    let reply = null;
    let source = "instant";

    // 1) Try the fact-grounded GLM endpoint (free, no key)
    try {
      const ai = await askAI(history);
      if (ai?.reply) {
        reply = ai.reply;
        source = ai.source || "glm";
      }
    } catch { /* fall through */ }

    // 2) Fallback: local rule-based engine (always works, zero cost)
    if (!reply) {
      // small natural pause so the fallback doesn't feel like a glitch
      await new Promise((r) => setTimeout(r, 350));
      reply = getChatbotResponse(text);
      source = "instant";
    }

    setMessages((prev) => [...prev, { id: idRef.current++, text: reply, sender: "bot", source, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-window" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Portfolio AI assistant">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-header-title-section">
              <div className="chatbot-avatar" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.887-1.28L2 22l1.28-5.113A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2z" />
                  <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
                  <path d="M9.5 14.5c1 .6 4 .6 5 0" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <h3 className="chatbot-title">Portfolio Assistant</h3>
                <p className="chatbot-subtitle">
                  <span className="chatbot-ai-dot" aria-hidden="true" />
                  AI assistant · fact-grounded
                </p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={onClose} title="Close chat" aria-label="Close chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`chatbot-message chatbot-message-${message.sender}`}>
              <div className="chatbot-message-bubble">
                <div className="chatbot-message-text">
                  {renderRichText(message.text)}
                </div>
                {message.sender === "bot" && message.source && (
                  <span className={`chatbot-source-badge chatbot-source-${message.source}`}>
                    {message.source === "glm" ? "AI" : "instant"}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-message chatbot-message-bot">
              <div className="chatbot-message-bubble">
                <div className="chatbot-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {messages.length === 1 && !isLoading && (
            <div className="chatbot-suggestions">
              <p className="chatbot-suggestions-title">Suggested questions:</p>
              <div className="chatbot-suggestions-grid">
                {suggestedQuestions.slice(0, 3).map((question, idx) => (
                  <button
                    key={idx}
                    className="chatbot-suggestion-btn"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <div className="chatbot-input-container">
            <textarea
              className="chatbot-input"
              placeholder="Ask me anything…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
              aria-label="Message the portfolio assistant"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              title="Send message"
              aria-label="Send message"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
