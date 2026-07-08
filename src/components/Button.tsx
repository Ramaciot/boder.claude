import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]",
  outline:
    "border border-border bg-background/40 backdrop-blur-xl text-foreground hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98]",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm sm:text-base px-6 py-3",
  lg: "text-base px-8 py-4",
};

const classes = (variant: Variant, size: Size, className = "") =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button ref={ref} className={classes(variant, size, className)} {...props} />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

/** Âncora com aparência de botão — para CTAs que navegam (WhatsApp, seções, rotas externas). */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <a ref={ref} className={classes(variant, size, className)} {...props} />
  ),
);
ButtonLink.displayName = "ButtonLink";
