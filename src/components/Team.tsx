import { Bot, Code, Megaphone, Palette, Share2, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { team } from "@/content/site";

const roleIcons = [Sparkles, Palette, Megaphone, Bot, Code, Share2];

export const Team = () => (
  <section className="py-16 sm:py-24 relative overflow-hidden">
    <div className="container">
      <SectionHeading badge="Nosso Time" title={team.title} subtitle={team.subtitle} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {team.items.map((member, index) => {
          const Icon = roleIcons[index % roleIcons.length];
          return (
            <Reveal key={member.name} delay={index * 0.06} className="h-full">
              <div className="h-full text-center p-5 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-400">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold leading-tight mb-1">{member.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{member.role}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
