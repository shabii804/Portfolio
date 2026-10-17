import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";
import { usePortfolio } from "../hooks/usePortfolio";
import "../styles/ChatButton.css";

export default function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fabHidden, setFabHidden] = useState(false);
  const { personal } = usePortfolio();

  const toggleChat = () => {
    setIsChatOpen((open) => !open);
  };

  /* v25 UX: on phones the two floating buttons sit over real content
     (form fields, timeline cards, body text). Hide them while the user
     scrolls DOWN, reveal on scroll-up / at top — and never hide while
     the chat panel is open (the button doubles as its close control). */
  useEffect(() => {
    if (isChatOpen) {
      // reset on open (async so we don't setState synchronously in the effect)
      return () => { requestAnimationFrame(() => setFabHidden(false)); };
    }
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > lastY + 4;
        const goingUp = y < lastY - 4;
        if (goingDown && y > 320) setFabHidden(true);
        else if (goingUp || y <= 320) setFabHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isChatOpen]);

  // Listen for "Ask the AI assistant" command from the command palette
  useEffect(() => {
    const openChat = () => setIsChatOpen(true);
    window.addEventListener("toggle-chatbot", openChat);
    return () => window.removeEventListener("toggle-chatbot", openChat);
  }, []);

  const phoneDigits = (personal.phone || "").replace(/\D/g, "");

  return (
    <>
      {/* Floating actions container */}
      <div className={`fab-stack fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 flex flex-col items-center gap-3 select-none pointer-events-none ${fabHidden ? "fab-stack-hidden" : ""}`}>
        
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
          className="whatsapp-float-button pointer-events-auto flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
        >
          {/* Inline WhatsApp glyph — no external image dependency */}
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" fill="#25D366" aria-hidden="true">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.414 1.258 4.868L2 22l5.312-1.392c1.401.763 3.001 1.196 4.7 1.196 5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm0 18.203c-1.489 0-2.951-.399-4.227-1.155l-.303-.18-3.142.823.838-3.064-.198-.315a8.19 8.19 0 0 1-1.258-4.324c0-4.54 3.696-8.233 8.24-8.233 4.543 0 8.238 3.694 8.238 8.236 0 4.542-3.695 8.212-8.188 8.212zm4.52-6.153c-.247-.124-1.464-.722-1.69-.805-.227-.083-.392-.124-.557.124-.165.247-.64.805-.784.97-.145.165-.289.186-.536.062-.247-.124-1.043-.384-1.986-1.226-.734-.655-1.23-1.463-1.374-1.71-.145-.248-.016-.382.108-.505.111-.11.247-.289.37-.434.124-.145.165-.248.248-.413.083-.166.041-.31-.021-.434-.062-.124-.556-1.34-.762-1.835-.2-.482-.404-.417-.556-.424l-.474-.009c-.165 0-.433.062-.66.31-.226.247-.864.845-.864 2.06 0 1.215.885 2.39 1.008 2.554.124.165 1.74 2.656 4.215 3.724.589.254 1.049.406 1.407.52.592.188 1.13.161 1.556.098.474-.071 1.464-.598 1.67-1.177.206-.578.206-1.073.145-1.177-.062-.103-.227-.165-.474-.289z"/>
          </svg>
        </a>
      </div>

      {/* Chat Window */}
      <ChatBot isOpen={isChatOpen} onClose={toggleChat} />
    </>
  );
}
