import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

// Components
import AIChatHeader from "../components/AIChat/AIChatHeader";
import MessageList from "../components/AIChat/MessageList";
import ChatInput from "../components/AIChat/ChatInput";
import SuggestedQuestions from "../components/AIChat/SuggestedQuestions";

const AIChatComponent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "WHAT IS THE CURRENT GAS PRICE EVM?",
    "HOW TO DEPLOY SMART CONTRACT?",
    "EXPLAIN ZERO KNOWLEDGE PROOFS",
    "TOP TRENDING DEFI PROTOCOLS"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      if (!response.ok) throw new Error("Neural link unstable");

      const data = await response.json();
      const aiMessage = { type: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "SYNC_ERROR: UNABLE_TO_REACH_NEURAL_CORE. CHECK_UPLINK." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto transition-all duration-700 rounded-[2.5rem] shadow-2xl border flex flex-col h-[85vh] overflow-hidden ${isDark ? "bg-[#0d0b1c]/60 border-white/5 backdrop-blur-2xl" : "bg-white/80 backdrop-blur-xl border-white/20"
      }`}>
      <AIChatHeader theme={theme} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        chatEndRef={chatEndRef}
        theme={theme}
      />

      {messages.length === 0 && (
        <SuggestedQuestions
          suggestions={suggestedQuestions}
          onSelect={(q) => { setInput(q); }}
          theme={theme}
        />
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isLoading={isLoading}
        theme={theme}
      />
    </div>
  );
};

export default AIChatComponent;
