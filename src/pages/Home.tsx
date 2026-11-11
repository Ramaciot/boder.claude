import { useEffect } from "react";
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
// Abertura em tempo real (WebGL). A abertura de quadros (CineOpening) não é
// importada aqui: nenhum quadro do filme antigo é baixado.
import { GlOpening } from "@/components/gl/GlOpening";

interface HomeProps {
  /** Id de seção para rolar ao montar (ex.: rota /servicos). */
  scrollTo?: string;
}

/**
 * Página inicial — abertura cinematográfica no topo e, abaixo dela, a mesma
 * ordem de seções do site oficial:
 * Hero → Serviços → Sites que Vendem → App → Depoimentos → CTA (FAQ fica no rodapé).
 */
const Home = ({ scrollTo }: HomeProps) => {
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
          <GlOpening />
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
