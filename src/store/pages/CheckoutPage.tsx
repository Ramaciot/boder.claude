import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { StoreLayout } from "@/store/StoreLayout";
import { formatPrice } from "@/store/products";
import { storeConfig } from "@/store/config";
import { useCart } from "@/store/CartContext";

const CheckoutPage = () => {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    cep: "",
    address: "",
    notes: "",
  });

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const lines = [
      `Olá! Quero finalizar meu pedido na ${storeConfig.name}:`,
      "",
      ...items.map(
        ({ product, quantity }) =>
          `- ${quantity}x ${product.name} — ${formatPrice(product.price * quantity)}`,
      ),
      "",
      `Total: ${formatPrice(total)}`,
      "",
      `Nome: ${form.name}`,
      `Telefone: ${form.phone}`,
      `CEP: ${form.cep}`,
      `Endereço: ${form.address}`,
    ];
    if (form.notes.trim()) lines.push(`Observações: ${form.notes}`);

    const url = `https://wa.me/${storeConfig.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
    clear();
    navigate("/loja", { replace: true });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary";

  return (
    <StoreLayout>
      <div className="container max-w-3xl py-8">
        <Link
          to="/loja/carrinho"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao carrinho
        </Link>

        <h1 className="mb-6 text-2xl font-bold">Finalizar compra</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-lg font-semibold">Seu carrinho está vazio</p>
            <Link
              to="/loja"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_280px]">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Nome completo
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    className={inputClass}
                    placeholder="(00) 90000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="cep" className="mb-1 block text-sm font-medium">
                    CEP
                  </label>
                  <input
                    id="cep"
                    required
                    value={form.cep}
                    onChange={(e) => set("cep")(e.target.value)}
                    className={inputClass}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-1 block text-sm font-medium">
                  Endereço completo
                </label>
                <input
                  id="address"
                  required
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  className={inputClass}
                  placeholder="Rua, número, bairro, cidade - UF"
                />
              </div>

              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  className={inputClass}
                  placeholder="Ponto de referência, cor preferida..."
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                Finalizar pelo WhatsApp
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Você será redirecionado para o WhatsApp com o resumo do pedido
                pronto para enviar.
              </p>
            </form>

            <aside className="h-fit rounded-lg border border-border bg-card p-5">
              <h2 className="font-bold">Resumo</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex justify-between gap-2">
                    <span className="line-clamp-1 text-muted-foreground">
                      {quantity}x {product.name}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-3 font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default CheckoutPage;
