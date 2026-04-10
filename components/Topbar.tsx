"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

const pageTitles: Record<string, string> = {
  "/orders/history": "Order History",
  "/orders": "Point of Sale",
  "/products/create": "New Product",
  "/products": "Products",
  "/reports": "Reports",
  "/feedbacks": "Feedbacks",
};

type Notification = {
  id: string;
  type: "stock" | "order" | "feedback";
  title: string;
  body: string;
  time: string;
  read: boolean;
  link: string;
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? "Dashboard";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("dismissedNotifications");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const ref = useRef<HTMLDivElement>(null);

  function persistDismissed(next: Set<string>) {
    setDismissed(next);
    try { localStorage.setItem("dismissedNotifications", JSON.stringify([...next])); } catch {}
  }

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data: Omit<Notification, "read">[] = await res.json();
      setNotifications((prev) => {
        const readIds = new Set(prev.filter((n) => n.read).map((n) => n.id));
        return data
          .filter((n) => !dismissed.has(n.id))
          .map((n) => ({ ...n, read: readIds.has(n.id) }));
      });
    } catch {
      // silently fail — no DB connection etc.
    }
  }, [dismissed]);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function handleNotificationClick(n: Notification) {
    markRead(n.id);
    setOpen(false);
    router.push(n.link);
  }

  function dismiss(id: string) {
    const next = new Set([...dismissed, id]);
    persistDismissed(next);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismissAll() {
    const next = new Set([...dismissed, ...notifications.map((n) => n.id)]);
    persistDismissed(next);
    setNotifications([]);
    setOpen(false);
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 px-4 md:px-6 flex items-center justify-between flex-shrink-0"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button onClick={onMenuClick} className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-slate-100" style={{ color: "var(--text-secondary)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

        {/* Notification bell */}
        <div className="relative" ref={ref}>
          <button onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
            className="w-8 h-8 rounded-md flex items-center justify-center relative transition-colors hover:bg-slate-100">
            <svg className="w-4 h-4" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold"
                style={{ background: "var(--brand)" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <>
              {/* Backdrop — mobile only */}
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-[4.25rem] sm:top-10 z-50 sm:w-80 rounded-xl sm:rounded-lg shadow-xl border overflow-hidden"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</p>
                  {notifications.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "var(--brand-muted)", color: "var(--brand)" }}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button onClick={dismissAll} className="text-xs font-medium transition-colors hover:opacity-70"
                    style={{ color: "var(--error)" }}>
                    Clear all
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.25}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id}
                      className="flex gap-3 px-4 py-3 border-b transition-colors hover:bg-slate-50 cursor-pointer"
                      style={{ borderColor: "var(--border)", background: n.read ? "transparent" : "#F8FAFF" }}
                      onClick={() => handleNotificationClick(n)}>

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-md flex items-center justify-center"
                        style={{
                          background: n.type === "stock" ? "var(--warning-muted)" : n.type === "feedback" ? "#FEF3C7" : "var(--success-muted)",
                          color: n.type === "stock" ? "var(--warning)" : n.type === "feedback" ? "#D97706" : "var(--success)",
                        }}>
                        {n.type === "stock" ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        ) : n.type === "feedback" ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                          <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded transition-colors hover:bg-slate-200"
                            style={{ color: "var(--text-muted)" }}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{n.body}</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: "var(--brand)" }}>A</div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>Admin</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
