import { useState, useEffect, useRef } from "react";
import { getChatbotResponse, getSuggestedQuestions, getPortfolioName } from "../utils/chatbotLogic";
import "../styles/ChatBot.css";

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! 👋 I'm ${getPortfolioName()}'s portfolio assistant. Ask me anything about his skills, projects, education, certifications, or how to contact him!`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const suggestedQuestions = getSuggestedQuestions();

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate bot typing delay (100-500ms)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 100));

    // Get bot response
    const botResponse = getChatbotResponse(message);
    const botMessage = {
      id: messages.length + 2,
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-window">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-header-title-section">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3 className="chatbot-title">Portfolio Assistant</h3>
                <p className="chatbot-subtitle">Ask me about {getPortfolioName()}</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={onClose} title="Close chat">
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`chatbot-message chatbot-message-${message.sender}`}>
              <div className="chatbot-message-bubble">
                <div className="chatbot-message-text">
                  {message.text.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
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

          {/* Suggested Questions (shown only if less than 3 messages) */}
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

        {/* Input Area */}
        <div className="chatbot-input-area">
          <div className="chatbot-input-container">
            <textarea
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
