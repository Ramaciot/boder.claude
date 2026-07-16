import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Calendar,
  HelpCircle,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { contact } from "@/content/site";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import { chatEndpoint, chatConfig, isAIChatEnabled } from "@/lib/boderChat";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

type QuickOptionAction = "meeting" | "whatsapp" | "ai_chat";

interface QuickOption {
  id: string;
  label: string;
  icon: typeof Calendar;
  action: QuickOptionAction;
  whatsappMessage: string | null;
}

const quickOptions: QuickOption[] = [
  {
    id: "meeting",
    label: "📅 Agendar Reunião",
    icon: Calendar,
    action: "meeting",
    whatsappMessage:
      "Olá! Vim pelo site da Boder Space e gostaria de agendar uma reunião para conhecer os serviços.",
  },
  {
    id: "services",
    label: "🎯 Conhecer Serviços",
    icon: Briefcase,
    action: "whatsapp",
    whatsappMessage:
      "Olá! Vim pelo site da Boder Space e gostaria de conhecer mais sobre os serviços de marketing digital. Podem me apresentar as opções?",
  },
  {
    id: "duvida",
    label: "❓ Tenho uma Dúvida",
    icon: HelpCircle,
    action: "whatsapp",
    whatsappMessage: "Olá! Vim pelo site da Boder Space e tenho algumas dúvidas. Podem me ajudar?",
  },
  {
    id: "ai",
    label: "✨ Falar com IA",
    icon: Sparkles,
    action: "ai_chat",
    whatsappMessage: null,
  },
];

const openWhatsApp = (message: string) => {
  window.open(`${contact.whatsappUrl}?text=${encodeURIComponent(message)}`, "_blank");
};

const getDailyWelcomeMessage = () => {
  const day = new Date().getDay();

  const byDay: Record<number, string> = {
    0: "Domingo é um ótimo dia pra planejar a semana. Quer conhecer nossos serviços ou agendar uma reunião?",
    1: "Boa segunda! Vamos colocar sua estratégia em movimento. Quer conhecer nossos serviços ou agendar uma reunião?",
    2: "Boa terça! Posso te ajudar com tráfego, social media, sites e muito mais. Quer conhecer nossos serviços ou agendar uma reunião?",
    3: "Boa quarta! Bora acelerar resultados? Quer conhecer nossos serviços ou agendar uma reunião?",
    4: "Boa quinta! Pronto pra ajustar e otimizar? Quer conhecer nossos serviços ou agendar uma reunião?",
    5: "Boa sexta! Vamos fechar a semana com estratégia. Quer conhecer nossos serviços ou agendar uma reunião?",
    6: "Bom sábado! Se quiser, já deixamos seu plano pronto pra semana. Quer conhecer nossos serviços ou agendar uma reunião?",
  };

  return `Olá! 👋 ${byDay[day] ?? "Como posso ajudar hoje?"}\n\nSelecione uma opção abaixo ou digite sua mensagem:`;
};

const ChatBot = () => {
  const { openMeetingForm } = useMeetingForm();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeShownRef = useRef(false);

  const toggleChatBot = () => setIsOpen((open) => !open);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bolha de boas-vindas após 5s (uma vez), some após 10s
  useEffect(() => {
    if (!welcomeShownRef.current && !isOpen) {
      const timer = setTimeout(() => {
        setShowWelcomeBubble(true);
        welcomeShownRef.current = true;
        setTimeout(() => setShowWelcomeBubble(false), 10000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShowWelcomeBubble(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => addBotMessage(getDailyWelcomeMessage()), 500);
    }
    if (isOpen) setUnreadCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Contador de não lidas + vibração no mobile quando o chat está fechado
  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].sender === "bot") {
      setUnreadCount((prev) => prev + 1);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }
  }, [messages, isOpen]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text, sender: "bot", timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const streamAIResponse = async (userText: string) => {
    setIsTyping(true);
    const newHistory = [...chatHistory, { role: "user", content: userText }];
    setChatHistory(newHistory);

    try {
      const response = await fetch(chatEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatConfig.publishableKey}`,
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          addBotMessage("Muitas mensagens! Aguarde um momento e tente novamente.");
          return;
        }
        throw new Error("AI request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      const botMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, text: "", sender: "bot", timestamp: new Date() },
      ]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMessageId ? { ...m, text: assistantContent } : m)),
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (error) {
      console.error("AI chat error:", error);
      addBotMessage("Desculpe, tive um problema. Tente novamente ou fale com a gente no WhatsApp!");
    }
  };

  const startAIMode = () => {
    if (!isAIChatEnabled()) {
      addBotMessage(
        "No momento a IA está indisponível por aqui, mas nosso time responde rapidinho no WhatsApp! 🚀\n\nToque em “Falar no WhatsApp” logo abaixo.",
      );
      return;
    }
    setIsAIMode(true);
    addBotMessage(
      "Perfeito! Agora você está conversando com a IA da Boder Space. 🤖✨\n\nPosso tirar dúvidas sobre nossos serviços, explicar métricas de marketing, falar sobre estratégias digitais e muito mais!\n\nDigite sua pergunta:",
    );
  };

  const handleQuickOption = (optionId: string) => {
    setShowQuickOptions(false);

    const option = quickOptions.find((o) => o.id === optionId);
    if (!option) return;

    switch (option.action) {
      case "meeting":
        // Abre o formulário de agendamento (igual ao site oficial)
        setIsOpen(false);
        openMeetingForm();
        break;

      case "whatsapp":
        if (option.whatsappMessage) openWhatsApp(option.whatsappMessage);
        break;

      case "ai_chat": {
        const userMessage: Message = {
          id: Date.now(),
          text: option.label,
          sender: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        startAIMode();
        break;
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setShowQuickOptions(false);

    if (isAIMode) {
      await streamAIResponse(messageText);
      return;
    }

    const lowerMessage = messageText.toLowerCase();
    if (lowerMessage.includes("reunião") || lowerMessage.includes("agendar")) {
      addBotMessage("Ótimo! Vou abrir o formulário de agendamento para você. 📅");
      setTimeout(() => {
        setIsOpen(false);
        openMeetingForm();
      }, 1500);
    } else if (isAIChatEnabled()) {
      setIsAIMode(true);
      await streamAIResponse(messageText);
    } else {
      addBotMessage(
        "Boa pergunta! Nosso time responde rapidinho no WhatsApp — toque em “Falar no WhatsApp” logo abaixo. ⚡",
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChatBot}
          className={`h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center text-primary-foreground transition-all duration-350 hover:scale-110 active:scale-95 ${
            isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:brightness-110"
          }`}
          aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Bolha de boas-vindas */}
        {showWelcomeBubble && !isOpen && (
          <div
            className="absolute bottom-16 right-0 w-72 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl rounded-br-none shadow-2xl p-5 animate-fade-up cursor-pointer"
            onClick={toggleChatBot}
          >
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar aviso"
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
              }}
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-base text-foreground pr-4 leading-relaxed">
              👋 Oi! Tem novidades hoje — clique aqui e veja como podemos te ajudar.
            </p>
          </div>
        )}
      </div>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(400px,calc(100vw-3rem))] h-[min(520px,calc(100dvh-8rem))] bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Cabeçalho */}
          <div className="bg-primary text-primary-foreground p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              {isAIMode ? <Sparkles className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg tracking-tight">
                {isAIMode ? "Boder AI" : "Assistente Boder"}
              </h3>
              <p className="text-sm opacity-90 flex items-center gap-1.5">
                {isTyping ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Digitando...
                  </>
                ) : (
                  "Online agora"
                )}
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-background/90 backdrop-blur-xl border border-border/50 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1.5 block">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Opções rápidas */}
            {showQuickOptions && !isTyping && messages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3">
                {quickOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickOption(option.id)}
                    className="text-sm px-3 py-2 rounded-xl border border-border/60 bg-background/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-250"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CTA WhatsApp + input */}
          <div className="p-5 bg-background/80 backdrop-blur-xl border-t border-border/50 space-y-3">
            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium transition-colors"
              onClick={() =>
                openWhatsApp("Olá! Vim pelo site da Boder Space e gostaria de falar com vocês.")
              }
            >
              <Phone className="h-4 w-4" />
              Falar no WhatsApp
            </button>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                aria-label="Enviar mensagem"
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
