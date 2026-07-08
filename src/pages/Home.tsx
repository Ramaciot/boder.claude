import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Bonuses } from "@/components/Bonuses";
import { Services } from "@/components/Services";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { Team } from "@/components/Team";
import { Authority } from "@/components/Authority";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

interface HomeProps {
  /** Id de seção para rolar ao montar (ex.: rota /servicos). */
  scrollTo?: string;
}

const Home = ({ scrollTo }: HomeProps) => {
  useEffect(() => {
    document.title =
      "Boder Space - Agência de Marketing Digital | Impulsione seu Negócio";
  }, []);

  useEffect(() => {
    if (!scrollTo) return;
    const timer = window.setTimeout(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [scrollTo]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Bonuses />
        <Services />
        <Stats />
        <Testimonials />
        <Team />
        <Authority />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;
