"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "../../../../components/ToastProvider";

type OrderItem = { id: string; quantity: number; subtotal: number; product: { name: string } };
type Order = { id: string; totalAmount: number; createdAt: string; user: { name: string }; items: OrderItem[] };

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}
function fmt(v: number) { return `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function Calendar({ value, onChange, minDate, maxDate }: {
  value: string; onChange: (v: string) => void; minDate?: string; maxDate?: string;
}) {
  const init = value ? new Date(value) : new Date();
  const [view, setView] = useState({ year: init.getFullYear(), month: init.getMonth() });
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function prev() { setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }); }
  function next() { setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }); }

  return (
    <div className="p-3 w-64">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: "#EDD9B4" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-xs font-semibold" style={{ color: "#1C1008" }}>{MONTHS[view.month]} {view.year}</span>
        <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: "#EDD9B4" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map(d => <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: "#B08060" }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = toISO(new Date(view.year, view.month, day));
          const selected = iso === value;
          const disabled = (minDate && iso < minDate) || (maxDate && iso > maxDate);
          return (
            <button key={i} onClick={() => !disabled && onChange(iso)} disabled={!!disabled}
              className="w-8 h-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all"
              style={{
                background: selected ? "#92694A" : "transparent",
                color: selected ? "#F5ECD7" : disabled ? "#D4B896" : "#1C1008",
                cursor: disabled ? "not-allowed" : "pointer",
              }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ from, to, onChange }: {
  from: string; to: string; onChange: (f: string, t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"from" | "to">("from");
  const [draft, setDraft] = useState({ from, to });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function pickDate(val: string) {
    if (picking === "from") {
      setDraft(d => ({ from: val, to: val > d.to ? val : d.to }));
      setPicking("to");
    } else {
      setDraft(d => ({ ...d, to: val < d.from ? d.from : val }));
      setPicking("from");
    }
  }

  const label = from && to ? `${fmtDate(from)} — ${fmtDate(to)}` : "Filter by date";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setDraft({ from, to }); setPicking("from"); setOpen(o => !o); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
        style={{ background: "#F5ECD7", borderColor: "#D4B896", color: "#6B4F3A" }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="truncate max-w-[160px]">{label}</span>
        <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-xl overflow-hidden"
          style={{ background: "#F5ECD7", borderColor: "#D4B896", boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}>
          <div className="flex border-b" style={{ borderColor: "#D4B896" }}>
            <button onClick={() => setPicking("from")} className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{ background: picking === "from" ? "#EDD9B4" : "transparent", color: picking === "from" ? "#92694A" : "#B08060" }}>
              From · {draft.from ? fmtDate(draft.from) : "—"}
            </button>
            <div className="w-px" style={{ background: "#D4B896" }} />
            <button onClick={() => setPicking("to")} className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{ background: picking === "to" ? "#EDD9B4" : "transparent", color: picking === "to" ? "#92694A" : "#B08060" }}>
              To · {draft.to ? fmtDate(draft.to) : "—"}
            </button>
          </div>
          <Calendar value={picking === "from" ? draft.from : draft.to} onChange={pickDate}
            minDate={picking === "to" ? draft.from : undefined} maxDate={toISO(new Date())} />
          <div className="px-3 pb-3 flex gap-2">
            <button onClick={() => { onChange("", ""); setOpen(false); }}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border"
              style={{ borderColor: "#D4B896", color: "#6B4F3A", background: "transparent" }}>
              Clear
            </button>
            <button onClick={() => { onChange(draft.from, draft.to); setOpen(false); }}
              className="flex-1 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#92694A", color: "#F5ECD7" }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<(number | string)[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all"
        style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      {pages.map((n, i) => n === "…" ? (
        <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: "#B08060" }}>…</span>
      ) : (
        <button key={n} onClick={() => onChange(n as number)}
          className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
          style={{ background: page === n ? "#92694A" : "#EDD9B4", color: page === n ? "#F5ECD7" : "#6B4F3A" }}>
          {n}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all"
        style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

const PER_PAGE = 8;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/orders?${params}`)
      .then(r => r.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
        if (from || to) toast(`Found ${data.length} order${data.length !== 1 ? "s" : ""}`, "info");
      });
  }, [from, to]);

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrder     = orders.length ? totalRevenue / orders.length : 0;
  const totalPages   = Math.ceil(orders.length / PER_PAGE);
  const paginated    = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4 pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Order History</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
      </div>

      {/* Stat cards */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Total Revenue", value: fmt(totalRevenue),
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              accent: "#92694A",
            },
            {
              label: "Total Orders", value: orders.length.toLocaleString(),
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
              accent: "#D97706",
            },
            {
              label: "Avg. Order", value: fmt(avgOrder),
              icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              accent: "#6B4F3A",
            },
          ].map(card => (
            <div key={card.label} className="rounded-xl border p-4 flex items-center gap-3"
              style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#EDD9B4", color: card.accent }}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold leading-tight truncate" style={{ color: "#1C1008" }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#B08060" }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order list */}
      <div className="space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 animate-pulse" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: "#EDD9B4" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-lg w-32" style={{ background: "#EDD9B4" }} />
                  <div className="h-2.5 rounded-lg w-48" style={{ background: "#EDD9B4" }} />
                </div>
                <div className="h-4 rounded-lg w-20" style={{ background: "#EDD9B4" }} />
              </div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="rounded-xl border py-16 flex flex-col items-center justify-center gap-3"
            style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#EDD9B4" }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: "#B08060" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>No orders found</p>
              <p className="text-xs mt-0.5" style={{ color: "#B08060" }}>Try adjusting the date range</p>
            </div>
          </div>
        ) : (
          paginated.map((order) => {
            const isOpen = expanded === order.id;
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div key={order.id} className="rounded-xl border overflow-hidden transition-all"
                style={{ background: "#F5ECD7", borderColor: isOpen ? "#92694A" : "#D4B896" }}>

                <div className="flex items-center justify-between px-3 sm:px-4 py-3.5 cursor-pointer gap-2"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#EDD9B4"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>

                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isOpen ? "#92694A" : "#EDD9B4", color: isOpen ? "#F5ECD7" : "#92694A" }}>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>#{order.id.slice(-6).toUpperCase()}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#B08060" }}>
                        {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)} · {order.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#92694A" }}>{fmt(order.totalAmount)}</p>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
                      <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t px-4 py-3 space-y-1" style={{ borderColor: "#D4B896", background: "#EDD9B4" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#B08060" }}>Order Items</p>
                    {order.items.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0"
                        style={{ borderColor: "#D4B896" }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: "#F5ECD7", color: "#92694A" }}>
                            {idx + 1}
                          </span>
                          <p className="text-xs font-medium truncate" style={{ color: "#1C1008" }}>{item.product.name}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F5ECD7", color: "#6B4F3A" }}>
                            ×{item.quantity}
                          </span>
                          <p className="text-xs font-bold w-20 text-right" style={{ color: "#92694A" }}>{fmt(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-xs font-semibold" style={{ color: "#6B4F3A" }}>Total</p>
                      <p className="text-sm font-extrabold" style={{ color: "#1C1008" }}>{fmt(order.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs" style={{ color: "#B08060" }}>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, orders.length)} of {orders.length} orders
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
