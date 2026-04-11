"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SmoothScrollLink } from "./SmoothScrollLink";

const links = [
  {
    href: "#menu",
    label: "Menu",
    desc: "Browse all drinks",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "#categories",
    label: "Categories",
    desc: "Explore by type",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "#feedback",
    label: "Reviews",
    desc: "Share your experience",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9990,
          background: "rgba(10,8,7,0.75)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9995,
          width: "280px", maxWidth: "85vw",
          background: "linear-gradient(160deg, #C9A87C 0%, #B8956A 60%, #A8845A 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
          display: "flex", flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-32px 0 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #6B3F1F, transparent)", opacity: 0.5 }} />

        {/* Header */}
        <div style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "28px", width: "auto" }} />
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.3)" }} />
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "20px", padding: "3px 8px",
            }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E", display: "block", boxShadow: "0 0 6px #22C55E" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#4ADE80", letterSpacing: "0.05em" }}>OPEN</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#6B3F1F", fontSize: "13px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <p style={{
            fontSize: "9px", fontWeight: 900, letterSpacing: "0.15em",
            color: "#7C5C42", paddingLeft: "10px", marginBottom: "10px",
          }}>NAVIGATION</p>

          {links.map(({ href, label, desc, icon }, i) => (
            <SmoothScrollLink
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "13px 14px", borderRadius: "14px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                textDecoration: "none",
                transition: "all 0.2s",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <span style={{
                width: "38px", height: "38px", borderRadius: "11px", flexShrink: 0,
                background: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6B3F1F",
              }}>
                {icon}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#1C1008", letterSpacing: "-0.01em" }}>{label}</span>
                <span style={{ fontSize: "11px", color: "#7C5C42", fontWeight: 500 }}>{desc}</span>
              </span>
              <span style={{ marginLeft: "auto", color: "#92694A", fontSize: "14px" }}>›</span>
            </SmoothScrollLink>
          ))}

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.25)", margin: "10px 0" }} />

          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "13px 14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #1C1917 0%, #2C1A0E 100%)",
              border: "1px solid rgba(252,211,77,0.25)",
              textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <span style={{
              width: "38px", height: "38px", borderRadius: "11px", flexShrink: 0,
              background: "rgba(252,211,77,0.15)",
              border: "1px solid rgba(252,211,77,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#FCD34D",
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#FCD34D", letterSpacing: "-0.01em" }}>Staff Portal</span>
              <span style={{ fontSize: "11px", color: "#92694A", fontWeight: 500 }}>Sign in to dashboard</span>
            </span>
            <span style={{ marginLeft: "auto", color: "#FCD34D", fontSize: "14px" }}>›</span>
          </Link>

          {/* Hours info */}
          <div style={{
            padding: "12px 14px", borderRadius: "14px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ color: "#92694A" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C5C42" }}>Open Today</p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#1C1008", letterSpacing: "-0.01em" }}>9:00 AM – 10:00 PM</p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <div className="md:hidden">

      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        style={{
          width: "40px", height: "40px",
          borderRadius: "12px",
          background: open ? "#1C1917" : "#F5F0E8",
          border: `1.5px solid ${open ? "rgba(252,211,77,0.25)" : "#E8E4DC"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.25s ease",
          flexShrink: 0,
        }}
      >
        <svg
          width="18" height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ overflow: "visible" }}
        >
          {/* Top line → rotates to \ */}
          <line
            x1="2" y1="5" x2="16" y2="5"
            stroke={open ? "#FCD34D" : "#1C1917"}
            strokeWidth="1.75"
            strokeLinecap="round"
            style={{
              transformOrigin: "9px 5px",
              transform: open ? "rotate(45deg) translateY(4px)" : "none",
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), stroke 0.25s",
            }}
          />
          {/* Middle line → fades out */}
          <line
            x1="4" y1="9" x2="16" y2="9"
            stroke={open ? "#FCD34D" : "#1C1917"}
            strokeWidth="1.75"
            strokeLinecap="round"
            style={{
              opacity: open ? 0 : 1,
              transition: "opacity 0.2s ease, stroke 0.25s",
            }}
          />
          {/* Bottom line → rotates to / */}
          <line
            x1="2" y1="13" x2="16" y2="13"
            stroke={open ? "#FCD34D" : "#1C1917"}
            strokeWidth="1.75"
            strokeLinecap="round"
            style={{
              transformOrigin: "9px 13px",
              transform: open ? "rotate(-45deg) translateY(-4px)" : "none",
              transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), stroke 0.25s",
            }}
          />
        </svg>
      </button>

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
