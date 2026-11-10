import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
// Logo oficial (flat) = marca do cabeçalho. A logo 3D é elemento da CENA
// (o meteoro no portal), nunca logo de interface.
import cineLogo from "@/assets/boder-logo.webp";
import { criarSplash } from "./cineSplash";
import "./cine.css";

/**
 * Abertura cinematográfica da home.
 *
 * Seção alta (460vh) com palco fixo: os quadros do filme são desenhados num
 * canvas conforme a rolagem (o scrub do astronauta subindo e virando em
 * direção à tela). Por cima: splash no molde da Lusion (cineSplash.ts), título
 * editorial e painéis de vidro.
 *
 * Desempenho (mobile primeiro):
 *  - Repouso SEM loop: parado, nada roda em JS. A "vida" da cena (astronauta
 *    respirando, brilho, anel, partículas sugadas, poeira) é CSS de
 *    transform/opacity. O requestAnimationFrame só existe enquanto o quadro
 *    está alcançando a rolagem e para sozinho quando alcança.
 *  - Quadros por janela: o 1º na hora; depois só uma janela à frente (e um
 *    pouco atrás) de onde a rolagem está, no máximo 4 downloads simultâneos,
 *    decode assíncrono; um "esqueleto" esparso (1 a cada 10) entra quando o
 *    navegador fica ocioso, para cobrir rolagens rápidas. Nunca os 120 de uma vez.
 *  - Fora da tela: loop parado e todas as animações CSS da abertura pausadas.
 *  - Canvas com resolução limitada e sem refazer tudo quando a barra de
 *    endereço do celular aparece/some.
 *
 * Unificação com o site: no trecho final (88%→100%) a cena se dissolve até
 * ficar transparente, revelando o fundo do próprio site.
 */

const TOTAL_FRAMES = 120;
const MOBILE_QUERY = "(max-width: 760px)";
const frameUrl = (set: "desktop" | "mobile", n: number) =>
  `/cine/assets/frames/${set}/f_${String(n).padStart(4, "0")}.webp`;

/** Logo 3D da Boder (mesma arte de /cine/assets/logo.png), em WebP leve. */
const METEORO_URL = "/cine/assets/logo-3d-meteoro.webp";

/** Faixas de progresso (0–1) em que cada painel aparece — iguais ao pacote. */
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;
/** A partir deste progresso a cena se dissolve no fundo do site. */
const SAIDA_INICIO = 0.88;

/** Janela de pré-carregamento em volta do quadro atual. */
const JANELA = { frente: 14, tras: 4 };
const MAX_DOWNLOADS = 4;

/** Partículas sugadas pela logo: ângulo de partida, raio (× diâmetro), duração, atraso. */
const SUGADAS = Array.from({ length: 18 }, (_, i) => ({
  a: Math.round((i * 360) / 18 + (i % 3) * 11),
  r: (0.95 + ((i * 37) % 10) / 14).toFixed(2),
  dur: (2.6 + ((i * 53) % 9) / 6).toFixed(2),
  atraso: (-((i * 71) % 40) / 10).toFixed(1),
}));

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
  const palcoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const logoFlatRef = useRef<HTMLImageElement>(null);
  const meteoroRef = useRef<HTMLDivElement>(null);

  useCineFonts();

  useEffect(() => {
    const section = sectionRef.current;
    const palco = palcoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!section || !palco || !canvas || !ctx) return;

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const celularMql = window.matchMedia(MOBILE_QUERY);
    const total = TOTAL_FRAMES;
    let set: "desktop" | "mobile" = celularMql.matches ? "mobile" : "desktop";

    // ── Quadros: carga por janela ─────────────────────────────────────────
    let quadros: (HTMLImageElement | null)[] = [];
    let prontos: boolean[] = [];
    let pedidos: boolean[] = [];
    let fila: number[] = [];
    let baixando = 0;
    let geracao = 0;
    let idleId = 0;
    let disposed = false;

    let alvo = 0;
    let atual = 0;
    let desenhado = -1;
    let raf = 0;
    let visivel = true;
    let saidaAplicada = -1;
    let ultimaJanela = -99;
    let tamanho = { w: 0, h: 0 };

    const maisProximo = (i: number) => {
      for (let d = 0; d < total; d++) {
        if (i - d >= 0 && prontos[i - d]) return i - d;
        if (i + d < total && prontos[i + d]) return i + d;
      }
      return -1;
    };

    const desenhar = (i: number, forcar = false) => {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j]!;
      const cw = canvas.width;
      const ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala;
      const h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    };

    const bombear = () => {
      while (baixando < MAX_DOWNLOADS && fila.length) {
        const i = fila.shift()!;
        if (pedidos[i]) continue;
        pedidos[i] = true;
        baixando++;
        const g = geracao;
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(set, i + 1);
        quadros[i] = img;
        const fim = (ok: boolean) => {
          if (g !== geracao || disposed) return;
          baixando--;
          if (ok) {
            prontos[i] = true;
            // Só redesenha se este quadro é melhor que o que está na tela
            const alvoIdx = Math.round(atual);
            if (desenhado < 0 || Math.abs(i - alvoIdx) < Math.abs(desenhado - alvoIdx)) desenhar(alvoIdx, true);
          }
          bombear();
        };
        img
          .decode()
          .then(() => fim(true))
          .catch(() => fim(img.complete && img.naturalWidth > 0));
      }
    };

    /** Prioriza a janela em volta de `idx` (à frente primeiro). */
    const janela = (idx: number) => {
      if (reduzir) return;
      const novos: number[] = [];
      for (let d = 0; d <= JANELA.frente; d++) if (idx + d < total) novos.push(idx + d);
      for (let d = 1; d <= JANELA.tras; d++) if (idx - d >= 0) novos.push(idx - d);
      fila = [...novos.filter((i) => !pedidos[i]), ...fila.filter((i) => !novos.includes(i))];
      bombear();
    };

    /** Esqueleto esparso (1 a cada 10) quando o navegador está ocioso. */
    const esqueleto = () => {
      if (reduzir) return;
      const pendentes: number[] = [];
      for (let i = 0; i < total; i += 10) if (!pedidos[i]) pendentes.push(i);
      fila = [...fila, ...pendentes.filter((i) => !fila.includes(i))];
      bombear();
    };

    const iniciarQuadros = () => {
      geracao++;
      quadros = new Array(total).fill(null);
      prontos = new Array(total).fill(false);
      pedidos = new Array(total).fill(false);
      fila = [0];
      baixando = 0;
      desenhado = -1;
      ultimaJanela = -99;
      bombear();
      janela(Math.round(atual));
      const agendar = () => {
        if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(esqueleto, { timeout: 4000 });
        else window.setTimeout(esqueleto, 2500);
      };
      if (document.readyState === "complete") agendar();
      else window.addEventListener("load", agendar, { once: true });
    };

    // ── Splash (wordmark que vira header + meteoro) ─────────────────────
    const splash =
      wordmarkRef.current && slotRef.current && logoFlatRef.current && meteoroRef.current
        ? criarSplash({
            palco,
            wordmark: wordmarkRef.current,
            slot: slotRef.current,
            logoFlat: logoFlatRef.current,
            meteoro: meteoroRef.current,
          })
        : null;

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
      // Título editorial: entra depois que o nome voou para o cabeçalho e sai
      // antes do primeiro painel.
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
      // Dissolve final no fundo do site
      const t = Math.min(1, Math.max(0, (p - SAIDA_INICIO) / (1 - SAIDA_INICIO)));
      const saida = Math.round(t * t * (3 - 2 * t) * 1000) / 1000;
      if (saida !== saidaAplicada) {
        saidaAplicada = saida;
        section.style.setProperty("--saida", String(saida));
      }
    };

    // ── Loop: só enquanto o quadro está alcançando a rolagem ───────────
    const quadro = () => {
      raf = 0;
      if (!visivel) return;
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      const p = atual / (total - 1);

      desenhar(Math.round(atual));
      atualizarMomentos(p);
      splash?.atualizar(p);

      const idx = Math.round(alvo);
      if (Math.abs(idx - ultimaJanela) >= 2) {
        ultimaJanela = idx;
        janela(idx);
      }
      if (atual !== alvo) raf = requestAnimationFrame(quadro);
    };
    const acordar = () => {
      if (!reduzir && visivel && !raf) raf = requestAnimationFrame(quadro);
    };

    // ── Tamanho: só refaz se o palco mudou de verdade ───────────────────
    const ajustar = (forcar = false) => {
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (!forcar && w === tamanho.w && h === tamanho.h) return;
      tamanho = { w, h };
      // Resolução interna = o detalhe que o quadro realmente tem na tela.
      // Com "cover", cada pixel do quadro ocupa `s` pixels CSS; desenhar acima
      // de ~1,15 px por pixel do quadro não acrescenta nada visível, só custo
      // (no celular, o recorte mostra ~125 px de largura do quadro de 640).
      // O navegador estica o canvas na GPU.
      const fonte = set === "mobile" ? { w: 640, h: 270 } : { w: 1440, h: 608 };
      const s = Math.max(w / fonte.w, h / fonte.h);
      const teto = Math.min(window.devicePixelRatio || 1, celularMql.matches ? 1.25 : 1.5);
      const densidade = Math.max(0.5, Math.min(teto, 1.15 / s));
      canvas.width = Math.round(w * densidade);
      canvas.height = Math.round(h * densidade);
      desenhado = -1;
      desenhar(Math.round(atual), true);
      splash?.medir();
      splash?.atualizar(atual / (total - 1));
    };
    const aoRedimensionar = () => ajustar();

    const aoMudarTela = () => {
      const novo = celularMql.matches ? "mobile" : "desktop";
      if (novo !== set) {
        set = novo;
        iniciarQuadros();
        ajustar(true);
      }
    };

    // Visibilidade: fora da tela, loop parado e animações CSS pausadas
    // (classe em-cena). Também esconde o header fixo do site enquanto a
    // abertura — que tem o próprio header — está na tela.
    const io = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
        document.documentElement.toggleAttribute("data-cine-ativa", visivel);
        section.classList.toggle("em-cena", visivel);
        if (visivel) acordar();
        else {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          document.documentElement.removeAttribute("data-cine-splash");
        }
      },
      { rootMargin: "0px 0px -100% 0px" },
    );

    atual = alvo = reduzir ? 0 : progresso() * (total - 1);
    iniciarQuadros();
    ajustar(true);
    atualizarMomentos(atual / (total - 1));
    // As fontes (Manrope 800 do wordmark) mudam a largura do texto: remede.
    void document.fonts?.ready.then(() => !disposed && ajustar(true));
    io.observe(section);
    if (!reduzir) window.addEventListener("scroll", acordar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    celularMql.addEventListener("change", aoMudarTela);

    return () => {
      disposed = true;
      geracao++;
      if (raf) cancelAnimationFrame(raf);
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      io.disconnect();
      document.documentElement.removeAttribute("data-cine-ativa");
      document.documentElement.removeAttribute("data-cine-splash");
      window.removeEventListener("scroll", acordar);
      window.removeEventListener("resize", aoRedimensionar);
      celularMql.removeEventListener("change", aoMudarTela);
    };
  }, []);

  const goTo = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="inicio" ref={sectionRef} className="cine-abertura em-cena" style={{ "--altura": "460vh" } as CSSProperties}>
      <div ref={palcoRef} className="cine-palco">
        <div className="cine-cena">
          {/* Astronauta "respirando" no repouso: só CSS na camada do canvas */}
          <div className="cine-respira">
            <canvas ref={canvasRef} className="cine-canvas" aria-hidden="true" />
          </div>

          {/* Meteoro: a logo 3D como fonte de luz e de atração da cena */}
          <div ref={meteoroRef} className="cine-meteoro" aria-hidden="true">
            <div className="cine-meteoro__feixe" />
            <div className="cine-meteoro__brilho" />
            <div className="cine-meteoro__anel" />
            <img src={METEORO_URL} alt="" className="cine-meteoro__logo" decoding="async" />
            <div className="cine-meteoro__nucleo" />
            <div className="cine-meteoro__sugadas">
              {SUGADAS.map((s, i) => (
                <i
                  key={i}
                  style={
                    {
                      "--a": `${s.a}deg`,
                      "--r": s.r,
                      animationDuration: `${s.dur}s`,
                      animationDelay: `${s.atraso}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
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
