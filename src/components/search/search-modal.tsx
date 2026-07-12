"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { SEARCH_DATA } from "@/data/mock";
import { Search, X, MapPin, Route, User, School } from "lucide-react";
import { useState } from "react";

const TYPE_ICONS = {
  stop: MapPin,
  route: Route,
  driver: User,
  school: School,
};

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState("");

  const results = query
    ? SEARCH_DATA.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATA;

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-lg rounded-[28px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stops, routes, drivers..."
                className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                <p className="text-xs text-white/30 px-3 py-2 tracking-[0.22em] uppercase">
                {query ? "Results" : "Recent Searches"}
              </p>
              {results.map((result) => {
                const Icon = TYPE_ICONS[result.type];
                return (
                  <button
                    key={result.id}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[18px] hover:bg-white/6 transition-colors text-left"
                    onClick={() => setSearchOpen(false)}
                  >
                      <div className="w-10 h-10 rounded-[16px] bg-white/6 border border-white/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{result.title}</p>
                      <p className="text-xs text-white/40">{result.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
