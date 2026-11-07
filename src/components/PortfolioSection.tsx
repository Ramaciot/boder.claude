import { useCallback, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { animate } from "framer-motion";

const STARS = [
  { left: "8%", top: "20%", delay: "0.1s" },
  { left: "18%", top: "70%", delay: "0.6s" },
  { left: "35%", top: "35%", delay: "1.4s" },
  { left: "55%", top: "15%", delay: "0.3s" },
  { left: "48%", top: "75%", delay: "1.7s" },
  { left: "68%", top: "45%", delay: "0.5s" },
  { left: "85%", top: "65%", delay: "2.2s" },
  { left: "92%", top: "25%", delay: "0.9s" },
  { left: "28%", top: "55%", delay: "1.1s" },
  { left: "78%", top: "12%", delay: "0.2s" },
];

const SpaceButton = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <div className="space-btn-container">
    <button type="button" onClick={onClick} className="space-btn">
      <span className="space-btn-text">{children}</span>
      {STARS.map((star) => (
        <div
          key={`${star.left}-${star.top}`}
          className="star"
          style={{ left: star.left, top: star.top, animationDelay: star.delay }}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`shooting-star ss-${i + 1}`} />
      ))}
    </button>
  </div>
);

/** Som de "whoosh" (ruído filtrado), igual ao do site oficial. */
const playWhoosh = () => {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const length = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.8);
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + 0.8);
  } catch {
    /* áudio não suportado — segue só com a animação */
  }
};

/** "Sites que Vendem" — botão espacial com zoom + flash até /portfolio. */
export const PortfolioSection = () => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  const handleClick = useCallback(async () => {
    if (running || !buttonRef.current || !flashRef.current) return;
    setRunning(true);
    playWhoosh();

    const button = buttonRef.current;
    const flash = flashRef.current;
    // Mesma timeline do original: zoom 80x (1.8s, power4.in), blur/fade nos
    // últimos 0.8s e flash branco cobrindo a tela antes de navegar.
    const powerIn = (t: number) => t * t * t * t * t;
    animate(button, { scale: 80 }, { duration: 1.8, ease: powerIn });
    animate(button, { filter: "blur(40px)", opacity: 0 }, { duration: 0.8, delay: 1.0 });
    await animate(flash, { opacity: [0, 1, 0.8, 1, 1] }, { duration: 0.65, delay: 1.4, times: [0, 0.23, 0.38, 0.54, 1] });

    navigate("/portfolio");
  }, [navigate, running]);

  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      {/* Vidro fosco do original, com bordas esmaecidas para não formar faixa */}
      <div
        className="absolute inset-0 backdrop-blur-md pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
        aria-hidden="true"
      />
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[9999] opacity-0"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <span className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            Portfólio
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-foreground">
            Sites que <span className="text-primary">Vendem</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light">
            Soluções completas para transformar seu negócio digital
          </p>
          <div className="flex justify-center">
            <div ref={buttonRef} className="will-change-transform relative" style={{ transformOrigin: "center center" }}>
              <SpaceButton onClick={handleClick}>VEJA NOSSOS SITES</SpaceButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
