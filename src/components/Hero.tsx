import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Clock, GitBranch, Smartphone, Sparkles, TrendingUp } from "lucide-react";
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

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax de scroll — fundo e conteúdo em velocidades diferentes
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden pt-24 sm:pt-32 pb-16"
    >
      {/* Fundo com malha de gradientes da marca + parallax */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }} aria-hidden>
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
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-full blur-3xl"
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div className="container relative z-10" style={{ y: contentY, opacity }}>
        <motion.div
          className="max-w-4xl lg:max-w-5xl mx-auto text-center space-y-7 sm:space-y-9"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item}>
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 backdrop-blur-xl border border-primary/15 shadow-sm cursor-default"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.span
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs sm:text-sm font-medium text-primary tracking-tight">
                {hero.badge}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-primary/60" />
            </motion.span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.12] text-balance"
          >
            <span className="block mb-1 sm:mb-2">{hero.titleTop}</span>
            <span className="relative inline-block">
              <span className="text-gradient">{hero.titleHighlight}</span>
              {/* Sublinhado desenhado à mão */}
              <motion.svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <motion.path
                  d="M2 8.5C50 2.5 100 2.5 150 5.5C200 8.5 250 6.5 298 4.5"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </motion.svg>
            </span>
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
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full sm:w-auto"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto text-base px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-shadow duration-400 group overflow-hidden"
              >
                {/* Shine ao passar o mouse */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <span className="relative flex items-center gap-2">
                  {hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-400" />
                </span>
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full sm:w-auto"
            >
              <a
                href="#servicos"
                className="inline-flex items-center justify-center w-full sm:w-auto text-base px-8 py-4 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-xl text-foreground font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors duration-400"
              >
                {hero.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="pt-8 sm:pt-12">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {hero.chips.map((chip, index) => {
                const Icon = chipIcons[index % chipIcons.length];
                return (
                  <motion.span
                    key={chip}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/40"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ scale: 1.03, y: -1 }}
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-foreground/85">{chip}</span>
                  </motion.span>
                );
              })}
            </div>
          </motion.div>

          {/* Indicador de scroll */}
          <motion.div
            className="pt-6 sm:pt-10 hidden sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.a
              href="#servicos"
              className="inline-flex flex-col items-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-400 cursor-pointer"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[10px] font-medium tracking-wider uppercase">Explorar</span>
              <span className="w-5 h-8 rounded-full border border-current/30 flex items-start justify-center p-1">
                <motion.span
                  className="w-1 h-2 bg-current rounded-full"
                  animate={{ y: [0, 10, 0], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
