import { createClient } from "@supabase/supabase-js";
import { chatConfig } from "./boderChat";

/**
 * Cliente Supabase do projeto Boder (mesma base que o painel interno alimenta).
 * As tabelas públicas `portfolio_sites` e `niches` são lidas aqui para montar
 * o portfólio — quando o painel interno publica um site (com nicho), ele
 * aparece automaticamente na página /portfolio.
 *
 * A URL é pública; a chave publishable/anon vem de VITE_SUPABASE_PUBLISHABLE_KEY
 * (protegida por RLS). Sem a chave, o portfólio mostra estado vazio amigável.
 */
export const supabase = createClient(chatConfig.url, chatConfig.publishableKey || "public-anon-key", {
  auth: { persistSession: true, storageKey: "boder-site-auth" },
});

export const isPortfolioEnabled = () => chatConfig.publishableKey.length > 0;

export interface PortfolioSite {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  niche_id: string | null;
  created_at: string;
}

export interface Niche {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
}
