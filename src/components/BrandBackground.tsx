/**
 * Fundo da marca — só CSS (sem WebGL, sem canvas, sem loop em JS).
 * Três manchas suaves nas cores da Boder (#10b981, #17c9ad, #8b5cf6) feitas
 * com radial-gradient (já nascem esfumaçadas, sem filter: blur) e que derivam
 * devagar animando apenas `transform`, que roda no compositor da GPU.
 */
export const BrandBackground = () => (
  <div className="brand-bg fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
    <div className="brand-bg__blob brand-bg__blob--teal" />
    <div className="brand-bg__blob brand-bg__blob--emerald" />
    <div className="brand-bg__blob brand-bg__blob--violet" />
  </div>
);
