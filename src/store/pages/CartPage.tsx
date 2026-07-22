import { Link } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { StoreLayout } from "@/store/StoreLayout";
import { ProductImage } from "@/store/ProductCard";
import { formatPrice } from "@/store/products";
import { storeConfig } from "@/store/config";
import { useCart } from "@/store/CartContext";

const CartPage = () => {
  const { items, total, setQuantity, remove } = useCart();
  const freeShipping = total >= storeConfig.freeShippingFrom;
  const missing = storeConfig.freeShippingFrom - total;

  return (
    <StoreLayout>
      <div className="container py-8">
        <Link
          to="/loja"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Continuar comprando
        </Link>

        <h1 className="mb-6 text-2xl font-bold">Meu carrinho</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold">Seu carrinho está vazio</p>
            <Link
              to="/loja"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <Link to={`/loja/produto/${product.slug}`} className="shrink-0">
                    <ProductImage
                      product={product}
                      className="h-24 w-24 rounded-md [&>span]:text-4xl"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/loja/produto/${product.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold">
                      {formatPrice(product.price)}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label="Diminuir quantidade"
                          className="p-2 hover:text-primary"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          aria-label="Aumentar quantidade"
                          className="p-2 hover:text-primary"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => remove(product.id)}
                        aria-label={`Remover ${product.name}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </button>
                    </div>
                  </div>

                  <p className="hidden shrink-0 font-bold sm:block">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Resumo do pedido</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={freeShipping ? "font-semibold text-primary" : ""}>
                    {freeShipping ? "Grátis" : "Calculado no checkout"}
                  </span>
                </div>
              </div>

              {!freeShipping && (
                <p className="mt-3 rounded-md bg-primary/10 p-3 text-xs text-foreground">
                  Faltam <strong>{formatPrice(missing)}</strong> para ganhar frete
                  grátis!
                </p>
              )}

              <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ou 12x de {formatPrice(total / 12)} sem juros
              </p>

              <Link
                to="/loja/checkout"
                className="mt-5 block rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                Finalizar compra
              </Link>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default CartPage;
