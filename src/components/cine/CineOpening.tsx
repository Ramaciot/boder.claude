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
 * A lógica do scrub segue o app.js do pacote (carga em passadas, suavização
 * 0.18, título saindo em 16% do progresso).
 *
 * Movimento constante (requisito): a cena nunca fica parada.
 *  - No topo da abertura, sem rolagem ativa, o abertura-loop.mp4 toca em loop
 *    por cima do canvas; ao rolar, crossfade para os quadros; voltando ao
 *    topo e parando, o vídeo reassume.
 *  - Parado no meio da abertura, os quadros "respiram" (oscilam alguns quadros
 *    em torno do ponto atual) em vez de congelar.
 *  - Poeira flutuando em CSS por cima de tudo, o tempo todo.
 *  - O loop de animação roda sem pausa enquanto a abertura existe.
 */

const TOTAL_FRAMES = 160;
const VIDEO_URL = "/cine/assets/abertura-loop.mp4";
/** Até este progresso (0–1) a cena é "o topo", onde o vídeo em loop assume. */
const TOPO = 0.03;
/** Sem evento de scroll por este tempo = rolagem não está ativa. */
const OCIOSO_MS = 220;
/** Amplitude (em quadros) e período da "respiração" quando parado no meio. */
const DERIVA_QUADROS = 3;
const DERIVA_PERIODO_MS = 4200;
const MOBILE_QUERY = "(max-width: 760px)"; // mesmo corte do app.js do pacote
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useCineFonts();

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    // ── Mesma lógica do app.js do pacote ──────────────────────────────────
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const celularMql = window.matchMedia(MOBILE_QUERY);
    const total = TOTAL_FRAMES;
    let set: "desktop" | "mobile" = celularMql.matches ? "mobile" : "desktop";
    let quadros: (HTMLImageElement | undefined)[] = [];
    let alvo = 0;
    let atual = 0;
    let desenhado = -1;
    let raf = 0;
    let loteTimer = 0;
    let disposed = false;
    let ultimoScroll = 0;
    let deriva = 0; // amplitude atual da respiração (sobe/desce suave)
    let visivel = true;
    let videoOk = false;
    let mostrandoVideo = false;
    let pausaVideoTimer = 0;
    const video = videoRef.current;

    const pronto = (i: number) => {
      const img = quadros[i];
      return !!img && img.complete && img.naturalWidth > 0;
    };
    const maisProximo = (i: number) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    function desenhar(i: number, forcar = false) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j]!;
      const cw = canvas!.width;
      const ch = canvas!.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala;
      const h = img.naturalHeight * escala;
      ctx!.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const carregar = (i: number) => {
      if (quadros[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(set, i + 1);
      img.onload = () => {
        if (disposed || quadros[i] !== img) return;
        if (Math.round(atual) === i || desenhado === -1) desenhar(i, true);
      };
      quadros[i] = img;
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo.
    const carregarTudo = () => {
      window.clearTimeout(loteTimer);
      quadros = new Array(total);
      desenhado = -1;
      carregar(0);
      if (reduzir) return;
      const fila: number[] = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => {
        for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]);
        if (k < fila.length && !disposed) loteTimer = window.setTimeout(lote, 40);
      };
      lote();
    };

    const progresso = () => {
      const r = section.getBoundingClientRect();
      const curso = section.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p: number) => {
      MOMENTS.forEach((m, i) => {
        momentRefs.current[i]?.classList.toggle("ativo", p >= m.from && (p < m.to || (m.to >= 1 && p >= 1)));
      });
      section.classList.toggle("andou", p > 0.02);
      const sair = titleRef.current;
      if (sair) {
        const q = Math.min(1, p / 0.16);
        sair.style.transform = `translateY(${(-46 * q).toFixed(1)}vh)`;
        sair.style.opacity = String(1 - q * q);
      }
    };

    // ── Vídeo em loop (camada do topo) ──────────────────────────────────
    const tocarVideo = () => {
      if (!video) return;
      window.clearTimeout(pausaVideoTimer);
      void video.play().catch(() => {
        // Autoplay recusado: fica no canvas, que também se move.
        videoOk = false;
        definirVideo(false);
      });
    };
    const definirVideo = (ligar: boolean) => {
      if (ligar === mostrandoVideo) return;
      mostrandoVideo = ligar;
      section.classList.toggle("com-video", ligar);
      if (ligar) tocarVideo();
      else if (video) {
        // Pausa depois do crossfade (economiza CPU enquanto escondido).
        window.clearTimeout(pausaVideoTimer);
        pausaVideoTimer = window.setTimeout(() => !mostrandoVideo && video.pause(), 800);
      }
    };
    if (video && !reduzir) {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      const pronto = () => {
        videoOk = true;
      };
      if (video.readyState >= 2) pronto();
      video.addEventListener("loadeddata", pronto);
      video.addEventListener("error", () => {
        videoOk = false;
        definirVideo(false);
      });
      video.src = VIDEO_URL;
      video.load();
    }

    // ── Loop contínuo (sem pausa): scrub do pacote + respiração + vídeo ───
    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      if (!visivel) return;

      const rolando = agora - ultimoScroll < OCIOSO_MS;
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      const p = atual / (total - 1);

      // Parado = a cena respira; rolando = scrub limpo.
      const parado = !rolando && atual === alvo;
      deriva += ((parado ? DERIVA_QUADROS : 0) - deriva) * 0.04;
      const oscilacao = deriva * Math.sin((agora / DERIVA_PERIODO_MS) * Math.PI * 2);
      const idx = Math.min(total - 1, Math.max(0, Math.round(atual + oscilacao)));
      desenhar(idx);

      atualizarMomentos(p);
      definirVideo(videoOk && !rolando && p <= TOPO);
    };
    const marcarScroll = () => {
      ultimoScroll = performance.now();
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    const aoMudarTela = () => {
      const novo = celularMql.matches ? "mobile" : "desktop";
      if (novo !== set) {
        set = novo;
        carregarTudo();
      }
    };

    // Esconde o header fixo do site enquanto a abertura está na tela
    // (a abertura tem o próprio header com a logo e a navegação).
    const io = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
        document.documentElement.toggleAttribute("data-cine-ativa", visivel);
        section.classList.toggle("em-cena", visivel);
        if (!visivel && video) video.pause();
        else if (visivel && mostrandoVideo) tocarVideo();
      },
      { rootMargin: "0px 0px -100% 0px" },
    );

    carregarTudo();
    ajustar();
    if (reduzir) atualizarMomentos(0);
    else {
      atual = alvo = progresso() * (total - 1);
      raf = requestAnimationFrame(quadro);
    }
    io.observe(section);
    window.addEventListener("scroll", marcarScroll, { passive: true });
    window.addEventListener("resize", ajustar);
    celularMql.addEventListener("change", aoMudarTela);

    return () => {
      disposed = true;
      window.clearTimeout(loteTimer);
      window.clearTimeout(pausaVideoTimer);
      if (raf) cancelAnimationFrame(raf);
      video?.pause();
      io.disconnect();
      document.documentElement.removeAttribute("data-cine-ativa");
      window.removeEventListener("scroll", marcarScroll);
      window.removeEventListener("resize", ajustar);
      celularMql.removeEventListener("change", aoMudarTela);
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
        <video
          ref={videoRef}
          className="cine-video"
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />
        <div className="cine-poeira" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
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
