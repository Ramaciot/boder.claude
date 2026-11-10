import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
// Logo oficial (flat) = marca do cabeçalho. A logo 3D é elemento da CENA
// (o meteoro no portal), nunca logo de interface.
import cineLogo from "@/assets/boder-logo.webp";
import { criarSplash } from "./cineSplash";
import "./cine.css";

/** Logo 3D da Boder (mesma arte de /cine/assets/logo.png), em WebP leve. */
const METEORO_URL = "/cine/assets/logo-3d-meteoro.webp";

/**
 * Abertura cinematográfica da home (pacote "boder-cine-v2").
 *
 * Splash no molde da Lusion (ver cineSplash.ts): BODER SPACE gigante na base,
 * que voa até o cabeçalho ao rolar; logo 3D como meteoro no portal, com
 * partículas girando e o feixe saindo dela.
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
 *  - O loop de animação roda sem pausa enquanto a abertura está na tela (só
 *    para quando ela sai totalmente de vista, e volta ao reaparecer).
 *
 * Unificação com o site: no trecho final (88%→100%) a cena inteira se dissolve
 * até ficar transparente, revelando o fundo do próprio site — o conteúdo da
 * home entra sem corte seco.
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
/** A partir deste progresso a cena se dissolve no fundo do site (unificação). */
const SAIDA_INICIO = 0.88;
const MOBILE_QUERY = "(max-width: 760px)"; // mesmo corte do app.js do pacote
const frameUrl = (set: "desktop" | "mobile", n: number) =>
  `/cine/assets/frames/${set}/f_${String(n).padStart(4, "0")}.webp`;

/** Faixas de progresso (0–1) em que cada painel aparece — iguais ao pacote. */
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap";

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
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const logoFlatRef = useRef<HTMLImageElement>(null);
  const meteoroRef = useRef<HTMLDivElement>(null);
  const logo3dRef = useRef<HTMLImageElement>(null);
  const brilhoRef = useRef<HTMLDivElement>(null);
  const feixeRef = useRef<HTMLDivElement>(null);
  const atrasRef = useRef<HTMLCanvasElement>(null);
  const frenteRef = useRef<HTMLCanvasElement>(null);

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
    let saidaAplicada = -1;
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
      // Título editorial: entra depois que o wordmark voou para o cabeçalho
      // e sai antes do primeiro painel.
      const titulo = titleRef.current;
      if (titulo) {
        const faixa = (a: number, b: number) => {
          const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
          return t * t * (3 - 2 * t);
        };
        const entra = faixa(0.085, 0.145);
        const sai = faixa(0.21, 0.28);
        titulo.style.transform = `translateY(${((1 - entra) * 6 - sai * 34).toFixed(2)}vh)`;
        titulo.style.opacity = String(entra * (1 - sai * sai));
        titulo.style.filter = entra < 1 ? `blur(${((1 - entra) * 8).toFixed(1)}px)` : "none";
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

    // ── Splash (wordmark que vira header + meteoro) ──────────────────────
    const splash =
      wordmarkRef.current && slotRef.current && logoFlatRef.current && meteoroRef.current && logo3dRef.current &&
      brilhoRef.current && feixeRef.current && atrasRef.current && frenteRef.current
        ? criarSplash(
            {
              palco: canvas.parentElement!.parentElement!,
              wordmark: wordmarkRef.current,
              slot: slotRef.current,
              logoFlat: logoFlatRef.current,
              meteoro: meteoroRef.current,
              logo3d: logo3dRef.current,
              brilho: brilhoRef.current,
              feixe: feixeRef.current,
              atras: atrasRef.current,
              frente: frenteRef.current,
            },
            reduzir,
          )
        : null;

    // ── Loop contínuo (sem pausa): scrub do pacote + respiração + vídeo ───
    const quadro = (agora: number) => {
      // Contínuo enquanto a abertura está na tela; fora dela, o loop para
      // (o IntersectionObserver religa quando ela volta).
      if (!visivel) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(quadro);

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
      splash?.atualizar(p, agora);
      definirVideo(videoOk && !rolando && p <= TOPO);

      // Dissolve final: 0 → 1 com ease, aplicado via variável CSS.
      const t = Math.min(1, Math.max(0, (p - SAIDA_INICIO) / (1 - SAIDA_INICIO)));
      const saida = Math.round(t * t * (3 - 2 * t) * 1000) / 1000;
      if (saida !== saidaAplicada) {
        saidaAplicada = saida;
        section.style.setProperty("--saida", String(saida));
      }
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
      splash?.medir();
      splash?.atualizar(atual / (total - 1), performance.now());
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
        if (visivel && !raf && !reduzir) raf = requestAnimationFrame(quadro);
      },
      { rootMargin: "0px 0px -100% 0px" },
    );

    carregarTudo();
    ajustar();
    // As fontes (Manrope 800 do wordmark) mudam a largura do texto: remede.
    void document.fonts?.ready.then(() => !disposed && ajustar());
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
      document.documentElement.removeAttribute("data-cine-splash");
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
        <div className="cine-cena">
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
          {/* Meteoro: logo 3D no portal, com brilho, anel de partículas e feixe */}
          <div ref={meteoroRef} className="cine-meteoro" aria-hidden="true">
            <div ref={brilhoRef} className="cine-meteoro__brilho" />
            <div ref={feixeRef} className="cine-meteoro__feixe" />
            <canvas ref={atrasRef} className="cine-meteoro__particulas" />
            <img ref={logo3dRef} src={METEORO_URL} alt="" className="cine-meteoro__logo" decoding="async" />
            <canvas ref={frenteRef} className="cine-meteoro__particulas" />
          </div>
          <div className="cine-poeira" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="cine-vinheta" />
        </div>

        <header className="cine-topo">
          <a href="#inicio" className="cine-marca" aria-label="Boder Space" onClick={goTo("inicio")}>
            <img ref={logoFlatRef} src={cineLogo} alt="" className="cine-marca-logo" width={40} height={40} />
            {/* Lugar onde o wordmark pousa (a peça que voa fica fora do header) */}
            <span ref={slotRef} className="cine-marca-slot" aria-hidden="true">
              BODER SPACE
            </span>
          </a>
          <nav className="cine-menu" aria-label="Seções">
            <a href="#servicos" onClick={goTo("servicos")}>Serviços</a>
            <a href="#depoimentos" onClick={goTo("depoimentos")}>Depoimentos</a>
            <button type="button" className="cine-menu-cta" onClick={openMeetingForm}>
              Fale conosco
            </button>
          </nav>
        </header>

        {/* Wordmark do splash: a MESMA peça voa da base até o cabeçalho */}
        <div ref={wordmarkRef} className="cine-wordmark" aria-hidden="true">
          BODER SPACE
        </div>

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
