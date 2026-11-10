import type { CSSProperties } from "react";
import { AuraInkButton } from "./AuraInkButton";
import { openChatBot } from "@/lib/chatEvents";

const atraso = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** CTA final — faixa na cor da marca (texto e botão do site oficial). */
export const FinalCTA = () => (
  <section className="py-16 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
      <div
        data-parallax="rapido"
        className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary-foreground rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
      />
      <div
        data-parallax="lento"
        className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary-foreground rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
      />
      <div className="absolute top-1/2 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-primary-foreground rounded-full blur-2xl" />
      <div className="absolute top-1/4 right-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-primary-foreground rounded-full blur-2xl" />
    </div>
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      aria-hidden
    />

    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          data-reveal="title"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight px-2"
        >
          Pronto para transformar sua presença digital em{" "}
          <span className="text-primary-foreground/80 underline decoration-primary-foreground/40 underline-offset-4">
            clientes reais
          </span>
          ?
        </h2>
        <p
          data-reveal
          style={atraso(140)}
          className="text-sm sm:text-lg md:text-xl text-primary-foreground/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
        >
          Agende uma conversa gratuita com nosso time e descubra como podemos acelerar o crescimento do seu negócio.
        </p>
        <div data-reveal style={atraso(260)}>
          <AuraInkButton
            onClick={openChatBot}
            hoverText="Vamos crescer juntos?"
            className="!bg-primary-foreground !justify-center [&_.texto-principal]:!text-primary [&_.texto-principal]:!translate-x-0 [&_.texto-principal]:!text-center [&_.texto-principal]:!w-full [&_.texto-hover]:!text-black [&_.ink-splash]:!bg-white"
          >
            Fale Conosco
          </AuraInkButton>
        </div>
        <p data-reveal style={atraso(360)} className="mt-4 sm:mt-6 text-xs sm:text-sm text-primary-foreground/60">
          Sem compromisso • Resposta em até 24h
        </p>
      </div>
    </div>
  </section>
);
