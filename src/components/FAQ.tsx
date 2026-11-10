import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { contact } from "@/content/site";

const questions = [
  {
    question: '"A grana tá curta". Será que preciso mesmo de uma agência?',
    answer:
      "Justamente quando a grana está curta é que o marketing se torna ainda mais essencial. Empresas que crescem entendem que investir em uma boa estratégia é o caminho mais rápido para atrair clientes e aumentar o faturamento. Adiar esse passo pode custar muito mais caro lá na frente.",
    icon: "💰",
  },
  {
    question: "Não tenho time de vendas. Preciso contratar pessoas antes?",
    answer:
      "Não necessariamente. Nossa agência cuida de atrair os clientes até você. Se o seu negócio já está preparado para atender, mesmo sem uma equipe de vendas, está tudo certo. Podemos agendar uma conversa para entender melhor sua estrutura e ver o que faz sentido no seu caso.",
    icon: "👥",
  },
  {
    question: "Tem alguma garantia de resultado?",
    answer:
      "Não. Fórmula mágica não existe, e prometer isso seria irresponsável. Acreditamos em trabalho conjunto: aplicamos estratégias eficazes, mas sua participação e constância são essenciais. Resultados vêm com disciplina e um bom planejamento colocado em prática.",
    icon: "🎯",
  },
  {
    question: "Meu negócio está iniciando, é o momento de contratar uma agência?",
    answer:
      "Se seu negócio está iniciando, não existe opção melhor do que começar da maneira correta: contratar uma agência no momento inicial pode impulsionar seu início. Temos uma linha de serviços especiais para pequenos empreendedores. Consulte-nos.",
    icon: "🚀",
  },
  {
    question: "Vocês podem me mandar uma proposta comercial?",
    answer:
      "Nossos serviços são personalizados, por isso preferimos apresentar nossas soluções em uma breve reunião. Assim entendemos melhor seu negócio e mostramos o que realmente faz sentido para você. Chama a gente no WhatsApp e agendamos rapidinho!",
    icon: "📋",
  },
];

const headerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const headerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/** FAQ — acordeão de vidro idêntico ao site oficial. */
export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
      </div>
      {/* Orbes "respirando" em CSS (compositor) — sem loop de JS */}
      <div className="faq-orbe faq-orbe--a absolute top-20 right-[10%] w-64 h-64 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="faq-orbe faq-orbe--b absolute bottom-20 left-[10%] w-56 h-56 bg-gradient-to-br from-accent/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={headerContainer}
          >
            <motion.div variants={headerItem}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 text-primary text-sm font-medium mb-6 tracking-tight shadow-sm">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </span>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight"
              variants={headerItem}
            >
              Perguntas{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-violet-500 bg-clip-text text-transparent">
                Frequentes
              </span>
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed"
              variants={headerItem}
            >
              Tire suas dúvidas sobre nossos serviços e como podemos ajudar seu negócio
            </motion.p>
          </motion.div>

          <div className="w-full space-y-4 sm:space-y-5">
            {questions.map((item, index) => {
              const isOpen = open === index;
              const panelId = `faq-panel-${index}`;
              return (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div data-state={isOpen ? "open" : "closed"} className="group relative overflow-hidden">
                    <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-background/90 via-background/70 to-background/50 backdrop-blur-xl border border-border/40 overflow-hidden transition-all duration-500 group-data-[state=open]:border-primary/30 group-data-[state=open]:shadow-2xl group-data-[state=open]:shadow-primary/10 hover:border-border/60 hover:shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-data-[state=open]:opacity-100 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                        <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:animate-shine" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="relative z-10 text-left py-5 sm:py-6 px-5 sm:px-8 w-full"
                      >
                        <div className="flex items-center gap-4 sm:gap-5 w-full">
                          <motion.div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-xl sm:text-2xl" aria-hidden>
                              {item.icon}
                            </span>
                          </motion.div>
                          <div className="flex-1 pr-4">
                            <span className="text-base sm:text-lg md:text-xl font-semibold text-foreground tracking-tight leading-tight block group-hover:text-primary transition-colors duration-300">
                              {item.question}
                            </span>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-data-[state=open]:bg-primary/20 transition-all duration-300">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            key="panel"
                            className="relative z-10 overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            <motion.div
                              className="pb-6 sm:pb-8 px-5 sm:px-8 pl-[4.5rem] sm:pl-[5.5rem]"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
                                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pl-4">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="text-center mt-12 sm:mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
            <motion.a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 text-primary font-medium hover:from-primary/20 hover:to-primary/10 hover:scale-105 transition-all duration-300"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              Fale conosco pelo WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
