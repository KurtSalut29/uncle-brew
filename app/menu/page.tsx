import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { category: "asc" },
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <header className="text-white py-14 text-center px-4" style={{ background: "var(--sidebar-bg)" }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4" style={{ background: "var(--brand)" }}>🧋</div>
        <h1 className="text-4xl font-bold mb-2">Uncle Brew</h1>
        <p style={{ color: "#A7F3D0" }}>Fresh Milk Tea & More · Order at the counter</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {categories.map((cat) => (
          <section key={cat} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--brand-light)" }}>🧋</div>
              <h2 className="text-lg font-bold text-gray-800">{cat}</h2>
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.filter((p) => p.category === cat).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start hover:shadow-md transition">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--brand-muted)" }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <img src="/uploads/logo.png" alt="Uncle Brew" className="w-full h-full object-contain opacity-70" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    {p.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{p.description}</p>}
                    <p className="font-bold mt-1.5" style={{ color: "var(--brand-dark)" }}>₱{p.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-3">🧋</span>
            <p>Menu coming soon!</p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-sm border-t border-gray-200" style={{ color: "var(--text-secondary)" }}>
        © {new Date().getFullYear()} Uncle Brew Milk Tea Shop
      </footer>
    </div>
  );
}
