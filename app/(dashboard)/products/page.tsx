"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../components/ToastProvider";
import ConfirmModal from "../../../components/ConfirmModal";

type Product = { id: string; name: string; description: string | null; price: number; stock: number; category: string; imageUrl: string | null; };
type FormData = { name: string; description: string; price: string; stock: string; category: string; customCategory: string; imageUrl: string; };

const EMPTY_FORM: FormData = { name: "", description: "", price: "", stock: "", category: "", customCategory: "", imageUrl: "" };
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; product?: Product } | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    const res = await fetch(`/api/products?${params}`);
    setProducts(await res.json());
    setPage(1);
  }

  useEffect(() => { load(); }, [search, filterCategory]);

  // All unique categories from existing products
  const allCategories = [...new Set(products.map((p) => p.category))].sort();

  // Pagination
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // The final category to save — custom input takes priority if filled
  const resolvedCategory = form.customCategory.trim() || form.category;

  function openCreate() {
    setForm({ ...EMPTY_FORM, category: allCategories[0] ?? "" });
    setPreview("");
    setFormError("");
    setModal({ mode: "create" });
  }

  function openEdit(p: Product) {
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stock: String(p.stock), category: p.category, customCategory: "", imageUrl: p.imageUrl ?? "" });
    setPreview(p.imageUrl ?? "");
    setFormError("");
    setModal({ mode: "edit", product: p });
  }

  function closeModal() { setModal(null); setPreview(""); setFormError(""); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return setFormError(data.error ?? "Upload failed");
    setForm((prev) => ({ ...prev, imageUrl: data.url }));
    toast("Image uploaded successfully", "success");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return setFormError("Please wait for the image to finish uploading.");
    if (!resolvedCategory) return setFormError("Please select or enter a category.");
    setSaving(true);
    setFormError("");

    const url = modal?.mode === "edit" ? `/api/products/${modal.product!.id}` : "/api/products";
    const method = modal?.mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, category: resolvedCategory, price: Number(form.price), stock: Number(form.stock) }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      return setFormError(data.error ?? "Something went wrong");
    }
    toast(modal?.mode === "create" ? "Product created successfully" : "Product updated successfully", "success");
    closeModal();
    load();
  }

  async function deleteProduct(id: string, name: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast(`"${name}" deleted`, "success");
    } else {
      toast("Failed to delete product", "error");
    }
    load();
  }

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const inputCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0";
  const inputStyle = { borderColor: "var(--border)" } as React.CSSProperties;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Products</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{products.length} total products</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white transition-colors"
          style={{ background: "var(--brand)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Products", value: products.length, text: "var(--brand)" },
          { label: "Low Stock", value: lowStock, text: "var(--warning)" },
          { label: "Out of Stock", value: outOfStock, text: "var(--error)" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xl font-bold" style={{ color: s.text }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-0"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}>
          <option value="">All Categories</option>
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="sticky top-0" style={{ background: "var(--bg)" }}>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Product", "Category", "Price", "Stock", "Actions"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? "text-right" : "text-left"} ${i === 4 ? "text-center" : ""}`}
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50 transition-colors" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0" style={{ background: "var(--brand-muted)" }}>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          : <img src="/uploads/logo.png" alt="Uncle Brew" className="w-full h-full object-contain p-1.5 opacity-70" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                        {p.description && <p className="text-xs truncate max-w-[180px] mt-0.5" style={{ color: "var(--text-muted)" }}>{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: "var(--brand-muted)", color: "var(--brand)" }}>{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: "var(--text-primary)" }}>₱{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        background: p.stock === 0 ? "var(--error-muted)" : p.stock < 10 ? "var(--warning-muted)" : "var(--success-muted)",
                        color: p.stock === 0 ? "var(--error)" : p.stock < 10 ? "var(--warning)" : "var(--success)",
                      }}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="text-xs font-medium px-2.5 py-1 rounded border transition-colors hover:bg-slate-50"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Edit</button>
                      <button onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                        className="text-xs font-medium px-2.5 py-1 rounded border transition-colors hover:bg-red-50"
                        style={{ borderColor: "var(--border)", color: "var(--error)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Showing {products.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.length)} of {products.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors hover:bg-slate-50 disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors hover:bg-slate-50 disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "...")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n as number)}
                    className="w-7 h-7 rounded border flex items-center justify-center text-xs font-medium transition-colors"
                    style={{
                      borderColor: page === n ? "var(--brand)" : "var(--border)",
                      background: page === n ? "var(--brand)" : "transparent",
                      color: page === n ? "#fff" : "var(--text-secondary)",
                    }}>{n}</button>
                )
              )}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors hover:bg-slate-50 disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="w-7 h-7 rounded border flex items-center justify-center text-xs transition-colors hover:bg-slate-50 disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>»</button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          showLogo
          onConfirm={() => { deleteProduct(confirmDelete.id, confirmDelete.name); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>

            <div className="flex flex-col items-center pt-5 pb-2">
              <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "34px", width: "auto", objectFit: "contain" }} />
            </div>

            <div className="flex items-center justify-center px-5 py-3 border-b relative" style={{ borderColor: "var(--border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {modal.mode === "create" ? "New Product" : "Edit Product"}
              </p>
              <button onClick={closeModal} className="absolute right-4 w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: "var(--text-muted)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <p className="text-xs px-3 py-2 rounded-md" style={{ background: "var(--error-muted)", color: "var(--error)" }}>{formError}</p>
                )}

                {/* Image */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Product Image</label>
                  {preview && (
                    <div className="relative w-full h-36 rounded-md overflow-hidden mb-2 border" style={{ borderColor: "var(--border)" }}>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => { setPreview(""); setForm((f) => ({ ...f, imageUrl: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                        style={{ color: "var(--error)" }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                          <p className="text-xs font-medium" style={{ color: "var(--brand)" }}>Uploading...</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full py-2.5 rounded-md border-2 border-dashed text-xs font-medium transition-colors hover:bg-slate-50 flex items-center justify-center gap-2"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {preview ? "Change Image" : "Upload Image"}
                  </button>
                  <input type="text" value={form.imageUrl} placeholder="Or paste image URL..."
                    onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setPreview(e.target.value); }}
                    className={`${inputCls} mt-2`} style={{ ...inputStyle, fontSize: "11px" }} />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Product Name</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Caramel Macchiato" className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2} placeholder="Short description..."
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                    style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Price (₱)</label>
                    <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="49" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stock</label>
                    <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="100" className={inputCls} style={inputStyle} />
                  </div>
                </div>

                {/* Category — select existing or type new */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Category
                  </label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, customCategory: "" })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 mb-2"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                    disabled={!!form.customCategory}>
                    <option value="">— Select existing —</option>
                    {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="relative">
                    <input type="text" value={form.customCategory}
                      onChange={(e) => setForm({ ...form, customCategory: e.target.value, category: "" })}
                      placeholder="Or type a new category..."
                      className={inputCls} style={{ ...inputStyle, fontSize: "12px" }} />
                    {form.customCategory && (
                      <button type="button" onClick={() => setForm({ ...form, customCategory: "" })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--text-muted)" }}>✕</button>
                    )}
                  </div>
                  {form.customCategory && (
                    <p className="text-xs mt-1" style={{ color: "var(--brand)" }}>
                      New category: <strong>{form.customCategory}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 border-t flex justify-center gap-2" style={{ borderColor: "var(--border)" }}>
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 rounded-md text-xs font-semibold border transition-colors hover:bg-slate-50"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                <button type="submit" disabled={saving || uploading}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: "var(--brand)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
                  {saving ? "Saving..." : uploading ? "Uploading..." : modal.mode === "create" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
