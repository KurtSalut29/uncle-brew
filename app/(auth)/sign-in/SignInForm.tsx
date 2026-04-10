"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInForm({ hasAdmin }: { hasAdmin: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    localStorage.setItem("pendingToast", `Welcome back, ${data.user?.name ?? "Admin"}!`);
    router.push("/orders");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1 text-center" style={{ color: "var(--text-primary)" }}>
        {hasAdmin ? "Sign in" : "Welcome!"}
      </h1>
      <p className="text-sm mb-6 text-center" style={{ color: "var(--text-muted)" }}>
        {hasAdmin ? "Enter your credentials to access the POS" : "No admin account found. Set one up first."}
      </p>

      {!hasAdmin && (
        <Link href="/sign-up"
          className="block w-full py-2.5 rounded-md text-sm font-semibold text-center text-white mb-4 transition-colors"
          style={{ background: "var(--brand)" }}>
          Set Up Admin Account
        </Link>
      )}

      {hasAdmin && (
        <>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs mb-4" style={{ background: "var(--error-muted)", color: "var(--error)" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@unclebrew.com"
                className="w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition"
                style={{ borderColor: "var(--border)" }} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border rounded-md px-3 py-2.5 pr-10 text-sm focus:outline-none transition"
                  style={{ borderColor: "var(--border)" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "var(--brand)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </>
      )}

      <p className="text-center text-xs mt-4">
        <Link href="/" className="font-semibold" style={{ color: "var(--text-muted)" }}>← Back to Menu</Link>
      </p>
    </div>
  );
}
