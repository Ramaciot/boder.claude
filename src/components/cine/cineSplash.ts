/**
 * Splash da abertura (molde "Lusion"):
 *
 *  1. Wordmark BODER SPACE gigante na base da tela que, ao rolar, voa (FLIP:
 *     translação + escala da MESMA peça) até o canto superior esquerdo e vira
 *     a marca do cabeçalho, ao lado da logo flat. Voltando ao topo, o inverso.
 *  2. Meteoro: a logo 3D da Boder posicionada exatamente no portal do filme
 *     (de onde parte o feixe que puxa o astronauta), com brilho pulsando, anel
 *     de partículas girando em canvas (atrás e na frente da logo, com
 *     profundidade) e faíscas saindo dela.
 *
 * Tudo é atualizado pelo loop único da abertura (`atualizar(p, agora)`);
 * este módulo não cria requestAnimationFrame próprio.
 */

/** Posição do portal no quadro do filme (fração da imagem 1440×608). */
const PORTAL = { x: 0.51, y: 0.27, diametro: 0.31, astronautaY: 0.8 };
const IMAGEM = { w: 1440, h: 608 };

/** Trechos do progresso (0–1) da abertura. */
const VOO_FIM = 0.11; // wordmark chega ao cabeçalho
const METEORO_SAI = [0.02, 0.13] as const; // câmera "passa" pelo portal

const CORES = ["23, 201, 173", "16, 185, 129", "238, 243, 240", "139, 92, 246"];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const suave = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Particula {
  a: number; // ângulo na órbita
  w: number; // velocidade angular (rad/s)
  r: number; // raio relativo
  tam: number;
  cor: string;
  fase: number;
}
interface Faisca {
  a: number;
  r: number;
  vr: number;
  w: number;
  vida: number;
  dur: number;
  tam: number;
  cor: string;
}

export interface SplashRefs {
  palco: HTMLElement;
  wordmark: HTMLElement;
  slot: HTMLElement;
  logoFlat: HTMLElement;
  meteoro: HTMLElement; // grupo (brilho + canvases + logo 3D + feixe)
  logo3d: HTMLElement;
  brilho: HTMLElement;
  feixe: HTMLElement;
  atras: HTMLCanvasElement;
  frente: HTMLCanvasElement;
}

export const criarSplash = (refs: SplashRefs, reduzir: boolean) => {
  const { palco, wordmark, slot, logoFlat, meteoro, logo3d, brilho, feixe, atras, frente } = refs;
  const ctxA = atras.getContext("2d");
  const ctxF = frente.getContext("2d");

  // Geometria (recalculada em medir())
  let voo = { dx: 0, dy: 0, escala: 1 };
  let centro = { x: 0, y: 0, raio: 100 };
  let caixa = { w: 0, h: 0 };
  let ultimoT = -1;
  let ultimoMeteoro = -1;
  let anterior = 0;

  const particulas: Particula[] = Array.from({ length: 150 }, () => ({
    a: Math.random() * Math.PI * 2,
    w: (0.12 + Math.random() * 0.32) * (Math.random() < 0.85 ? 1 : -1),
    r: 1.05 + Math.random() * 0.55,
    tam: 0.6 + Math.random() * 1.6,
    cor: CORES[Math.random() < 0.06 ? 3 : Math.floor(Math.random() * 3)],
    fase: Math.random() * Math.PI * 2,
  }));
  const novaFaisca = (): Faisca => ({
    a: Math.random() * Math.PI * 2,
    r: 0.15 + Math.random() * 0.2,
    vr: 0.18 + Math.random() * 0.3,
    w: (Math.random() - 0.5) * 1.6,
    vida: 0,
    dur: 1.8 + Math.random() * 2.2,
    tam: 0.6 + Math.random() * 1.2,
    cor: CORES[Math.floor(Math.random() * 3)],
  });
  const faiscas: Faisca[] = Array.from({ length: 46 }, () => {
    const f = novaFaisca();
    f.vida = Math.random() * f.dur;
    return f;
  });

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

    // 2) Portal no filme (object-fit: cover, como o canvas e o vídeo).
    const s = Math.max(W / IMAGEM.w, H / IMAGEM.h);
    const ox = (W - IMAGEM.w * s) / 2;
    const oy = (H - IMAGEM.h * s) / 2;
    const d = PORTAL.diametro * IMAGEM.h * s;
    centro = { x: ox + PORTAL.x * IMAGEM.w * s, y: oy + PORTAL.y * IMAGEM.h * s, raio: d / 2 };
    const astronautaY = oy + PORTAL.astronautaY * IMAGEM.h * s;

    meteoro.style.transformOrigin = `${centro.x}px ${centro.y}px`;
    logo3d.style.height = `${d * 1.1}px`;
    logo3d.style.left = `${centro.x}px`;
    logo3d.style.top = `${centro.y}px`;
    brilho.style.width = brilho.style.height = `${d * 2.1}px`;
    brilho.style.left = `${centro.x}px`;
    brilho.style.top = `${centro.y}px`;
    const inicioFeixe = centro.y + d * 0.42;
    feixe.style.left = `${centro.x}px`;
    feixe.style.top = `${inicioFeixe}px`;
    feixe.style.height = `${Math.max(0, astronautaY - inicioFeixe)}px`;

    // 3) Canvases das partículas: uma caixa em volta do portal (barato).
    caixa = { w: Math.round(centro.raio * 4.2), h: Math.round(centro.raio * 3.4) };
    for (const c of [atras, frente]) {
      c.width = caixa.w;
      c.height = caixa.h;
      c.style.width = `${caixa.w}px`;
      c.style.height = `${caixa.h}px`;
      c.style.left = `${centro.x - caixa.w / 2}px`;
      c.style.top = `${centro.y - caixa.h / 2}px`;
    }

    ultimoT = -1;
    ultimoMeteoro = -1;
  };

  const desenharParticulas = (dt: number, agora: number) => {
    if (!ctxA || !ctxF) return;
    ctxA.clearRect(0, 0, caixa.w, caixa.h);
    ctxF.clearRect(0, 0, caixa.w, caixa.h);
    ctxA.globalCompositeOperation = ctxF.globalCompositeOperation = "lighter";
    const cx = caixa.w / 2;
    const cy = caixa.h / 2;
    const R = centro.raio;
    const inclinacao = 0.34; // achatamento da órbita (vista em perspectiva)
    const plano = -0.24; // rotação do plano da órbita
    const cosP = Math.cos(plano);
    const sinP = Math.sin(plano);

    for (const p of particulas) {
      p.a += p.w * dt;
      const ex = Math.cos(p.a) * p.r * R;
      const ey = Math.sin(p.a) * p.r * R * inclinacao;
      const x = cx + ex * cosP - ey * sinP;
      const y = cy + ex * sinP + ey * cosP;
      const z = Math.sin(p.a); // >0 = na frente da logo
      const brilhoP = 0.25 + 0.55 * ((z + 1) / 2) * (0.65 + 0.35 * Math.sin(agora / 380 + p.fase));
      const ctx = z > 0 ? ctxF : ctxA;
      ctx.fillStyle = `rgba(${p.cor}, ${brilhoP.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, p.tam * (0.75 + 0.45 * ((z + 1) / 2)), 0, Math.PI * 2);
      ctx.fill();
    }

    // Faíscas: saem da logo em espiral e se apagam
    for (const f of faiscas) {
      f.vida += dt;
      if (f.vida > f.dur) Object.assign(f, novaFaisca());
      f.r += f.vr * dt;
      f.a += f.w * dt;
      const vida = f.vida / f.dur;
      const alfa = Math.sin(vida * Math.PI) * 0.8;
      const x = cx + Math.cos(f.a) * f.r * R;
      const y = cy + Math.sin(f.a) * f.r * R * 0.7 - vida * R * 0.25;
      ctxF.fillStyle = `rgba(${f.cor}, ${alfa.toFixed(3)})`;
      ctxF.beginPath();
      ctxF.arc(x, y, f.tam, 0, Math.PI * 2);
      ctxF.fill();
    }
  };

  /** Chamado a cada quadro pelo loop da abertura. `p` é o progresso suavizado. */
  const atualizar = (p: number, agora: number) => {
    const dt = anterior ? Math.min(0.05, (agora - anterior) / 1000) : 0;
    anterior = agora;

    // Wordmark: FLIP da base até o cabeçalho
    const t = easeInOutCubic(clamp01(p / VOO_FIM));
    if (Math.abs(t - ultimoT) > 0.0005) {
      ultimoT = t;
      const esc = 1 + (voo.escala - 1) * t;
      wordmark.style.transform = `translate3d(${(voo.dx * t).toFixed(2)}px, ${(voo.dy * t).toFixed(2)}px, 0) scale(${esc.toFixed(4)})`;
      logoFlat.style.opacity = String(suave(0.55, 1, t));
      logoFlat.style.transform = `scale(${(0.7 + 0.3 * suave(0.55, 1, t)).toFixed(3)})`;
      // Splash "limpo": o botão do chat só aparece depois que o nome sai da base
      document.documentElement.toggleAttribute("data-cine-splash", t < 0.5);
    }

    // Meteoro: cheio no splash; a câmera "atravessa" o portal ao rolar
    const k = suave(METEORO_SAI[0], METEORO_SAI[1], p);
    if (Math.abs(k - ultimoMeteoro) > 0.001) {
      ultimoMeteoro = k;
      meteoro.style.opacity = String(1 - k);
      meteoro.style.transform = `scale(${(1 + 0.55 * k).toFixed(3)})`;
      meteoro.style.visibility = k >= 0.999 ? "hidden" : "visible";
    }
    if (!reduzir && k < 0.999) desenharParticulas(dt, agora);
  };

  return { medir, atualizar };
};
