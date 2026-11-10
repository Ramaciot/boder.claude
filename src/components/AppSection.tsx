import type { CSSProperties } from "react";
import { BarChart3, Globe, MessageSquare, Smartphone, Sparkles, type LucideIcon } from "lucide-react";
import { contact } from "@/content/site";

interface AppCard {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  details: string;
}

const cards: AppCard[] = [
  {
    title: "Relatórios",
    subtitle: "Tempo Real",
    icon: BarChart3,
    details: "Acompanhe métricas de ROAS, CTR e investimento em tempo real direto pelo celular.",
  },
  {
    title: "Portfólio",
    subtitle: "Sites & LPs",
    icon: Globe,
    details: "Visualize todos os seus projetos web em um só lugar com acesso rápido.",
  },
  {
    title: "Boder AI",
    subtitle: "Inteligência",
    icon: Sparkles,
    details: "Tire dúvidas sobre suas campanhas e peça sugestões de criativos para nossa IA.",
  },
  {
    title: "Solicite Post",
    subtitle: "Social Media",
    icon: MessageSquare,
    details: "Abra solicitações de artes para redes sociais de forma rápida e prática.",
  },
];

const features: { icon: LucideIcon; text: string }[] = [
  { icon: Smartphone, text: "App exclusivo para clientes" },
  { icon: BarChart3, text: "Relatórios em tempo real" },
  { icon: MessageSquare, text: "Solicite postagem para sua rede social" },
  { icon: Sparkles, text: "Boder AI: Dúvidas, dicas de post e legendas" },
];

/** "Boder Space App" — seção exclusiva para clientes, idêntica ao site oficial. */
export const AppSection = () => (
  <section className="relative w-full flex flex-col justify-center items-center overflow-hidden bg-transparent py-20">
    <div className="mb-8 md:mb-12 z-10 text-center px-4">
      <span data-reveal className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-2">
        Exclusivo para Clientes
      </span>
      <h2
        data-reveal="title"
        className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-4 md:mb-6"
      >
        Boder Space <span className="text-primary">App</span>
      </h2>
      <p
        data-reveal
        style={{ "--reveal-delay": "160ms" } as CSSProperties}
        className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
      >
        Nossos clientes têm acesso a um aplicativo exclusivo para acompanhar campanhas, explorar portfólios,
        solicitar posts para o Social Media e utilizar ferramentas de IA personalizadas.
      </p>
    </div>

    <div className="relative w-full max-w-[1100px] px-4 md:px-0 grid grid-cols-2 md:flex md:flex-nowrap justify-center gap-3 md:gap-0">
      {cards.map(({ title, subtitle, icon: Icon, details }, index) => (
        <div
          key={title}
          data-reveal="card"
          data-parallax="desktop"
          style={
            {
              background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
              "--reveal-delay": `${index * 110}ms`,
              "--parallax": index % 2 ? "34px" : "14px",
            } as CSSProperties
          }
          className="relative w-full md:flex-1 aspect-[0.85/1] md:aspect-[4/6] transition-all duration-300 rounded-[20px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center items-center text-center"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-foreground">{title}</h3>
          <p className="text-primary/80 font-semibold text-[10px] md:text-sm mb-3 md:mb-4 tracking-wider uppercase">
            {subtitle}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{details}</p>
        </div>
      ))}
    </div>

    <div className="mt-12 md:mt-16 w-full max-w-4xl mx-auto px-4 z-10">
      <div data-reveal className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="group relative flex flex-col sm:flex-row items-center sm:items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground font-medium text-xs text-center sm:text-left">{text}</span>
            </div>
          ))}
        </div>
        <a href={contact.appUrl} className="flex justify-center">
          <span className="wave-shimmer-premium-btn">Saiba sobre o App</span>
        </a>
        <p className="text-xs text-muted-foreground text-center mt-4">Disponível para clientes com serviços ativos</p>
      </div>
    </div>
  </section>
);
