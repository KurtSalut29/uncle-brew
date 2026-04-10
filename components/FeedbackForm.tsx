"use client";

import { useState, useEffect } from "react";

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", message: "", rating: 0 });
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) return setError("Please select a star rating.");
    setLoading(true);
    setError("");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      return setError(data.error ?? "Something went wrong.");
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: "#92694A" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-bold mb-1" style={{ color: "#1C1917" }}>Thank you for your feedback!</p>
        <p className="text-sm" style={{ color: "#A8A29E" }}>We appreciate you taking the time to share your experience.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626" }}>{error}</p>
      )}

      {/* Star Rating */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold" style={{ color: "#1C1917" }}>How was your experience?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-110"
              style={{ color: star <= (hover || form.rating) ? "#F59E0B" : "#D4CFC8" }}
            >
              ★
            </button>
          ))}
        </div>
        {form.rating > 0 && (
          <p className="text-xs font-medium" style={{ color: "#A8A29E" }}>
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][form.rating]}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#78716C" }}>Your Name</label>
        <input
          type="text" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Juan dela Cruz"
          className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: "#F5F0E8", border: "1px solid #E8E4DC", color: "#1C1917" }}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#78716C" }}>Your Message</label>
        <textarea
          required value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your experience..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
          style={{ background: "#F5F0E8", border: "1px solid #E8E4DC", color: "#1C1917" }}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: "#1C1917", color: "#FCD34D" }}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
