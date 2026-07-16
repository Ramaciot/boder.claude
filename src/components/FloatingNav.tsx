import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Facebook, Instagram, Linkedin, LogIn, MessageCircle, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { contact } from "@/content/site";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import { useTheme } from "@/lib/theme";
import logoWhite from "@/assets/boder-logo.png";
import logoBlack from "@/assets/boder-logo-black.png";

/**
 * Navegação flutuante (dock) — espelha o header no modelo do site oficial.
 * Estilos de vidro/shimmer vivem em index.css. Fica oculta no topo da página;
 * aparece ao rolar para cima e some ao rolar para baixo.
 */

const navItems = [
  { name: "Home", link: "/#home" },
  { name: "Serviços", link: "/#servicos" },
  { name: "Portfólio", link: "/portfolio" },
  { name: "Depoimentos", link: "/#depoimentos" },
  { name: "FAQ", link: "/#faq" },
];

const socialIcons = [
  { label: "WhatsApp", href: contact.whatsappUrl, Icon: MessageCircle, color: "#25D366" },
  { label: "Instagram", href: "https://www.instagram.com/boderspace", Icon: Instagram, color: "#E1306C" },
  { label: "Facebook", href: "https://www.facebook.com/boderspace", Icon: Facebook, color: "#1877F2" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/boder-space-8a3307378", Icon: Linkedin, color: "#0A66C2" },
];

export const FloatingNav = ({ className }: { className?: string }) => {
  const { scrollY } = useScroll();
  const { theme, toggleTheme } = useTheme();
  const { openMeetingForm } = useMeetingForm();
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() || 0;
    const diff = current - previous;

    if (current < 50) {
      setVisible(false);
    } else if (diff < -5) {
      setVisible(true);
    } else if (diff > 5) {
      setVisible(false);
    }
  });

  const logo = theme === "light" ? logoBlack : logoWhite;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "flex max-w-fit fixed top-4 sm:top-6 inset-x-0 mx-auto rounded-full z-[5000] pl-4 sm:pl-6 pr-2 py-2 items-center justify-center gap-3 sm:gap-5",
          "glass-container",
          className,
        )}
      >
        <Link to="/" className="flex items-center shrink-0 transition-transform duration-300 hover:scale-[1.03]">
          <img src={logo} alt="Boder Space" className="h-7 w-auto" />
        </Link>

        {navItems.map((navItem, idx) => (
          <a
            key={navItem.name}
            href={navItem.link}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative hidden md:flex text-muted-foreground items-center hover:text-foreground transition-colors duration-300 text-sm font-medium py-1"
          >
            {navItem.name}
            {hoveredIndex === idx && (
              <motion.span
                layoutId="navUnderline"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent origin-center shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
              />
            )}
          </a>
        ))}

        {/* Ícones sociais circulares coloridos */}
        <div className="hidden lg:flex items-center gap-1.5">
          {socialIcons.map(({ label, href, Icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-7 h-7 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center transition-transform duration-300 hover:scale-110"
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </a>
          ))}
        </div>

        {/* Alternador de tema */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Login shimmer */}
        <a href={contact.loginUrl} className="bookmarkBtn group hidden sm:flex" aria-label="Login">
          <span className="IconContainer">
            <LogIn className="btn-icon-svg" strokeWidth={2} />
          </span>
          <p className="btn-text">Login</p>
        </a>

        {/* Agendar Meet */}
        <button
          onClick={openMeetingForm}
          className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-300 group"
        >
          <span className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="hidden sm:inline">Agendar Meet</span>
          <span className="sm:hidden">Meet</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
