import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Quote, Sparkles, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { testimonials } from "@/content/site";
import videoThumbnail from "@/assets/video-thumbnail.jpeg";

type Testimonial = (typeof testimonials.items)[number];

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    className="h-full"
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    viewport={{ once: true }}
  >
    <div className="group relative h-full rounded-3xl bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl border border-border/40 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
      {/* Overlay em gradiente no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Efeito shine */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:animate-shine" />
      </div>

      <div className="relative z-10 p-5 sm:p-8 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center text-2xl sm:text-3xl border border-primary/10 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {testimonial.avatar}
          </motion.div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-gradient">
              {testimonial.highlight}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {testimonial.highlightLabel}
            </div>
          </div>
        </div>

        <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/30 mb-3 sm:mb-4" aria-hidden />

        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed flex-1">
          {testimonial.content}
        </p>

        <div className="flex gap-1 my-4 sm:my-5" aria-label="5 de 5 estrelas">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.05 }}
              viewport={{ once: true }}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
            </motion.span>
          ))}
        </div>

        <div className="pt-4 sm:pt-5 border-t border-border/30">
          <p className="font-semibold text-foreground text-base sm:text-lg tracking-tight">
            {testimonial.name}
          </p>
          <p className="text-sm sm:text-base text-primary/80">{testimonial.company}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const VideoTestimonial = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto mb-14 sm:mb-20"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/40 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl group">
        {/* Glow atrás do vídeo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-[9/16] object-cover"
            poster={videoThumbnail}
            controls={isPlaying}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
            preload="none"
          >
            <source src={testimonials.video.src} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          {!isPlaying && (
            <motion.button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-transparent to-transparent cursor-pointer"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              aria-label={testimonials.video.playLabel}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Anel pulsante */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/40"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" />
                </motion.div>
              </motion.div>

              <span className="absolute bottom-6 left-6 right-6 text-left">
                <span className="block text-white/90 text-sm sm:text-base font-medium">
                  {testimonials.video.playLabel}
                </span>
                <span className="block text-white/60 text-xs sm:text-sm">
                  {testimonials.video.playSubtitle}
                </span>
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true, dragFree: true, containScroll: "trimSnaps" },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="depoimentos" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Fundo em gradiente premium */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />
      </div>

      {/* Orbes flutuantes */}
      <motion.div
        className="absolute top-40 left-[5%] w-72 h-72 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-40 right-[5%] w-64 h-64 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden
      />

      <div className="container relative z-10">
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 text-primary text-sm font-medium mb-6 tracking-tight shadow-sm">
              <Sparkles className="w-4 h-4" />
              Depoimentos
            </span>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight"
            variants={staggerItem}
          >
            {testimonials.title} <span className="text-gradient">{testimonials.titleHighlight}</span>{" "}
            {testimonials.titleEnd}
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={staggerItem}
          >
            {testimonials.subtitle}
          </motion.p>
        </motion.div>

        {/* Depoimento em vídeo */}
        <VideoTestimonial />

        {/* Carrossel de depoimentos */}
        <motion.div
          className="max-w-7xl mx-auto relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="overflow-hidden touch-pan-x" ref={emblaRef}>
            <div className="flex -ml-4 sm:-ml-6">
              {testimonials.items.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className="pl-4 sm:pl-6 flex-none basis-[85%] sm:basis-1/2 lg:basis-1/3 min-w-0"
                >
                  <TestimonialCard testimonial={testimonial} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <button
            onClick={scrollPrev}
            aria-label="Depoimento anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 hidden sm:flex items-center justify-center rounded-2xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/40 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Próximo depoimento"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 hidden sm:flex items-center justify-center rounded-2xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/40 shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Indicador mobile */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-6 sm:hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-xs text-muted-foreground">Deslize para ver mais</span>
              <span className="text-primary">→</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
