import { Target, Users, Workflow, Zap } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { authority } from "@/content/site";

const pillarIcons = [Target, Zap, Workflow, Users];

export const Authority = () => (
  <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

    <div className="container relative z-10">
      <SectionHeading
        badge="Por que a Boder"
        title={authority.title}
        subtitle={authority.subtitle}
      />

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12 sm:mb-16">
        {authority.pillars.map((pillar, index) => {
          const Icon = pillarIcons[index % pillarIcons.length];
          return (
            <Reveal key={pillar.title} delay={index * 0.08} className="h-full">
              <div className="h-full flex gap-4 p-6 rounded-3xl bg-card/70 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-colors duration-400">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {authority.stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary mb-1">
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
