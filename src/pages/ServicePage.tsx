import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { FloatingNav } from "@/components/FloatingNav";
import { LiquidEtherBackground } from "@/components/LiquidEtherBackground";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/Button";
import { services, whatsappLink } from "@/content/site";

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((item) => item.slug === slug);

  useEffect(() => {
    if (service) {
      document.title = `${service.title} | Boder Space`;
    }
  }, [service]);

  if (!service) {
    return <Navigate to="/" replace />;
  }

  const otherServices = services.filter((item) => item.slug !== service.slug);

  return (
    <div className="min-h-screen">
      <LiquidEtherBackground />
      <div className="relative z-10">
      <Header />
      <FloatingNav />
      <main>
        {/* Hero do serviço */}
        <section className="relative overflow-hidden pt-32 sm:pt-40 pb-16 sm:pb-24">
          <div className="container relative z-10">
            <Reveal className="max-w-3xl mx-auto text-center">
              <Link
                to="/#servicos"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Todos os serviços
              </Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
                {service.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-9">
                {service.longDescription}
              </p>
              <ButtonLink
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="rounded-2xl group"
              >
                Quero esse serviço
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </ButtonLink>
            </Reveal>
          </div>
        </section>

        {/* O que está incluso */}
        <section className="pb-16 sm:pb-24">
          <div className="container">
            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {service.features.map((feature, index) => (
                <Reveal key={feature} delay={index * 0.08} className="h-full">
                  <div className="h-full flex items-start gap-3 p-5 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-xl">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <p className="text-sm sm:text-base text-foreground/80 leading-snug">{feature}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Outros serviços */}
        <section className="pb-16 sm:pb-24">
          <div className="container">
            <Reveal className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl mb-6 text-center">Conheça também</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {otherServices.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/servicos/${item.slug}`}
                    className="px-5 py-3 rounded-full bg-card/70 border border-border/50 text-sm font-medium text-foreground/80 hover:border-primary/40 hover:text-foreground transition-colors duration-300"
                  >
                    {item.shortTitle}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <FinalCTA />
      </main>
      <Footer />
      <ChatBot />
      </div>
    </div>
  );
};

export default ServicePage;
