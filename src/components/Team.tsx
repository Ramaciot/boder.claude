import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight, Instagram, Linkedin } from "lucide-react";
import { Reveal } from "./Reveal";
import creativeDirector from "@/assets/team/creative-director.jpg";
import designer from "@/assets/team/designer-female.jpg";
import trafficManager from "@/assets/team/traffic-manager.jpg";
import aiDeveloper from "@/assets/team/ai-developer.jpg";
import webDeveloper from "@/assets/team/web-developer.jpg";
import socialMedia from "@/assets/team/social-media-manager.jpg";

const INSTAGRAM = "https://www.instagram.com/boderspace";
const LINKEDIN = "https://www.linkedin.com/in/boder-space-8a3307378";

const members = [
  { name: "Diretor Criativo", role: "Estratégia & Liderança", image: creativeDirector },
  { name: "Designer Gráfico", role: "Design & Identidade Visual", image: designer },
  { name: "Gestor de Tráfego", role: "Mídia Paga & Performance", image: trafficManager },
  { name: "Desenvolvedor de IA", role: "Inteligência Artificial & Automação", image: aiDeveloper },
  { name: "Desenvolvedor de Sites", role: "Web Development & Landing Pages", image: webDeveloper },
  { name: "Social Media", role: "Gestão de Redes Sociais & Conteúdo", image: socialMedia },
];

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 inline-flex items-center justify-center text-foreground transition-colors z-10";

/** Equipe — carrossel com fotos, idêntico ao site oficial. */
export const Team = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            Nossa Equipe
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-foreground">
            Profissionais <span className="text-primary">especializados</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            Apaixonados por transformar negócios através do marketing digital
          </p>
        </div>

        <Reveal className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {members.map((member) => (
                  <div key={member.name} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 pl-4">
                    <div className="rounded-lg border bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full shadow-sm">
                      <div className="relative overflow-hidden reflexo">
                        <img
                          src={member.image}
                          alt={member.name}
                          loading="lazy"
                          width={640}
                          height={800}
                          className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                        <p className="text-primary font-medium mb-4">{member.role}</p>
                        <div className="flex justify-center gap-4">
                          <a
                            href={INSTAGRAM}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Instagram"
                          >
                            <Instagram size={20} />
                          </a>
                          <a
                            href={LINKEDIN}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin size={20} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={prev} className={`${arrowClass} left-0 md:-left-12`} aria-label="Anterior">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={next} className={`${arrowClass} right-0 md:-right-12`} aria-label="Próximo">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
