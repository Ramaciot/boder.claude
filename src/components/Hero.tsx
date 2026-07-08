import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Clock, GitBranch, Smartphone, Sparkles, TrendingUp } from "lucide-react";
import { ButtonLink } from "./Button";
import { hero, whatsappLink } from "@/content/site";

const chipIcons = [Smartphone, BarChart3, Clock, GitBranch, TrendingUp];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export const Hero = () => (
  <section
    id="home"
    className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden pt-24 sm:pt-32 pb-16"
  >
    {/* Fundo com malha de gradientes da marca */}
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_60%,hsl(var(--primary)/0.05),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_80%,hsl(var(--accent)/0.06),transparent)]" />
      <motion.div
        className="absolute top-1/4 left-[10%] w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[10%] w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-gradient-to-br from-accent/12 via-accent/6 to-transparent rounded-full blur-3xl"
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>

    <motion.div
      className="container relative z-10"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl lg:max-w-5xl mx-auto text-center space-y-7 sm:space-y-9">
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/15">
            <motion.span
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-xs sm:text-sm font-medium text-primary tracking-tight">
              {hero.badge}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-primary/60" />
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.12] text-balance"
        >
          <span className="block mb-1 sm:mb-2">{hero.titleTop}</span>
          <span className="text-gradient">{hero.titleHighlight}</span>
          <span className="block mt-1 sm:mt-2">{hero.titleBottom}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto leading-relaxed"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2"
        >
          <ButtonLink
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="w-full sm:w-auto rounded-2xl group"
          >
            {hero.ctaPrimary}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </ButtonLink>
          <ButtonLink
            href="#servicos"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-2xl"
          >
            {hero.ctaSecondary}
          </ButtonLink>
        </motion.div>

        <motion.div variants={item} className="pt-8 sm:pt-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {hero.chips.map((chip, index) => {
              const Icon = chipIcons[index % chipIcons.length];
              return (
                <span
                  key={chip}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/40"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground/85">{chip}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  </section>
);
