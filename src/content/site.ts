/**
 * Fonte única de conteúdo do site.
 * Todo texto, link e dado exibido nas páginas vive aqui —
 * para editar o site, edite este arquivo.
 */

export const contact = {
  whatsappNumber: "5516994792602",
  whatsappUrl: "https://wa.me/5516994792602",
  whatsappMessage:
    "Olá! Vim pelo site da Boder Space e quero agendar uma conversa rápida.",
  email: "contatoboder@outlook.com.br",
  phoneDisplay: "(16) 99479-2602",
  phoneHref: "tel:+5516994792602",
  appUrl: "https://www.agenciaboder.com.br/app",
  loginUrl: "https://www.agenciaboder.com.br/auth",
} as const;

export const whatsappLink = `${contact.whatsappUrl}?text=${encodeURIComponent(
  contact.whatsappMessage,
)}`;

export const social = [
  { label: "WhatsApp", href: contact.whatsappUrl },
  { label: "Instagram", href: "https://www.instagram.com/boderspace" },
  { label: "Facebook", href: "https://www.facebook.com/boderspace" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/boder-space-8a3307378" },
] as const;

export const hero = {
  titleTop: "Ajudamos empresas a gerar",
  titleHighlight: "clientes todos os dias",
  titleBottom: "com tráfego, sites e estratégia digital",
  subtitle:
    "Estratégias completas para negócios que querem crescer com previsibilidade e autoridade online.",
  ctaPrimary: "Agendar Meet Rápido",
  ctaSecondary: "Ver Serviços",
} as const;

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  features: string[];
  badge: "popular" | "recommended" | null;
  longDescription: string;
}

export const services: Service[] = [
  {
    slug: "sites-landing-pages",
    title: "Criação de Sites e Landing Pages",
    shortTitle: "Sites e Landing Pages",
    description:
      "Sites rápidos, modernos e feitos para converter visitantes em clientes",
    features: [
      "Design responsivo e profissional",
      "Otimizado para conversão",
      "Carregamento ultra-rápido",
    ],
    badge: "popular",
    longDescription:
      "Sites profissionais, responsivos e otimizados com foco em conversão. Cada página é pensada para transformar visitantes em clientes, com performance de carregamento no topo das métricas do Google.",
  },
  {
    slug: "social-media",
    title: "Social Media",
    shortTitle: "Social Media",
    description:
      "Gestão profissional das suas redes sociais para aumentar engajamento",
    features: [
      "Criação de conteúdo estratégico",
      "Gestão de comunidade e interações",
      "Análise de métricas e crescimento",
    ],
    badge: "recommended",
    longDescription:
      "Perfil estruturado e postagens estratégicas para atrair e engajar seu público. Cuidamos do conteúdo, da comunidade e das métricas para que sua marca cresça de forma consistente.",
  },
  {
    slug: "ia-atendimento",
    title: "IA de Atendimento 24/7",
    shortTitle: "IA de Atendimento",
    description: "Atendimento automatizado e inteligente que nunca dorme",
    features: [
      "Respostas instantâneas aos clientes",
      "Qualificação automática de leads",
      "Integração com WhatsApp e Instagram",
    ],
    badge: null,
    longDescription:
      "IA que simula a experiência do seu melhor vendedor com atendimento 24/7. Respostas instantâneas, qualificação automática de leads e integração direta com WhatsApp e Instagram.",
  },
  {
    slug: "gestao-trafego",
    title: "Gestão de Tráfego Pago",
    shortTitle: "Gestão de Tráfego",
    description: "Geração de leads qualificados e vendas todos os dias",
    features: [
      "Campanhas no Google e Meta Ads",
      "Otimização contínua de resultados",
      "Relatórios de performance detalhados",
    ],
    badge: null,
    longDescription:
      "Atraímos clientes através de anúncios estratégicos no Google, Facebook e Instagram. Campanhas otimizadas continuamente, com relatórios de performance detalhados e foco total em retorno.",
  },
  {
    slug: "estrategia-digital",
    title: "Estratégia Digital Completa",
    shortTitle: "Estratégia Digital",
    description:
      "Planejamento, execução e otimização contínua do seu crescimento online",
    features: [
      "Análise completa do seu negócio",
      "Plano de ação personalizado",
      "Acompanhamento e ajustes constantes",
    ],
    badge: null,
    longDescription:
      "Planejamento, execução e otimização contínua do seu crescimento online. Analisamos seu negócio a fundo, montamos um plano de ação personalizado e acompanhamos cada ajuste com você.",
  },
];

export const footer = {
  tagline: "A Boder não é pra todo mundo. Só pra quem quer crescer de verdade. 🚀",
  hours: {
    title: "Horário de Atendimento",
    lines: ["Segunda a Sexta: 9h às 18h", "Sábado: 9h às 13h"],
    highlight: "Respondemos em até 1h ⚡",
  },
} as const;
