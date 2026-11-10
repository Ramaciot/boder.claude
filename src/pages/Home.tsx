import { lazy, Suspense, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PortfolioSection } from "@/components/PortfolioSection";
import { AppSection } from "@/components/AppSection";
import { Testimonials } from "@/components/Testimonials";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { ChatBotLazy } from "@/components/ChatBotLazy";
import { BrandBackground } from "@/components/BrandBackground";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { GlOpening } from "@/components/gl/GlOpening";

// Abertura de frames: só com ?gl=0 (comparação); fora do carregamento padrão
const CineOpening = lazy(() =>
  import("@/components/cine/CineOpening").then((m) => ({ default: m.CineOpening })),
);

interface HomeProps {
  /** Id de seção para rolar ao montar (ex.: rota /servicos). */
  scrollTo?: string;
  /** "gl" (padrão) = cena WebGL; "cine" = abertura de frames (?gl=0). */
  abertura?: "cine" | "gl";
}

/**
 * Página inicial — abertura cinematográfica no topo e, abaixo dela, a mesma
 * ordem de seções do site oficial:
 * Hero → Serviços → Sites que Vendem → App → Depoimentos → CTA (FAQ fica no rodapé).
 */
const Home = ({ scrollTo, abertura = "gl" }: HomeProps) => {
  useScrollReveal();

  useEffect(() => {
    document.title = "Boder Space - Agência de Marketing Digital | Impulsione seu Negócio";
  }, []);

  useEffect(() => {
    if (!scrollTo) return;
    const timer = window.setTimeout(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [scrollTo]);

  return (
    <>
      <BrandBackground />
      <div className="relative z-10 min-h-screen">
        <div className="site-header-slot">
          <Header />
        </div>
        <main>
          {abertura === "gl" ? (
            <GlOpening />
          ) : (
            <Suspense fallback={<div className="cine-abertura" style={{ height: "460vh" }} />}>
              <CineOpening />
            </Suspense>
          )}
          <Hero />
          <Services />
          <PortfolioSection />
          <AppSection />
          <Testimonials />
          <FinalCTA />
        </main>
        <Footer />
      </div>
      <ChatBotLazy />
    </>
  );
};

export default Home;
