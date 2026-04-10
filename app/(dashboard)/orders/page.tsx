"use client";

import { useEffect, useState } from "react";
import { useToast } from "../../../components/ToastProvider";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  description: string | null;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  toppings: string[];
};

type ModalState = {
  product: Product;
  size: string;
  toppings: string[];
  quantity: number;
};

const SIZES = [{ label: "Small", delta: -10 }, { label: "Medium", delta: 0 }, { label: "Large", delta: 20 }];
const ORDER_TYPES = ["Dine In", "Takeout", "Delivery"];

type Addon = { id: string; name: string; price: number; stock: number };

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [orderType, setOrderType] = useState("Dine In");
  const [placing, setPlacing] = useState(false);
  const { toast } = useToast();
  const [modal, setModal] = useState<ModalState | null>(null);

  async function loadProducts() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    const res = await fetch(`/api/products?${params}`);
    const all: Product[] = await res.json();
    setProducts(all.filter((p) => p.category !== "Add-ons"));
  }

  async function loadAddons() {
    const res = await fetch("/api/products?category=Add-ons");
    setAddons(await res.json());
  }

  useEffect(() => { loadProducts(); }, [search, category]);
  useEffect(() => { loadAddons(); }, []);

  const allCategories = ["All", ...Array.from(new Set(products.map((p) => p.category))).filter((c) => c !== "Add-ons")];

  function openModal(p: Product) {
    if (p.stock === 0) return;
    setModal({ product: p, size: "Medium", toppings: [], quantity: 1 });
  }

  function computePrice(m: ModalState) {
    const sizeDelta = SIZES.find((s) => s.label === m.size)?.delta ?? 0;
    const addonCost = m.toppings.reduce((s, t) => s + (addons.find((x) => x.name === t)?.price ?? 0), 0);
    return m.product.price + sizeDelta + addonCost;
  }

  function confirmAdd() {
    if (!modal) return;
    const price = computePrice(modal);
    const key = `${modal.product.id}|${modal.size}|${modal.toppings.join(",")}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === key);
      if (existing) return prev.map((i) => i.id === key ? { ...i, quantity: i.quantity + modal.quantity } : i);
      return [...prev, { id: key, name: modal.product.name, price, quantity: modal.quantity, size: modal.size, toppings: modal.toppings }];
    });
    setModal(null);
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  async function placeOrder() {
    if (!cart.length) return;
    setPlacing(true);
    const itemsMap: Record<string, number> = {};
    for (const item of cart) {
      const productId = item.id.split("|")[0];
      itemsMap[productId] = (itemsMap[productId] ?? 0) + item.quantity;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: Object.entries(itemsMap).map(([productId, quantity]) => ({ productId, quantity })) }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      toast(data.error ?? "Failed to place order", "error");
      return;
    }
    setCart([]);
    toast(`Order #${data.id.slice(-6).toUpperCase()} placed — ₱${total.toFixed(2)}`, "success");
    loadProducts();
  }

  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 4rem)" }}>

      {/* ── Products Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-0"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allCategories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-100 border"
              style={{
                background: category === cat ? "var(--brand)" : "var(--surface)",
                color: category === cat ? "#fff" : "var(--text-secondary)",
                borderColor: category === cat ? "var(--brand)" : "var(--border)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pb-20 md:pb-2">
          {products.map((p) => {
            const outOfStock = p.stock === 0;
            return (
              <div key={p.id} onClick={() => openModal(p)}
                className="bg-white rounded-lg border flex flex-col transition-all duration-150"
                style={{
                  borderColor: "var(--border)",
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  opacity: outOfStock ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!outOfStock) { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.boxShadow = "0 0 0 1px var(--brand)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="h-32 rounded-t-lg flex items-center justify-center overflow-hidden" style={{ background: "var(--brand-muted)" }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover rounded-t-lg" />
                    : <img src="/uploads/logo.png" alt="Uncle Brew" className="h-14 w-auto object-contain opacity-70" />
                  }
                </div>

                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.category}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>₱{p.price.toFixed(0)}</span>
                    {outOfStock
                      ? <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--error-muted)", color: "var(--error)" }}>Out of stock</span>
                      : <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.stock} left</span>
                    }
                  </div>
                  {!outOfStock && (
                    <button className="w-full mt-1 py-1.5 rounded text-xs font-semibold text-white transition-colors"
                      style={{ background: "var(--brand)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
                      Add to Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating cart button — mobile only ── */}
      <button
        onClick={() => setCartOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold"
        style={{ background: "var(--brand)", color: "#FCD34D" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Order
        {cartCount > 0 && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FCD34D", color: "var(--brand)" }}>
            {cartCount}
          </span>
        )}
      </button>

      {/* ── Mobile cart backdrop ── */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setCartOpen(false)} />
      )}

      {/* ── Order Panel ── */}
      <div className={`
        fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto
        z-50 md:z-auto
        w-full md:w-[300px]
        flex flex-col rounded-t-2xl md:rounded-lg border flex-shrink-0 overflow-hidden
        transition-transform duration-300
        ${cartOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
        max-h-[85vh] md:max-h-none
      `} style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Current Order</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--brand-muted)", color: "var(--brand)" }}>
                {cartCount} items
              </span>
              <button onClick={() => setCartOpen(false)} className="md:hidden w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--border)", color: "var(--text-secondary)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {ORDER_TYPES.map((t) => (
              <button key={t} onClick={() => setOrderType(t)}
                className="flex-1 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: orderType === t ? "var(--brand)" : "var(--surface)",
                  color: orderType === t ? "#fff" : "var(--text-secondary)",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10" style={{ color: "var(--text-muted)" }}>
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xs text-center">No items added yet.<br />Select a product to begin.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>₱{(item.price * item.quantity).toFixed(0)}</span>
                    <button onClick={() => setCart((p) => p.filter((i) => i.id !== item.id))} style={{ color: "var(--text-muted)" }}
                      className="hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[item.size, ...item.toppings].map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "#F1F5F9", color: "var(--text-secondary)" }}>{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCart((p) => p.map((i) => i.id === item.id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0))}
                    className="w-5 h-5 rounded border flex items-center justify-center text-xs font-bold transition-colors hover:bg-slate-100"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>−</button>
                  <span className="text-xs font-semibold w-4 text-center" style={{ color: "var(--text-primary)" }}>{item.quantity}</span>
                  <button onClick={() => setCart((p) => p.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                    className="w-5 h-5 rounded border flex items-center justify-center text-xs font-bold transition-colors hover:bg-slate-100"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-1.5">
            {[["Subtotal", `₱${subtotal.toFixed(2)}`], ["Tax (12%)", `₱${tax.toFixed(2)}`]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <span>Total</span><span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setCart([])} disabled={cart.length === 0}
              className="px-3 py-2 rounded-md text-xs font-semibold border transition-colors hover:bg-slate-50 disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Clear
            </button>
            <button onClick={placeOrder} disabled={placing || cart.length === 0}
              className="flex-1 py-2 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: cart.length === 0 ? "var(--text-muted)" : "var(--brand)" }}
              onMouseEnter={(e) => { if (cart.length > 0) e.currentTarget.style.background = "var(--brand-dark)"; }}
              onMouseLeave={(e) => { if (cart.length > 0) e.currentTarget.style.background = "var(--brand)"; }}>
              {placing ? "Processing..." : `Charge ₱${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Customization Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border" style={{ borderColor: "var(--border)" }}>

            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{modal.product.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Customize your order</p>
              </div>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: "var(--text-muted)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-5 max-h-[65vh] overflow-y-auto">

              {/* Size */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Size</p>
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button key={s.label} onClick={() => setModal({ ...modal, size: s.label })}
                      className="flex-1 py-2 rounded-md text-xs font-medium border-2 transition-colors"
                      style={{
                        borderColor: modal.size === s.label ? "var(--brand)" : "var(--border)",
                        background: modal.size === s.label ? "var(--brand-muted)" : "var(--surface)",
                        color: modal.size === s.label ? "var(--brand)" : "var(--text-secondary)",
                      }}>
                      {s.label}
                      <span className="block text-xs font-normal mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {s.delta === 0 ? "base" : s.delta > 0 ? `+₱${s.delta}` : `-₱${Math.abs(s.delta)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons from DB */}
              {addons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Add-ons</p>
                  <div className="space-y-1.5">
                    {addons.map((t) => {
                      const checked = modal.toppings.includes(t.name);
                      const unavailable = t.stock === 0;
                      return (
                        <label key={t.name}
                          className="flex items-center justify-between px-3 py-2 rounded-md border transition-colors"
                          style={{
                            borderColor: checked ? "var(--brand)" : "var(--border)",
                            background: checked ? "var(--brand-muted)" : unavailable ? "#F8FAFC" : "var(--surface)",
                            cursor: unavailable ? "not-allowed" : "pointer",
                            opacity: unavailable ? 0.5 : 1,
                          }}>
                          <div className="flex items-center gap-2.5">
                            <input type="checkbox" checked={checked} disabled={unavailable}
                              onChange={() => !unavailable && setModal({ ...modal, toppings: checked ? modal.toppings.filter((x) => x !== t.name) : [...modal.toppings, t.name] })}
                              className="w-3.5 h-3.5 accent-blue-600" />
                            <div>
                              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{t.name}</span>
                              {unavailable && <span className="ml-2 text-xs" style={{ color: "var(--error)" }}>Out of stock</span>}
                            </div>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: "var(--brand)" }}>+₱{t.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setModal({ ...modal, quantity: Math.max(1, modal.quantity - 1) })}
                    className="w-8 h-8 rounded-md border flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>−</button>
                  <span className="text-sm font-semibold w-6 text-center" style={{ color: "var(--text-primary)" }}>{modal.quantity}</span>
                  <button onClick={() => setModal({ ...modal, quantity: modal.quantity + 1 })}
                    className="w-8 h-8 rounded-md border flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>+</button>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>₱{(computePrice(modal) * modal.quantity).toFixed(0)}</p>
              </div>
              <button onClick={confirmAdd}
                className="px-5 py-2 rounded-md text-sm font-semibold text-white transition-colors"
                style={{ background: "var(--brand)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dark)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--brand)"; }}>
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
