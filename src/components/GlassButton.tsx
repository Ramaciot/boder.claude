import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const base =
  "group relative overflow-hidden inline-flex items-center justify-center px-8 py-4 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/40 bg-gradient-to-tr from-white/10 via-white/5 to-transparent shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer text-foreground font-semibold tracking-wide";

const Inner = ({ children }: { children: ReactNode }) => (
  <>
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
    <span className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </>
);

/** Botão de vidro do hero — réplica do componente do site oficial. */
export const GlassButton = ({ children, onClick, href, className }: GlassButtonProps) =>
  href ? (
    <motion.a href={href} className={cn(base, className)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Inner>{children}</Inner>
    </motion.a>
  ) : (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(base, className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Inner>{children}</Inner>
    </motion.button>
  );
