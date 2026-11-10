import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import cineLogo from "@/assets/boder-logo.webp";
import { criarSplash } from "../cine/cineSplash";
import "../cine/cine.css";
import "./gl.css";
import type { Cena } from "./glScene";

/**
 * PROTÓTIPO GL da abertura (só na branch prototipo-gl, ativado por ?gl=1).
 *
 * Mesma altura de rolagem da abertura atual (460vh) e palco sticky; no lugar
 * dos quadros, uma cena WebGL ao vivo (glScene.ts). Por cima, a mesma camada
 * da abertura atual: wordmark BODER SPACE que vira o header (cineSplash),
 * título, painéis e indicador de rolagem.
 *
 * Desempenho: three.js em chunk separado (import() só aqui); DPR máx. 2 no
 * desktop e 1,5 no celular; render pausado fora da tela e com a aba oculta;
 * sem WebGL (ou se a cena falhar), mostra poster-gl.jpg estático.
 */

const ASSETS = {
  logo: "/cine-gl/logo3d-gl.webp",
  astro: "/cine-gl/astro-gl.webp",
  poster: "/cine-gl/poster-gl.jpg",
};
const MOBILE_QUERY = "(max-width: 760px)";
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;
const SAIDA_INICIO = 0.88;
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap";

const temWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

export const GlOpening = () => {
  const { openMeetingForm } = useMeetingForm();
  const sectionRef = useRef<HTMLElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const logoFlatRef = useRef<HTMLImageElement>(null);
  const meteoroDomRef = useRef<HTMLDivElement>(null); // o meteoro aqui é WebGL
  const [semGL, setSemGL] = useState(false);

  // Fontes da marca/abertura (mesmas da abertura atual)
  useEffect(() => {
    if (document.querySelector("link[data-cine-fonts]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    link.dataset.cineFonts = "";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const palco = palcoRef.current;
    const canvas = canvasRef.current;
    if (!section || !palco || !canvas) return;

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const celular = window.matchMedia(MOBILE_QUERY).matches;
    const dprMax = celular ? 1.5 : 2;
    let cena: Cena | null = null;
    let raf = 0;
    let visivel = true;
    let disposed = false;
    let alvo = 0;
    let atual = 0;
    let saidaAplicada = -1;
    let tamanho = { w: 0, h: 0 };
    const t0 = performance.now();

    const splash =
      wordmarkRef.current && slotRef.current && logoFlatRef.current && meteoroDomRef.current
        ? criarSplash({
            palco,
            wordmark: wordmarkRef.current,
            slot: slotRef.current,
            logoFlat: logoFlatRef.current,
            meteoro: meteoroDomRef.current,
          })
        : null;

    const progresso = () => {
      const r = section.getBoundingClientRect();
      const curso = section.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarCamada = (p: number) => {
      MOMENTS.forEach((m, i) => {
        momentRefs.current[i]?.classList.toggle("ativo", p >= m.from && (p < m.to || (m.to >= 1 && p >= 1)));
      });
      section.classList.toggle("andou", p > 0.02);
      const titulo = titleRef.current;
      if (titulo) {
        const faixa = (a: number, b: number) => {
          const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
          return t * t * (3 - 2 * t);
        };
        const entra = faixa(0.085, 0.145);
        const sai = faixa(0.21, 0.28);
        titulo.style.transform = `translate3d(0, ${((1 - entra) * 6 - sai * 34).toFixed(2)}vh, 0)`;
        titulo.style.opacity = String(entra * (1 - sai * sai));
      }
      const t = Math.min(1, Math.max(0, (p - SAIDA_INICIO) / (1 - SAIDA_INICIO)));
      const saida = Math.round(t * t * (3 - 2 * t) * 1000) / 1000;
      if (saida !== saidaAplicada) {
        saidaAplicada = saida;
        section.style.setProperty("--saida", String(saida));
      }
      splash?.atualizar(p);
    };

    // A cena é viva (nunca congela): renderiza a cada quadro enquanto a
    // abertura está na tela e a aba está visível; caso contrário, nada roda.
    const ativo = () => visivel && !document.hidden && !disposed;
    const quadro = () => {
      raf = 0;
      if (!ativo()) return;
      alvo = progresso();
      atual += (alvo - atual) * 0.18; // mesma suavização do CineOpening
      if (Math.abs(alvo - atual) < 0.0004) atual = alvo;
      atualizarCamada(atual);
      const t = reduzir ? 0 : (performance.now() - t0) / 1000;
      cena?.render(atual, t);
      // Com movimento reduzido, só renderiza enquanto a rolagem anda
      if (!reduzir || atual !== alvo) raf = requestAnimationFrame(quadro);
    };
    const ligar = () => {
      if (ativo() && !raf) raf = requestAnimationFrame(quadro);
    };
    const desligar = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const ajustar = (forcar = false) => {
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (!forcar && w === tamanho.w && h === tamanho.h) return;
      tamanho = { w, h };
      cena?.redimensionar(w, h, Math.min(window.devicePixelRatio || 1, dprMax));
      splash?.medir({ w: 0, h: 0 }, celular ? "mobile" : "desktop");
      splash?.atualizar(atual);
      ligar();
    };
    const aoRedimensionar = () => ajustar();

    const io = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
        document.documentElement.toggleAttribute("data-cine-ativa", visivel);
        section.classList.toggle("em-cena", visivel);
        if (visivel) ligar();
        else {
          desligar();
          document.documentElement.removeAttribute("data-cine-splash");
        }
      },
      { rootMargin: "0px 0px -100% 0px" },
    );
    const aoTrocarAba = () => (document.hidden ? desligar() : ligar());

    atual = alvo = progresso();
    ajustar(true);
    atualizarCamada(atual);
    void document.fonts?.ready.then(() => !disposed && ajustar(true));
    io.observe(section);
    window.addEventListener("scroll", ligar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    document.addEventListener("visibilitychange", aoTrocarAba);

    // Cena WebGL: three.js só é baixado aqui (chunk separado)
    if (!temWebGL()) setSemGL(true);
    else {
      import("./glScene")
        .then(({ criarCena }) =>
          criarCena(canvas, { celular, dpr: Math.min(window.devicePixelRatio || 1, dprMax), urls: ASSETS }),
        )
        .then((c) => {
          if (disposed) return c.destruir();
          cena = c;
          section.classList.add("gl-pronto");
          ajustar(true);
          ligar();
        })
        .catch((erro) => {
          console.warn("Abertura GL: usando o poster estático.", erro);
          if (!disposed) setSemGL(true);
        });
    }

    return () => {
      disposed = true;
      desligar();
      io.disconnect();
      cena?.destruir();
      document.documentElement.removeAttribute("data-cine-ativa");
      document.documentElement.removeAttribute("data-cine-splash");
      window.removeEventListener("scroll", ligar);
      window.removeEventListener("resize", aoRedimensionar);
      document.removeEventListener("visibilitychange", aoTrocarAba);
    };
  }, []);

  const goTo = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className={`cine-abertura gl-abertura em-cena${semGL ? " gl-sem-webgl" : ""}`}
      style={{ "--altura": "460vh" } as CSSProperties}
    >
      <div ref={palcoRef} className="cine-palco">
        <div className="gl-cena">
          <img src={ASSETS.poster} alt="" className="gl-poster" aria-hidden="true" />
          <canvas ref={canvasRef} className="gl-canvas" aria-hidden="true" />
          <div className="cine-vinheta" />
        </div>
        <div ref={meteoroDomRef} hidden aria-hidden="true" />

        <header className="cine-topo">
          <a href="#inicio" className="cine-marca" aria-label="Boder Space" onClick={goTo("inicio")}>
            <img ref={logoFlatRef} src={cineLogo} alt="" className="cine-marca-logo" width={40} height={40} />
            <span ref={slotRef} className="cine-marca-slot" aria-hidden="true">
              BODER SPACE
            </span>
          </a>
          <nav className="cine-menu" aria-label="Seções">
            <a href="#servicos" onClick={goTo("servicos")}>
              Serviços
            </a>
            <a href="#depoimentos" onClick={goTo("depoimentos")}>
              Depoimentos
            </a>
            <button type="button" className="cine-menu-cta" onClick={openMeetingForm}>
              Fale conosco
            </button>
          </nav>
        </header>

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

        <div
          ref={(el) => {
            momentRefs.current[0] = el;
          }}
          className="cine-momento cine-momento--direita"
        >
          <div className="cine-painel cine-painel--vidro">
            <p className="cine-destaque">
              Site novo em até 7 dias, com direção de arte em cada tela. Nada de modelo pronto.
            </p>
          </div>
        </div>
        <div
          ref={(el) => {
            momentRefs.current[1] = el;
          }}
          className="cine-momento cine-momento--centro"
        >
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

export default GlOpening;
