import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PortfolioSection } from "@/components/PortfolioSection";
import { AppSection } from "@/components/AppSection";
import { Testimonials } from "@/components/Testimonials";
import { Team } from "@/components/Team";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { BrandBackground } from "@/components/BrandBackground";
import { CineOpening } from "@/components/cine/CineOpening";

interface HomeProps {
  /** Id de seção para rolar ao montar (ex.: rota /servicos). */
  scrollTo?: string;
}

/**
 * Página inicial — abertura cinematográfica no topo e, abaixo dela, a mesma
 * ordem de seções do site oficial:
 * Hero → Serviços → Sites que Vendem → App → Depoimentos → Equipe → FAQ → CTA.
 */
const Home = ({ scrollTo }: HomeProps) => {
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
          <CineOpening />
          <Hero />
          <Services />
          <PortfolioSection />
          <AppSection />
          <Testimonials />
          <Team />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
      <ChatBot />
    </>
  );
};

export default Home;
