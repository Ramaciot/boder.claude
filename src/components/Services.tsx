import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Check, Globe, Rocket, Share2, Star, TrendingUp } from "lucide-react";
import { ParallaxCard } from "./ParallaxCard";
import { SectionHeading } from "./SectionHeading";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { services } from "@/content/site";

const serviceGradients: Record<string, string> = {
  "sites-landing-pages": "from-blue-500/20 via-cyan-500/10 to-transparent",
  "social-media": "from-amber-500/20 via-orange-500/10 to-transparent",
  "ia-atendimento": "from-violet-500/20 via-purple-500/10 to-transparent",
  "gestao-trafego": "from-emerald-500/20 via-green-500/10 to-transparent",
  "estrategia-digital": "from-rose-500/20 via-pink-500/10 to-transparent",
};

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

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {services.map((service) => {
          const Icon = serviceIcons[service.slug] ?? Globe;
          const isHighlighted = service.badge !== null;

          return (
            <ParallaxCard key={service.slug} className="group h-full" intensity={6}>
              <motion.div
                variants={staggerItem}
                className={`relative h-full flex flex-col p-6 lg:p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 overflow-hidden ${
                  isHighlighted
                    ? "bg-gradient-to-br from-primary/8 via-primary/4 to-card border-primary/25 shadow-xl shadow-primary/10"
                    : "bg-card/70 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                }`}
              >
                {/* Overlay de gradiente no hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${serviceGradients[service.slug] ?? ""} opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-3xl pointer-events-none`}
                />
                {/* Efeito shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                  <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12 group-hover:animate-shine" />
                </div>
                {service.badge && (
                  <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {badgeLabels[service.badge]}
                  </span>
                )}

                <div className="relative z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-400">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary transition-transform duration-400 group-hover:scale-105" />
                </div>

                <div className="relative z-10 flex flex-col flex-1">
                  <h3 className="text-lg lg:text-xl mb-2.5 leading-tight">{service.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground mb-5 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {service.features.map((feature, i) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm lg:text-base"
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        viewport={{ once: true }}
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </span>
                        <span className="text-foreground/75">{feature}</span>
                      </motion.li>
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
              </motion.div>
            </ParallaxCard>
          );
        })}
      </motion.div>
    </div>
  </section>
);
