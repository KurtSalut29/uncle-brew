import Link from "next/link";
import { prisma } from "../lib/prisma";
import { SmoothScrollLink } from "../components/SmoothScrollLink";
import FeedbackForm from "../components/FeedbackForm";
import CategoryBar from "../components/CategoryBar";
import MobileNav from "../components/MobileNav";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, { bg: string; accent: string }> = {
  "Milk Tea":       { bg: "#F5ECD7", accent: "#92694A" },
  "Fruit Tea":      { bg: "#FEF3C7", accent: "#D97706" },
  "Coffee":         { bg: "#F5F0E8", accent: "#6B3F1F" },
  "Smoothies":      { bg: "#ECFDF5", accent: "#059669" },
  "Frappe":         { bg: "#EFF6FF", accent: "#2563EB" },
  "Frappuccino":    { bg: "#F5F3FF", accent: "#7C3AED" },
  "Dessert":        { bg: "#FFF1F2", accent: "#E11D48" },
  "Ice Cream":      { bg: "#F0F9FF", accent: "#0284C7" },
  "Signature Latte":{ bg: "#FFFBEB", accent: "#B45309" },
};

export default async function LandingPage() {
  let products: { id: string; name: string; description: string | null; price: number; stock: number; category: string; imageUrl: string | null }[] = [];

  try {
    products = await prisma.product.findMany({
      where: { stock: { gt: 0 }, category: { not: "Add-ons" } },
      orderBy: { category: "asc" },
    });
  } catch {
    // DB unavailable
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const featured = products.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "rgba(250,250,248,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E8E4DC", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "36px", width: "auto" }} />
          <div className="hidden md:flex items-center gap-8">
            <SmoothScrollLink href="#menu" className="text-sm font-medium transition-colors" style={{ color: "#78716C" }}>Menu</SmoothScrollLink>
            <SmoothScrollLink href="#categories" className="text-sm font-medium transition-colors" style={{ color: "#78716C" }}>Categories</SmoothScrollLink>
            <SmoothScrollLink href="#feedback" className="text-sm font-medium transition-colors" style={{ color: "#78716C" }}>Reviews</SmoothScrollLink>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:block px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{ background: "#1C1917", color: "#FAFAF8" }}>
              Staff Portal
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(150deg, #1C1917 0%, #2C1A0E 50%, #3B2212 100%)", position: "relative", overflow: "hidden", minHeight: "92vh" }}
        className="flex items-center">

        {/* Glow effects */}
        <div style={{ position: "absolute", top: "10%", right: "5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(146,105,74,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-12 sm:py-20" style={{ position: "relative", zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8 anim-fade-in"
                style={{ background: "rgba(252,211,77,0.12)", color: "#FCD34D", border: "1px solid rgba(252,211,77,0.2)", letterSpacing: "0.08em" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#FCD34D" }} />
                NOW OPEN · 9AM – 10PM DAILY
              </div>

              <h1 className="font-black text-white mb-6 anim-fade-up anim-delay-1"
                style={{ fontSize: "clamp(2.5rem, 10vw, 5.5rem)", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
                UNCLE<br />
                <span style={{ color: "#FCD34D" }}>BREW</span>
              </h1>

              <p className="text-base sm:text-lg mb-4 anim-fade-up anim-delay-2" style={{ color: "#A8A29E", lineHeight: 1.7, maxWidth: "420px" }}>
                Handcrafted milk teas, fruit teas & refreshing drinks — made fresh for every single order.
              </p>

              <div className="flex items-center flex-wrap gap-2 mb-10 anim-fade-up anim-delay-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#78716C", border: "1px solid rgba(255,255,255,0.08)" }}>Milk Tea</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#78716C", border: "1px solid rgba(255,255,255,0.08)" }}>Fruit Tea</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#78716C", border: "1px solid rgba(255,255,255,0.08)" }}>Coffee</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap anim-fade-up anim-delay-3">
                <SmoothScrollLink href="#menu"
                  className="px-8 py-4 rounded-full text-sm font-black tracking-wide transition-all"
                  style={{ background: "#FCD34D", color: "#1C1917", letterSpacing: "0.05em" }}>
                  VIEW MENU
                </SmoothScrollLink>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#57534E" }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  <span>Order at the counter</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center mt-10 sm:mt-14 anim-fade-up anim-delay-4" style={{ gap: 0 }}>
                {[
                  { value: products.length > 0 ? `${products.length}+` : "20+", label: "Menu Items" },
                  { value: "100%", label: "Fresh Daily" },
                  { value: "5★", label: "Rated" },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center">
                    {i > 0 && <div style={{ width: "1px", height: "32px", background: "#2C2420", margin: "0 20px" }} />}
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#57534E" }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Featured card */}
            {featured.length > 0 && (
              <div className="hidden lg:flex flex-col gap-4 anim-fade-up anim-delay-3">
                {/* Main featured product */}
                <div className="rounded-3xl overflow-hidden relative" style={{ background: "#2C1A0E", border: "1px solid rgba(255,255,255,0.06)", height: "340px" }}>
                  {featured[0].imageUrl
                    ? <img src={featured[0].imageUrl} alt={featured[0].name} className="w-full h-full object-cover opacity-80" />
                    : <div className="w-full h-full flex items-center justify-center"><img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "120px", width: "auto", opacity: 0.4 }} /></div>
                  }
                  <div className="absolute inset-0 p-6 flex flex-col justify-end" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.95) 0%, transparent 50%)" }}>
                    <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FCD34D" }}>{featured[0].category}</span>
                    <p className="text-xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>{featured[0].name}</p>
                    {featured[0].description && <p className="text-xs mt-1 line-clamp-1" style={{ color: "#A8A29E" }}>{featured[0].description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-black" style={{ color: "#FCD34D" }}>₱{featured[0].price.toFixed(0)}</span>
                      <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(252,211,77,0.15)", color: "#FCD34D" }}>Order at counter</span>
                    </div>
                  </div>
                </div>

                {/* Two smaller cards */}
                <div className="grid grid-cols-2 gap-4">
                  {featured.slice(1, 3).map((p) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden relative" style={{ background: "#2C1A0E", border: "1px solid rgba(255,255,255,0.06)", height: "160px" }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-70" />
                        : <div className="w-full h-full flex items-center justify-center"><img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "60px", width: "auto", opacity: 0.3 }} /></div>
                      }
                      <div className="absolute inset-0 p-4 flex flex-col justify-end" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.95) 0%, transparent 60%)" }}>
                        <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: "#FCD34D" }}>₱{p.price.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && <CategoryBar categories={categories} />}

      {/* ── Social Proof Strip ── */}
      <div style={{ background: "#1C1917" }} className="py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-10">
          {[
            { text: "Made Fresh Daily", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { text: "5-Star Rated", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
            { text: "Dine In & Takeout", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg> },
            { text: "Open 9AM – 10PM", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <span style={{ color: "#57534E" }}>{icon}</span>
              <span className="text-xs font-semibold" style={{ color: "#A8A29E" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Cards Grid ── */}
      {categories.length > 0 && (
        <section id="categories" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#C4B5A0" }}>EXPLORE</p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "#1C1917", letterSpacing: "-0.03em" }}>Our Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat] ?? { bg: "#F5F0E8", accent: "#92694A" };
              const catProducts = products.filter((p) => p.category === cat);
              const thumb = catProducts.find((p) => p.imageUrl)?.imageUrl;
              return (
                <SmoothScrollLink key={cat} href={`#cat-${cat.replace(/\s+/g, "-")}`}
                  className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ background: colors.bg, border: `1px solid ${colors.bg}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="h-32 flex items-center justify-center overflow-hidden">
                    {thumb
                      ? <img src={thumb} alt={cat} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "60px", opacity: 0.4 }} />
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-black text-sm" style={{ color: "#1C1917", letterSpacing: "-0.01em" }}>{cat}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.accent }}>{catProducts.length} items</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-semibold" style={{ color: colors.accent }}>Explore →</span>
                    </div>
                  </div>
                </SmoothScrollLink>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Full Menu ── */}
      <main id="menu" className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16 scroll-mt-28">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#C4B5A0" }}>FULL MENU</p>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "#1C1917", letterSpacing: "-0.03em" }}>Everything We Offer</h2>
          <p className="text-sm mt-2" style={{ color: "#A8A29E" }}>All drinks made fresh upon order</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-32">
            <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "80px", margin: "0 auto 16px", opacity: 0.3 }} />
            <p className="text-lg font-bold" style={{ color: "#1C1917" }}>Menu coming soon!</p>
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat} id={`cat-${cat.replace(/\s+/g, "-")}`} className="mb-16 scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: "#C4B5A0" }}>Category</p>
                  <h3 className="text-xl font-black" style={{ color: "#1C1917", letterSpacing: "-0.02em" }}>{cat}</h3>
                </div>
                <div className="flex-1 h-px" style={{ background: "#E8E4DC" }} />
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F5F0E8", color: "#92694A" }}>
                  {products.filter((p) => p.category === cat).length} items
                </span>
              </div>

              {/* Mobile: horizontal scroll row — Desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.filter((p) => p.category === cat).map((p, i) => (
                  <div key={p.id} className={`menu-card group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 anim-scale-in anim-delay-${Math.min(i + 1, 6)}`}
                    style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}>
                    <div className="relative h-48 w-full overflow-hidden" style={{ background: "#F5F0E8" }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <img src="/uploads/logo.png" alt="Uncle Brew" className="h-20 w-auto object-contain opacity-50" />
                          </div>
                      }
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black"
                        style={{ background: "#1C1917", color: "#FCD34D" }}>
                        ₱{p.price.toFixed(0)}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-black text-sm leading-tight" style={{ color: "#1C1917" }}>{p.name}</p>
                      {p.description
                        ? <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: "#A8A29E" }}>{p.description}</p>
                        : <p className="text-xs mt-1.5" style={{ color: "#D4CFC8" }}>Freshly made to order</p>
                      }
                      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F5F0E8" }}>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#F5F0E8", color: "#78716C" }}>
                          {p.stock} left
                        </span>
                        <span className="text-xs font-bold" style={{ color: "#D97706" }}>Order at counter →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile horizontal scroll */}
              <div className="flex sm:hidden gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                {products.filter((p) => p.category === cat).map((p) => (
                  <div key={p.id} className="menu-card group rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300"
                    style={{ background: "#FFFFFF", border: "1px solid #E8E4DC", width: "160px", scrollSnapAlign: "start" }}>
                    <div className="relative overflow-hidden" style={{ height: "120px", background: "#F5F0E8" }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <img src="/uploads/logo.png" alt="Uncle Brew" className="h-12 w-auto object-contain opacity-50" />
                          </div>
                      }
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black"
                        style={{ background: "#1C1917", color: "#FCD34D" }}>
                        ₱{p.price.toFixed(0)}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-black text-xs leading-tight" style={{ color: "#1C1917" }}>{p.name}</p>
                      {p.description
                        ? <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: "#A8A29E" }}>{p.description}</p>
                        : <p className="text-xs mt-1" style={{ color: "#D4CFC8" }}>Fresh to order</p>
                      }
                      <p className="text-xs font-bold mt-2" style={{ color: "#D97706" }}>At counter →</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ── Feedback ── */}
      <section id="feedback" style={{ background: "#F5F0E8", borderTop: "1px solid #E8E4DC" }} className="py-12 sm:py-16 px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#C4B5A0" }}>REVIEWS</p>
            <h2 className="text-3xl font-black" style={{ color: "#1C1917", letterSpacing: "-0.03em" }}>Share Your Experience</h2>
            <p className="text-sm mt-2" style={{ color: "#78716C" }}>Help us improve by sharing your thoughts</p>
          </div>
          <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}>
            <FeedbackForm />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "linear-gradient(135deg, #1C1917 0%, #2C1A0E 100%)", position: "relative", overflow: "hidden" }} className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(252,211,77,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#57534E" }}>VISIT US TODAY</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3" style={{ letterSpacing: "-0.04em" }}>Ready to order?</h2>
        <p className="text-sm mb-8 sm:mb-10" style={{ color: "#78716C" }}>Walk in and order at the counter. No app needed.</p>
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          {[
            [<svg key="clock" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, "9AM – 10PM Daily"],
            [<svg key="pin" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>, "Main Branch"],
            [<svg key="store" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>, "Dine In & Takeout"],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "#78716C" }}>{icon}</span>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#A8A29E" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#C9A87C", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "36px", width: "auto", opacity: 0.9 }} />
          <p className="text-xs order-last sm:order-none" style={{ color: "#6B3F1F" }}>© {new Date().getFullYear()} Uncle Brew Milk Tea Shop · All rights reserved</p>
          <Link href="/sign-in" className="text-xs font-semibold transition-colors" style={{ color: "#1C1917" }}>Staff Portal →</Link>
        </div>
      </footer>
    </div>
  );
}
