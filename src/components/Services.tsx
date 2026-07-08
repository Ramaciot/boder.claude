import { Link } from "react-router-dom";
import { ArrowRight, Bot, Check, Globe, Rocket, Share2, Star, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { services } from "@/content/site";

const serviceIcons: Record<string, typeof Globe> = {
  "sites-landing-pages": Globe,
  "social-media": Share2,
  "ia-atendimento": Bot,
  "gestao-trafego": TrendingUp,
  "estrategia-digital": Rocket,
};

const badgeLabels = {
  popular: "Mais Popular",
  recommended: "Recomendado",
} as const;

export const Services = () => (
  <section id="servicos" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

    <div className="container relative z-10">
      <SectionHeading
        badge="Nossos Serviços"
        title="Soluções para"
        highlight="escalar seu negócio"
        subtitle="Cada serviço é pensado para entregar resultados mensuráveis"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => {
          const Icon = serviceIcons[service.slug] ?? Globe;
          const isHighlighted = service.badge !== null;

          return (
            <Reveal key={service.slug} delay={index * 0.08} className="h-full">
              <div
                className={`relative h-full flex flex-col p-6 lg:p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 group ${
                  isHighlighted
                    ? "bg-gradient-to-br from-primary/8 via-primary/4 to-card border-primary/25 shadow-xl shadow-primary/10"
                    : "bg-card/70 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                } hover:-translate-y-1`}
              >
                {service.badge && (
                  <span className="absolute -top-3 left-5 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {badgeLabels[service.badge]}
                  </span>
                )}

                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-400">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>

                <h3 className="text-lg lg:text-xl mb-2.5 leading-tight">{service.title}</h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-5 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm lg:text-base">
                      <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </span>
                      <span className="text-foreground/75">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/servicos/${service.slug}`}
                  className={`mt-auto inline-flex items-center justify-center gap-1.5 w-full rounded-xl py-3 text-sm font-medium transition-all duration-300 group/btn ${
                    isHighlighted
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:brightness-110"
                      : "border border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  }`}
                >
                  Quero saber mais
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
