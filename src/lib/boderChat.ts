/**
 * Configuração do chat com IA (edge function `boder-chat` do sistema Boder).
 *
 * A URL do projeto é pública (aparece no bundle do site atual). A chave
 * publishable/anon vem de variável de ambiente (.env local / Vercel):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
 * Sem a chave, o chatbot funciona normalmente e direciona ao WhatsApp
 * em vez do modo IA.
 */
export const chatConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://rcbjmwisgodsnvssrmjq.supabase.co",
  publishableKey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "",
};

export const isAIChatEnabled = () => chatConfig.publishableKey.length > 0;

export const chatEndpoint = () => `${chatConfig.url}/functions/v1/boder-chat`;
