import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import { MeetingFormProvider, useMeetingForm } from "@/contexts/MeetingFormContext";

// Só a home entra no carregamento inicial. Todo o resto (inclusive o app
// interno e o Supabase) vira chunk separado, baixado sob demanda.
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Admin = lazy(() => import("@/pages/Admin"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MeetingBookingForm = lazy(() =>
  import("@/components/MeetingBookingForm").then((m) => ({ default: m.MeetingBookingForm })),
);

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
};

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="min-h-screen" />}>{children}</Suspense>
);

/**
 * O formulário de agendamento (que usa Supabase e date-fns) só é baixado na
 * primeira vez que alguém abre o agendamento; depois fica montado para manter
 * as animações de abrir/fechar.
 */
const MeetingFormGate = () => {
  const { isOpen } = useMeetingForm();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (isOpen) setRequested(true);
  }, [isOpen]);

  if (!requested) return null;
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <MeetingBookingForm />
    </Suspense>
  );
};

const App = () => {
  // Protótipo GL da abertura: ?gl=1 monta o GlOpening no lugar do CineOpening.
  // Sem a flag, tudo como está.
  const { search } = useLocation();
  const abertura = new URLSearchParams(search).get("gl") === "1" ? "gl" : "cine";

  return (
    <MeetingFormProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home abertura={abertura} />} />
        <Route path="/servicos" element={<Home scrollTo="servicos" abertura={abertura} />} />
        <Route path="/servicos/:slug" element={<Lazy><ServicePage /></Lazy>} />
        <Route path="/portfolio" element={<Lazy><Portfolio /></Lazy>} />
        <Route path="/auth" element={<Lazy><Auth /></Lazy>} />
        <Route path="/admin" element={<Lazy><Admin /></Lazy>} />
        <Route path="*" element={<Lazy><NotFound /></Lazy>} />
      </Routes>
      <MeetingFormGate />
    </MeetingFormProvider>
  );
};

export default App;
