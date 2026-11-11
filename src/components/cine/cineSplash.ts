/**
 * Splash da abertura (molde "Lusion"):
 *
 * Wordmark BODER SPACE gigante na base da tela que, ao rolar, voa (FLIP:
 * translação + escala da MESMA peça) até o canto superior esquerdo e vira a
 * marca do cabeçalho, ao lado da logo flat. Voltando ao topo, o inverso.
 *
 * A logo-meteoro 3D vem dentro do próprio filme, então não há sobreposição.
 * Custo quase zero: este módulo só mede (medir) e, durante a rolagem, aplica
 * o voo do nome (atualizar) — chamado pelo loop da abertura, que só roda
 * enquanto há scroll a acompanhar.
 */

/** Trechos do progresso (0–1) da abertura. */
const VOO_FIM = 0.11; // wordmark chega ao cabeçalho

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const suave = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface SplashRefs {
  palco: HTMLElement;
  wordmark: HTMLElement;
  slot: HTMLElement;
  logoFlat: HTMLElement;
}

export const criarSplash = (refs: SplashRefs) => {
  const { palco, wordmark, slot, logoFlat } = refs;
  let voo = { dx: 0, dy: 0, escala: 1 };
  let ultimoT = -1;

  /** Mede o tamanho do wordmark e o destino dele no cabeçalho. */
  const medir = () => {
    const W = palco.clientWidth;

    // 1) Wordmark: ocupa a largura útil da tela, na base.
    wordmark.style.transform = "none";
    wordmark.style.fontSize = "100px";
    const natural = wordmark.getBoundingClientRect().width || 1;
    const margem = wordmark.offsetLeft;
    wordmark.style.fontSize = `${(100 * (W - 2 * margem)) / natural}px`;
    const grande = wordmark.getBoundingClientRect();
    const destino = slot.getBoundingClientRect();
    voo = {
      escala: destino.width / (grande.width || 1),
      dx: destino.left - grande.left,
      dy: destino.top - grande.top,
    };
    // Altura ocupada pelo wordmark a partir da base do palco: a dica de
    // rolagem fica logo acima dele, sem ficar escondida atrás do texto.
    palco.style.setProperty("--wordmark-topo", `${Math.round(palco.getBoundingClientRect().bottom - grande.top)}px`);

    ultimoT = -1;
  };

  /** Aplica o estado do splash para o progresso `p` (0–1, suavizado). */
  const atualizar = (p: number) => {
    // Wordmark: FLIP da base até o cabeçalho
    const t = easeInOutCubic(clamp01(p / VOO_FIM));
    if (Math.abs(t - ultimoT) > 0.0005) {
      ultimoT = t;
      const esc = 1 + (voo.escala - 1) * t;
      wordmark.style.transform = `translate3d(${(voo.dx * t).toFixed(2)}px, ${(voo.dy * t).toFixed(2)}px, 0) scale(${esc.toFixed(4)})`;
      const chegada = suave(0.55, 1, t);
      logoFlat.style.opacity = String(chegada);
      logoFlat.style.transform = `scale(${(0.7 + 0.3 * chegada).toFixed(3)})`;
      // Splash "limpo": o botão do chat só aparece depois que o nome sai da base
      document.documentElement.toggleAttribute("data-cine-splash", t < 0.5);
    }
  };

  return { medir, atualizar };
};
