import { Gift } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { bonuses } from "@/content/site";

export const Bonuses = () => (
  <section className="py-16 sm:py-24 relative overflow-hidden">
    <div className="container relative z-10">
      <SectionHeading badge="Bônus Exclusivos" title={bonuses.title} subtitle={bonuses.subtitle} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
        {bonuses.items.map((bonus, index) => (
          <Reveal key={bonus.title} delay={index * 0.07} className="h-full">
            <div className="h-full flex gap-4 p-5 sm:p-6 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-400">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 leading-snug">
                  {bonus.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {bonus.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
