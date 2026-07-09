import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import NotFound from "@/pages/NotFound";

// Portfólio carrega o cliente Supabase — lazy para manter o bundle inicial leve.
const Portfolio = lazy(() => import("@/pages/Portfolio"));

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

const App = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/servicos" element={<Home scrollTo="servicos" />} />
      <Route path="/servicos/:slug" element={<ServicePage />} />
      <Route
        path="/portfolio"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <Portfolio />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
