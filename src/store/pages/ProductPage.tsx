import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { StoreLayout } from "@/store/StoreLayout";
import { ProductCard, ProductImage } from "@/store/ProductCard";
import { formatPrice, products } from "@/store/products";
import { storeConfig } from "@/store/config";
import { useCart } from "@/store/CartContext";

const ProductPage = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <StoreLayout>
        <div className="container flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-xl font-semibold">Produto não encontrado</p>
          <Link
            to="/loja"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Voltar para a loja
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <StoreLayout>
      <div className="container py-8">
        <Link
          to="/loja"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a loja
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <ProductImage
            product={product}
            className="aspect-square w-full rounded-lg [&>span]:text-9xl"
          />

          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

            <div>
              {product.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className="text-sm text-muted-foreground">
                ou 12x de {formatPrice(product.price / 12)} sem juros
              </p>
            </div>

            <p className="leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
              <Truck className="h-5 w-5 shrink-0 text-primary" />
              <span>
                Frete grátis em compras acima de{" "}
                <strong>{formatPrice(storeConfig.freeShippingFrom)}</strong>
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="p-3 hover:text-primary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar quantidade"
                  className="p-3 hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                {added ? "Adicionado!" : "Adicionar ao carrinho"}
              </button>
            </div>

            <Link
              to="/loja/carrinho"
              className="text-center text-sm font-medium text-primary hover:underline"
            >
              Ver carrinho
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-bold">Você também pode gostar</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
};

export default ProductPage;
