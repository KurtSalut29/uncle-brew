"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const navGroups = [
  {
    label: "Operations",
    items: [
      {
        href: "/orders",
        label: "Point of Sale",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        href: "/orders/history",
        label: "Order History",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        href: "/products",
        label: "Products",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        href: "/reports",
        label: "Reports",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        href: "/feedbacks",
        label: "Feedbacks",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
    ],
  },
];

type Props = { open: boolean; onClose: () => void };

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    localStorage.setItem("pendingToast", "You have been signed out. See you next time!");
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/orders" ? pathname === "/orders" : pathname.startsWith(href);

  const sidebarContent = (
    <aside
      className="w-56 h-full flex flex-col flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #F5ECD7 0%, #EDD9B4 100%)",
        borderRight: "1px solid #D4B896",
      }}
    >
      {/* Brand */}
      <div className="px-4 h-16 flex items-center justify-center relative" style={{ borderBottom: "1px solid #D4B896" }}>
        <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "34px", width: "auto" }} />
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden absolute right-3 w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "#92694A" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#92694A" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-100 relative"
                    style={{
                      background: active ? "rgba(146,105,74,0.15)" : "transparent",
                      color: active ? "#3B1F0A" : "#92694A",
                      borderLeft: active ? "2px solid #6B3F1F" : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(146,105,74,0.08)";
                        e.currentTarget.style.color = "#6B3F1F";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#92694A";
                      }
                    }}
                  >
                    <span style={{ color: active ? "#3B1F0A" : "#B08060" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4" style={{ borderTop: "1px solid #D4B896" }}>
        <div className="pt-3">
          <button
            onClick={() => setConfirmSignOut(true)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-100"
            style={{ color: "#92694A" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(146,105,74,0.08)"; e.currentTarget.style.color = "#6B3F1F"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#92694A"; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile — slide-in drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
          {/* Drawer */}
          <div className="relative h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {confirmSignOut && (
        <ConfirmModal
          title="Sign Out"
          message="Are you sure you want to sign out?"
          confirmLabel="Sign Out"
          danger
          showLogo
          onConfirm={signOut}
          onCancel={() => setConfirmSignOut(false)}
        />
      )}
    </>
  );
}
