import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import videoThumbnail from "@/assets/video-thumbnail.jpeg";

const quotes = [
  {
    quote:
      "Trabalhei com a Boder Space na gestão de tráfego e social media. Em 3 meses aumentamos as vendas em 250% e o engajamento nas redes sociais explodiu! Equipe muito profissional.",
    name: "Ana Carolina Lima",
    title: "E-commerce de Moda",
  },
  {
    quote:
      "A criação do site e identidade visual da nossa clínica superou todas as expectativas. Design moderno, sofisticado e funcional. Recomendo!",
    name: "Rafael Costa",
    title: "Clínica Médica",
  },
  {
    quote:
      "A estratégia digital completa que a Boder desenvolveu nos ajudou a conquistar investidores. O trabalho de branding e presença online foi impecável!",
    name: "Mariana Ferreira",
    title: "Startup Tech",
  },
  {
    quote:
      "ROI excepcional! A gestão de tráfego pago trouxe leads altamente qualificados. Melhor investimento que fiz para o meu negócio.",
    name: "Pedro Henrique",
    title: "Consultoria Empresarial",
  },
  {
    quote:
      "O social media estratégico transformou nossa presença online. Posts que engajam e convertem! Nossa base de clientes cresceu 180% em 4 meses.",
    name: "Juliana Santos",
    title: "Academia Fitness",
  },
  {
    quote:
      "Landing page de alta conversão e campanhas certeiras. A Boder entende do negócio e entrega resultados reais. Equipe nota 10!",
    name: "Lucas Oliveira",
    title: "Restaurante Gourmet",
  },
];

/** Moldura 3D que "deita" e se endireita com a rolagem (ContainerScroll). */
const ContainerScroll = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.85, 0.95] : [1.02, 1]);

  return (
    <div ref={ref} className="h-[32rem] sm:h-[36rem] md:h-[42rem] flex items-center justify-center relative p-2 md:p-8">
      <div className="py-4 md:py-8 w-full relative" style={{ perspective: "1000px" }}>
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto -mt-4 md:-mt-6 h-[24rem] sm:h-[28rem] md:h-[32rem] lg:h-[36rem] w-full border-4 border-border/30 p-1 sm:p-1.5 md:p-2 bg-background/80 backdrop-blur-xl rounded-[16px] sm:rounded-[20px] md:rounded-[24px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black flex items-center justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const VideoTestimonial = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  return (
    <ContainerScroll>
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={videoThumbnail}
          controls={playing}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          playsInline
          preload="none"
        >
          <source src="/videos/testimonial-video.mov" type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
        {!playing && (
          <button
            type="button"
            onClick={play}
            aria-label="Assistir o depoimento"
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent cursor-pointer hover:bg-black/40 transition-colors z-10"
          >
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-transform">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-left">
              <p className="text-white/90 text-xs sm:text-sm font-medium">Assista o depoimento</p>
              <p className="text-white/60 text-[10px] sm:text-xs">Descubra como ajudamos nossos clientes</p>
            </div>
          </button>
        )}
      </div>
    </ContainerScroll>
  );
};

/** Faixa infinita de depoimentos (pausa ao passar o mouse). */
const InfiniteMarquee = () => (
  <div
    className="scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]"
    style={{ "--animation-direction": "reverse", "--animation-duration": "80s" } as CSSProperties}
  >
    <ul className="flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap select-none animate-infinite-scroll">
      {[...quotes, ...quotes].map((item, index) => (
        <li
          key={item.name + index}
          aria-hidden={index >= quotes.length}
          className="w-[300px] max-w-[85vw] relative rounded-2xl border flex-shrink-0 border-border/50 px-5 py-4 sm:w-[360px] sm:px-6 sm:py-5 backdrop-blur-xl"
          style={{ background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
        >
          <blockquote className="flex flex-col h-full justify-between gap-3 sm:gap-4">
            <span className="relative z-20 text-sm leading-[1.7] text-foreground/90 font-normal line-clamp-4 sm:line-clamp-none">
              "{item.quote}"
            </span>
            <div className="relative z-20 flex flex-row items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-base sm:text-lg border border-primary/10">
                {item.name.charAt(0)}
              </div>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm leading-[1.6] text-foreground font-semibold">{item.name}</span>
                <span className="text-xs leading-[1.6] text-muted-foreground font-normal">{item.title}</span>
              </span>
            </div>
          </blockquote>
        </li>
      ))}
    </ul>
  </div>
);

/** Depoimentos — vídeo em moldura 3D + faixa infinita, idêntico ao oficial. */
export const Testimonials = () => (
  <section id="depoimentos" className="relative overflow-hidden py-16 sm:py-24">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <span data-reveal className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">
          Depoimentos
        </span>
        <h2 data-reveal="title" className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-foreground">
          O que nossos <span className="text-primary">clientes</span> dizem
        </h2>
        <p
          data-reveal
          style={{ "--reveal-delay": "160ms" } as CSSProperties}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed"
        >
          Resultados reais de empresas que confiaram no nosso trabalho
        </p>
      </div>
      <div data-reveal className="mb-12">
        <VideoTestimonial />
      </div>
      <div data-reveal className="flex flex-col items-center justify-center">
        <InfiniteMarquee />
      </div>
    </div>
  </section>
);
