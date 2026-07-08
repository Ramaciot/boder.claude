import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { stats } from "@/content/site";

export const Stats = () => (
  <section className="py-16 sm:py-24 relative overflow-hidden">
    <div className="container">
      <SectionHeading title={stats.title} subtitle={stats.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {stats.items.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <div className="text-center p-6 sm:p-8 rounded-3xl bg-card/70 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-colors duration-400">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gradient mb-2">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
