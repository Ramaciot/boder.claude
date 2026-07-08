import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { HelpCircle, Home, LogIn, MessageSquareQuote, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { contact } from "@/content/site";

/**
 * Navegação flutuante (dock) — glassmorphism premium com botão Login shimmer.
 * Fica oculta no topo da página; aparece ao rolar para cima e some ao rolar
 * para baixo. Os acentos usam os tokens de cor da marca.
 */

const customStyles = `
  /* Efeito de vidro elaborado */
  .glass-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }

  /* Botão shimmer */
  .bookmarkBtn {
    width: auto;
    min-width: 110px;
    height: 38px;
    border-radius: 40px;
    border: 1px solid hsl(var(--primary) / 0.4);
    background-color: rgb(12, 12, 12);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    transition-duration: 0.3s;
    overflow: hidden;
    padding: 0;
    position: relative;
  }

  .bookmarkBtn::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      hsl(var(--primary) / 0.2) 25%,
      rgba(255, 255, 255, 0.9) 50%,
      hsl(var(--primary) / 0.2) 75%,
      transparent 100%);
    background-size: 200% 100%;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    z-index: 5;
    transition: opacity 0.3s;
  }

  .bookmarkBtn:hover::before {
    opacity: 1;
    animation: shinerySync 2s infinite ease-in-out;
  }

  .IconContainer {
    width: 28px;
    height: 28px;
    background: linear-gradient(to bottom, hsl(var(--accent)), hsl(var(--primary)));
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 2;
    transition-duration: 0.3s;
    flex-shrink: 0;
    margin-left: 5px;
    position: relative;
  }

  .IconContainer::after {
    content: '';
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0) 20%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 80%,
      transparent 100%);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: -110%;
    transform: skewX(-25deg);
    user-select: none;
    pointer-events: none;
  }

  .bookmarkBtn:hover .IconContainer::after {
    animation: internalShinerySync 2s infinite ease-in-out;
  }

  @keyframes shinerySync {
    0% { background-position: 150% 0; }
    100% { background-position: -150% 0; }
  }

  @keyframes internalShinerySync {
    0% { left: -110%; }
    100% { left: 110%; }
  }

  .btn-icon-svg {
    border-radius: 1px;
    transition-duration: 0.3s;
    z-index: 3;
    width: 14px;
    height: 14px;
    color: white;
  }

  .bookmarkBtn:hover .btn-icon-svg {
    animation: arrowNudge 1s infinite ease-in-out;
  }

  @keyframes arrowNudge {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }

  .btn-text {
    height: 100%;
    width: auto;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1;
    transition-duration: 0.3s;
    font-size: 13px;
    font-weight: 500;
    margin: 0;
    margin-left: 10px;
    margin-right: 12px;
    opacity: 1;
  }

  .bookmarkBtn:hover .IconContainer {
    width: calc(100% - 10px);
    border-radius: 35px;
    margin-left: 5px;
  }

  .bookmarkBtn:hover .btn-text {
    opacity: 0;
    transform: translateX(30px);
  }

  .bookmarkBtn:active {
    transform: scale(0.95);
  }
`;

interface NavItem {
  name: string;
  link: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { name: "Home", link: "/#home", icon: <Home className="h-4 w-4" /> },
  { name: "Serviços", link: "/#servicos", icon: <Rocket className="h-4 w-4" /> },
  { name: "Depoimentos", link: "/#depoimentos", icon: <MessageSquareQuote className="h-4 w-4" /> },
  { name: "FAQ", link: "/#faq", icon: <HelpCircle className="h-4 w-4" /> },
];

export const FloatingNav = ({ className }: { className?: string }) => {
  const { scrollY } = useScroll();
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

  return (
    <>
      <style>{customStyles}</style>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{
            y: visible ? 0 : -100,
            opacity: visible ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 30,
          }}
          className={cn(
            "flex max-w-fit fixed top-6 sm:top-10 inset-x-0 mx-auto rounded-full z-[5000] pr-2 pl-5 sm:pl-8 py-2.5 items-center justify-center space-x-4 sm:space-x-6",
            "glass-container",
            className,
          )}
        >
          {navItems.map((navItem, idx) => (
            <a
              key={navItem.name}
              href={navItem.link}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative text-muted-foreground items-center flex space-x-1 hover:text-foreground transition-all duration-300 text-sm font-medium py-1 px-1"
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block">{navItem.name}</span>

              {/* Linha animada no hover — estilo glowing */}
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="navUnderline"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent origin-center shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                />
              )}
            </a>
          ))}

          <a href={contact.loginUrl} className="bookmarkBtn group" aria-label="Login">
            <span className="IconContainer">
              <LogIn className="btn-icon-svg" strokeWidth={2} />
            </span>
            <p className="btn-text">Login</p>
          </a>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
