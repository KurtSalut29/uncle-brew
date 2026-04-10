"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
};

type Props = {
  initial?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
};

const CATEGORIES = ["Milk Tea", "Fruit Tea", "Coffee", "Smoothies", "Snacks", "Add-ons"];

export default function ProductForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    stock: initial?.stock ?? "",
    category: initial?.category ?? "Milk Tea",
    imageUrl: initial?.imageUrl ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      router.push("/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Product Name</label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Classic Milk Tea"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
          style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties} />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2} placeholder="Short description..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition resize-none"
          style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Price (₱)</label>
          <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="120"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
            style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock</label>
          <input type="number" required min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="50"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
            style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Category</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
          style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>Image URL <span className="normal-case font-normal">(optional)</span></label>
        <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
          style={{ "--tw-ring-color": "var(--brand)" } as React.CSSProperties} />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
          style={{ background: "var(--brand)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          {loading ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/products")}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}
