import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import cineLogo from "@/assets/boder-logo.webp";
import { criarSplash } from "../cine/cineSplash";
import { criarDeslize } from "../cine/cineDeslize";
import "../cine/cine.css";
import "./gl.css";
import type { Cena } from "./glScene";

/**
 * Abertura em tempo real (WebGL), sem sequência de quadros.
 *
 * Seção alta (460vh) com palco fixo; a cena (glScene.ts, three.js em chunk
 * separado) é renderizada ao vivo. Por cima, a mesma camada aprovada: wordmark
 * BODER SPACE que voa para o cabeçalho ao lado da logo flat (cineSplash),
 * título, painéis, dica de rolagem e o deslize automático (cineDeslize).
 *
 * Desempenho:
 *  - three.js só é baixado aqui (import dinâmico); DPR máx. 2 no desktop e
 *    1,5 no celular; contagens de partículas/geometria menores no celular.
 *  - rAF só com a abertura na tela e a aba visível.
 *  - Geometria da seção em cache (medida no resize): nenhuma leitura de
 *    layout dentro do loop.
 *  - Sem WebGL (ou se a cena falhar): pôster estático da própria cena.
 *  - prefers-reduced-motion: cena parada (sem tempo), sem deslize; só
 *    redesenha quando a rolagem muda.
 */

const LOGO_3D = "/cine-gl/logo3d-gl.webp";
const POSTER = "/cine-gl/poster-gl.webp";
const MOBILE_QUERY = "(max-width: 760px)";
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;
const SAIDA_INICIO = 0.88;
/** Suavização da câmera: 0,18 por quadro a 60 fps (normalizada pelo tempo). */
const SUAVIZA = 0.18;
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap";

const temWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
};

export const GlOpening = () => {
  const { openMeetingForm, isOpen: formAberto } = useMeetingForm();
  const formAbertoRef = useRef(formAberto);
  formAbertoRef.current = formAberto;
  const sectionRef = useRef<HTMLElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const logoFlatRef = useRef<HTMLImageElement>(null);
  const [semGL, setSemGL] = useState(false);

  // Fontes da marca/abertura
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
    let desenhado = -1;
    let saidaAplicada = -1;
    let tAnterior = 0;
    let tempo = 0;
    // Geometria em cache (medida só no resize / carga)
    let geo = { topo: 0, curso: 1 };
    let tamanho = { w: 0, h: 0 };

    const splash =
      wordmarkRef.current && slotRef.current && logoFlatRef.current
        ? criarSplash({ palco, wordmark: wordmarkRef.current, slot: slotRef.current, logoFlat: logoFlatRef.current })
        : null;

    const progresso = () => Math.min(1, Math.max(0, (window.scrollY - geo.topo) / geo.curso));

    const atualizarCamada = (p: number) => {
      MOMENTS.forEach((m, i) => {
        momentRefs.current[i]?.classList.toggle("ativo", p >= m.from && p < m.to);
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

    // ── Loop: vivo enquanto a abertura está na tela e a aba visível ───────
    const ativo = () => visivel && !document.hidden && !disposed;
    const quadro = (agora: number) => {
      raf = 0;
      if (!ativo()) return;
      const dt = tAnterior ? Math.min(0.1, (agora - tAnterior) / 1000) : 1 / 60;
      tAnterior = agora;
      if (!reduzir) tempo += dt;
      alvo = progresso();
      atual += (alvo - atual) * (1 - Math.pow(1 - SUAVIZA, dt * 60));
      if (Math.abs(alvo - atual) < 0.0002) atual = alvo;
      atualizarCamada(atual);
      if (cena && (!reduzir || atual !== desenhado)) {
        cena.render(atual, tempo);
        desenhado = atual;
      }
      // Movimento reduzido: só segue enquanto a câmera alcança a rolagem
      if (!reduzir || atual !== alvo) raf = requestAnimationFrame(quadro);
      else tAnterior = 0;
    };
    const ligar = () => {
      if (ativo() && !raf) raf = requestAnimationFrame(quadro);
    };
    const desligar = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      tAnterior = 0;
    };

    // ── Medidas: só aqui (resize/carga), nunca dentro do loop ─────────────
    const medir = () => {
      const r = section.getBoundingClientRect();
      geo = { topo: r.top + window.scrollY, curso: Math.max(1, section.offsetHeight - window.innerHeight) };
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (w !== tamanho.w || h !== tamanho.h) {
        tamanho = { w, h };
        cena?.redimensionar(w, h, Math.min(window.devicePixelRatio || 1, dprMax));
      }
      splash?.medir();
      splash?.atualizar(atual);
      desenhado = -1;
      ligar();
    };
    let resizeId = 0;
    const aoRedimensionar = () => {
      cancelAnimationFrame(resizeId);
      resizeId = requestAnimationFrame(medir);
    };

    // Deslize automático: arma no 1º gesto dentro da abertura
    const deslize = criarDeslize({ geometria: () => geo, permitido: () => !formAbertoRef.current });

    const io = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
        deslize.visibilidade(visivel);
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

    medir();
    atual = alvo = progresso();
    atualizarCamada(atual);
    void document.fonts?.ready.then(() => !disposed && medir());
    window.addEventListener("load", medir, { once: true });
    io.observe(section);
    window.addEventListener("scroll", ligar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    document.addEventListener("visibilitychange", aoTrocarAba);

    // Cena WebGL: three.js só é baixado aqui (chunk separado)
    if (!temWebGL()) setSemGL(true);
    else {
      import("./glScene")
        .then(({ criarCena }) =>
          criarCena(canvas, { celular, dpr: Math.min(window.devicePixelRatio || 1, dprMax), logoUrl: LOGO_3D }),
        )
        .then((c) => {
          if (disposed) return c.destruir();
          cena = c;
          tamanho = { w: 0, h: 0 };
          medir();
          cena.render(atual, tempo);
          section.classList.add("gl-pronto");
        })
        .catch((erro) => {
          console.warn("Abertura GL: usando o pôster estático.", erro);
          if (!disposed) setSemGL(true);
        });
    }

    return () => {
      disposed = true;
      desligar();
      cancelAnimationFrame(resizeId);
      deslize.destruir();
      io.disconnect();
      cena?.destruir();
      document.documentElement.removeAttribute("data-cine-ativa");
      document.documentElement.removeAttribute("data-cine-splash");
      window.removeEventListener("scroll", ligar);
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("load", medir);
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
      aria-label="Abertura: Boder Space, agência digital"
    >
      <div ref={palcoRef} className="cine-palco">
        <div className="gl-cena">
          <img src={POSTER} alt="" className="gl-poster" aria-hidden="true" decoding="async" />
          <canvas ref={canvasRef} className="gl-canvas" aria-hidden="true" />
          <div className="cine-vinheta" />
        </div>

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
