/**
 * Deslize automático da abertura (molde Lusion).
 *
 * No primeiro gesto do usuário dentro da abertura (wheel, arrasto no toque ou
 * tecla de rolagem), a página passa a deslizar sozinha, devagar, na MESMA
 * direção do gesto, até sair da abertura — o astronauta nunca fica congelado.
 *
 *  - Velocidade constante e lenta: VELOCIDADE × altura da tela por segundo.
 *  - CEDE na hora ao usuário: durante um gesto ativo (dedo na tela, ou até
 *    CEDE_MS depois do último wheel/tecla) o deslize não escreve nada — não
 *    disputa com a rolagem do navegador. Depois, enquanto o embalo nativo
 *    anda mais rápido que o deslize, também não escreve; quando o embalo cai
 *    abaixo dessa velocidade, completa só a diferença — passagem contínua,
 *    sem tranco. Gesto no sentido oposto vira a direção.
 *  - Sem leitura de layout no loop: a geometria da abertura vem em cache
 *    (medida pelo player no resize).
 *  - Só dentro do trecho da abertura: chegou ao fim (ou ao topo, subindo),
 *    saiu da tela ou a aba ficou oculta → desliga e não roda nenhum rAF.
 *    Volta a armar no próximo gesto dentro da abertura.
 *  - prefers-reduced-motion: nunca arma.
 *
 * Não desenha nem decodifica nada: só move a página. O player da abertura
 * continua perseguindo a posição da página com a mesma suavização.
 */

/** Fração da altura da tela por segundo (travessia de 360vh em ~29 s). */
const VELOCIDADE = 0.125;
/** Abaixo disto (px) o movimento externo é ruído de arredondamento. */
const RUIDO_PX = 1.5;
/** Depois do último wheel/tecla, o deslize espera isto antes de voltar a escrever. */
const CEDE_MS = 320;

export interface DeslizeOpcoes {
  /** Geometria em cache da abertura: topo (px do documento) e curso rolável. */
  geometria: () => { topo: number; curso: number };
  /** false enquanto algo deve pausar o deslize (ex.: formulário aberto). */
  permitido: () => boolean;
}

export const criarDeslize = ({ geometria, permitido }: DeslizeOpcoes) => {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let direcao = 0; // +1 desce, -1 sobe, 0 desarmado
  let raf = 0;
  let visivel = true;
  let dedoNaTela = false;
  let toqueY = 0;
  let ultimoY = 0;
  let ultimoT = 0;
  let sobra = 0; // fração de pixel acumulada
  let gestoAte = 0; // até quando (performance.now) o usuário está no controle

  /** Posição dentro do trecho da abertura: 0 (topo) a curso (fim). */
  const trecho = () => {
    const { topo, curso } = geometria();
    return { pos: window.scrollY - topo, curso };
  };
  const dentro = () => {
    const { pos, curso } = trecho();
    return curso > 0 && pos >= -1 && pos <= curso + 1;
  };

  const parar = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const desarmar = () => {
    direcao = 0;
    parar();
  };

  const passo = (agora: number) => {
    raf = 0;
    if (!direcao || !visivel || document.hidden) return;
    // passo pelo tempo real (velocidade certa mesmo com fps baixo); teto só
    // para não dar salto depois de uma pausa longa
    const dt = ultimoT ? Math.min(0.25, (agora - ultimoT) / 1000) : 0;
    ultimoT = agora;
    const y = window.scrollY;
    const { pos, curso } = trecho();

    // Saiu do trecho da abertura (no sentido do deslize): desliga.
    if ((direcao > 0 && pos >= curso) || (direcao < 0 && pos <= 0) || pos < -1 || pos > curso + 1) {
      desarmar();
      return;
    }

    if (dt > 0 && !dedoNaTela && agora >= gestoAte && permitido()) {
      const externo = y - ultimoY; // o que andou sem nós (gesto/embalo)
      if (externo * direcao < -RUIDO_PX) {
        // Gesto no sentido oposto: vira a direção (o embalo dele conduz).
        direcao = externo > 0 ? 1 : -1;
        sobra = 0;
      } else {
        const meta = VELOCIDADE * window.innerHeight * dt; // px deste quadro
        const falta = meta - Math.max(0, externo * direcao);
        if (falta > 0) {
          // Não passa do fim/topo da abertura
          const limite = direcao > 0 ? curso - pos : pos;
          const mover = Math.min(falta + sobra, limite);
          const inteiro = Math.floor(mover);
          sobra = mover - inteiro;
          if (inteiro > 0) window.scrollTo({ top: y + inteiro * direcao, behavior: "instant" });
        }
      }
    }
    ultimoY = window.scrollY;
    raf = requestAnimationFrame(passo);
  };

  const ligar = () => {
    if (raf || !direcao || !visivel || document.hidden) return;
    ultimoT = 0;
    ultimoY = window.scrollY;
    raf = requestAnimationFrame(passo);
  };

  /** Gesto do usuário: arma (ou redireciona) o deslize. */
  const gesto = (sentido: number) => {
    if (reduzir || !sentido || !dentro()) return;
    const { pos, curso } = trecho();
    // Gesto que já sai da abertura (descendo no fim / subindo no topo): nada.
    if ((sentido > 0 && pos >= curso) || (sentido < 0 && pos <= 0)) return;
    if (sentido !== direcao) sobra = 0;
    direcao = sentido;
    ligar();
  };

  const ceder = () => {
    gestoAte = performance.now() + CEDE_MS;
  };
  const aoWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    ceder();
    gesto(Math.sign(e.deltaY));
  };
  const aoTocar = (e: TouchEvent) => {
    dedoNaTela = true;
    toqueY = e.touches[0]?.clientY ?? 0;
  };
  const aoArrastar = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY ?? toqueY;
    const d = toqueY - y; // dedo sobe = página desce
    if (Math.abs(d) > 6) {
      gesto(Math.sign(d));
      toqueY = y;
    }
  };
  const aoSoltar = (e: TouchEvent) => {
    dedoNaTela = e.touches.length > 0;
    ultimoY = window.scrollY; // o embalo nativo começa daqui
  };
  const TECLAS: Record<string, number> = {
    ArrowDown: 1,
    PageDown: 1,
    " ": 1,
    End: 1,
    ArrowUp: -1,
    PageUp: -1,
    Home: -1,
  };
  const aoTeclar = (e: KeyboardEvent) => {
    const alvo = e.target as HTMLElement | null;
    if (alvo?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
    const s = TECLAS[e.key];
    if (!s) return;
    ceder();
    gesto(e.key === " " && e.shiftKey ? -1 : s);
  };
  const aoTrocarAba = () => (document.hidden ? parar() : ligar());

  const passivo = { passive: true } as const;
  if (!reduzir) {
    window.addEventListener("wheel", aoWheel, passivo);
    window.addEventListener("touchstart", aoTocar, passivo);
    window.addEventListener("touchmove", aoArrastar, passivo);
    window.addEventListener("touchend", aoSoltar, passivo);
    window.addEventListener("touchcancel", aoSoltar, passivo);
    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("visibilitychange", aoTrocarAba);
  }

  return {
    /** Visibilidade da abertura (IntersectionObserver do player). */
    visibilidade(v: boolean) {
      visivel = v;
      if (!v) desarmar(); // saiu da abertura: rearma só no próximo gesto
    },
    destruir() {
      desarmar();
      window.removeEventListener("wheel", aoWheel);
      window.removeEventListener("touchstart", aoTocar);
      window.removeEventListener("touchmove", aoArrastar);
      window.removeEventListener("touchend", aoSoltar);
      window.removeEventListener("touchcancel", aoSoltar);
      window.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("visibilitychange", aoTrocarAba);
    },
  };
};
