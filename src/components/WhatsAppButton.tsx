import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/content/site";

export const WhatsAppButton = () => (
  <a
    href={whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Falar no WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-black/20 hover:scale-110 active:scale-95 transition-transform duration-300"
  >
    <MessageCircle className="w-7 h-7" fill="currentColor" strokeWidth={0} />
  </a>
);
