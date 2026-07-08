import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { finalCta, whatsappLink } from "@/content/site";

export const FinalCTA = () => (
  <section className="py-16 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
    <div className="absolute inset-0 opacity-10" aria-hidden>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary-foreground rounded-full blur-2xl" />
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary-foreground rounded-full blur-2xl" />
    </div>

    <div className="container relative z-10">
      <Reveal className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight text-balance">
          {finalCta.title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-9 max-w-2xl mx-auto">
          {finalCta.subtitle}
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-foreground text-primary font-semibold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 group"
        >
          {finalCta.button}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        <p className="mt-5 text-xs sm:text-sm text-primary-foreground/60">{finalCta.note}</p>
      </Reveal>
    </div>
  </section>
);
