# Boder Space — Site Institucional

Site público da **Boder Space** (agência de marketing digital), recriado do zero com foco em performance, manutenção simples e fidelidade total à identidade visual da marca.

## Stack

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript (strict)
- [Tailwind CSS 3](https://tailwindcss.com/) — paleta da marca via CSS variables
- [Framer Motion](https://www.framer.com/motion/) — animações on-scroll
- [React Router 6](https://reactrouter.com/) — rotas `/`, `/servicos/:slug`, 404
- Sem backend: todos os CTAs levam ao WhatsApp; Login aponta para o sistema interno existente

## Comandos

```bash
npm install     # instalar dependências
npm run dev     # servidor de desenvolvimento
npm run build   # build de produção (dist/)
npm run preview # servir o build localmente
```

## Estrutura

```
src/
├── content/site.ts      ← TODO o texto/links do site (edite aqui)
├── index.css            ← Paleta de cores da marca (CSS variables)
├── components/          ← Header, Hero, Services, FAQ, Footer…
├── pages/               ← Home, ServicePage (template das 5 páginas), NotFound
└── lib/theme.ts         ← Alternância dark/light (dark é o padrão)
```

## Identidade visual

As cores replicam **exatamente** o design system do site anterior e vivem em um único lugar (`src/index.css`):

| Token | Light | Dark |
|---|---|---|
| `--primary` | `hsl(173 80% 35%)` | `hsl(173 80% 45%)` |
| `--background` | `hsl(220 14% 98%)` | `hsl(222 25% 6%)` |
| `--accent` | `hsl(173 65% 45%)` | `hsl(173 70% 50%)` |

Não alterar sem alinhamento de branding.

## Conteúdo

Todo o texto exibido (hero, serviços, bônus, depoimentos, FAQ, contatos, redes sociais) fica centralizado em `src/content/site.ts`. Nenhum texto está hardcoded nos componentes de seção.

## Deploy

Build estático (`dist/`) — funciona em qualquer host (Netlify, Vercel, Cloudflare Pages, Lovable). O arquivo `public/_redirects` já cobre o fallback de SPA no Netlify; em outros hosts, configure o rewrite de todas as rotas para `index.html`.
