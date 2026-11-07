import { useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuraInkButtonProps {
  children: ReactNode;
  hoverText?: string;
  onClick?: () => void;
  className?: string;
}

/** Botão "tinta" com brilho giratório e partículas — réplica do site oficial. */
export const AuraInkButton = ({ children, hoverText, onClick, className }: AuraInkButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const spawn = useCallback((kind: "ice" | "white", x: number, y: number) => {
    const host = particlesRef.current;
    if (!host) return;
    const p = document.createElement("div");
    p.className = `particle ${kind === "ice" ? "p-ice" : "p-white"}`;
    const size = kind === "ice" ? Math.random() * 6 + 4 : Math.random() * 5 + 3;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    if (kind === "ice") {
      const d = Math.random() * 60 + 40;
      p.style.setProperty("--startX", `${Math.cos(angle) * d}px`);
      p.style.setProperty("--startY", `${Math.sin(angle) * d}px`);
    } else {
      const d = Math.random() * 100 + 60;
      p.style.setProperty("--moveX", `${Math.cos(angle) * d}px`);
      p.style.setProperty("--moveY", `${Math.sin(angle) * d}px`);
      p.style.setProperty("--life", `${Math.random() + 1}s`);
    }
    host.appendChild(p);
    window.setTimeout(() => p.remove(), kind === "ice" ? 800 : 2000);
  }, []);

  const burst = useCallback(
    (kind: "ice" | "white", count: number, step: number) => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      for (let i = 0; i < count; i++) {
        window.setTimeout(() => spawn(kind, Math.random() * rect.width, Math.random() * rect.height), i * step);
      }
    },
    [spawn],
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => burst("ice", 25, 15)}
      onMouseLeave={() => burst("white", 20, 20)}
      className={cn("aura-ink-button", className)}
    >
      <svg className="absolute w-0 h-0" aria-hidden>
        <defs>
          <filter id="ink-filter-glitch" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} result="noise" seed={1} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={25} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="shimmer-container">
        <div className="shimmer-gradient" />
      </div>
      <div className="ink-splash" />
      <span className="texto-principal">{children}</span>
      {hoverText && <span className="texto-hover">{hoverText}</span>}
      <div ref={particlesRef} className="particle-container" />
    </button>
  );
};
