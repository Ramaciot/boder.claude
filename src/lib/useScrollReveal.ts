import { useEffect } from "react";

/**
 * Revela elementos marcados com `data-reveal` quando entram na tela.
 *
 * Sem requestAnimationFrame: um IntersectionObserver adiciona a classe
 * `is-revealed` uma única vez por elemento (e deixa de observá-lo); a animação
 * em si é transição CSS (ver "Reveal ao rolar" em index.css). Quando ela
 * termina, `reveal-done` devolve o elemento às próprias classes (hover etc.).
 *
 * A classe `reveal-ready` no <html> só é posta quando o observer existe — sem
 * JS ou sem suporte, nada fica escondido.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-revealed", "reveal-done"));
      return;
    }

    root.classList.add("reveal-ready");
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          observer.unobserve(el);
          const delay = parseFloat(el.style.getPropertyValue("--reveal-delay")) || 0;
          timers.push(window.setTimeout(() => el.classList.add("reveal-done"), delay + 1400));
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      root.classList.remove("reveal-ready");
    };
  }, []);
};
