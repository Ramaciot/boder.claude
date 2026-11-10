/**
 * Splash da abertura (molde "Lusion"):
 *
 *  1. Wordmark BODER SPACE gigante na base da tela que, ao rolar, voa (FLIP:
 *     translação + escala da MESMA peça) até o canto superior esquerdo e vira
 *     a marca do cabeçalho, ao lado da logo flat. Voltando ao topo, o inverso.
 *  2. Meteoro: a logo 3D da Boder é a FONTE da cena — fica no portal do filme,
 *     com o brilho emanando dela, o anel do portal abraçando-a, o feixe
 *     nascendo nela e partículas sendo sugadas em sua direção.
 *
 * Custo quase zero: tudo o que se move sozinho (brilho, anel, partículas,
 * balanço da logo) é animação CSS de transform/opacity. Este módulo só
 * posiciona as camadas (medir) e, durante a rolagem, aplica o voo do nome e a
 * saída do meteoro (atualizar) — chamado pelo loop da abertura, que só roda
 * enquanto há scroll a acompanhar.
 */

/** Posição do portal no quadro do filme (fração da imagem 1440×608). */
const PORTAL = { x: 0.51, y: 0.27, diametro: 0.31, astronautaY: 0.8 };
const IMAGEM = { w: 1440, h: 608 };

/** Trechos do progresso (0–1) da abertura. */
const VOO_FIM = 0.11; // wordmark chega ao cabeçalho
const METEORO_SAI = [0.02, 0.13] as const; // câmera "passa" pelo portal

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
  /** Grupo do meteoro; as camadas internas são posicionadas por variáveis CSS. */
  meteoro: HTMLElement;
}

export const criarSplash = (refs: SplashRefs) => {
  const { palco, wordmark, slot, logoFlat, meteoro } = refs;
  let voo = { dx: 0, dy: 0, escala: 1 };
  let ultimoT = -1;
  let ultimoMeteoro = -1;

  /** Mede tudo: tamanho do wordmark, destino no cabeçalho e posição do portal. */
  const medir = () => {
    const W = palco.clientWidth;
    const H = palco.clientHeight;

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

    // 2) Portal no filme (object-fit: cover, igual ao canvas dos quadros).
    const s = Math.max(W / IMAGEM.w, H / IMAGEM.h);
    const ox = (W - IMAGEM.w * s) / 2;
    const oy = (H - IMAGEM.h * s) / 2;
    const d = PORTAL.diametro * IMAGEM.h * s;
    const cx = ox + PORTAL.x * IMAGEM.w * s;
    const cy = oy + PORTAL.y * IMAGEM.h * s;
    const astronautaY = oy + PORTAL.astronautaY * IMAGEM.h * s;
    meteoro.style.setProperty("--cx", `${cx.toFixed(1)}px`);
    meteoro.style.setProperty("--cy", `${cy.toFixed(1)}px`);
    meteoro.style.setProperty("--d", `${d.toFixed(1)}px`);
    meteoro.style.setProperty("--feixe", `${Math.max(0, astronautaY - cy).toFixed(1)}px`);
    meteoro.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;

    ultimoT = -1;
    ultimoMeteoro = -1;
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

    // Meteoro: cheio no splash; a câmera "atravessa" o portal ao rolar
    const k = suave(METEORO_SAI[0], METEORO_SAI[1], p);
    if (Math.abs(k - ultimoMeteoro) > 0.001) {
      ultimoMeteoro = k;
      meteoro.style.opacity = String(1 - k);
      meteoro.style.transform = `scale(${(1 + 0.55 * k).toFixed(3)})`;
      // Fora de vista: some do render e as animações dele ficam pausadas
      const fora = k >= 0.999;
      meteoro.style.visibility = fora ? "hidden" : "visible";
      meteoro.classList.toggle("is-fora", fora);
    }
  };

  return { medir, atualizar };
};
