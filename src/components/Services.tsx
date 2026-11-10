import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Check, Globe, Share2, Star, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { services } from "@/content/site";

const icons: Record<string, LucideIcon> = {
  "sites-landing-pages": Globe,
  "social-media": Share2,
  "ia-atendimento": Bot,
  "gestao-trafego": TrendingUp,
  "estrategia-digital": Target,
};

/** Tópicos curtos exibidos nos cards da home (iguais ao site oficial). */
const cardFeatures: Record<string, string[]> = {
  "sites-landing-pages": ["Design Responsivo", "SEO Otimizado", "Alta Performance"],
  "social-media": ["Conteúdo Estratégico", "Calendário Editorial", "Análise de Métricas"],
  "ia-atendimento": ["Respostas Instantâneas", "Integração WhatsApp", "Aprendizado Contínuo"],
  "gestao-trafego": ["Meta Ads", "Google Ads", "Relatórios Detalhados"],
  "estrategia-digital": ["Consultoria Estratégica", "Plano de Ação", "Acompanhamento Mensal"],
};

/** Serviços — grid de cards de vidro idêntico ao site oficial. */
export const Services = () => {
  const isOdd = services.length % 2 === 1;

  return (
    <section id="servicos" className="py-20 sm:py-32 bg-transparent relative overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div data-parallax="rapido" className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div data-parallax="lento" className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <span data-reveal className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">
              Nossos Serviços
            </span>
            <h2
              data-reveal="title"
              className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6"
            >
              Soluções para <span className="text-primary">escalar seu negócio</span>
            </h2>
            <p
              data-reveal
              style={{ "--reveal-delay": "160ms" } as CSSProperties}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light"
            >
              Cada serviço é pensado para entregar resultados mensuráveis
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {services.map((service, index) => {
              const Icon = icons[service.slug] ?? Globe;
              const isPopular = service.badge === "popular";
              const isRecommended = service.badge === "recommended";
              const highlighted = isPopular || isRecommended;
              const isLastOdd = index === services.length - 1 && isOdd;

              return (
                <div
                  key={service.slug}
                  data-reveal="card"
                  style={{ "--reveal-delay": `${(index % 3) * 110}ms` } as CSSProperties}
                  className={[
                    "group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-6 xl:p-8 transition-all duration-300 cursor-pointer backdrop-blur-xl",
                    "hover:bg-foreground/[0.08] hover:border-foreground/30 hover:scale-[1.02] hover:z-10",
                    highlighted
                      ? "bg-foreground/[0.07] border border-foreground/20 ring-2 ring-foreground/30 shadow-[0_0_50px_-12px_hsl(var(--foreground)/0.2)]"
                      : "bg-foreground/[0.03] border border-foreground/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
                    isLastOdd ? "col-span-2 md:col-span-1 max-w-[50%] mx-auto md:max-w-none" : "",
                  ].join(" ")}
                >
                  {highlighted && (
                    <div className="absolute inset-[-1px] rounded-2xl sm:rounded-3xl p-[1px] bg-gradient-to-b from-foreground/40 via-transparent to-foreground/10 pointer-events-none [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]" />
                  )}

                  <div>
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <div
                        className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${highlighted ? "bg-primary/20" : "bg-foreground/10"}`}
                      >
                        <Icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${highlighted ? "text-primary" : "text-foreground/70"}`}
                        />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold leading-tight text-foreground">
                        {service.title}
                      </h3>
                    </div>

                    {highlighted && (
                      <span
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-2 sm:mb-4 ${isPopular ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white"}`}
                      >
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                        {isPopular ? "Mais Popular" : "Recomendado"}
                      </span>
                    )}

                    <p
                      className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 line-clamp-3 sm:line-clamp-none ${highlighted ? "text-foreground/60" : "text-foreground/50"}`}
                    >
                      {service.description}
                    </p>

                    <ul className="hidden sm:block space-y-2.5 mb-6">
                      {(cardFeatures[service.slug] ?? service.features).map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-center gap-x-3 text-sm ${highlighted ? "text-foreground/80" : "text-foreground/70"}`}
                        >
                          <Check
                            className={`w-4 h-4 flex-shrink-0 ${highlighted ? "text-primary" : "text-foreground/40"}`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/servicos/${service.slug}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className={`group/btn inline-flex items-center justify-center w-full h-9 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                        : "bg-foreground/10 text-foreground hover:bg-foreground/20 ring-1 ring-foreground/20"
                    }`}
                  >
                    <span className="sm:hidden">Ver mais</span>
                    <span className="hidden sm:inline">Saiba mais</span>
                    <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p data-reveal className="text-center text-muted-foreground/60 text-sm mt-12">
            Passe o mouse sobre os cards para destacar • Clique para saber mais
          </p>
        </div>
      </div>
    </section>
  );
};
