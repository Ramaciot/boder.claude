import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BadgeCheck, CreditCard, SearchX, Truck } from "lucide-react";
import { StoreLayout } from "@/store/StoreLayout";
import { ProductCard } from "@/store/ProductCard";
import { categories, products } from "@/store/products";
import { storeConfig } from "@/store/config";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const benefits = [
  { icon: Truck, text: "Envio para todo o Brasil" },
  { icon: CreditCard, text: "Até 12x sem juros" },
  { icon: BadgeCheck, text: "Compra 100% segura" },
];

const StoreHome = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("cat") ?? "";

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        normalize(p.name).includes(q) ||
        normalize(p.category).includes(q) ||
        normalize(p.description).includes(q)
      );
    });
  }, [query, category]);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(params);
    if (cat) next.set("cat", cat);
    else next.delete("cat");
    setParams(next);
  };

  const searching = query.trim().length > 0 || category.length > 0;

  return (
    <StoreLayout>
      {!searching && (
        <section className="border-b border-border bg-gradient-to-br from-primary/15 via-transparent to-accent/10">
          <div className="container flex flex-col items-center gap-4 py-14 text-center">
            <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              {storeConfig.tagline}
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Produtos selecionados com preço justo, envio rápido e atendimento
              direto pelo WhatsApp.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {benefits.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? "" : cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {searching && (
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
            {query.trim() && (
              <>
                {" "}para <span className="font-semibold text-foreground">"{query.trim()}"</span>
              </>
            )}
          </p>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro termo ou navegue pelas categorias.
            </p>
            <Link
              to="/loja"
              className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Ver todos os produtos
            </Link>
          </div>
        )}
      </section>
    </StoreLayout>
  );
};

export default StoreHome;
