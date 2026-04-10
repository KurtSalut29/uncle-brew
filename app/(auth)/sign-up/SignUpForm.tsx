"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    router.push("/sign-in");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1 text-center" style={{ color: "var(--text-primary)" }}>Create Admin Account</h1>
      <p className="text-sm mb-6 text-center" style={{ color: "var(--text-muted)" }}>Set up your account to get started</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs mb-4" style={{ background: "var(--error-muted)", color: "var(--error)" }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Full Name", key: "name", type: "text", placeholder: "Juan dela Cruz" },
          { label: "Email Address", key: "email", type: "email", placeholder: "admin@unclebrew.com" },
          { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
          { label: "Confirm Password", key: "confirm", type: "password", placeholder: "Repeat password" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <input type={type} required value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition"
              style={{ borderColor: "var(--border)" }} />
          </div>
        ))}

        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ background: "var(--brand)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs mt-4">
        <Link href="/" className="font-semibold" style={{ color: "var(--text-muted)" }}>← Back to Menu</Link>
      </p>
    </div>
  );
}
