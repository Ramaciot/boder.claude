import { lazy, Suspense, useEffect, useState } from "react";

// three.js só é baixado depois que a página montou (chunk separado),
// preservando o carregamento inicial leve do site.
const LiquidEther = lazy(() => import("./LiquidEther.jsx"));

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Fluido WebGL fixo atrás de todo o conteúdo — mesmos parâmetros do site
 * oficial. Como no original, só aparece a partir de tablets/desktop; aqui o
 * three.js nem é baixado no celular.
 */
export const LiquidEtherBackground = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none hidden md:block"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden", contain: "strict" }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <LiquidEther
          colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]}
          mouseForce={12}
          cursorSize={120}
          resolution={0.5}
          autoDemo={true}
          autoSpeed={0.25}
          autoIntensity={1.2}
        />
      </Suspense>
    </div>
  );
};
