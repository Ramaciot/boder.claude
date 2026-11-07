import BlurText from "./BlurText";
import TrueFocus from "./TrueFocus";
import { GlassButton } from "./GlassButton";
import { hero } from "@/content/site";
import { useMeetingForm } from "@/contexts/MeetingFormContext";

/** Hero — estrutura, textos e animações idênticos ao site oficial. */
export const Hero = () => {
  const { openMeetingForm } = useMeetingForm();

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32 sm:pt-40 pb-16 sm:pb-24"
    >
      {/* Véu de vidro sobre o fundo fluido */}
      <div className="absolute inset-0 backdrop-blur-[3px] bg-background/10 z-[1] [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />

      {/* Gradientes radiais da marca */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_60%,hsl(var(--primary)/0.05),transparent)]" />
      </div>

      {/* Orbes: teal à esquerda, roxo à direita */}
      <div className="absolute top-1/4 left-[15%] w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl z-[3] opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 right-[15%] w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl z-[3] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl z-[3] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight px-2">
            <BlurText
              as="span"
              text={hero.titleTop}
              delay={100}
              animateBy="words"
              direction="top"
              className="justify-center mb-2"
            />
            <span className="block">
              <TrueFocus
                sentence={hero.titleHighlight}
                manualMode={false}
                blurAmount={5}
                borderColor="hsl(var(--primary))"
                glowColor="hsl(var(--primary) / 0.6)"
                animationDuration={0.5}
                pauseBetweenAnimations={1.5}
                className="justify-center py-2 text-primary"
              />
            </span>
            <BlurText
              as="span"
              text={hero.titleBottom}
              delay={80}
              animateBy="words"
              direction="bottom"
              className="justify-center mt-2"
            />
          </h1>

          <div className="max-w-3xl mx-auto px-4">
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground leading-relaxed font-normal">
              {hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center pt-4 sm:pt-6 px-4">
            <GlassButton onClick={openMeetingForm} className="min-w-[280px] h-14 px-8 text-base">
              {hero.ctaPrimary}
            </GlassButton>
            <GlassButton href="#servicos" className="min-w-[280px] h-14 px-8 text-base">
              {hero.ctaSecondary}
            </GlassButton>
          </div>

          <div className="pt-8 sm:pt-12">
            <a
              href="#servicos"
              className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium tracking-wide uppercase">Explorar</span>
              <div className="w-6 h-10 rounded-full border-2 border-current/30 flex items-start justify-center p-1.5">
                <div className="w-1.5 h-3 bg-current rounded-full" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
