"use client";

export function SmoothScrollLink({ href, className, style, children, onClick }: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
    onClick?.();
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
