"use client";

import { useState, useEffect, useCallback } from "react";

export default function CategoryBar({ categories }: { categories: string[] }) {
  const [active, setActive] = useState<string>("");

  const updateActive = useCallback(() => {
    for (const cat of [...categories].reverse()) {
      const el = document.getElementById(`cat-${cat.replace(/\s+/g, "-")}`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 160) {
        setActive(cat);
        return;
      }
    }
    setActive("");
  }, [categories]);

  useEffect(() => {
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  function handleClick(cat: string) {
    setActive(cat);
    const target = document.getElementById(`cat-${cat.replace(/\s+/g, "-")}`);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 128;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E4DC", position: "sticky", top: "64px", zIndex: 40 }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch", paddingLeft: "16px", paddingRight: "16px" }}>
        <span className="text-xs font-black uppercase tracking-widest mr-2" style={{ color: "#C4B5A0", flexShrink: 0, whiteSpace: "nowrap" }}>BROWSE</span>
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: isActive ? "#92694A" : "#1C1917",
                color: "#FAFAF8",
                border: `1px solid ${isActive ? "#92694A" : "#1C1917"}`,
                transform: isActive ? "scale(1.05)" : "scale(1)",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
