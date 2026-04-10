"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="text-sm" style={{ color: s <= rating ? "#F59E0B" : "#D4CFC8" }}>★</span>
      ))}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => { setFeedbacks(data); setLoading(false); });
  }, []);

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : "—";

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));

  const ratingLabel = ["Poor", "Fair", "Good", "Great", "Excellent"];
  const filtered = filter === null ? feedbacks : feedbacks.filter((f) => f.rating === filter);

  const PER_PAGE = 6;
  const [page, setPage] = useState(1);

  // reset page when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Customer Feedback</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{feedbacks.length} total reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Average rating */}
        <div className="bg-white rounded-xl border p-5 flex flex-col items-center justify-center gap-1" style={{ borderColor: "var(--border)" }}>
          <p className="text-5xl font-extrabold leading-none" style={{ color: "var(--brand)" }}>{avg}</p>
          <Stars rating={Math.round(Number(avg))} />
          <span className="mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>
            {feedbacks.length} reviews
          </span>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>RATING BREAKDOWN</p>
          <div className="space-y-2">
            {dist.map(({ star, count }) => {
              const pct = feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex gap-px w-16 flex-shrink-0">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-xs" style={{ color: s <= star ? "#F59E0B" : "#D4CFC8" }}>★</span>
                    ))}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${pct}%`,
                      background: "var(--brand)",
                    }} />
                  </div>
                  <span className="text-xs w-7 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {[null, 5, 4, 3, 2, 1].map((val) => {
          const active = filter === val;
          const label = val === null ? "All" : [1,2,3,4,5].map((s) => (
            <span key={s} style={{ color: s <= val ? "#F59E0B" : active ? "#D4CFC8" : "#A8A29E" }}>★</span>
          ));
          return (
            <button
              key={val ?? "all"}
              onClick={() => setFilter(val)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
              style={{
                background: active ? "var(--brand)" : "#F5F0E8",
                color: active ? "#FCD34D" : "var(--text-secondary)",
                border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
              }}
            >
              {val === null ? (
                <>All <span className="ml-1 opacity-70">{feedbacks.length}</span></>
              ) : (
                <>{label} <span className="ml-1 opacity-70">{dist.find((d) => d.star === val)?.count ?? 0}</span></>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No feedback yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Customer reviews will appear here</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border py-12 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No {filter}★ reviews yet</p>
          </div>
        ) : (
          paginated.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "var(--brand)" }}>
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars rating={f.rating} />
                      <span className="text-xs font-medium" style={{ color: "#92400E" }}>{ratingLabel[f.rating - 1]}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>{timeAgo(f.createdAt)}</p>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)", paddingLeft: "52px" }}>{f.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-1 pb-4">
          <p className="text-xs" style={{ color: "#B08060" }}>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold disabled:opacity-40 transition-all"
              style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | string)[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) => n === "…" ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: "#B08060" }}>…</span>
              ) : (
                <button key={n} onClick={() => setPage(n as number)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: page === n ? "#92694A" : "#EDD9B4",
                    color: page === n ? "#F5ECD7" : "#6B4F3A",
                  }}>
                  {n}
                </button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold disabled:opacity-40 transition-all"
              style={{ background: "#EDD9B4", color: "#6B4F3A" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
