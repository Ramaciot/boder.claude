import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import NotFound from "@/pages/NotFound";

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
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
