import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import "./cine.css";

/**
 * Abertura cinematográfica da home (pacote "boder-cine-v2").
 *
 * Seção alta (460vh) com palco fixo: os 160 quadros do filme são desenhados
 * num canvas conforme o progresso da rolagem dentro da seção. Por cima, o
 * header da abertura, o título que sai da tela e os painéis de vidro que
 * entram em sincronia com os quadros (faixas data-de/data-ate do pacote).
 *
 * Desempenho: nada roda em loop — o canvas só é redesenhado quando a rolagem
 * muda o quadro; só o conjunto de quadros do tamanho da tela é baixado, e os
 * quadros depois do primeiro carregam em segundo plano.
 */

const TOTAL_FRAMES = 160;
const MOBILE_QUERY = "(max-width: 860px)";
const frameUrl = (set: "desktop" | "mobile", n: number) =>
  `/cine/assets/frames/${set}/f_${String(n).padStart(4, "0")}.webp`;

/** Faixas de progresso (0–1) em que cada painel aparece — iguais ao pacote. */
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap";

const useCineFonts = () => {
  useEffect(() => {
    if (document.querySelector(`link[data-cine-fonts]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    link.dataset.cineFonts = "";
    document.head.appendChild(link);
  }, []);
};

export const CineOpening = () => {
  const { openMeetingForm } = useMeetingForm();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useCineFonts();

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileMql = window.matchMedia(MOBILE_QUERY);
    let set: "desktop" | "mobile" = mobileMql.matches ? "mobile" : "desktop";
    let frames: HTMLImageElement[] = [];
    let loaded: boolean[] = [];
    let drawn = -1;
    let raf = 0;
    let disposed = false;
    let loadToken = 0;

    // ── Desenho ─────────────────────────────────────────────────────────
    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawn = -1;
    };

    const draw = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.fillStyle = "#050807";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    /** Quadro carregado mais próximo do desejado (prefere os anteriores). */
    const nearestLoaded = (idx: number) => {
      for (let d = 0; d < TOTAL_FRAMES; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < TOTAL_FRAMES && loaded[idx + d]) return idx + d;
      }
      return -1;
    };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    };

    const update = () => {
      raf = 0;
      const p = reduceMotion ? 0 : progress();

      const target = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
      const idx = nearestLoaded(target);
      if (idx >= 0 && idx !== drawn) {
        drawn = idx;
        draw(frames[idx]);
      }

      // Título gigante sai da tela (sobe e esmaece) no primeiro trecho.
      const title = titleRef.current;
      if (title) {
        const t = Math.min(1, p / 0.26);
        title.style.transform = `translate3d(0, ${-t * 38}vh, 0)`;
        title.style.opacity = String(1 - t);
      }

      MOMENTS.forEach((m, i) => {
        momentRefs.current[i]?.classList.toggle("ativo", p >= m.from && p <= m.to);
      });
      section.classList.toggle("andou", p > 0.02);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // ── Carregamento dos quadros ───────────────────────────────────────
    const loadFrames = () => {
      const token = ++loadToken;
      frames = Array.from({ length: TOTAL_FRAMES }, () => new Image());
      loaded = new Array(TOTAL_FRAMES).fill(false);
      drawn = -1;

      const load = (i: number) =>
        new Promise<void>((resolve) => {
          const img = frames[i];
          img.decoding = "async";
          img.onload = () => {
            if (token !== loadToken || disposed) return resolve();
            loaded[i] = true;
            schedule();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = frameUrl(set, i + 1);
        });

      // Primeiro quadro já; o resto em segundo plano, em ordem, 6 por vez.
      load(0).then(() => {
        if (reduceMotion || token !== loadToken) return;
        const start = () => {
          let next = 1;
          const worker = async (): Promise<void> => {
            while (next < TOTAL_FRAMES && token === loadToken && !disposed) {
              await load(next++);
            }
          };
          for (let k = 0; k < 6; k++) void worker();
        };
        if (document.readyState === "complete") start();
        else window.addEventListener("load", start, { once: true });
      });
    };

    // ── Ligações ───────────────────────────────────────────────────────
    const onResize = () => {
      fitCanvas();
      schedule();
    };
    const onBreakpoint = () => {
      const nextSet = mobileMql.matches ? "mobile" : "desktop";
      if (nextSet !== set) {
        set = nextSet;
        loadFrames();
      }
    };

    // Esconde o header fixo do site enquanto a abertura está na tela
    // (a abertura tem o próprio header com a logo e a navegação).
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        document.documentElement.toggleAttribute("data-cine-ativa", visible);
        section.classList.toggle("em-cena", visible);
        if (visible) schedule();
      },
      { rootMargin: "0px 0px -100% 0px" },
    );

    fitCanvas();
    loadFrames();
    update();
    io.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    mobileMql.addEventListener("change", onBreakpoint);

    return () => {
      disposed = true;
      loadToken++;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.documentElement.removeAttribute("data-cine-ativa");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      mobileMql.removeEventListener("change", onBreakpoint);
    };
  }, []);

  const goTo = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="inicio" ref={sectionRef} className="cine-abertura" style={{ "--altura": "460vh" } as CSSProperties}>
      <div className="cine-palco">
        <canvas ref={canvasRef} className="cine-canvas" aria-hidden="true" />
        <div className="cine-vinheta" />

        <header className="cine-topo">
          <a href="#inicio" className="cine-marca" aria-label="Boder Space" onClick={goTo("inicio")}>
            <img src="/cine/assets/logo.png" alt="Boder Space" className="cine-marca-logo" width={30} height={40} />
            <span className="cine-marca-texto">Boder Space</span>
          </a>
          <nav className="cine-menu" aria-label="Seções">
            <a href="#servicos" onClick={goTo("servicos")}>Serviços</a>
            <a href="#depoimentos" onClick={goTo("depoimentos")}>Depoimentos</a>
            <a href="#faq" onClick={goTo("faq")}>FAQ</a>
            <button type="button" className="cine-menu-cta" onClick={openMeetingForm}>
              Fale conosco
            </button>
          </nav>
        </header>

        <div ref={titleRef} className="cine-titulo-sair">
          <h1>
            Nós somos a<br />
            Boder Space.
          </h1>
          <p className="cine-apoio">
            Uma agência digital.
            <br />
            <em>
              Criando sites que colocam
              <br />a sua empresa em órbita.
            </em>
          </p>
        </div>

        <div ref={(el) => {
            momentRefs.current[0] = el;
          }} className="cine-momento cine-momento--direita">
          <div className="cine-painel cine-painel--vidro">
            <p className="cine-destaque">
              Site novo em até 7 dias, com direção de arte em cada tela. Nada de modelo pronto.
            </p>
          </div>
        </div>
        <div ref={(el) => {
            momentRefs.current[1] = el;
          }} className="cine-momento cine-momento--centro">
          <div className="cine-painel cine-painel--vidro">
            <p className="cine-destaque">Mais de 25 empresas já estão no ar com a gente. A próxima pode ser a sua.</p>
            <button type="button" className="cine-botao" onClick={openMeetingForm}>
              Quero meu site
            </button>
          </div>
        </div>

        <div className="cine-dica" aria-hidden="true">
          <span />
          role
        </div>
      </div>
    </section>
  );
};
