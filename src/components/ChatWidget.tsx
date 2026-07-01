import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, RotateCcw, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { sendMessage, clearChatHistory } from "@/lib/geminiTextService";
import { GeminiLiveClient } from "@/lib/geminiLiveService";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SESSION_ID = `session-${Date.now()}`;

const QUICK_QUESTIONS = [
  "How do I open a savings account?",
  "What are the loan interest rates?",
  "How to check my deposit maturity?",
  "What documents are needed for membership?",
];

const MarkdownRenderer = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  
  const renderBold = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-[#1a1f36]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmedLine = line.trim();
        
        // Bullet points
        if (trimmedLine.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2.5 ml-1 mt-1">
              <span className="text-[#c9a84c] font-bold mt-1">•</span>
              <span className="flex-1 text-sm leading-relaxed text-gray-700">
                {renderBold(trimmedLine.substring(2))}
              </span>
            </div>
          );
        }

        if (!trimmedLine) return <div key={i} className="h-1" />;

        return (
          <p key={i} className="text-sm leading-relaxed text-gray-700">
            {renderBold(line)}
          </p>
        );
      })}
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Sharanam! I'm here to help you with questions about our savings accounts, deposits, loans, and membership. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveUserTranscript, setLiveUserTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Live API refs
  const liveClientRef = useRef<GeminiLiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const liveUserTranscriptRef = useRef("");
  const isVoiceModeActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    isVoiceModeActiveRef.current = isVoiceModeActive;
  }, [isVoiceModeActive]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const startLiveSession = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      liveClientRef.current = new GeminiLiveClient({
        apiKey,
        onAudioData: (buffer) => {
          audioQueue.current.push(buffer);
          processAudioQueue();
        },
        onInputTextData: (text) => {
          liveUserTranscriptRef.current += text;
          setLiveUserTranscript(liveUserTranscriptRef.current);
        },
        onTextData: (text) => {
          liveTranscriptRef.current += text;
          setLiveTranscript(liveTranscriptRef.current);
        },
        onInterrupted: () => {
          audioQueue.current = [];
          isPlayingRef.current = false;
        },
        onTurnComplete: () => {
          const assistantText = liveTranscriptRef.current.trim();
          const userText = liveUserTranscriptRef.current.trim();
          setMessages(prev => {
            const next = [...prev];
            if (userText) {
              next.push({ id: `live-user-${Date.now()}`, role: "user", content: userText });
            }
            if (assistantText) {
              next.push({ id: `live-assistant-${Date.now()}`, role: "assistant", content: assistantText });
            }
            return next;
          });
          liveUserTranscriptRef.current = "";
          liveTranscriptRef.current = "";
          setLiveUserTranscript("");
          setLiveTranscript("");
        },
        onError: (err) => console.error("Live Error:", err)
      });

      await liveClientRef.current.connect();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isVoiceModeActiveRef.current || isSpeakingRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Simple noise gate
        const hasAudio = inputData.some(v => Math.abs(v) > 0.01);
        if (!hasAudio) return;

        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        if (liveClientRef.current) {
          liveClientRef.current.sendAudio(pcmData);
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      isVoiceModeActiveRef.current = true;
      setIsVoiceModeActive(true);
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start Live session:", err);
    }
  };

  const processAudioQueue = async () => {
    if (isPlayingRef.current || audioQueue.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    const buffer = audioQueue.current.shift()!;
    
    try {
      const int16View = new Int16Array(buffer);
      const float32Data = new Float32Array(int16View.length);
      for (let i = 0; i < int16View.length; i++) {
        float32Data[i] = int16View[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      source.onended = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        isPlayingRef.current = false;
        processAudioQueue();
      };
      source.start();
    } catch (e) {
      console.error("Playback error:", e);
      isPlayingRef.current = false;
      processAudioQueue();
    }
  };

  const stopLiveSession = () => {
    setIsVoiceModeActive(false);
    isVoiceModeActiveRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setLiveUserTranscript("");
    liveUserTranscriptRef.current = "";
    liveTranscriptRef.current = "";
    
    liveClientRef.current?.disconnect();
    liveClientRef.current = null;
    
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    
    processorRef.current?.disconnect();
    processorRef.current = null;
    
    audioContextRef.current?.close();
    audioContextRef.current = null;
    
    audioQueue.current = [];
  };

  const toggleVoiceMode = () => {
    if (isVoiceModeActive) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(messageText, SESSION_ID);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (isVoiceModeActive) {
        // Voice mode (Live API) handles its own audio stream natively.
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again or call 9845457250.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    clearChatHistory(SESSION_ID);
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Chat has been reset. How can I help you today?",
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a1f36] text-white shadow-lg flex items-center justify-center hover:bg-[#2d3356] transition-colors"
            style={{ boxShadow: "0 8px 30px rgba(26,31,54,0.35)" }}
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a84c] rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-96px)] bg-white rounded-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.25)" }}
          >
            {/* Header */}
            <div className="bg-[#1a1f36] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-white/20">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-none tracking-tight">sharanam assistant</h3>
                  <p className="text-[#c9a84c] text-[10px] mt-1 font-bold uppercase tracking-wider animate-pulse">
                    {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Online • Live"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Reset chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center overflow-hidden ${
                      msg.role === "user"
                        ? "bg-[#1a1f36]"
                        : "bg-[#c9a84c]/15"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiGKOPlllt8Wur_GBsuN1_NRPMrdlrIeDpGw&s" 
                        alt="AI" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div
                    className={`min-w-0 max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1a1f36] text-white rounded-br-md"
                        : "bg-white text-gray-700 rounded-bl-md border border-gray-100"
                    }`}
                    style={
                      msg.role === "assistant"
                        ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
                        : undefined
                    }
                  >
                    <MarkdownRenderer text={msg.content} />
                  </div>
                </div>
              ))}

               {/* Live Transcript Streaming */}
              {liveUserTranscript && (
                <div className="flex items-start gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-[#1a1f36]">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0 max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed bg-[#1a1f36] text-white rounded-br-md animate-in fade-in">
                    <MarkdownRenderer text={liveUserTranscript} />
                  </div>
                </div>
              )}

              {liveTranscript && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg shrink-0 overflow-hidden bg-[#c9a84c]/15">
                     <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiGKOPlllt8Wur_GBsuN1_NRPMrdlrIeDpGw&s" 
                        alt="AI" 
                        className="w-full h-full object-cover" 
                      />
                  </div>
                  <div className="min-w-0 max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed bg-white text-gray-700 rounded-bl-md border border-gray-100 shadow-sm animate-in fade-in">
                    <MarkdownRenderer text={liveTranscript} />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiGKOPlllt8Wur_GBsuN1_NRPMrdlrIeDpGw&s" 
                      alt="AI" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap bg-gray-50/50">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#c9a84c] hover:text-[#1a1f36] hover:bg-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceMode}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isVoiceModeActive 
                      ? "bg-rose-100 text-rose-600 animate-pulse border-rose-200" 
                      : "bg-gray-50 text-gray-400 hover:text-[#1a1f36] border-gray-100"
                  } border`}
                >
                  {isVoiceModeActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isVoiceModeActive ? "Listening..." : "Type your message..."}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#c9a84c] focus:bg-white transition-colors"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-[#1a1f36] hover:bg-[#2d3356] text-white shrink-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                For urgent help, call 9845457250
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
