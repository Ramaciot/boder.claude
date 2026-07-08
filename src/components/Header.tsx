import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Menu, X } from "lucide-react";
import { ButtonLink } from "./Button";
import { ThemeToggle } from "./ThemeToggle";
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

  // Ao rolar, o header dá lugar ao dock flutuante (FloatingNav)
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled && !isMenuOpen
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "bg-transparent"
      }`}
    >
      <nav className="container py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-[1.02]">
            <img src={logo} alt="Boder Space" className="h-8 sm:h-10 w-auto" />
          </Link>

          {/* Navegação desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => goToSection(item.hash)}
                className="text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </button>
            ))}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <ButtonLink href={contact.loginUrl} variant="outline" size="sm">
              <LogIn className="h-4 w-4" />
              Login
            </ButtonLink>
            <ButtonLink href={whatsappLink} target="_blank" rel="noopener noreferrer" size="sm">
              Agendar Meet Rápido
            </ButtonLink>
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              className="p-2 -mr-2 text-foreground"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-3 py-4 space-y-1 bg-card/95 backdrop-blur-2xl border border-border/30 rounded-2xl shadow-xl">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => goToSection(item.hash)}
                className="block w-full text-left px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 pt-3 space-y-2">
              <ButtonLink href={contact.loginUrl} variant="outline" size="sm" className="w-full">
                <LogIn className="h-4 w-4" />
                Login
              </ButtonLink>
              <ButtonLink
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                className="w-full"
              >
                Agendar Meet Rápido
              </ButtonLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
