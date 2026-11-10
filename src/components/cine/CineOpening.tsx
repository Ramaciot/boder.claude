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
 * Player (mobile primeiro):
 *  - Repouso SEM loop: parado, nada roda em JS. A "vida" da cena (astronauta
 *    respirando, brilho, anel, partículas sugadas, poeira) é CSS de
 *    transform/opacity. O requestAnimationFrame só existe enquanto o quadro
 *    está alcançando a rolagem (suavização 0,18) e para sozinho quando alcança.
 *  - Pré-carga em passadas: 1 a cada 8 quadros, depois a cada 4, 2 e 1, em
 *    lotes de 6 a cada 40 ms. Logo no início há quadros espalhados pelo filme
 *    todo; a densidade aumenta até completar.
 *  - Pré-decodificação: em tempo ocioso (requestIdleCallback), a janela de ±8
 *    quadros em volta do atual é decodificada antes de ser desenhada. Nunca no
 *    handler de scroll, que só acorda o loop.
 *  - Canvas na resolução da fonte: o tamanho interno é o recorte "cover" do
 *    quadro, nunca maior que o quadro (nem que a tela × DPR até 2).
 *  - Fora da tela: loop parado e todas as animações CSS da abertura pausadas.
 *
 * Unificação com o site: no trecho final (88%→100%) a cena se dissolve até
 * ficar transparente, revelando o fundo do próprio site.
 */

const MOBILE_QUERY = "(max-width: 760px)";

/**
 * Configuração dos quadros vem do próprio pacote (frames.json): total,
 * largura/altura (desktop) e o padrão dos arquivos. Nada fixo no código — ao
 * trocar o pacote, basta substituir a pasta frames/. As dimensões do mobile
 * (retrato) são lidas do próprio quadro carregado.
 */
const FRAMES_JSON = "/cine/assets/frames/frames.json";
interface FramesConfig {
  total: number;
  largura: number;
  altura: number;
  desktop: string;
  mobile: string;
}
const frameUrl = (cfg: FramesConfig, set: "desktop" | "mobile", n: number) =>
  `/cine/${cfg[set].replace("{n}", String(n).padStart(4, "0"))}`;

/** Logo 3D da Boder (mesma arte de /cine/assets/logo.png), em WebP leve. */
const METEORO_URL = "/cine/assets/logo-3d-meteoro.webp";

/** Faixas de progresso (0–1) em que cada painel aparece — iguais ao pacote. */
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;
/** A partir deste progresso a cena se dissolve no fundo do site. */
const SAIDA_INICIO = 0.88;

/** Pré-carga: passadas (passo entre quadros) e ritmo dos lotes. */
const PASSADAS = [8, 4, 2, 1] as const;
const LOTE = 6;
const LOTE_MS = 40;
/** Janela pré-decodificada em tempo ocioso, em volta do quadro atual. */
const VIZINHOS = 8;

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
    let set: "desktop" | "mobile" = celularMql.matches ? "mobile" : "desktop";
    let cfg: FramesConfig | null = null;
    let total = 0; // conhecido quando o frames.json chega
    // Dimensões do quadro do conjunto atual (desktop: frames.json; mobile:
    // lidas do 1º quadro carregado). 0 = ainda desconhecidas.
    let fonte = { w: 0, h: 0 };

    // ── Quadros: pré-carga em passadas + pré-decodificação ociosa ───────
    let quadros: (HTMLImageElement | null)[] = [];
    let prontos: boolean[] = []; // baixado
    let decodificados: boolean[] = []; // decodificado (pronto para desenhar sem travar)
    let fila: number[] = [];
    let loteId = 0;
    let decodeId = 0;
    let geracao = 0;
    let disposed = false;

    // Progresso da rolagem (0–1): alvo = real; atual = suavizado
    let alvo = 0;
    let atual = 0;
    let desenhado = -1;
    let raf = 0;
    let visivel = true;
    let saidaAplicada = -1;
    let ultimoIdx = -1;
    let tamanho = { w: 0, h: 0 };
    let recorte = { x: 0, y: 0, w: 0, h: 0 }; // área "cover" do quadro, em px da fonte

    const indice = (p: number) => Math.round(p * Math.max(0, total - 1));

    const maisProximo = (i: number) => {
      for (let d = 0; d < total; d++) {
        if (i - d >= 0 && prontos[i - d]) return i - d;
        if (i + d < total && prontos[i + d]) return i + d;
      }
      return -1;
    };

    /**
     * Canvas na resolução da fonte: o tamanho interno é o recorte "cover" do
     * quadro para o formato do palco — nunca maior que o quadro, e também não
     * maior que o palco × DPR (máx. 2), que seria só pixel desperdiçado.
     */
    const dimensionarCanvas = () => {
      const { w, h } = tamanho;
      if (!w || !h || !fonte.w || !fonte.h) return;
      const s = Math.max(w / fonte.w, h / fonte.h);
      const rw = Math.min(fonte.w, w / s);
      const rh = Math.min(fonte.h, h / s);
      recorte = { x: (fonte.w - rw) / 2, y: (fonte.h - rh) / 2, w: rw, h: rh };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const k = Math.min(1, (w * dpr) / rw);
      const cw = Math.max(1, Math.round(rw * k));
      const ch = Math.max(1, Math.round(rh * k));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        ctx.imageSmoothingQuality = "high";
      }
      desenhado = -1;
    };

    const desenhar = (i: number, forcar = false) => {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar) || !recorte.w) return;
      const img = quadros[j]!;
      // Recorte em coordenadas da fonte (escala caso o arquivo difira do json)
      const fx = img.naturalWidth / fonte.w;
      const fy = img.naturalHeight / fonte.h;
      ctx.drawImage(img, recorte.x * fx, recorte.y * fy, recorte.w * fx, recorte.h * fy, 0, 0, canvas.width, canvas.height);
      desenhado = j;
      decodificados[j] = true; // desenhar já deixa o quadro decodificado
    };

    /** Ordem da pré-carga: passadas de 8, 4, 2 e 1 (sem repetir). */
    const ordemPassadas = (primeiro: number) => {
      const ordem = [primeiro];
      const visto = new Set(ordem);
      for (const passo of PASSADAS)
        for (let i = 0; i < total; i += passo)
          if (!visto.has(i)) {
            visto.add(i);
            ordem.push(i);
          }
      return ordem;
    };

    const pedir = (i: number) => {
      const g = geracao;
      const img = new Image();
      img.decoding = "async";
      quadros[i] = img;
      img.onload = () => {
        if (g !== geracao || disposed) return;
        prontos[i] = true;
        // 1º quadro que chega: dimensões reais (o mobile não está no json)
        if (img.naturalWidth !== fonte.w || img.naturalHeight !== fonte.h) {
          fonte = { w: img.naturalWidth, h: img.naturalHeight };
          dimensionarCanvas();
          splash?.medir(fonte, set);
          splash?.atualizar(atual);
        }
        // Só redesenha se este quadro é melhor que o que está na tela
        const alvoIdx = indice(atual);
        if (desenhado < 0 || Math.abs(i - alvoIdx) < Math.abs(desenhado - alvoIdx)) desenhar(alvoIdx, true);
        if (Math.abs(i - alvoIdx) <= VIZINHOS) agendarDecode();
      };
      img.src = frameUrl(cfg!, set, i + 1);
    };

    /** Um lote de 6 pedidos; o próximo sai 40 ms depois, até esvaziar a fila. */
    const lote = () => {
      loteId = 0;
      if (disposed) return;
      for (let n = 0; n < LOTE && fila.length; n++) pedir(fila.shift()!);
      if (fila.length) loteId = window.setTimeout(lote, LOTE_MS);
    };

    /** Pré-decodifica, em tempo ocioso, os ±8 quadros em volta do atual. */
    const decodificarVizinhos = () => {
      decodeId = 0;
      if (disposed || !total) return;
      const g = geracao;
      const centro = indice(atual);
      for (let d = 0; d <= VIZINHOS; d++)
        for (const i of d ? [centro + d, centro - d] : [centro]) {
          const img = quadros[i];
          if (i < 0 || i >= total || !img || !prontos[i] || decodificados[i]) continue;
          decodificados[i] = true; // evita pedir de novo enquanto decodifica
          img.decode().catch(() => {
            if (g === geracao) decodificados[i] = false;
          });
        }
    };
    const agendarDecode = () => {
      if (decodeId || disposed || reduzir) return;
      decodeId =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(decodificarVizinhos, { timeout: 300 })
          : window.setTimeout(decodificarVizinhos, 60);
    };
    const cancelarDecode = () => {
      if (!decodeId) return;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(decodeId);
      else window.clearTimeout(decodeId);
      decodeId = 0;
    };

    const iniciarQuadros = () => {
      if (!cfg) return;
      geracao++;
      if (loteId) window.clearTimeout(loteId);
      loteId = 0;
      cancelarDecode();
      fonte = set === "desktop" ? { w: cfg.largura, h: cfg.altura } : { w: 0, h: 0 };
      quadros = new Array(total).fill(null);
      prontos = new Array(total).fill(false);
      decodificados = new Array(total).fill(false);
      desenhado = -1;
      ultimoIdx = -1;
      dimensionarCanvas();
      // Movimento reduzido: só o quadro de repouso.
      fila = reduzir ? [0] : ordemPassadas(indice(atual));
      lote();
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
      alvo = progresso();
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.0004) atual = alvo;
      const p = atual;

      if (total) desenhar(indice(p));
      atualizarMomentos(p);
      splash?.atualizar(p);

      // Mudou de quadro: pede a pré-decodificação dos vizinhos para o tempo
      // ocioso (o handler de scroll em si só acorda este loop).
      const idx = indice(p);
      if (idx !== ultimoIdx) {
        ultimoIdx = idx;
        agendarDecode();
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
      dimensionarCanvas();
      if (total) desenhar(indice(atual), true);
      splash?.medir(fonte, set);
      splash?.atualizar(atual);
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

    atual = alvo = reduzir ? 0 : progresso();
    ajustar(true);
    atualizarMomentos(atual);
    // Lê a configuração do pacote de quadros e só então começa a carregá-los.
    fetch(FRAMES_JSON)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`frames.json: HTTP ${r.status}`))))
      .then((json: FramesConfig) => {
        if (disposed) return;
        cfg = json;
        total = Math.max(1, Math.floor(json.total));
        iniciarQuadros();
        ajustar(true);
      })
      .catch((erro) => console.warn("Abertura: não foi possível ler os quadros.", erro));
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
      if (loteId) window.clearTimeout(loteId);
      cancelarDecode();
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
