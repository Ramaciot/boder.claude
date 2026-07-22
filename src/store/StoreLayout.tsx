import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, Store } from "lucide-react";
import { storeConfig } from "@/store/config";
import { useCart } from "@/store/CartContext";

const SearchBar = ({ className }: { className?: string }) => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/loja?q=${encodeURIComponent(q)}` : "/loja");
  };

  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você está procurando?"
          aria-label="Pesquisar produtos"
          className="w-full rounded-full border border-border bg-card py-2.5 pl-5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          aria-label="Pesquisar"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

const StoreHeader = () => {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-8 items-center justify-center gap-8 overflow-hidden text-xs font-medium">
          {storeConfig.announcements.map((text) => (
            <span key={text} className="hidden whitespace-nowrap first:inline sm:inline">
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="container flex items-center gap-4 py-3 md:gap-8">
        <Link to="/loja" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            {storeConfig.name}
          </span>
        </Link>

        <SearchBar className="hidden flex-1 md:block md:max-w-xl" />

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/loja/carrinho"
            aria-label={`Carrinho com ${count} itens`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
};

const StoreFooter = () => (
  <footer className="mt-16 border-t border-border bg-card/60">
    <div className="container grid gap-8 py-10 text-sm sm:grid-cols-3">
      <div>
        <p className="font-display text-base font-bold">{storeConfig.name}</p>
        <p className="mt-2 text-muted-foreground">{storeConfig.tagline}</p>
      </div>
      <div>
        <p className="font-semibold">Atendimento</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>Seg. a sex., 9h às 18h</li>
          <li>
            <a
              href={`https://wa.me/${storeConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
      <div>
        <p className="font-semibold">Garantias</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>Compra 100% segura</li>
          <li>Troca em até 7 dias</li>
          <li>Envio para todo o Brasil</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} {storeConfig.name}. Todos os direitos reservados.
    </div>
  </footer>
);

export const StoreLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <StoreHeader />
    <main className="flex-1">{children}</main>
    <StoreFooter />
  </div>
);
