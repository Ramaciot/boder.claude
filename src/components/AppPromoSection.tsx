import { ArrowRight, BarChart3, CheckCircle2, Globe, Palette, Smartphone, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { contact } from "@/content/site";

const features = [
  {
    icon: BarChart3,
    title: "Relatórios em Tempo Real",
    description: "Acompanhe suas campanhas de tráfego pago com métricas atualizadas",
  },
  {
    icon: Globe,
    title: "Portfólio de Sites",
    description: "Explore nosso catálogo de sites e landing pages desenvolvidas",
  },
  {
    icon: Palette,
    title: "Temas de Posts",
    description: "Acesse ideias e inspirações para suas publicações nas redes sociais",
  },
  {
    icon: Sparkles,
    title: "Templates de IA",
    description: "Utilize prompts e templates personalizados para cada nicho de mercado",
  },
];

const benefits = [
  "Acesso exclusivo para clientes",
  "Interface intuitiva e moderna",
  "Dados sincronizados em tempo real",
  "Suporte integrado",
];

export const AppPromoSection = () => (
  <section className="py-20 sm:py-28 relative overflow-hidden">
    <div className="container">
      <Reveal className="text-center mb-14 sm:mb-16 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Smartphone className="w-4 h-4" />
          Exclusivo para Clientes
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">Boder Space App</h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          Nossos clientes têm acesso a um aplicativo exclusivo para acompanhar campanhas,
          explorar portfólios e utilizar ferramentas de IA personalizadas.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
        {/* Grade de recursos */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08} className="h-full">
              <div className="group relative h-full bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:animate-shine" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Cartão CTA */}
        <Reveal delay={0.2}>
          <div className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Acesso Exclusivo</h3>
                <p className="text-sm text-muted-foreground">Para clientes Boder Space</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Tenha controle total sobre seus projetos digitais. O Boder Space App oferece uma
              experiência completa para gerenciar e acompanhar todos os serviços contratados.
            </p>

            <div className="space-y-2 mb-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="group/benefit flex items-center gap-3 p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-primary/5 hover:translate-x-1"
                >
                  <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center group-hover/benefit:bg-primary/20 transition-colors duration-300">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-sm font-medium group-hover/benefit:text-primary transition-colors duration-300">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={contact.appUrl}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-primary text-primary-foreground py-3.5 font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-300 group"
            >
              Saiba Mais Sobre o App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Disponível para clientes com serviços ativos
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);
