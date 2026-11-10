/**
 * Deslize automático da abertura (molde Lusion).
 *
 * No primeiro gesto do usuário dentro da abertura (wheel, arrasto no toque ou
 * tecla de rolagem), a página passa a deslizar sozinha, devagar, na MESMA
 * direção do gesto, até sair da abertura — o astronauta nunca fica congelado.
 *
 *  - Velocidade constante e lenta: VELOCIDADE × altura da tela por segundo.
 *  - Um gesto novo assume na hora: enquanto o gesto (ou o embalo nativo
 *    dele) anda mais rápido que o deslize, o deslize não escreve nada; quando
 *    o embalo cai abaixo dessa velocidade, o deslize completa só a diferença —
 *    a passagem é contínua, sem tranco. Gesto no sentido oposto vira a direção.
 *  - Com o dedo na tela, nada é escrito (o usuário está no controle).
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

export interface DeslizeOpcoes {
  section: HTMLElement;
  /** false enquanto algo deve pausar o deslize (ex.: formulário aberto). */
  permitido: () => boolean;
}

export const criarDeslize = ({ section, permitido }: DeslizeOpcoes) => {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let direcao = 0; // +1 desce, -1 sobe, 0 desarmado
  let raf = 0;
  let visivel = true;
  let dedoNaTela = false;
  let toqueY = 0;
  let ultimoY = 0;
  let ultimoT = 0;
  let sobra = 0; // fração de pixel acumulada

  /** Posição dentro do trecho da abertura: 0 (topo) a curso (fim). */
  const trecho = () => {
    const curso = section.offsetHeight - window.innerHeight;
    return { pos: -section.getBoundingClientRect().top, curso };
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
    const dt = ultimoT ? Math.min(0.05, (agora - ultimoT) / 1000) : 0;
    ultimoT = agora;
    const y = window.scrollY;
    const { pos, curso } = trecho();

    // Saiu do trecho da abertura (no sentido do deslize): desliga.
    if ((direcao > 0 && pos >= curso) || (direcao < 0 && pos <= 0) || pos < -1 || pos > curso + 1) {
      desarmar();
      return;
    }

    if (dt > 0 && !dedoNaTela && permitido()) {
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

  const aoWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) gesto(Math.sign(e.deltaY));
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
    if (s) gesto(e.key === " " && e.shiftKey ? -1 : s);
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
