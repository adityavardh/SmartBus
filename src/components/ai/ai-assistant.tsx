"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { AI_RESPONSES } from "@/data/mock";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Where is my bus?",
  "When will it arrive?",
  "Why is it late?",
  "Nearest stop",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I’m SmartBus AI. I can tell you where the bus is, when it arrives, and why it’s late." },
  ]);
  const [input, setInput] = useState("");

  const ask = (question: string) => {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    setTimeout(() => {
      const key = question.toLowerCase().replace(/[?.!]/g, "").trim();
      const response =
        Object.entries(AI_RESPONSES).find(([k]) => key.includes(k))?.[1] ??
        AI_RESPONSES.default;
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-glow flex items-center justify-center border border-white/10 backdrop-blur-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 3, repeat: Infinity } }}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 sm:bottom-6 sm:right-6 sm:left-auto left-0 right-0 sm:w-[420px] max-h-[72vh] rounded-t-3xl sm:rounded-[28px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[18px] bg-primary/20 flex items-center justify-center border border-primary/20">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">SmartBus AI</p>
                      <p className="text-xs text-white/40">Ask anything</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[420px]">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-white/5 text-white/80"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 border-t border-white/10">
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/6 text-white/55 hover:text-white hover:bg-white/12 transition-colors border border-white/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ask(input)}
                    placeholder="Ask SmartBus AI..."
                    className="flex-1 h-10 rounded-[16px] bg-white/6 border border-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="icon" onClick={() => ask(input)} className="h-10 w-10 rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
