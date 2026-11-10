/**
 * Ponte leve para abrir o chat de qualquer lugar (ex.: CTA "Fale Conosco")
 * sem importar o componente do chat — assim ele pode ser carregado depois.
 * Se o chat ainda não carregou, o pedido fica pendente e é atendido assim
 * que ele monta.
 */
const OPEN_EVENT = "boder:open-chat";

let pendente = false;
let carregar: (() => void) | null = null;

export const openChatBot = () => {
  pendente = true;
  carregar?.();
  window.dispatchEvent(new Event(OPEN_EVENT));
};

/** Usado pelo chat ao montar: devolve (e limpa) um pedido de abertura pendente. */
export const consumirAberturaPendente = () => {
  const p = pendente;
  pendente = false;
  return p;
};

export const aoPedirAbertura = (fn: () => void) => {
  const handler = () => {
    pendente = false;
    fn();
  };
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};

/** Registrado por quem carrega o chat sob demanda. */
export const registrarCarregadorDoChat = (fn: (() => void) | null) => {
  carregar = fn;
};
