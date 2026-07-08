import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}

export const SectionHeading = ({ badge, title, highlight, subtitle }: SectionHeadingProps) => (
  <motion.div
    className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
    initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {badge && (
      <motion.span
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium tracking-wide mb-5"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </motion.span>
    )}
    <motion.h2
      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 text-balance"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.25 }}
    >
      {title}
      {highlight && (
        <>
          {" "}
          <span className="text-primary">{highlight}</span>
        </>
      )}
    </motion.h2>
    {subtitle && (
      <motion.p
        className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35 }}
      >
        {subtitle}
      </motion.p>
    )}
  </motion.div>
);
