import * as THREE from "three";

/**
 * Cena WebGL da abertura (tempo real, sem sequência de quadros).
 *
 * Vale lunar sob céu de espaço profundo; o meteoro é a logo 3D REAL da Boder
 * (textura), corpo luminoso com brilho emanando dela, partículas atraídas e
 * um feixe que desce até o foco de luz onde está o astronauta (construído em
 * código, primitivas com material próprio). No scroll o astronauta sobe e
 * vira para a tela, e a câmera acompanha.
 *
 * Arte estilizada, não fotorealista: todos os materiais são shaders próprios
 * (luz-chave fria, contorno esmeralda, neblina por profundidade e altura),
 * escritos direto no espaço de cor do site — sem pós-processamento; grão e
 * vinheta ficam no CSS por cima.
 */

export interface Cena {
  /** p = progresso suavizado (0–1); t = tempo em segundos (0 = parado). */
  render(p: number, t: number): void;
  redimensionar(w: number, h: number, dpr: number): void;
  destruir(): void;
}

interface Opcoes {
  celular: boolean;
  dpr: number;
  logoUrl: string;
}

// ── Paleta (espaço de cor do site, sem conversão) ──────────────────────────
const COR = {
  fundo: new THREE.Color("#050807"),
  neblina: new THREE.Color("#13221e"),
  horizonte: new THREE.Color("#0f1f1a"),
  menta: new THREE.Color("#5dffc2"),
  esmeralda: new THREE.Color("#16c784"),
  chave: new THREE.Color("#b9c8d6"),
};

// ── Ruído determinístico (terreno calculado uma vez, em cache) ──────────────
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const ruido = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, oitavas = 5) => {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oitavas; i++) {
    s += a * ruido(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
};
const suave = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mistura = (a: number, b: number, t: number) => a + (b - a) * t;

/** Altura do vale: fundo largo e quase plano, paredes subindo com cristas. */
const alturaVale = (x: number, z: number) => {
  const meia = 7 + Math.max(0, -z) * 0.16;
  const dx = Math.abs(x) - meia;
  const parede = dx > 0 ? Math.pow(dx, 1.22) * 0.34 : 0;
  const cristas = (fbm(x * 0.05 + 7, z * 0.05 - 3) - 0.38) * 11 * suave(0, 18, dx);
  const rocha = (fbm(x * 0.16 + 3, z * 0.16) - 0.5) * 1.6 * suave(-2, 10, dx);
  const chao = (fbm(x * 0.2, z * 0.2) - 0.5) * 0.45;
  const fundo = suave(-110, -230, z) * (fbm(x * 0.018 + 2, 1.7) * 30 + 4);
  return parede + Math.max(0, cristas) + rocha + chao + fundo;
};

// ── GLSL compartilhado ─────────────────────────────────────────────────────
const GLSL_NEBLINA = /* glsl */ `
  uniform vec3 uNeblina;
  uniform vec3 uFundo;
  vec3 aplicaNeblina(vec3 cor, vec3 mundo, vec3 cam) {
    float d = length(mundo - cam);
    float altura = exp(-max(mundo.y, 0.0) * 0.035);
    float f = 1.0 - exp(-d * 0.0125 * (0.45 + altura));
    vec3 nb = mix(uFundo * 1.6, uNeblina, clamp(0.35 + altura, 0.0, 1.0));
    return mix(cor, nb, clamp(f, 0.0, 0.94));
  }
`;

export const criarCena = async (canvas: HTMLCanvasElement, op: Opcoes): Promise<Cena> => {
  const { celular } = op;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !celular,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // shaders já escrevem na cor final
  renderer.setClearColor(COR.fundo, 1);
  renderer.setPixelRatio(op.dpr);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 900);

  const descartaveis: { dispose(): void }[] = [];
  const guarda = <T extends { dispose(): void }>(x: T) => {
    descartaveis.push(x);
    return x;
  };

  // Pontos-chave da cena
  const METEORO = new THREE.Vector3(0, 21, -74);
  const ASTRO_BASE = new THREE.Vector3(0, 0, -4);
  const CHAVE_DIR = new THREE.Vector3(-0.55, 0.62, 0.35).normalize();
  ASTRO_BASE.y = alturaVale(ASTRO_BASE.x, ASTRO_BASE.z);

  const uComuns = {
    uNeblina: { value: COR.neblina },
    uFundo: { value: COR.fundo },
    uTempo: { value: 0 },
    uMeteoro: { value: METEORO },
    uChave: { value: CHAVE_DIR },
    uFoco: { value: ASTRO_BASE.clone() },
    uMenta: { value: COR.menta },
    uEsmeralda: { value: COR.esmeralda },
  };

  // ── Céu: degradê profundo + nebulosa esmeralda + brilho do meteoro ───────
  const ceu = new THREE.Mesh(
    guarda(new THREE.SphereGeometry(600, 32, 16)),
    guarda(
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { ...uComuns, uHorizonte: { value: COR.horizonte } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          uniform vec3 uFundo; uniform vec3 uHorizonte; uniform vec3 uMenta; uniform vec3 uEsmeralda;
          uniform vec3 uMeteoro; uniform float uTempo;
          float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
            return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
          float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.02; a*=0.5; } return s; }
          void main() {
            float y = vDir.y;
            vec3 cor = mix(uHorizonte, uFundo, smoothstep(-0.02, 0.42, y));
            // nebulosa: faixas suaves e lentas
            vec2 q = vDir.xz / (abs(y) + 0.35) * 1.6;
            float neb = fbm(q * 0.9 + vec2(uTempo * 0.004, 0.0));
            neb = smoothstep(0.48, 0.92, neb) * smoothstep(0.02, 0.5, y);
            cor += mix(uEsmeralda * 0.10, uMenta * 0.05, neb) * neb;
            // brilho do meteoro no céu
            vec3 dm = normalize(uMeteoro - cameraPosition);
            float g = max(dot(normalize(vDir), dm), 0.0);
            cor += uMenta * (pow(g, 160.0) * 0.35 + pow(g, 24.0) * 0.045);
            gl_FragColor = vec4(cor, 1.0);
          }`,
      }),
    ),
  );
  cena.add(ceu);

  // ── Estrelas (cintilam, ficam atrás de tudo) ─────────────────────────────
  {
    const qtd = celular ? 650 : 1700;
    const pos = new Float32Array(qtd * 3);
    const sem = new Float32Array(qtd);
    for (let i = 0; i < qtd; i++) {
      const u = Math.random() * Math.PI * 2;
      const y = 0.05 + Math.pow(Math.random(), 0.7) * 0.95;
      const r = Math.sqrt(1 - y * y);
      pos.set([Math.cos(u) * r * 520, y * 520, Math.sin(u) * r * 520 - 60], i * 3);
      sem[i] = Math.random();
    }
    const g = guarda(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSem", new THREE.BufferAttribute(sem, 1));
    const m = guarda(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTempo: uComuns.uTempo, uPx: { value: op.dpr } },
        vertexShader: /* glsl */ `
          attribute float aSem; uniform float uTempo; uniform float uPx; varying float vA;
          void main(){
            vA = (0.35 + 0.65 * aSem) * (0.6 + 0.4 * sin(uTempo * (0.6 + aSem * 1.7) + aSem * 40.0));
            gl_PointSize = (aSem > 0.93 ? 3.0 : 1.7) * uPx;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.82, 0.95, 0.9) * vA * smoothstep(0.5, 0.0, d), 1.0); }`,
      }),
    );
    const estrelas = new THREE.Points(g, m);
    estrelas.renderOrder = -1;
    cena.add(estrelas);
  }

  // ── Vale: terreno esculpido (em cache) com luz-chave, contorno e neblina ──
  const materialTerra = guarda(
    new THREE.ShaderMaterial({
      uniforms: { ...uComuns },
      vertexShader: /* glsl */ `
        varying vec3 vMundo; varying vec3 vNormal; varying float vAltura;
        void main(){
          vec4 m = modelMatrix * vec4(position, 1.0);
          vMundo = m.xyz; vAltura = position.y;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * m;
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vMundo; varying vec3 vNormal; varying float vAltura;
        uniform vec3 uChave; uniform vec3 uMeteoro; uniform vec3 uFoco; uniform vec3 uMenta; uniform vec3 uEsmeralda;
        ${GLSL_NEBLINA}
        void main(){
          // normal facetada (rocha esculpida) misturada à suave
          vec3 nf = normalize(cross(dFdx(vMundo), dFdy(vMundo)));
          vec3 n = normalize(mix(normalize(vNormal), nf, 0.55));
          vec3 v = normalize(cameraPosition - vMundo);
          // regolito lunar: cinza frio quase-preto; topos planos mais claros
          vec3 rocha = mix(vec3(0.085, 0.094, 0.1), vec3(0.25, 0.262, 0.27), smoothstep(0.55, 0.98, n.y));
          float k = clamp((dot(n, uChave) + 0.15) / 1.15, 0.0, 1.0);
          vec3 cor = rocha * (0.2 + 1.45 * k * k) * vec3(0.84, 0.92, 1.0);
          // contorno esmeralda: só nas faces viradas para o meteoro, mais na borda
          vec3 lm = normalize(uMeteoro - vMundo);
          float face = max(dot(n, lm), 0.0);
          float borda = pow(1.0 - max(dot(n, v), 0.0), 4.0);
          float dist = length(uMeteoro - vMundo);
          float at = 1.0 / (1.0 + dist * dist * 0.00022);
          // crista: faces quase de perfil contra o céu ganham o contorno
          float crista = smoothstep(0.15, 0.65, borda) * smoothstep(0.0, 0.4, face);
          cor += uEsmeralda * (face * 0.04 + crista * 0.55) * at;
          // foco de luz no vale (onde o feixe toca o chão)
          float df = length(vMundo.xz - uFoco.xz);
          cor += uMenta * (0.42 * exp(-df * df * 0.14) + 0.05 * exp(-df * 0.2)) * smoothstep(0.3, 0.85, n.y);
          gl_FragColor = vec4(aplicaNeblina(cor, vMundo, cameraPosition), 1.0);
        }`,
    }),
  );
  {
    const larg = 260;
    const prof = 300;
    const segX = celular ? 110 : 200;
    const segZ = celular ? 130 : 240;
    const g = guarda(new THREE.PlaneGeometry(larg, prof, segX, segZ));
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -prof / 2 + 30);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, alturaVale(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    cena.add(new THREE.Mesh(g, materialTerra));
  }

  // ── Camadas de silhueta ao fundo (profundidade atmosférica) ──────────────
  {
    const camadas = [
      { z: -230, alt: 70, cor: new THREE.Color("#121f1b"), borda: 0.5, sem: 3 },
      { z: -300, alt: 95, cor: new THREE.Color("#172822"), borda: 0.35, sem: 9 },
      { z: -380, alt: 120, cor: new THREE.Color("#1c302a"), borda: 0.22, sem: 17 },
    ];
    for (const c of camadas) {
      const seg = celular ? 90 : 180;
      const g = guarda(new THREE.PlaneGeometry(900, 1, seg, 1));
      const p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const topo = p.getY(i) > 0;
        const perfil = c.alt * (0.35 + 0.65 * fbm(x * 0.012 + c.sem, c.sem, 4)) * (0.55 + 0.45 * Math.min(1, Math.abs(x) / 120));
        p.setY(i, topo ? perfil : -40);
      }
      const m = guarda(
        new THREE.ShaderMaterial({
          transparent: false,
          depthWrite: true,
          uniforms: { uCor: { value: c.cor }, uBorda: { value: c.borda }, uMenta: uComuns.uMenta },
          vertexShader: /* glsl */ `
            varying float vY; uniform float uBorda;
            void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: /* glsl */ `
            varying float vY; uniform vec3 uCor; uniform float uBorda; uniform vec3 uMenta;
            void main(){ gl_FragColor = vec4(uCor * (0.75 + 0.25 * smoothstep(-40.0, 60.0, vY)), 1.0); }`,
        }),
      );
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(0, 0, c.z);
      cena.add(mesh);
    }
  }

  // ── Meteoro: a logo 3D real como corpo luminoso ─────────────────────────
  const meteoro = new THREE.Group();
  meteoro.position.copy(METEORO);
  cena.add(meteoro);

  const brilho = (tamanho: number, cor: THREE.Color, forca: number, queda: number) => {
    const m = guarda(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uCor: { value: cor }, uForca: { value: forca }, uQueda: { value: queda } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform vec3 uCor; uniform float uForca; uniform float uQueda;
          void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(1.0 - d, 0.0), uQueda) * uForca; gl_FragColor = vec4(uCor * a, 1.0); }`,
      }),
    );
    const s = new THREE.Mesh(guarda(new THREE.PlaneGeometry(tamanho, tamanho)), m);
    return { mesh: s, mat: m };
  };
  const halo = brilho(34, COR.esmeralda, 0.2, 2.4);
  const nucleo = brilho(14, COR.menta, 0.34, 2.6);
  meteoro.add(halo.mesh, nucleo.mesh);

  const texLogo = await new THREE.TextureLoader().loadAsync(op.logoUrl);
  texLogo.colorSpace = THREE.NoColorSpace;
  texLogo.anisotropy = 4;
  guarda(texLogo);
  const img = texLogo.image as { width: number; height: number };
  const logoAlt = 11.5;
  const logo = new THREE.Mesh(
    guarda(new THREE.PlaneGeometry((logoAlt * img.width) / img.height, logoAlt)),
    guarda(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uMapa: { value: texLogo }, uPulso: { value: 1 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; uniform sampler2D uMapa; uniform float uPulso;
          void main(){ vec4 c = texture2D(uMapa, vUv); gl_FragColor = vec4(c.rgb * (1.05 + 0.25 * uPulso), c.a); }`,
      }),
    ),
  );
  meteoro.add(logo);

  // Partículas atraídas pela logo (espiral para o centro)
  const atraidas = (() => {
    const qtd = celular ? 110 : 280;
    const sem = new Float32Array(qtd * 4);
    for (let i = 0; i < qtd; i++) sem.set([Math.random() * Math.PI * 2, 7 + Math.random() * 13, 0.05 + Math.random() * 0.09, Math.random()], i * 4);
    const g = guarda(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(qtd * 3), 3));
    g.setAttribute("aSem", new THREE.BufferAttribute(sem, 4));
    const m = guarda(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTempo: uComuns.uTempo, uMenta: uComuns.uMenta, uPx: { value: op.dpr } },
        vertexShader: /* glsl */ `
          attribute vec4 aSem; uniform float uTempo; uniform float uPx; varying float vA;
          void main(){
            float f = fract(uTempo * aSem.z + aSem.w);
            float r = aSem.y * (1.0 - f * f * (3.0 - 2.0 * f) * 0.94);
            float ang = aSem.x + f * 2.6;
            vec3 p = vec3(cos(ang) * r, sin(ang) * r * 0.82, sin(ang * 1.7 + aSem.w * 6.0) * 1.5);
            vA = smoothstep(0.0, 0.18, f) * (1.0 - smoothstep(0.82, 1.0, f));
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (1.6 + 2.4 * f) * uPx * (60.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA; uniform vec3 uMenta;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(uMenta * vA * smoothstep(0.5, 0.05, d) * 0.9, 1.0); }`,
      }),
    );
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    meteoro.add(pts);
    return pts;
  })();
  void atraidas;

  // ── Feixe: do meteoro ao foco de luz no vale ─────────────────────────────
  const feixeMat = guarda(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTempo: uComuns.uTempo, uMenta: uComuns.uMenta, uForca: { value: 1 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uTempo; uniform vec3 uMenta; uniform float uForca;
        void main(){
          float lado = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
          float ao_longo = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.85, vUv.y) * (0.6 + 0.4 * vUv.y);
          float ondas = 0.82 + 0.18 * sin(vUv.y * 30.0 - uTempo * 2.2);
          gl_FragColor = vec4(uMenta * lado * ao_longo * ondas * 0.85 * uForca, 1.0);
        }`,
    }),
  );
  const feixe = new THREE.Mesh(guarda(new THREE.CylinderGeometry(0.7, 2.6, 1, 28, 1, true)), feixeMat);
  cena.add(feixe);
  const posicionarFeixe = (de: THREE.Vector3, para: THREE.Vector3) => {
    const meio = de.clone().add(para).multiplyScalar(0.5);
    const dir = para.clone().sub(de);
    feixe.position.copy(meio);
    feixe.scale.set(1, dir.length(), 1);
    feixe.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
  };
  posicionarFeixe(METEORO.clone().add(new THREE.Vector3(0, -3.5, 0)), ASTRO_BASE.clone().add(new THREE.Vector3(0, -0.2, 0)));

  // ── Astronauta (primitivas + material com contorno esmeralda) ───────────
  const fazTraje = (base: string, emissao = 0) =>
    guarda(
      new THREE.ShaderMaterial({
        uniforms: { ...uComuns, uBase: { value: new THREE.Color(base) }, uEmissao: { value: emissao }, uBrilho: uBrilhoTraje },
        vertexShader: /* glsl */ `
          varying vec3 vMundo; varying vec3 vN; varying float vY;
          void main(){ vec4 m = modelMatrix * vec4(position, 1.0); vMundo = m.xyz; vY = position.y; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * m; }`,
        fragmentShader: /* glsl */ `
          varying vec3 vMundo; varying vec3 vN; varying float vY;
          uniform vec3 uBase; uniform float uEmissao; uniform float uBrilho; uniform vec3 uChave; uniform vec3 uMeteoro; uniform vec3 uMenta; uniform vec3 uEsmeralda; uniform vec3 uFoco;
          ${GLSL_NEBLINA}
          void main(){
            vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vMundo);
            // luz-chave suave (tecido do traje), sombra azulada
            float k = clamp((dot(n, uChave) + 0.4) / 1.4, 0.0, 1.0);
            vec3 sombra = uBase * vec3(0.16, 0.2, 0.24);
            vec3 cor = mix(sombra, uBase * vec3(0.92, 0.96, 1.0), smoothstep(0.05, 0.95, k));
            // brilho especular leve (tecido revestido)
            vec3 hv = normalize(uChave + v);
            cor += vec3(0.35) * pow(max(dot(n, hv), 0.0), 28.0) * 0.5;
            // contorno esmeralda vindo do meteoro + luz do foco por baixo
            vec3 lm = normalize(uMeteoro - vMundo);
            float face = max(dot(n, lm), 0.0);
            float borda = pow(1.0 - max(dot(n, v), 0.0), 2.4);
            cor += uMenta * (borda * (0.22 + 0.85 * face) + face * 0.08) * (0.8 + uBrilho);
            float df = length(vMundo.xz - uFoco.xz);
            cor += uMenta * 0.10 * max(-n.y * 0.5 + 0.5, 0.0) * exp(-df * df * 0.2);
            cor += uMenta * uEmissao;
            gl_FragColor = vec4(aplicaNeblina(cor, vMundo, cameraPosition), 1.0);
          }`,
      }),
    );
  const uBrilhoTraje = { value: 0 };
  const matTraje = fazTraje("#dfe6e3");
  const matJunta = fazTraje("#7d8885");
  const matEscuro = fazTraje("#3a4442");
  const matLuz = fazTraje("#0f1a17", 0.85);
  const matViseira = guarda(
    new THREE.ShaderMaterial({
      uniforms: { ...uComuns },
      vertexShader: /* glsl */ `
        varying vec3 vMundo; varying vec3 vN;
        void main(){ vec4 m = modelMatrix * vec4(position, 1.0); vMundo = m.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * m; }`,
      fragmentShader: /* glsl */ `
        varying vec3 vMundo; varying vec3 vN; uniform vec3 uChave; uniform vec3 uMeteoro; uniform vec3 uMenta; uniform vec3 uEsmeralda;
        ${GLSL_NEBLINA}
        void main(){
          vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vMundo);
          float fr = pow(1.0 - max(dot(n, v), 0.0), 2.2);
          vec3 r = reflect(-v, n);
          float esp = pow(max(dot(r, uChave), 0.0), 80.0);
          float met = pow(max(dot(r, normalize(uMeteoro - vMundo)), 0.0), 24.0);
          // vidro escuro esmeralda: horizonte refletido + brilho do meteoro
          vec3 cor = vec3(0.01, 0.028, 0.024) + uEsmeralda * (0.06 + 0.5 * fr);
          cor += uEsmeralda * 0.28 * smoothstep(0.22, 0.0, abs(r.y + 0.04));
          cor += uMenta * met * 0.9 + vec3(0.95) * esp * 0.8;
          gl_FragColor = vec4(aplicaNeblina(cor, vMundo, cameraPosition), 1.0);
        }`,
    }),
  );

  const astro = new THREE.Group(); // posição/rotação controladas pelo scroll
  const corpo = new THREE.Group(); // "respiração" e balanço, no lugar
  astro.add(corpo);
  cena.add(astro);
  const parte = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, pai: THREE.Object3D = corpo) => {
    const mesh = new THREE.Mesh(guarda(g), m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    pai.add(mesh);
    return mesh;
  };
  const seg = celular ? 14 : 24;
  // Proporção estilizada (capacete um pouco grande), altura ~1,85. Frente = +z.
  parte(new THREE.CapsuleGeometry(0.31, 0.34, 8, seg), matTraje, 0, 1.06, 0); // tronco
  parte(new THREE.CylinderGeometry(0.3, 0.27, 0.16, seg), matJunta, 0, 0.78, 0); // cinto
  parte(new THREE.BoxGeometry(0.17, 0.09, 0.06), matJunta, 0.06, 1.02, 0.29, -0.1); // módulo do peito
  parte(new THREE.SphereGeometry(0.014, 8, 8), matLuz, 0.03, 1.025, 0.322);
  parte(new THREE.SphereGeometry(0.014, 8, 8), matLuz, 0.09, 1.025, 0.322);
  const mochila = parte(new THREE.CapsuleGeometry(0.21, 0.3, 6, seg), matJunta, 0, 1.12, -0.29); // mochila
  mochila.scale.set(1.15, 1, 0.62);
  parte(new THREE.BoxGeometry(0.035, 0.32, 0.02), matLuz, -0.1, 1.14, -0.43); // faixas de luz na mochila
  parte(new THREE.BoxGeometry(0.035, 0.32, 0.02), matLuz, 0.1, 1.14, -0.43);
  parte(new THREE.TorusGeometry(0.235, 0.05, 10, seg + 8), matJunta, 0, 1.49, 0, Math.PI / 2); // anel do capacete
  parte(new THREE.SphereGeometry(0.36, seg + 8, seg), matTraje, 0, 1.76, 0); // capacete
  parte(new THREE.SphereGeometry(0.335, seg + 8, seg, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.24, Math.PI * 0.46), matViseira, 0, 1.775, 0.05); // viseira
  const braco = (lado: number) => {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.37, 1.3, 0);
    ombro.rotation.z = lado * 0.28;
    corpo.add(ombro);
    parte(new THREE.SphereGeometry(0.15, seg, seg), matTraje, 0, 0, 0, 0, 0, 0, ombro);
    parte(new THREE.CapsuleGeometry(0.125, 0.2, 6, seg), matTraje, 0, -0.2, 0, 0, 0, 0, ombro);
    parte(new THREE.SphereGeometry(0.11, seg, seg), matJunta, 0, -0.37, 0.01, 0, 0, 0, ombro); // cotovelo
    parte(new THREE.CapsuleGeometry(0.115, 0.16, 6, seg), matTraje, 0, -0.52, 0.05, -0.25, 0, 0, ombro);
    parte(new THREE.SphereGeometry(0.115, seg, seg), matEscuro, 0, -0.69, 0.1, 0, 0, 0, ombro); // luva
    return ombro;
  };
  const bracoD = braco(1);
  const bracoE = braco(-1);
  const perna = (lado: number) => {
    parte(new THREE.CapsuleGeometry(0.145, 0.2, 6, seg), matTraje, lado * 0.155, 0.58, 0, 0, 0, lado * 0.03);
    parte(new THREE.SphereGeometry(0.13, seg, seg), matJunta, lado * 0.16, 0.4, 0.015); // joelho
    parte(new THREE.CapsuleGeometry(0.13, 0.16, 6, seg), matTraje, lado * 0.165, 0.25, 0);
    const bota = parte(new THREE.CapsuleGeometry(0.105, 0.14, 6, seg), matEscuro, lado * 0.16, 0.07, 0.06, Math.PI / 2);
    bota.scale.set(1, 1, 0.75);
  };
  perna(1);
  perna(-1);

  // Poeira viva (volume em volta do caminho da câmera)
  const poeira = (() => {
    const qtd = celular ? 260 : 820;
    const pos = new Float32Array(qtd * 3);
    const sem = new Float32Array(qtd);
    for (let i = 0; i < qtd; i++) {
      pos.set([(Math.random() - 0.5) * 60, Math.random() * 22, 12 - Math.random() * 90], i * 3);
      sem[i] = Math.random();
    }
    const g = guarda(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSem", new THREE.BufferAttribute(sem, 1));
    const m = guarda(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTempo: uComuns.uTempo, uPx: { value: op.dpr }, uMenta: uComuns.uMenta },
        vertexShader: /* glsl */ `
          attribute float aSem; uniform float uTempo; uniform float uPx; varying float vA;
          void main(){
            vec3 p = position;
            p.x += sin(uTempo * 0.11 + aSem * 30.0) * 1.6 + uTempo * 0.25 * (aSem - 0.3);
            p.y += sin(uTempo * 0.17 + aSem * 12.0) * 0.8;
            p.x = mod(p.x + 30.0, 60.0) - 30.0;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float d = -mv.z;
            vA = (0.25 + 0.75 * aSem) * smoothstep(0.4, 3.0, d) * (1.0 - smoothstep(30.0, 80.0, d));
            gl_PointSize = (0.8 + aSem * 2.2) * uPx * (16.0 / max(d, 1.0));
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA; uniform vec3 uMenta;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(mix(vec3(0.75, 0.85, 0.82), uMenta, 0.35) * vA * smoothstep(0.5, 0.0, d) * 0.55, 1.0); }`,
      }),
    );
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    cena.add(pts);
    return pts;
  })();
  void poeira;

  // ── Coreografia ──────────────────────────────────────────────────────────
  const camPos = new THREE.Vector3();
  const camAlvo = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const BALANCO = THREE.MathUtils.degToRad(28); // ±28°, nunca gira inteiro nem espelha
  const eio = (a: number, b: number, p: number) => {
    const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const render = (p: number, t: number) => {
    uComuns.uTempo.value = t;

    // Astronauta: no repouso, de costas olhando o meteoro, "respirando" no
    // lugar. No scroll: sobe (puxado pelo feixe) e vira para a tela.
    const sobe = eio(0.05, 0.8, p);
    const vira = eio(0.16, 0.72, p);
    astro.position.set(ASTRO_BASE.x, ASTRO_BASE.y + sobe * 6.2, ASTRO_BASE.z + eio(0.25, 1, p) * 2.2);
    astro.rotation.set(-0.08 * sobe, Math.PI + vira * Math.PI, 0.05 * Math.sin(vira * Math.PI));
    const resp = Math.sin(t * 1.7);
    corpo.position.y = resp * 0.02 + sobe * Math.sin(t * 0.85) * 0.1;
    corpo.rotation.z = Math.sin(t * 0.55) * 0.02 * (1 + sobe * 2);
    corpo.scale.set(1 + resp * 0.006, 1 - resp * 0.004, 1 + resp * 0.006);
    // braços abrem um pouco ao flutuar
    bracoD.rotation.z = 0.28 + sobe * 0.5 + Math.sin(t * 0.9) * 0.04 * sobe;
    bracoE.rotation.z = -0.28 - sobe * 0.5 - Math.sin(t * 0.9 + 1) * 0.04 * sobe;
    uBrilhoTraje.value = 0.12 + 0.08 * Math.sin(t * 1.2);
    uComuns.uFoco.value.set(astro.position.x, ASTRO_BASE.y, astro.position.z);

    // Câmera: parada no repouso; com o scroll avança, sobe e enquadra o
    // astronauta em plano médio, com o meteoro atrás e acima.
    const aprox = eio(0.03, 1, p);
    camPos.set(
      mistura(0, 0.35, aprox),
      mistura(2.1, astro.position.y + 0.55, aprox),
      mistura(15, astro.position.z + 6.2, aprox),
    );
    camAlvo.set(0, mistura(6.2, astro.position.y + 2.4, eio(0.05, 0.95, p)), mistura(-60, astro.position.z - 6, eio(0.05, 0.95, p)));
    camera.position.copy(camPos);
    camera.lookAt(camAlvo);

    // Meteoro: pulso de luz e balanço ±28°
    logo.position.y = Math.sin(t * 0.8) * 0.35;
    const pulso = 0.5 + 0.5 * Math.sin(t * 1.3);
    (logo.material as THREE.ShaderMaterial).uniforms.uPulso.value = pulso;
    halo.mat.uniforms.uForca.value = 0.17 + 0.06 * pulso;
    nucleo.mat.uniforms.uForca.value = 0.3 + 0.1 * pulso;
    halo.mesh.lookAt(camera.position);
    nucleo.mesh.lookAt(camera.position);
    // de frente para a câmera e, depois, o balanço no próprio plano
    logo.lookAt(tmp.copy(camera.position));
    logo.rotateZ(Math.sin(t * 0.42) * BALANCO * 0.6 + Math.sin(t * 0.23 + 1.3) * BALANCO * 0.4);
    // o feixe segue o astronauta; enfraquece quando ele sobe
    posicionarFeixe(tmp.copy(METEORO).add(new THREE.Vector3(0, -4.2, 0)), new THREE.Vector3(astro.position.x, ASTRO_BASE.y - 0.2, astro.position.z));
    feixeMat.uniforms.uForca.value = 1 - 0.5 * sobe;

    renderer.render(cena, camera);
  };

  const redimensionar = (w: number, h: number, dpr: number) => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // retrato: abre o campo de visão para o vale caber
    camera.fov = w / h < 0.8 ? 58 : w / h < 1.2 ? 50 : 42;
    camera.updateProjectionMatrix();
  };

  return {
    render,
    redimensionar,
    destruir() {
      for (const d of descartaveis) d.dispose();
      renderer.dispose();
    },
  };
};
