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
  badge: "Agência de Marketing Digital",
  titleTop: "Ajudamos empresas a gerar",
  titleHighlight: "clientes todos os dias",
  titleBottom: "com tráfego, sites e estratégia digital",
  subtitle:
    "Estratégias completas para negócios que querem crescer com previsibilidade e autoridade online.",
  ctaPrimary: "Agendar Meet Rápido",
  ctaSecondary: "Ver Serviços",
  chips: [
    "App exclusivo para clientes",
    "Relatórios em tempo real",
    "Boder AI: Atendimento 24/7",
    "Funis de venda com IA",
    "Dashboard de performance",
  ],
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

export const stats = {
  title: "Tecnologia e estratégia aplicadas",
  subtitle: "Números que comprovam nossa eficiência em negócios reais",
  items: [
    { value: "+300%", label: "Aumento médio em leads" },
    { value: "+200", label: "Clientes atendidos" },
    { value: "95%", label: "Taxa de satisfação" },
    { value: "+2M", label: "Em vendas geradas" },
  ],
} as const;

export const bonuses = {
  title: "Bônus para clientes Boder Space",
  subtitle: "Ao contratar Gestão de Tráfego + Social Media, você leva:",
  items: [
    {
      title: "Landing Page Estratégica",
      description: "Já configurada e pronta pra captar e vender.",
    },
    {
      title: "Cartão Digital Interativo",
      description: "Com links diretos para WhatsApp, Instagram, site e contatos.",
    },
    {
      title: "Análise de Criativos dos Concorrentes",
      description: "Para você se destacar no seu nicho.",
    },
    {
      title: "Campanha Inicial Pronta para Rodar",
      description:
        "Criativo, copy e segmentação ajustados para atrair leads desde o primeiro dia.",
    },
    {
      title: "Pacote de Stories Ilimitados",
      description: "Artes prontas para aumentar engajamento e gerar conversas.",
    },
  ],
} as const;

export const testimonials = {
  title: "O que nossos",
  titleHighlight: "clientes",
  titleEnd: "dizem",
  subtitle: "Resultados reais de empresas que confiaram no nosso trabalho",
  video: {
    src: "/videos/testimonial-video.mov",
    playLabel: "Assista o depoimento",
    playSubtitle: "Descubra como ajudamos nossos clientes",
  },
  items: [
    {
      name: "Ana Carolina Lima",
      company: "E-commerce de Moda",
      content:
        "Trabalhei com a Boder Space na gestão de tráfego e social media. Em 3 meses aumentamos as vendas em 250% e o engajamento nas redes sociais explodiu! Equipe muito profissional.",
      avatar: "👩‍💼",
      highlight: "+250%",
      highlightLabel: "em vendas",
    },
    {
      name: "Rafael Costa",
      company: "Clínica Médica",
      content:
        "A criação do site e identidade visual da nossa clínica superou todas as expectativas. Design moderno, sofisticado e funcional. Recomendo!",
      avatar: "👨‍⚕️",
      highlight: "100%",
      highlightLabel: "satisfação",
    },
    {
      name: "Mariana Ferreira",
      company: "Startup Tech",
      content:
        "A estratégia digital completa que a Boder desenvolveu nos ajudou a conquistar investidores. O trabalho de branding e presença online foi impecável!",
      avatar: "👩‍💻",
      highlight: "3x",
      highlightLabel: "mais leads",
    },
    {
      name: "Pedro Henrique",
      company: "Consultoria Empresarial",
      content:
        "ROI excepcional! A gestão de tráfego pago trouxe leads altamente qualificados. Melhor investimento que fiz para o meu negócio.",
      avatar: "👨‍💼",
      highlight: "ROI",
      highlightLabel: "excepcional",
    },
    {
      name: "Juliana Santos",
      company: "Academia Fitness",
      content:
        "O social media estratégico transformou nossa presença online. Posts que engajam e convertem! Nossa base de clientes cresceu 180% em 4 meses.",
      avatar: "💪",
      highlight: "+180%",
      highlightLabel: "clientes",
    },
    {
      name: "Lucas Oliveira",
      company: "Restaurante Gourmet",
      content:
        "Landing page de alta conversão e campanhas certeiras. A Boder entende do negócio e entrega resultados reais. Equipe nota 10!",
      avatar: "👨‍🍳",
      highlight: "Nota 10",
      highlightLabel: "atendimento",
    },
  ],
} as const;

export const team = {
  title: "Profissionais especializados",
  subtitle: "Apaixonados por transformar negócios através do marketing digital",
  items: [
    { name: "Diretor Criativo", role: "Estratégia & Liderança" },
    { name: "Designer Gráfico", role: "Design & Identidade Visual" },
    { name: "Gestor de Tráfego", role: "Mídia Paga & Performance" },
    { name: "Desenvolvedor de IA", role: "Inteligência Artificial & Automação" },
    { name: "Desenvolvedor de Sites", role: "Web Development & Landing Pages" },
    { name: "Social Media", role: "Gestão de Redes Sociais & Conteúdo" },
  ],
} as const;

export const authority = {
  title: "Resultados que transformam negócios",
  subtitle: "Metodologia validada e foco total em resultados mensuráveis",
  pillars: [
    {
      title: "Estratégias personalizadas",
      description:
        "Analisamos seu mercado e criamos um plano exclusivo para seus objetivos",
    },
    {
      title: "Foco em conversão",
      description:
        "Cada elemento é pensado para transformar visitantes em clientes",
    },
    {
      title: "Processos validados",
      description:
        "Metodologia testada que funciona para diversos tipos de negócio",
    },
    {
      title: "Atendimento próximo",
      description: "Você tem acesso direto ao time que cuida do seu projeto",
    },
  ],
  stats: [
    { value: "+300%", label: "Aumento médio em conversões" },
    { value: "+50", label: "Projetos entregues" },
    { value: "24/7", label: "Suporte disponível" },
    { value: "98%", label: "Clientes satisfeitos" },
  ],
} as const;

export const faq = {
  title: "Perguntas frequentes",
  subtitle: "Tire suas dúvidas antes de dar o próximo passo",
  items: [
    {
      question: '"A grana tá curta". Será que preciso mesmo de uma agência?',
      answer:
        "Justamente quando a grana está curta é que o marketing se torna ainda mais essencial. Empresas que crescem entendem que investir em uma boa estratégia é o caminho mais rápido para atrair clientes e aumentar o faturamento. Adiar esse passo pode custar muito mais caro lá na frente.",
    },
    {
      question: "Não tenho time de vendas. Preciso contratar pessoas antes?",
      answer:
        "Não necessariamente. Nossa agência cuida de atrair os clientes até você. Se o seu negócio já está preparado para atender, mesmo sem uma equipe de vendas, está tudo certo. Podemos agendar uma conversa para entender melhor sua estrutura e ver o que faz sentido no seu caso.",
    },
    {
      question: "Tem alguma garantia de resultado?",
      answer:
        "Não. Fórmula mágica não existe, e prometer isso seria irresponsável. Acreditamos em trabalho conjunto: aplicamos estratégias eficazes, mas sua participação e constância são essenciais. Resultados vêm com disciplina e um bom planejamento colocado em prática.",
    },
    {
      question:
        "Meu negócio está iniciando, é o momento de contratar uma agência?",
      answer:
        "Se seu negócio está iniciando, não existe opção melhor do que começar da maneira correta: contratar uma agência no momento inicial pode impulsionar seu início. Temos uma linha de serviços especiais para pequenos empreendedores. Consulte-nos.",
    },
    {
      question: "Vocês podem me mandar uma proposta comercial?",
      answer:
        "Nossos serviços são personalizados, por isso preferimos apresentar nossas soluções em uma breve reunião. Assim entendemos melhor seu negócio e mostramos o que realmente faz sentido para você. Chama a gente no WhatsApp e agendamos rapidinho!",
    },
  ],
} as const;

export const finalCta = {
  title: "Pronto para transformar sua presença digital em clientes reais?",
  subtitle:
    "Agende uma conversa gratuita com nosso time e descubra como podemos acelerar o crescimento do seu negócio.",
  note: "Sem compromisso • Resposta em até 24h",
  button: "Agendar conversa gratuita",
} as const;

export const footer = {
  tagline: "A Boder não é pra todo mundo. Só pra quem quer crescer de verdade. 🚀",
  hours: {
    title: "Horário de Atendimento",
    lines: ["Segunda a Sexta: 9h às 18h", "Sábado: 9h às 13h"],
    highlight: "Respondemos em até 1h ⚡",
  },
} as const;
