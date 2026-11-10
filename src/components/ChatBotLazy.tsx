import { lazy, Suspense, useEffect, useState } from "react";
import { registrarCarregadorDoChat } from "@/lib/chatEvents";

const ChatBot = lazy(() => import("./ChatBot"));

/**
 * O chat fica fora do carregamento inicial da home: o código dele é baixado
 * quando o navegador fica ocioso depois do `load` — ou na hora, se alguém
 * pedir para abrir o chat antes disso.
 */
export const ChatBotLazy = () => {
  const [carregar, setCarregar] = useState(false);

  useEffect(() => {
    const ligar = () => setCarregar(true);
    registrarCarregadorDoChat(ligar);

    let idle = 0;
    let timer = 0;
    const agendar = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(ligar, { timeout: 2500 });
      else timer = window.setTimeout(ligar, 1200);
    };
    if (document.readyState === "complete") agendar();
    else window.addEventListener("load", agendar, { once: true });

    return () => {
      registrarCarregadorDoChat(null);
      window.removeEventListener("load", agendar);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);

  if (!carregar) return null;
  return (
    <Suspense fallback={null}>
      <ChatBot />
    </Suspense>
  );
};
