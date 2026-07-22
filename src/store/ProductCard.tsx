import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { formatPrice, type Product } from "@/store/products";
import { useCart } from "@/store/CartContext";

export const ProductImage = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => (
  <div
    className={`flex items-center justify-center bg-gradient-to-br ${product.gradient} ${className ?? ""}`}
    role="img"
    aria-label={product.name}
  >
    <span className="text-6xl drop-shadow-lg">{product.emoji}</span>
  </div>
);

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link to={`/loja/produto/${product.slug}`} className="relative block">
        <ProductImage product={product} className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <Link
          to={`/loja/produto/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-auto">
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
          <p className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            ou 12x de {formatPrice(product.price / 12)}
          </p>
        </div>

        <button
          onClick={() => add(product)}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
};
