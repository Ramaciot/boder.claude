import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    onClick={onToggle}
    className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-300"
    aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
  >
    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);
