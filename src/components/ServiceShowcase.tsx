import { useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import trafegoPagoBanner from "@/assets/trafego-pago-banner.png";
import socialMediaBanner from "@/assets/social-media-banner.png";
import landingPagesBanner from "@/assets/landing-pages-banner.png";
import designGraficoBanner from "@/assets/design-grafico-banner.png";
import iaPerformanceBanner from "@/assets/ia-performance-banner.png";

const banners = [
  {
    image: trafegoPagoBanner,
    alt: "Gestão de Tráfego Pago — anúncios estratégicos no Google, Facebook e Instagram",
  },
  {
    image: socialMediaBanner,
    alt: "Social Media Estratégico — perfil estruturado e postagens que engajam",
  },
  {
    image: landingPagesBanner,
    alt: "Criação de Sites & Landing Pages — profissionais, responsivos e focados em conversão",
  },
  {
    image: designGraficoBanner,
    alt: "Design Gráfico Profissional — artes para redes sociais, banners e identidade visual",
  },
  {
    image: iaPerformanceBanner,
    alt: "IA de Performance — clone da sua performance em vendas com atendimento 24/7",
  },
];

export const ServiceShowcase = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true }, [
    Autoplay({ delay: 4000, stopOnMouseEnter: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="portfolio" className="py-20 sm:py-32 relative overflow-hidden">
      <div className="container">
        <motion.div
          className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block text-primary/80 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            Portfólio
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
            Sites que <span className="text-primary">Vendem</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light">
            Soluções completas para transformar seu negócio digital
          </p>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-400 group"
          >
            <Globe className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            Veja Nossos Sites
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto relative"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {banners.map((banner) => (
                <div key={banner.alt} className="pl-4 flex-none basis-full sm:basis-1/2 lg:basis-1/3 min-w-0">
                  <div className="p-2">
                    <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2">
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        loading="lazy"
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollPrev}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 hidden sm:flex items-center justify-center rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Próximo"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 hidden sm:flex items-center justify-center rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
