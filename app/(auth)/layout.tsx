export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl p-5" style={{
          background: "#ffffff",
          border: "2px solid var(--border)",
          boxShadow: "0 4px 24px rgba(146,105,74,0.10)",
        }}>
          <div className="flex justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "40px", width: "auto", objectFit: "contain", display: "block" }} />
          </div>
          {children}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Uncle Brew · All rights reserved
        </p>
      </div>
    </div>
  );
}
