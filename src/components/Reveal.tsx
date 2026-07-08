import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Wrapper padrão de animação on-scroll usado em todas as seções. */
export const Reveal = ({ children, delay = 0, className, ...rest }: RevealProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    {...rest}
  >
    {children}
  </motion.div>
);
