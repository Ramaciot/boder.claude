import { lazy, Suspense } from "react";

// three.js só é baixado depois que a página montou (chunk separado),
// preservando o carregamento inicial leve do site.
const LiquidEther = lazy(() => import("./LiquidEther.jsx"));

/** Fluido WebGL fixo atrás de todo o conteúdo do site. */
export const LiquidEtherBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
    <Suspense fallback={null}>
      <LiquidEther
        colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
    </Suspense>
  </div>
);
