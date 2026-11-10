/**
 * Cena WebGL da abertura (protótipo "GL", estilo Lusion).
 *
 * Este módulo é carregado com import() pelo GlOpening — o three.js vai junto,
 * num chunk separado, e só é baixado quando a abertura GL é usada (?gl=1).
 *
 * Elementos: céu #050807 com névoa esverdeada; estrelas e poeira em Points
 * derivando; vale lunar procedural fosco; portal esmeralda (anel + glow
 * aditivo pulsando); meteoro-fonte (logo 3D em plano no centro do anel, glow
 * atrás, feixe cônico até o chão, ~300 partículas sugadas em espiral);
 * astronauta em plano de frente para a câmera, no foco do feixe.
 *
 * Repouso: câmera parada; só o "tempo" anima (astronauta flutuando, glow,
 * partículas, poeira). Scroll: `p` (0–1) move câmera e astronauta — função
 * pura de p, sem loop de câmera; rolar para cima reverte.
 */
import * as THREE from "three";

export interface CenaOpcoes {
  celular: boolean;
  dpr: number;
  urls: { logo: string; astro: string };
}

const COR = {
  ceu: 0x050807,
  nevoa: 0x0d231c, // mesma cor no horizonte do céu: montanhas somem na névoa
  esmeralda: 0x17c9ad,
  menta: 0x7ff5dc,
};

// Geografia da cena (unidades do mundo)
const PORTAL = new THREE.Vector3(0, 16, -72);
const RAIO_PORTAL = 9;
const CHAO_ASTRO = new THREE.Vector3(0, 0, -34);
const CAMERA_INICIO = new THREE.Vector3(0, 2.6, 10);
const CAMERA_FIM = new THREE.Vector3(0, 10.5, -38);
const ALVO_INICIO = new THREE.Vector3(0, 8.5, -72);
const ALVO_FIM = new THREE.Vector3(0, 13, -72);

const suave = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const GRAU = Math.PI / 180;

/** Textura radial (glow) gerada em canvas — sem arquivo extra. */
const texturaGlow = (cores: [number, string][]) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  cores.forEach(([o, cor]) => grad.addColorStop(o, cor));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Relevo do vale: encostas subindo para os lados e ao fundo + ruído suave. */
const altura = (x: number, z: number) => {
  const ax = Math.abs(x);
  const encosta = Math.pow(Math.max(0, ax - 7) / 48, 1.7) * 26;
  const fundo = Math.pow(Math.max(0, -z - 80) / 70, 1.5) * 30;
  const ruido =
    Math.sin(x * 0.13 + z * 0.05) * 1.4 +
    Math.sin(x * 0.31 - z * 0.22) * 0.7 +
    Math.sin(z * 0.41 + x * 0.07) * 0.45 +
    Math.sin(x * 0.9 + z * 0.73) * 0.18;
  const trilha = 0.35 + 0.65 * Math.min(1, ax / 14); // fundo do vale mais plano
  return encosta + fundo + ruido * trilha;
};

export const criarCena = async (canvas: HTMLCanvasElement, opcoes: CenaOpcoes) => {
  const { celular } = opcoes;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !celular,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(opcoes.dpr);
  renderer.setClearColor(COR.ceu, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  cena.fog = new THREE.FogExp2(COR.nevoa, 0.011);

  // Céu: cúpula com degradê #050807 no alto → névoa esverdeada no horizonte
  const ceu = new THREE.Mesh(
    new THREE.SphereGeometry(330, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTopo: { value: new THREE.Color(COR.ceu) },
        uHorizonte: { value: new THREE.Color(COR.nevoa) },
      },
      vertexShader: /* glsl */ `
        varying float vY;
        void main() { vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTopo; uniform vec3 uHorizonte; varying float vY;
        void main() { gl_FragColor = vec4(mix(uHorizonte, uTopo, smoothstep(-0.02, 0.38, vY)), 1.0); }`,
    }),
  );
  ceu.renderOrder = -1;
  const camera = new THREE.PerspectiveCamera(celular ? 62 : 48, 1, 0.1, 500);

  // ── Luz: lua fria + verde vindo do portal ─────────────────────────────
  cena.add(ceu);
  cena.add(new THREE.HemisphereLight(0x3a4a46, 0x050807, 0.5));
  const luzPortal = new THREE.DirectionalLight(COR.esmeralda, 0.9);
  luzPortal.position.copy(PORTAL).add(new THREE.Vector3(0, 6, 0));
  cena.add(luzPortal);
  const lua = new THREE.DirectionalLight(0x9fb3c8, 0.5);
  lua.position.set(-40, 50, 20);
  cena.add(lua);

  // ── Vale lunar procedural ─────────────────────────────────────────────
  const seg = celular ? 90 : 160;
  const terreno = new THREE.PlaneGeometry(260, 260, seg, seg);
  terreno.rotateX(-Math.PI / 2);
  terreno.translate(0, 0, -70);
  const pos = terreno.attributes.position as THREE.BufferAttribute;
  const cores: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = altura(x, z);
    pos.setY(i, h);
    // cinza lunar fosco, levemente mais claro nas encostas
    const v = 0.1 + Math.min(0.08, h * 0.003) + (Math.sin(x * 2.1 + z * 1.7) * 0.5 + 0.5) * 0.025;
    cores.push(v, v * 1.02, v * 1.01);
  }
  terreno.setAttribute("color", new THREE.Float32BufferAttribute(cores, 3));
  terreno.computeVertexNormals();
  const vale = new THREE.Mesh(
    terreno,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }),
  );
  cena.add(vale);

  // ── Estrelas (cúpula distante) ────────────────────────────────────────
  const nEstrelas = celular ? 700 : 1400;
  const ePos = new Float32Array(nEstrelas * 3);
  for (let i = 0; i < nEstrelas; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.random() * Math.PI * 0.45;
    const r = 200;
    ePos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
    ePos[i * 3 + 1] = Math.cos(ph) * r * 0.8 + 10;
    ePos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r - 60;
  }
  const estrelasGeo = new THREE.BufferGeometry();
  estrelasGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  const estrelas = new THREE.Points(
    estrelasGeo,
    new THREE.PointsMaterial({ size: celular ? 0.9 : 0.7, color: 0xdff7ef, transparent: true, opacity: 0.8, fog: false, depthWrite: false }),
  );
  cena.add(estrelas);

  // ── Poeira flutuando (GPU: deriva no vertex shader) ───────────────────
  const nPoeira = celular ? 260 : 520;
  const pPos = new Float32Array(nPoeira * 3);
  const pSeed = new Float32Array(nPoeira);
  for (let i = 0; i < nPoeira; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 60;
    pPos[i * 3 + 1] = Math.random() * 16;
    pPos[i * 3 + 2] = -Math.random() * 75 + 8;
    pSeed[i] = Math.random();
  }
  const poeiraGeo = new THREE.BufferGeometry();
  poeiraGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  poeiraGeo.setAttribute("aSeed", new THREE.BufferAttribute(pSeed, 1));
  const uTempo = { value: 0 };
  const poeira = new THREE.Points(
    poeiraGeo,
    new THREE.ShaderMaterial({
      uniforms: { uTempo, uDpr: { value: opcoes.dpr } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTempo; uniform float uDpr; varying float vA;
        void main() {
          vec3 p = position;
          p.x += sin(uTempo * 0.12 + aSeed * 6.28) * 0.9;
          p.y += sin(uTempo * 0.17 + aSeed * 12.0) * 0.6 + mod(uTempo * 0.25 + aSeed * 16.0, 16.0) * 0.15;
          p.z += cos(uTempo * 0.09 + aSeed * 9.0) * 0.7;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.6 + aSeed * 2.2) * uDpr * (28.0 / -mv.z);
          vA = 0.18 + 0.32 * aSeed;
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(0.72, 0.86, 0.8, vA * smoothstep(0.5, 0.0, d));
        }`,
    }),
  );
  cena.add(poeira);

  // ── Portal: anel + glow aditivo pulsando ──────────────────────────────
  const portal = new THREE.Group();
  portal.position.copy(PORTAL);
  cena.add(portal);
  const anel = new THREE.Mesh(
    new THREE.TorusGeometry(RAIO_PORTAL, 0.32, 16, 200),
    new THREE.MeshBasicMaterial({ color: COR.menta, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  portal.add(anel);
  const anelHalo = new THREE.Mesh(
    new THREE.TorusGeometry(RAIO_PORTAL, 1.9, 16, 160),
    new THREE.MeshBasicMaterial({ color: COR.esmeralda, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  portal.add(anelHalo);
  const texGlow = texturaGlow([
    [0, "rgba(200,255,240,0.95)"],
    [0.18, "rgba(23,201,173,0.6)"],
    [0.45, "rgba(16,185,129,0.18)"],
    [1, "rgba(16,185,129,0)"],
  ]);
  const glowPortal = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texGlow, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  glowPortal.scale.setScalar(RAIO_PORTAL * 5.2);
  glowPortal.position.z = -1;
  portal.add(glowPortal);

  // Redemoinho de partículas no anel (gira devagar)
  const nRede = celular ? 260 : 480;
  const rPos = new Float32Array(nRede * 3);
  for (let i = 0; i < nRede; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = RAIO_PORTAL * (0.82 + Math.random() * 0.5);
    rPos[i * 3] = Math.cos(a) * r;
    rPos[i * 3 + 1] = Math.sin(a) * r;
    rPos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
  }
  const redeGeo = new THREE.BufferGeometry();
  redeGeo.setAttribute("position", new THREE.BufferAttribute(rPos, 3));
  const redemoinho = new THREE.Points(
    redeGeo,
    new THREE.PointsMaterial({ size: 0.35, color: 0xc8fff0, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  portal.add(redemoinho);

  // ── Meteoro-fonte: logo 3D + glow atrás + feixe + partículas sugadas ──
  const carregador = new THREE.TextureLoader();
  const carregar = (url: string) =>
    new Promise<THREE.Texture>((ok, falha) =>
      carregador.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          ok(t);
        },
        undefined,
        falha,
      ),
    );
  const [texLogo, texAstro] = await Promise.all([carregar(opcoes.urls.logo), carregar(opcoes.urls.astro)]);

  const glowLogo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texGlow, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  glowLogo.scale.setScalar(RAIO_PORTAL * 3.2);
  glowLogo.position.z = -0.5;
  portal.add(glowLogo);

  const logoAlt = RAIO_PORTAL * 1.45;
  const imgLogo = texLogo.image as { width: number; height: number };
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry((logoAlt * imgLogo.width) / imgLogo.height, logoAlt),
    new THREE.MeshBasicMaterial({ map: texLogo, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }),
  );
  logo.position.z = 0.6;
  portal.add(logo);

  // Feixe cônico translúcido: do centro da logo até o chão (no astronauta)
  const topoFeixe = PORTAL.clone();
  const baseFeixe = CHAO_ASTRO.clone();
  const dirFeixe = new THREE.Vector3().subVectors(topoFeixe, baseFeixe);
  const compFeixe = dirFeixe.length();
  const feixe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 3.4, compFeixe, 48, 1, true),
    new THREE.ShaderMaterial({
      uniforms: { uTempo },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main() {
          vUv = uv;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTempo; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main() {
          float borda = pow(abs(dot(vN, vV)), 1.6);       // mais denso no miolo
          float altura = smoothstep(0.0, 0.35, vUv.y);    // some perto do chão
          float pulso = 0.82 + 0.18 * sin(uTempo * 1.8);
          float a = borda * altura * 0.8 * pulso;
          gl_FragColor = vec4(mix(vec3(0.09, 0.79, 0.68), vec3(0.85, 1.0, 0.96), vUv.y * vUv.y), a);
        }`,
    }),
  );
  feixe.position.copy(baseFeixe).addScaledVector(dirFeixe, 0.5);
  feixe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirFeixe.clone().normalize());
  cena.add(feixe);

  // ~300 partículas sugadas em espiral para a logo (loop na GPU)
  const nSug = 300;
  const sAng = new Float32Array(nSug);
  const sRad = new Float32Array(nSug);
  const sVel = new Float32Array(nSug);
  const sFase = new Float32Array(nSug);
  for (let i = 0; i < nSug; i++) {
    sAng[i] = Math.random() * Math.PI * 2;
    sRad[i] = RAIO_PORTAL * (1.0 + Math.random() * 1.8);
    sVel[i] = 0.12 + Math.random() * 0.22;
    sFase[i] = Math.random();
  }
  const sugGeo = new THREE.BufferGeometry();
  sugGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nSug * 3), 3));
  sugGeo.setAttribute("aAng", new THREE.BufferAttribute(sAng, 1));
  sugGeo.setAttribute("aRad", new THREE.BufferAttribute(sRad, 1));
  sugGeo.setAttribute("aVel", new THREE.BufferAttribute(sVel, 1));
  sugGeo.setAttribute("aFase", new THREE.BufferAttribute(sFase, 1));
  const sugadas = new THREE.Points(
    sugGeo,
    new THREE.ShaderMaterial({
      uniforms: { uTempo, uDpr: { value: opcoes.dpr } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aAng; attribute float aRad; attribute float aVel; attribute float aFase;
        uniform float uTempo; uniform float uDpr; varying float vA;
        void main() {
          float t = fract(uTempo * aVel + aFase);
          float r = aRad * pow(1.0 - t, 1.5);
          float ang = aAng + t * 5.5;
          vec3 p = vec3(cos(ang) * r, sin(ang) * r * 0.8, sin(ang * 0.7) * r * 0.25);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = mix(3.2, 0.8, t) * uDpr * (60.0 / -mv.z);
          vA = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.82, 1.0, t));
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(0.78, 1.0, 0.94, vA * smoothstep(0.5, 0.0, d));
        }`,
    }),
  );
  sugadas.position.z = 0.8;
  portal.add(sugadas);

  // ── Astronauta: plano de frente para a câmera, no foco do feixe ───────
  const astroAlt = 2.6;
  const imgAstro = texAstro.image as { width: number; height: number };
  const astro = new THREE.Mesh(
    new THREE.PlaneGeometry((astroAlt * imgAstro.width) / imgAstro.height, astroAlt),
    new THREE.MeshBasicMaterial({ map: texAstro, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, color: 0xd8efe8 }),
  );
  cena.add(astro);
  const astroBase = new THREE.Vector3(CHAO_ASTRO.x, astroAlt / 2 + 0.25, CHAO_ASTRO.z);

  // ── Atualização por quadro ────────────────────────────────────────────
  const tmpPos = new THREE.Vector3();
  const tmpAlvo = new THREE.Vector3();
  const frenteCam = new THREE.Vector3();

  /** `p` = progresso suavizado (0–1); `t` = tempo em segundos (vida no lugar). */
  const render = (p: number, t: number) => {
    uTempo.value = t;

    // Câmera: função pura de p (sem loop). Frente e para cima rumo ao portal.
    const e = easeInOut(p);
    camera.position.lerpVectors(CAMERA_INICIO, CAMERA_FIM, e);
    tmpAlvo.lerpVectors(ALVO_INICIO, ALVO_FIM, e);
    camera.lookAt(tmpAlvo);

    // Vida no lugar: glow pulsando, anel e redemoinho girando, logo balançando
    const pulso = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 3.4);
    glowPortal.material.opacity = 0.7 + 0.25 * pulso;
    glowPortal.scale.setScalar(RAIO_PORTAL * (5.0 + 0.4 * pulso));
    glowLogo.material.opacity = 0.75 + 0.25 * pulso;
    glowLogo.scale.setScalar(RAIO_PORTAL * (3.0 + 0.35 * pulso));
    anelHalo.material.opacity = 0.12 + 0.08 * pulso;
    redemoinho.rotation.z = -t * 0.08;
    logo.rotation.y = Math.sin((t * Math.PI * 2) / 12) * 14 * GRAU; // ±14°, nunca 360
    logo.rotation.z = Math.sin((t * Math.PI * 2) / 9) * 2 * GRAU;
    estrelas.rotation.y = t * 0.004;

    // Astronauta: flutua no lugar (seno ~3,6 s, inclinação ±3°, giro y ±6°);
    // com o scroll sobe, gira até ~160° e cresce rumo à tela no fim.
    const sobe = suave(0.05, 0.7, p);
    const vem = suave(0.62, 1, p);
    tmpPos.copy(astroBase);
    tmpPos.y += sobe * 8.5 + Math.sin((t * Math.PI * 2) / 3.6) * 0.12;
    frenteCam.subVectors(tmpAlvo, camera.position).normalize();
    const pertoDaTela = camera.position.clone().addScaledVector(frenteCam, 5.5).add(new THREE.Vector3(0, -0.6, 0));
    tmpPos.lerp(pertoDaTela, vem * vem);
    astro.position.copy(tmpPos);
    astro.scale.setScalar(1 + vem * 0.35);
    // de frente para a câmera + balanço/giro
    const yaw = Math.atan2(camera.position.x - astro.position.x, camera.position.z - astro.position.z);
    astro.rotation.set(
      0,
      yaw + Math.sin((t * Math.PI * 2) / 5.2) * 6 * GRAU + easeInOut(suave(0.1, 0.95, p)) * 160 * GRAU,
      Math.sin((t * Math.PI * 2) / 4.4) * 3 * GRAU,
    );

    renderer.render(cena, camera);
  };

  const redimensionar = (w: number, h: number, dpr: number) => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const destruir = () => {
    cena.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    [texGlow, texLogo, texAstro].forEach((x) => x.dispose());
    renderer.dispose();
  };

  return { render, redimensionar, destruir };
};

export type Cena = Awaited<ReturnType<typeof criarCena>>;
