import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { finalCta } from "@/content/site";
import { useMeetingForm } from "@/contexts/MeetingFormContext";

export const FinalCTA = () => (
  <section className="py-16 sm:py-24 relative overflow-hidden">
    {/* Brilho teal contínuo — profundidade, sem faixa que corte a página */}
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-[radial-gradient(circle,hsl(var(--primary)/0.12),transparent_60%)]" />
    </div>

    <div className="container relative z-10">
      <Reveal className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight text-balance">
          {finalCta.title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-9 max-w-2xl mx-auto">
          {finalCta.subtitle}
        </p>
        <FinalCTAButton />
        <p className="mt-5 text-xs sm:text-sm text-muted-foreground/70">{finalCta.note}</p>
      </Reveal>
    </div>
  </section>
);

const FinalCTAButton = () => {
  const { openMeetingForm } = useMeetingForm();
  return (
    <button
      onClick={openMeetingForm}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base shadow-xl shadow-primary/25 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] transition-all duration-300 group"
    >
      {finalCta.button}
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};
