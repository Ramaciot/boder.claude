export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  badge?: string;
  // Gradiente usado como "foto" placeholder até subir imagens reais.
  gradient: string;
  emoji: string;
};

export const categories = [
  "Eletrônicos",
  "Acessórios",
  "Casa",
  "Perfumaria",
  "Moda",
] as const;

export const products: Product[] = [
  {
    id: "p1",
    slug: "fone-bluetooth-pro",
    name: "Fone Bluetooth Pro com Cancelamento de Ruído",
    category: "Eletrônicos",
    price: 189.9,
    oldPrice: 299.9,
    description:
      "Fone sem fio com cancelamento ativo de ruído, até 30h de bateria, estojo com carregamento rápido e microfone com redução de ruído para chamadas.",
    badge: "Mais vendido",
    gradient: "from-sky-500 to-indigo-600",
    emoji: "🎧",
  },
  {
    id: "p2",
    slug: "smartwatch-fit",
    name: "Smartwatch Fit com Monitor Cardíaco",
    category: "Eletrônicos",
    price: 249.9,
    oldPrice: 399.9,
    description:
      "Relógio inteligente com tela AMOLED, monitoramento de sono e batimentos, GPS integrado e resistência à água 5ATM.",
    badge: "Oferta",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "⌚",
  },
  {
    id: "p3",
    slug: "caixa-som-portatil",
    name: "Caixa de Som Portátil à Prova d'Água",
    category: "Eletrônicos",
    price: 159.9,
    description:
      "Som potente com graves profundos, 12h de bateria, certificação IPX7 e pareamento estéreo com uma segunda caixa.",
    gradient: "from-orange-500 to-rose-600",
    emoji: "🔊",
  },
  {
    id: "p4",
    slug: "carregador-turbo-65w",
    name: "Carregador Turbo 65W USB-C",
    category: "Acessórios",
    price: 89.9,
    oldPrice: 129.9,
    description:
      "Carregamento rápido para celular e notebook, duas portas USB-C e uma USB-A, proteção contra sobrecarga.",
    gradient: "from-violet-500 to-purple-700",
    emoji: "🔌",
  },
  {
    id: "p5",
    slug: "capinha-magnetica",
    name: "Capinha Magnética Antichoque",
    category: "Acessórios",
    price: 49.9,
    description:
      "Compatível com carregamento por indução, bordas reforçadas e proteção de câmera elevada.",
    gradient: "from-slate-500 to-slate-800",
    emoji: "📱",
  },
  {
    id: "p6",
    slug: "mochila-antifurto",
    name: "Mochila Antifurto com USB",
    category: "Acessórios",
    price: 139.9,
    oldPrice: 189.9,
    description:
      "Compartimento para notebook até 15,6\", tecido impermeável, zíperes ocultos e porta USB externa.",
    badge: "Novidade",
    gradient: "from-cyan-600 to-blue-800",
    emoji: "🎒",
  },
  {
    id: "p7",
    slug: "luminaria-led-smart",
    name: "Luminária LED Smart RGB",
    category: "Casa",
    price: 99.9,
    description:
      "Controle pelo app, 16 milhões de cores, modos de leitura e relaxamento, compatível com assistentes de voz.",
    gradient: "from-amber-400 to-orange-600",
    emoji: "💡",
  },
  {
    id: "p8",
    slug: "garrafa-termica-inox",
    name: "Garrafa Térmica Inox 1L",
    category: "Casa",
    price: 79.9,
    oldPrice: 109.9,
    description:
      "Mantém bebidas geladas por 24h e quentes por 12h, parede dupla a vácuo e tampa com trava.",
    gradient: "from-teal-500 to-emerald-700",
    emoji: "🧊",
  },
  {
    id: "p9",
    slug: "kit-organizadores",
    name: "Kit 6 Organizadores de Gaveta",
    category: "Casa",
    price: 59.9,
    description:
      "Tamanhos variados, tecido resistente e dobrável, ideal para roupas, acessórios e itens de escritório.",
    gradient: "from-lime-500 to-green-700",
    emoji: "🗂️",
  },
  {
    id: "p10",
    slug: "perfume-essence-100ml",
    name: "Perfume Essence Masculino 100ml",
    category: "Perfumaria",
    price: 129.9,
    oldPrice: 199.9,
    description:
      "Fragrância amadeirada de alta fixação, notas de bergamota, âmbar e vetiver. Ideal para o dia a dia e ocasiões especiais.",
    badge: "Mais vendido",
    gradient: "from-yellow-600 to-amber-800",
    emoji: "🧴",
  },
  {
    id: "p11",
    slug: "perfume-flor-de-lis",
    name: "Perfume Flor de Lis Feminino 75ml",
    category: "Perfumaria",
    price: 119.9,
    description:
      "Fragrância floral frutada com notas de jasmim, pêra e baunilha. Alta fixação e projeção.",
    gradient: "from-pink-500 to-fuchsia-700",
    emoji: "🌸",
  },
  {
    id: "p12",
    slug: "oculos-sol-polarizado",
    name: "Óculos de Sol Polarizado UV400",
    category: "Moda",
    price: 89.9,
    oldPrice: 149.9,
    description:
      "Lentes polarizadas com proteção UV400, armação leve em TR90 e estojo rígido incluso.",
    badge: "Oferta",
    gradient: "from-zinc-600 to-zinc-900",
    emoji: "🕶️",
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
