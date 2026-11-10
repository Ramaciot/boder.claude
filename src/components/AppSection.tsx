import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { BarChart3, Globe, MessageSquare, Smartphone, Sparkles, type LucideIcon } from "lucide-react";
import { contact } from "@/content/site";

/*
 * "Boder Space App" — área exclusiva para clientes.
 *
 * Cada cartão tem uma mini tela do app que "acorda" quando o cartão entra na
 * tela (barras crescem, bolhas de chat chegam, status deslizam) e
 * microinterações no ponteiro (inclinação 3D e brilho que segue o mouse).
 * Tudo em CSS — o JS só grava a posição do ponteiro em variáveis CSS, sem
 * loop de animação. Estilos em "App — área exclusiva" no index.css.
 */

const atraso = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/* ── Mini telas do app ─────────────────────────────────────────────────── */

const PreviewRelatorios = () => (
  <div className="app-tela">
    <div className="app-tela__topo">
      <span className="app-ao-vivo" />
      <span>Ao vivo</span>
    </div>
    <div className="app-barras" aria-hidden>
      {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
        <span key={i} style={{ "--h": `${h}%`, "--i": i } as CSSProperties} />
      ))}
    </div>
    <div className="app-metricas">
      <span className="app-chip">
        CTR <strong>3.2%</strong>
      </span>
      <span className="app-chip">
        ROAS <strong>4.5x</strong>
      </span>
    </div>
  </div>
);

const PreviewPortfolio = () => (
  <div className="app-tela">
    <div className="app-tela__topo">
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span>Projetos</span>
    </div>
    <div className="app-ladrilhos" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ "--i": i } as CSSProperties} />
      ))}
    </div>
    <div className="app-linha">
      <span className="app-linha__icone">
        <Globe className="w-3.5 h-3.5" />
      </span>
      <span>
        <strong>Seu Site</strong>
        <small>Landing Page</small>
      </span>
    </div>
  </div>
);

const PreviewIA = () => (
  <div className="app-tela">
    <div className="app-tela__topo">
      <Sparkles className="w-3.5 h-3.5 text-primary" />
      <span>Boder AI</span>
    </div>
    <div className="app-chat" aria-hidden>
      <span className="app-bolha app-bolha--eu" style={{ "--i": 0 } as CSSProperties}>
        Como está minha campanha?
      </span>
      <span className="app-bolha" style={{ "--i": 1 } as CSSProperties}>
        CTR de 3.2%, acima da média! 🚀
      </span>
      <span className="app-bolha app-bolha--digitando" style={{ "--i": 2 } as CSSProperties}>
        <i />
        <i />
        <i />
      </span>
    </div>
  </div>
);

const PreviewPost = () => (
  <div className="app-tela">
    <div className="app-tela__topo">
      <MessageSquare className="w-3.5 h-3.5 text-primary" />
      <span>Solicite sua Postagem</span>
    </div>
    <div className="app-status" aria-hidden>
      <span className="app-status__item app-status__item--producao" style={{ "--i": 0 } as CSSProperties}>
        Em produção
      </span>
      <span className="app-status__item app-status__item--aprovado" style={{ "--i": 1 } as CSSProperties}>
        Aprovado
      </span>
      <span className="app-status__item app-status__item--publicado" style={{ "--i": 2 } as CSSProperties}>
        Publicado
      </span>
    </div>
    <span className="app-botao-mini">+ Nova Solicitação</span>
  </div>
);

interface AppCard {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  details: string;
  preview: () => ReactNode;
}

const cards: AppCard[] = [
  {
    title: "Relatórios",
    subtitle: "Tempo Real",
    icon: BarChart3,
    details: "Acompanhe métricas de ROAS, CTR e investimento em tempo real direto pelo celular.",
    preview: PreviewRelatorios,
  },
  {
    title: "Portfólio",
    subtitle: "Sites & LPs",
    icon: Globe,
    details: "Visualize todos os seus projetos web em um só lugar com acesso rápido.",
    preview: PreviewPortfolio,
  },
  {
    title: "Boder AI",
    subtitle: "Inteligência",
    icon: Sparkles,
    details: "Tire dúvidas sobre suas campanhas e peça sugestões de criativos para nossa IA.",
    preview: PreviewIA,
  },
  {
    title: "Solicite Post",
    subtitle: "Social Media",
    icon: MessageSquare,
    details: "Abra solicitações de artes para redes sociais de forma rápida e prática.",
    preview: PreviewPost,
  },
];

const features: { icon: LucideIcon; text: string }[] = [
  { icon: Smartphone, text: "App exclusivo para clientes" },
  { icon: BarChart3, text: "Relatórios em tempo real" },
  { icon: MessageSquare, text: "Solicite postagem para sua rede social" },
  { icon: Sparkles, text: "Boder AI: Dúvidas, dicas de post e legendas" },
];

/** Grava a posição do ponteiro (0–1) em variáveis CSS: inclinação + brilho. */
const seguirPonteiro = (event: PointerEvent<HTMLElement>) => {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", ((event.clientX - r.left) / r.width).toFixed(3));
  el.style.setProperty("--my", ((event.clientY - r.top) / r.height).toFixed(3));
};
const soltarPonteiro = (event: PointerEvent<HTMLElement>) => {
  event.currentTarget.style.removeProperty("--mx");
  event.currentTarget.style.removeProperty("--my");
};

export const AppSection = () => (
  <section className="app-secao relative w-full flex flex-col justify-center items-center overflow-hidden bg-transparent py-20 sm:py-28">
    {/* Fundo: grade sutil e orbes com parallax */}
    <div className="app-secao__grade" aria-hidden />
    <div data-parallax="rapido" className="app-secao__orbe app-secao__orbe--a" aria-hidden />
    <div data-parallax="lento" className="app-secao__orbe app-secao__orbe--b" aria-hidden />

    <div className="mb-10 md:mb-14 z-10 text-center px-4">
      <span data-reveal className="app-selo">
        <span className="app-ao-vivo" />
        Exclusivo para Clientes
      </span>
      <h2
        data-reveal="title"
        className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-4 md:mb-6"
      >
        Boder Space <span className="app-titulo-destaque">App</span>
      </h2>
      <p
        data-reveal
        style={atraso(160)}
        className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
      >
        Nossos clientes têm acesso a um aplicativo exclusivo para acompanhar campanhas, explorar portfólios,
        solicitar posts para o Social Media e utilizar ferramentas de IA personalizadas.
      </p>
    </div>

    <div className="relative z-10 w-full max-w-[1100px] px-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {cards.map(({ title, subtitle, icon: Icon, details, preview: Preview }, index) => (
        <div
          key={title}
          data-reveal="card"
          data-parallax="desktop"
          style={{ "--reveal-delay": `${index * 110}ms`, "--parallax": index % 2 ? "34px" : "12px" } as CSSProperties}
          className="app-cartao-moldura"
        >
          <article className="app-cartao" onPointerMove={seguirPonteiro} onPointerLeave={soltarPonteiro}>
            <div className="app-cartao__brilho" aria-hidden />
            <Preview />
            <div className="app-cartao__texto">
              <div className="app-cartao__icone">
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-xl font-bold text-foreground">{title}</h3>
              <p className="text-primary/80 font-semibold text-[10px] md:text-xs mb-2 md:mb-3 tracking-wider uppercase">
                {subtitle}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{details}</p>
            </div>
          </article>
        </div>
      ))}
    </div>

    <div className="mt-12 md:mt-16 w-full max-w-4xl mx-auto px-4 z-10">
      <div data-reveal className="app-painel">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
          {features.map(({ icon: Icon, text }, index) => (
            <div key={text} data-reveal style={atraso(120 + index * 80)} className="app-recurso">
              <div className="app-recurso__icone">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground font-medium text-xs text-center sm:text-left">{text}</span>
            </div>
          ))}
        </div>
        <a href={contact.appUrl} className="flex justify-center">
          <span className="wave-shimmer-premium-btn">Saiba sobre o App</span>
        </a>
        <p className="text-xs text-muted-foreground text-center mt-4">Disponível para clientes com serviços ativos</p>
      </div>
    </div>
  </section>
);
