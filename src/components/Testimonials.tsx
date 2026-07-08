import { Quote, Star } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { testimonials } from "@/content/site";

export const Testimonials = () => (
  <section id="depoimentos" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
    <div className="container">
      <SectionHeading
        badge="Depoimentos"
        title={testimonials.title}
        subtitle={testimonials.subtitle}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {testimonials.items.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 0.07} className="h-full">
            <figure className="h-full flex flex-col p-6 sm:p-7 rounded-3xl bg-card/70 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-colors duration-400">
              <Quote className="w-7 h-7 text-primary/40 mb-4" aria-hidden />
              <blockquote className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-6 flex-1">
                “{testimonial.content}”
              </blockquote>
              <figcaption className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
                <div className="flex gap-0.5" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                  ))}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
