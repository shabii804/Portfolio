import { useState } from "react";
import ChatBot from "./ChatBot";
import { usePortfolio } from "../context/PortfolioContext";
import "../styles/ChatButton.css";

export default function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { personal } = usePortfolio();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const phoneDigits = (personal.phone || "").replace(/\D/g, "");

  return (
    <>
      {/* Floating actions container */}
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 flex flex-col items-center gap-3 select-none pointer-events-none">
        
        {/* Floating Chat Button (above WhatsApp) */}
        <button
          className={`chat-button pointer-events-auto ${isChatOpen ? "chat-button-active" : ""}`}
          onClick={toggleChat}
          title="Open portfolio assistant"
          aria-label="Portfolio assistant"
        >
          <span className="chat-button-icon">
            {isChatOpen ? (
              // Close icon with rotation anim
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform duration-300 rotate-90">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              // Sleek, glowing modern AI Robot chat icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.887-1.28L2 22l1.28-5.113A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2z" />
                <rect x="9" y="8" width="6" height="5" rx="1" fill="currentColor" className="opacity-10" />
                <circle cx="10" cy="10" r="1.2" fill="currentColor" />
                <circle cx="14" cy="10" r="1.2" fill="currentColor" />
                <path d="M10 14.5c1 .5 3 .5 4 0" strokeWidth="1.5" />
              </svg>
            )}
          </span>
        </button>

        {/* Floating WhatsApp Button (at the bottom) */}
        <a
          href={`https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(personal.name.split(" ")[0])}!%20I%27d%20like%20to%20talk.`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="whatsapp-float-button pointer-events-auto flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 shadow-lg bg-[#25D366] hover:bg-[#20ba5a]"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/500px-WhatsApp_icon.png"
            alt="WhatsApp"
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
        </a>
      </div>

      {/* Chat Window */}
      <ChatBot isOpen={isChatOpen} onClose={toggleChat} />
    </>
  );
}
