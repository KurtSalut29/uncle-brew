"use client";

import { useEffect, useState, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

type Summary = { totalSales: number; totalOrders: number; totalItems: number; avgOrder: number };
type DailyData = { date: string; total: number };
type ProductData = { name: string; quantity: number; revenue: number };
type CategoryData = { category: string; revenue: number };

const PALETTE = [
  "#92694A", "#D97706", "#2563EB", "#16A34A", "#9333EA",
  "#DC2626", "#0891B2", "#CA8A04", "#C026D3", "#059669",
];

const PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function daysAgo(n: number) { return toISO(new Date(Date.now() - n * 86400000)); }
function fmt(v: number) { return `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }
function fmtShort(v: number) { return v >= 1000 ? `₱${(v / 1000).toFixed(1)}k` : `₱${v}`; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

/* ── Mini Calendar ─────────────────────────────────────────── */
function Calendar({
  value, onChange, minDate, maxDate,
}: { value: string; onChange: (v: string) => void; minDate?: string; maxDate?: string }) {
  const init = value ? new Date(value) : new Date();
  const [view, setView] = useState({ year: init.getFullYear(), month: init.getMonth() });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function prev() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function next() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }
  function select(day: number) {
    const iso = toISO(new Date(view.year, view.month, day));
    if (minDate && iso < minDate) return;
    if (maxDate && iso > maxDate) return;
    onChange(iso);
  }

  return (
    <div className="p-3 w-64">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70" style={{ background: "#EDD9B4" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-xs font-semibold" style={{ color: "#1C1008" }}>{MONTHS[view.month]} {view.year}</span>
        <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70" style={{ background: "#EDD9B4" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: "#B08060" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = toISO(new Date(view.year, view.month, day));
          const isSelected = iso === value;
          const disabled = (minDate && iso < minDate) || (maxDate && iso > maxDate);
          return (
            <button key={i} onClick={() => select(day)} disabled={!!disabled}
              className="w-8 h-8 mx-auto rounded-lg text-xs font-medium transition-all flex items-center justify-center"
              style={{
                background: isSelected ? "#92694A" : "transparent",
                color: isSelected ? "#F5ECD7" : disabled ? "#D4B896" : "#1C1008",
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

/* ── Date Range Picker ─────────────────────────────────────── */
function DateRangePicker({
  from, to, onChange,
}: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"from" | "to">("from");
  const [draft, setDraft] = useState({ from, to });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function apply() {
    onChange(draft.from, draft.to);
    setOpen(false);
  }

  function pickDate(val: string) {
    if (picking === "from") {
      setDraft(d => ({ from: val, to: val > d.to ? val : d.to }));
      setPicking("to");
    } else {
      setDraft(d => ({ ...d, to: val < d.from ? d.from : val }));
      setPicking("from");
    }
  }

  const label = `${fmtDate(from)} — ${fmtDate(to)}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setDraft({ from, to }); setPicking("from"); setOpen(o => !o); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
        style={{ background: "#F5ECD7", borderColor: "#D4B896", color: "#6B4F3A" }}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-xl overflow-hidden"
          style={{ background: "#F5ECD7", borderColor: "#D4B896", boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}>
          <div className="flex border-b" style={{ borderColor: "#D4B896" }}>
            <button onClick={() => setPicking("from")}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{ background: picking === "from" ? "#EDD9B4" : "transparent", color: picking === "from" ? "#92694A" : "#B08060" }}>
              From · {fmtDate(draft.from)}
            </button>
            <div className="w-px" style={{ background: "#D4B896" }} />
            <button onClick={() => setPicking("to")}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{ background: picking === "to" ? "#EDD9B4" : "transparent", color: picking === "to" ? "#92694A" : "#B08060" }}>
              To · {fmtDate(draft.to)}
            </button>
          </div>
          <Calendar
            value={picking === "from" ? draft.from : draft.to}
            onChange={pickDate}
            minDate={picking === "to" ? draft.from : undefined}
            maxDate={toISO(new Date())}
          />
          <div className="px-3 pb-3">
            <button onClick={apply}
              className="w-full py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: "#92694A", color: "#F5ECD7" }}>
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Custom Tooltips ───────────────────────────────────────── */
const AreaTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
      <p className="font-semibold mb-0.5" style={{ color: "#1C1008" }}>{fmtDate(label)}</p>
      <p style={{ color: "#92694A" }}>{fmt(payload[0].value)}</p>
    </div>
  );
};
const BarTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
      <p className="font-semibold mb-0.5" style={{ color: "#1C1008" }}>{payload[0].payload.name}</p>
      <p style={{ color: "#92694A" }}>{fmt(payload[0].value)}</p>
    </div>
  );
};
const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
      <p className="font-semibold mb-0.5" style={{ color: "#1C1008" }}>{payload[0].name}</p>
      <p style={{ color: "#92694A" }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

/* ── Skeleton ──────────────────────────────────────────────── */
const Skeleton = ({ h = "h-24" }: { h?: string }) => (
  <div className={`${h} rounded-xl animate-pulse`} style={{ background: "#EDD9B4" }} />
);

/* ── Main Page ─────────────────────────────────────────────── */
export default function ReportsPage() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(toISO(new Date()));
  const [activePreset, setActivePreset] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = `from=${from}&to=${to}`;
    Promise.all([
      fetch(`/api/reports?type=summary&${q}`).then(r => r.json()),
      fetch(`/api/reports?type=daily&${q}`).then(r => r.json()),
      fetch(`/api/reports?type=products&${q}`).then(r => r.json()),
      fetch(`/api/reports?type=categories&${q}`).then(r => r.json()),
    ]).then(([s, d, p, c]) => {
      setSummary(s); setDaily(d); setProducts(p); setCategories(c);
      setLoading(false);
    });
  }, [from, to]);

  function applyRange(f: string, t: string) {
    setFrom(f); setTo(t); setActivePreset(0);
  }

  const totalCatRevenue = categories.reduce((s, c) => s + c.revenue, 0);
  const maxProductRevenue = products[0]?.revenue ?? 1;

  const avgRevenue = daily.length ? daily.reduce((s, d) => s + d.total, 0) / daily.length : 0;

  const cards = summary ? [
    {
      label: "Total Revenue", value: fmt(summary.totalSales), sub: `${summary.totalOrders} orders`, accent: "#92694A",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Total Orders", value: summary.totalOrders.toLocaleString(), sub: "completed", accent: "#D97706",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    },
    {
      label: "Items Sold", value: summary.totalItems.toLocaleString(), sub: "units", accent: "#2563EB",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      label: "Avg. Order", value: fmt(summary.avgOrder), sub: "per order", accent: "#9333EA",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
  ] : [];

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Reports</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Sales analytics overview</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset pills */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#EDD9B4" }}>
            {PRESETS.map(p => (
              <button key={p.days}
                onClick={() => { setActivePreset(p.days); setFrom(daysAgo(p.days)); setTo(toISO(new Date())); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activePreset === p.days ? "#92694A" : "transparent",
                  color: activePreset === p.days ? "#F5ECD7" : "#6B4F3A",
                }}>
                {p.label}
              </button>
            ))}
          </div>
          <DateRangePicker from={from} to={to} onChange={applyRange} />
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} />)
          : cards.map(card => (
            <div key={card.label} className="rounded-xl border p-4 flex flex-col gap-3"
              style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EDD9B4", color: card.accent }}>
                  {card.icon}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[90px] text-right" style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
                  {card.sub}
                </span>
              </div>
              <div>
                <p className="text-base sm:text-xl font-extrabold leading-tight truncate" style={{ color: "#1C1008" }}>{card.value}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#B08060" }}>{card.label}</p>
              </div>
            </div>
          ))}
      </div>

      {/* ── Revenue Trend ── */}
      <div className="rounded-xl border p-5" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>Revenue Trend</p>
            <p className="text-xs mt-0.5" style={{ color: "#B08060" }}>Daily revenue · {fmtDate(from)} – {fmtDate(to)}</p>
          </div>
          {!loading && summary && (
            <p className="text-sm font-bold" style={{ color: "#92694A" }}>{fmt(summary.totalSales)}</p>
          )}
        </div>
        {loading ? <Skeleton h="h-48" /> : daily.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm" style={{ color: "#B08060" }}>No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#92694A" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#92694A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D4B896" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "#B08060" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: "#B08060" }} tickLine={false} axisLine={false} />
              <Tooltip content={<AreaTip />} />
              {avgRevenue > 0 && (
                <ReferenceLine
                  y={avgRevenue}
                  stroke="#D97706"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: `Avg ${fmtShort(avgRevenue)}`, position: "insideTopRight", fontSize: 10, fill: "#D97706", fontWeight: 600 }}
                />
              )}
              <Area type="monotone" dataKey="total" stroke="#92694A" strokeWidth={2.5} fill="url(#grad)" dot={false}
                activeDot={{ r: 5, fill: "#92694A", stroke: "#F5ECD7", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Products */}
        <div className="rounded-xl border p-5" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#1C1008" }}>Top Products</p>
          <p className="text-xs mb-4" style={{ color: "#B08060" }}>By revenue</p>
          {loading ? <Skeleton h="h-48" /> : products.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: "#B08060" }}>No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={products} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4B896" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fill: "#B08060" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6B4F3A" }} tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={16}>
                  {products.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Donut */}
        <div className="rounded-xl border p-5" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#1C1008" }}>Sales by Category</p>
          <p className="text-xs mb-4" style={{ color: "#B08060" }}>Revenue distribution</p>
          {loading ? <Skeleton h="h-48" /> : categories.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: "#B08060" }}>No data for this period</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-[45%] flex-shrink-0">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%"
                      outerRadius={75} innerRadius={48} strokeWidth={3} stroke="#F5ECD7">
                      {categories.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3">
                {categories.map((c, i) => {
                  const pct = totalCatRevenue ? Math.round((c.revenue / totalCatRevenue) * 100) : 0;
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                          <span className="text-xs font-medium truncate" style={{ color: "#1C1008" }}>{c.category}</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums" style={{ color: "#92694A" }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EDD9B4" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Best Sellers Table ── */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#F5ECD7", borderColor: "#D4B896" }}>
        <div className="px-4 sm:px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#D4B896" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>Best Selling Products</p>
            <p className="text-xs mt-0.5" style={{ color: "#B08060" }}>Ranked by revenue</p>
          </div>
          {!loading && products.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
              Top {products.length}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr style={{ background: "#EDD9B4", borderBottom: `1px solid #D4B896` }}>
              {["#", "Product", "Units", "Share", "Revenue"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? "text-right" : "text-left"}`}
                  style={{ color: "#B08060" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "#D4B896" }}>
                  {[40, 120, 40, 80, 60].map((w, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-3 rounded-lg animate-pulse" style={{ background: "#EDD9B4", width: w }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: "#B08060" }}>
                  No data available for this period
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={p.name} className="border-t transition-colors"
                  style={{ borderColor: "#D4B896" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#EDD9B4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-5 py-3.5">
                    <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold"
                      style={{
                        background: i === 0 ? "#D97706" : i === 1 ? "#C9A87C" : i === 2 ? "#92694A" : "#EDD9B4",
                        color: i <= 2 ? "#F5ECD7" : "#6B4F3A",
                      }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-sm" style={{ color: "#1C1008" }}>{p.name}</td>
                  <td className="px-5 py-3.5 text-right text-sm" style={{ color: "#6B4F3A" }}>{p.quantity}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "#EDD9B4" }}>
                        <div className="h-full rounded-full" style={{ width: `${(p.revenue / maxProductRevenue) * 100}%`, background: "#92694A" }} />
                      </div>
                      <span className="text-xs tabular-nums w-7 text-right" style={{ color: "#B08060" }}>
                        {Math.round((p.revenue / maxProductRevenue) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-sm" style={{ color: "#92694A" }}>{fmt(p.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
