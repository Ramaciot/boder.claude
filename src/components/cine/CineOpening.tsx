import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
// Logo oficial (flat) = marca do cabeçalho. A logo-meteoro 3D vem dentro do
// próprio filme (quadros), sem sobreposição.
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
 *    transform/opacity. O requestAnimationFrame só existe enquanto há rolagem
 *    e durante o assentamento; depois para sozinho.
 *  - Scroll suave no molde da Lusion: o quadro é dirigido por um valor
 *    amortecido (mola criticamente amortecida, por tempo — igual a 60 ou
 *    120 Hz), que acelera e desacelera sem tranco e nunca passa do ponto.
 *    Quando a página para, o destino vira o quadro inteiro mais próximo e a
 *    cena desacelera até assentar nele — sem o "rabo" que fica escorregando.
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
/** Celular em pé: filme vertical próprio (9:16), mostrado inteiro. */
const RETRATO_QUERY = "(max-width: 760px) and (orientation: portrait)";

/**
 * Configuração dos quadros vem do próprio pacote: frames.json (desktop e
 * mobile paisagem) e frames-retrato.json (celular em pé). Nada fixo no código
 * — ao trocar o pacote, basta substituir os arquivos. As dimensões do mobile
 * paisagem são lidas do próprio quadro carregado.
 */
const FRAMES_JSON = "/cine/assets/frames/frames.json";
const FRAMES_RETRATO_JSON = "/cine/assets/frames/frames-retrato.json";
type Conjunto = "desktop" | "mobile" | "retrato";
interface FramesConfig {
  total: number;
  largura: number;
  altura: number;
  desktop: string;
  mobile: string;
  /**
   * Área útil de cada conjunto, em px da fonte (opcional): quando o filme vem
   * com faixas pretas embutidas (letterbox), só essa faixa vertical entra no
   * palco. Sem o campo, o quadro inteiro.
   */
  util?: Partial<Record<"desktop" | "mobile", { y: number; h: number }>>;
}
interface RetratoConfig {
  total: number;
  largura: number;
  altura: number;
  mobileRetrato: string;
}
/** O que o player precisa de um conjunto de quadros, já resolvido. */
interface InfoConjunto {
  total: number;
  /** Padrão do arquivo, relativo a /cine/ (com {n}). */
  padrao: string;
  /** Dimensões da fonte (0 = lidas do 1º quadro). */
  w: number;
  h: number;
  util?: { y: number; h: number };
  /** true = quadro inteiro, tamanho natural, "contain" (filme vertical). */
  inteiro: boolean;
}
const frameUrl = (padrao: string, n: number) => `/cine/${padrao.replace("{n}", String(n).padStart(4, "0"))}`;

/** Faixas de progresso (0–1) em que cada painel aparece — iguais ao pacote. */
const MOMENTS = [
  { from: 0.3, to: 0.58 },
  { from: 0.64, to: 0.88 },
] as const;
/** A partir deste progresso a cena se dissolve no fundo do site. */
const SAIDA_INICIO = 0.88;
/**
 * Logo oficial por cima do meteoro do filme: opacidade 1 até 78% do
 * progresso, cai linear até 0 em 88% e fica em 0 — some antes do close
 * final, cujo reflexo na viseira já é a logo.
 */
const LOGO_SOME = [0.78, 0.88] as const;
const LOGO_URL = { webp: "/cine/assets/logo3d-rgba.webp", png: "/cine/assets/logo3d-rgba.png" };

/** Pré-carga: passadas (passo entre quadros) e ritmo dos lotes. */
const PASSADAS = [8, 4, 2, 1] as const;
const LOTE = 6;
const LOTE_MS = 40;
/** Rolagem parada há este tempo = destino vira o quadro inteiro mais próximo. */
const PARADA_MS = 90;
/** Tempo de suavização da mola (s): durante a rolagem e no assentamento. */
const SUAVE_ROLANDO = 0.1;
const SUAVE_ASSENTA = 0.14;

/** Janela pré-decodificada em tempo ocioso, em volta do quadro atual. */
const VIZINHOS = 8;

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
  const logoBroadcastRef = useRef<HTMLImageElement>(null);

  useCineFonts();

  useEffect(() => {
    const section = sectionRef.current;
    const palco = palcoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!section || !palco || !canvas || !ctx) return;

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const celularMql = window.matchMedia(MOBILE_QUERY);
    const retratoMql = window.matchMedia(RETRATO_QUERY);
    const escolher = (): Conjunto => (retratoMql.matches ? "retrato" : celularMql.matches ? "mobile" : "desktop");
    let set: Conjunto = escolher();
    let info: InfoConjunto | null = null;
    let total = 0; // conhecido quando o json do conjunto chega
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

    // Progresso da rolagem (0–1): alvo = real (posição da página); atual = o
    // que a cena mostra (amortecido; parado, assenta no quadro inteiro)
    let alvo = 0;
    let atual = 0;
    let desenhado = -1;
    let raf = 0;
    let visivel = true;
    let saidaAplicada = -1;
    let logoAplicada = -1;
    let ultimoIdx = -1;
    let alvoAnterior = -1;
    let ultimoMovimento = 0;
    let velocidade = 0; // da mola, em progresso/s
    let tAnterior = 0;
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
    /** Área útil do quadro (sem as faixas pretas, se o frames.json as declarar). */
    const util = () => {
      const u = info?.util;
      return u && u.h > 0 && u.y >= 0 && u.y + u.h <= fonte.h ? u : { y: 0, h: fonte.h };
    };

    const dimensionarCanvas = () => {
      const { w, h } = tamanho;
      if (!w || !h || !fonte.w || !fonte.h) return;
      // Filme vertical (celular em pé): quadro inteiro, no tamanho natural; o
      // CSS (object-fit: contain) encaixa sem recorte nem ampliação.
      canvas.classList.toggle("is-inteiro", !!info?.inteiro);
      if (info?.inteiro) {
        recorte = { x: 0, y: 0, w: fonte.w, h: fonte.h };
        if (canvas.width !== fonte.w || canvas.height !== fonte.h) {
          canvas.width = fonte.w;
          canvas.height = fonte.h;
          ctx.imageSmoothingQuality = "high";
        }
        desenhado = -1;
        return;
      }
      const u = util();
      const s = Math.max(w / fonte.w, h / u.h);
      const rw = Math.min(fonte.w, w / s);
      const rh = Math.min(u.h, h / s);
      recorte = { x: (fonte.w - rw) / 2, y: u.y + (u.h - rh) / 2, w: rw, h: rh };
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
        }
        // Só redesenha se este quadro é melhor que o que está na tela
        const alvoIdx = indice(atual);
        if (desenhado < 0 || Math.abs(i - alvoIdx) < Math.abs(desenhado - alvoIdx)) desenhar(alvoIdx, true);
        if (Math.abs(i - alvoIdx) <= VIZINHOS) agendarDecode();
      };
      img.src = frameUrl(info!.padrao, i + 1);
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

    const iniciarQuadros = (novo: InfoConjunto) => {
      info = novo;
      total = Math.max(1, Math.floor(novo.total));
      geracao++;
      if (loteId) window.clearTimeout(loteId);
      loteId = 0;
      cancelarDecode();
      fonte = { w: novo.w, h: novo.h };
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

    // ── Configuração dos conjuntos (json lido uma vez, sob demanda) ─────
    const jsons = new Map<string, Promise<unknown>>();
    const lerJson = (url: string) => {
      if (!jsons.has(url))
        jsons.set(
          url,
          fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}: HTTP ${r.status}`)))),
        );
      return jsons.get(url)!;
    };
    const carregarConjunto = async (c: Conjunto): Promise<InfoConjunto> => {
      if (c === "retrato") {
        const j = (await lerJson(FRAMES_RETRATO_JSON)) as RetratoConfig;
        return { total: j.total, padrao: j.mobileRetrato, w: j.largura, h: j.altura, inteiro: true };
      }
      const j = (await lerJson(FRAMES_JSON)) as FramesConfig;
      return c === "desktop"
        ? { total: j.total, padrao: j.desktop, w: j.largura, h: j.altura, util: j.util?.desktop, inteiro: false }
        : { total: j.total, padrao: j.mobile, w: 0, h: 0, util: j.util?.mobile, inteiro: false };
    };
    /** Troca para o conjunto `c` (ignora a resposta se a tela mudou de novo). */
    const usarConjunto = (c: Conjunto) =>
      carregarConjunto(c)
        .then((novo) => {
          if (disposed || c !== set) return;
          iniciarQuadros(novo);
          ajustar(true);
        })
        .catch((erro) => console.warn("Abertura: não foi possível ler os quadros.", erro));

    // ── Splash (wordmark que vira header) ────────────────────────────────
    const splash =
      wordmarkRef.current && slotRef.current && logoFlatRef.current
        ? criarSplash({
            palco,
            wordmark: wordmarkRef.current,
            slot: slotRef.current,
            logoFlat: logoFlatRef.current,
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
      // Logo oficial sobre o meteoro: mesmo progresso que move os quadros
      const logo = Math.round((1 - Math.min(1, Math.max(0, (p - LOGO_SOME[0]) / (LOGO_SOME[1] - LOGO_SOME[0])))) * 1000) / 1000;
      if (logo !== logoAplicada && logoBroadcastRef.current) {
        logoAplicada = logo;
        logoBroadcastRef.current.style.opacity = String(logo);
      }
    };

    // ── Loop: só enquanto há rolagem e durante o assentamento ─────────
    /** Progresso do quadro inteiro mais próximo. */
    const noQuadro = (p: number) => (total > 1 ? indice(p) / (total - 1) : p);

    /**
     * Mola criticamente amortecida (smooth damp): leva `atual` até `destino`
     * em ~`suave` s, sem passar do ponto. Independente da taxa de quadros.
     */
    const amortecer = (destino: number, suave: number, dt: number) => {
      const w = 2 / suave;
      const x = w * dt;
      const k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const delta = atual - destino;
      const temp = (velocidade + w * delta) * dt;
      velocidade = (velocidade - w * temp) * k;
      let novo = destino + (delta + temp) * k;
      if (destino - atual > 0 === novo > destino) {
        novo = destino;
        velocidade = 0;
      }
      atual = novo;
    };

    const quadro = (agora: number) => {
      raf = 0;
      if (!visivel) return;
      const dt = tAnterior ? Math.min(0.05, Math.max(0.001, (agora - tAnterior) / 1000)) : 1 / 60;
      tAnterior = agora;
      alvo = progresso();
      if (alvo !== alvoAnterior) {
        alvoAnterior = alvo;
        ultimoMovimento = agora;
      }
      const parado = agora - ultimoMovimento >= PARADA_MS;
      // Rolando: persegue a página, suave. Parado: assenta no quadro inteiro.
      const destino = parado ? noQuadro(alvo) : alvo;
      amortecer(destino, parado ? SUAVE_ASSENTA : SUAVE_ROLANDO, dt);
      let continuar = true;
      if (parado && Math.abs(atual - destino) < 0.00015 && Math.abs(velocidade) < 0.002) {
        atual = destino;
        velocidade = 0;
        continuar = false;
      }
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
      if (continuar) raf = requestAnimationFrame(quadro);
      else tAnterior = 0;
    };
    const acordar = () => {
      if (!reduzir && visivel && !raf) {
        tAnterior = 0;
        raf = requestAnimationFrame(quadro);
      }
    };

    // ── Tamanho: só refaz se o palco mudou de verdade ───────────────────
    const ajustar = (forcar = false) => {
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (!forcar && w === tamanho.w && h === tamanho.h) return;
      tamanho = { w, h };
      dimensionarCanvas();
      if (total) desenhar(indice(atual), true);
      splash?.medir();
      splash?.atualizar(atual);
    };
    const aoRedimensionar = () => ajustar();

    const aoMudarTela = () => {
      const novo = escolher();
      if (novo !== set) {
        set = novo;
        void usarConjunto(novo);
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
    // Lê a configuração do conjunto desta tela e só então começa a carregá-lo.
    void usarConjunto(set);
    // As fontes (Manrope 800 do wordmark) mudam a largura do texto: remede.
    void document.fonts?.ready.then(() => !disposed && ajustar(true));
    io.observe(section);
    if (!reduzir) window.addEventListener("scroll", acordar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);
    celularMql.addEventListener("change", aoMudarTela);
    retratoMql.addEventListener("change", aoMudarTela);

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
      retratoMql.removeEventListener("change", aoMudarTela);
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

          <div className="cine-poeira" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="cine-vinheta" />
        </div>

        {/* Logo oficial por cima do meteoro do filme (acima do canvas, abaixo
            dos painéis); opacidade dirigida pelo progresso da rolagem */}
        <picture>
          <source srcSet={LOGO_URL.webp} type="image/webp" />
          <img
            ref={logoBroadcastRef}
            src={LOGO_URL.png}
            alt=""
            aria-hidden="true"
            className="cine-logo-broadcast"
            width={700}
            height={846}
            decoding="async"
          />
        </picture>

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
