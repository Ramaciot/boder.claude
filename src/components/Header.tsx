import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, LogIn, Menu, MessageCircle, Moon, Smartphone, Sun, X } from "lucide-react";
import { contact, whatsappLink } from "@/content/site";
import { useTheme } from "@/lib/theme";
import logoWhite from "@/assets/boder-logo.png";
import logoBlack from "@/assets/boder-logo-black.png";

const navItems = [
  { label: "Home", hash: "#home" },
  { label: "Serviços", hash: "#servicos" },
  { label: "Depoimentos", hash: "#depoimentos" },
  { label: "FAQ", hash: "#faq" },
];

// Ícones sociais circulares coloridos (modelo do site oficial)
const socialIcons = [
  { label: "WhatsApp", href: contact.whatsappUrl, Icon: MessageCircle, color: "#25D366" },
  { label: "Instagram", href: "https://www.instagram.com/boderspace", Icon: Instagram, color: "#E1306C" },
  { label: "Facebook", href: "https://www.facebook.com/boderspace", Icon: Facebook, color: "#1877F2" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/boder-space-8a3307378", Icon: Linkedin, color: "#0A66C2" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (hash: string) => {
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${hash}`);
    }
  };

  const logo = theme === "light" ? logoBlack : logoWhite;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled && !isMenuOpen ? "-translate-y-full opacity-0 pointer-events-none" : ""
      }`}
    >
      <nav className="container py-4 sm:py-5">
        {/* Pílula de vidro — modelo do site oficial */}
        <div className="glass-container rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center transition-transform duration-300 hover:scale-[1.03] shrink-0"
          >
            <img src={logo} alt="Boder Space" className="h-8 sm:h-9 w-auto" />
          </Link>

          {/* Navegação desktop */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => goToSection(item.hash)}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:origin-center after:scale-x-0 hover:after:scale-x-100 after:bg-gradient-to-r after:from-transparent after:via-primary after:to-transparent after:transition-transform after:duration-300"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Ações desktop */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Ícones sociais circulares coloridos */}
            <div className="flex items-center gap-2">
              {socialIcons.map(({ label, href, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-transparent"
                  style={{ ["--sc" as string]: color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${color}22`;
                    e.currentTarget.style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </a>
              ))}
            </div>

            {/* Alternador de tema */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-300"
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Login shimmer */}
            <a href={contact.loginUrl} className="bookmarkBtn group" aria-label="Login">
              <span className="IconContainer">
                <LogIn className="btn-icon-svg" strokeWidth={2} />
              </span>
              <p className="btn-text">Login</p>
            </a>

            {/* Atalho App */}
            <a
              href={contact.appUrl}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <Smartphone className="w-4 h-4" />
              App
            </a>

            {/* Agendar Meet */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 transition-all duration-300 group"
            >
              <span className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              Agendar Meet
            </a>
          </div>

          {/* Botão do menu mobile */}
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-foreground"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 p-4 space-y-1 glass-container rounded-3xl">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => goToSection(item.hash)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}

            <div className="flex items-center gap-3 px-4 py-3">
              {socialIcons.map(({ label, href, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </a>
              ))}
            </div>

            <div className="px-4 pt-1 space-y-2">
              <a
                href={contact.loginUrl}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-border/60 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
              >
                Agendar Meet
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
