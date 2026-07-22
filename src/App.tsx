import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import NotFound from "@/pages/NotFound";
import { MeetingFormProvider } from "@/contexts/MeetingFormContext";
import { MeetingBookingForm } from "@/components/MeetingBookingForm";
import { CartProvider } from "@/store/CartContext";

// Rotas com Supabase — lazy para manter o bundle inicial leve.
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Admin = lazy(() => import("@/pages/Admin"));
const Auth = lazy(() => import("@/pages/Auth"));

// Loja — seção independente, lazy para não pesar o site institucional.
const StoreHome = lazy(() => import("@/store/pages/StoreHome"));
const StoreProduct = lazy(() => import("@/store/pages/ProductPage"));
const StoreCart = lazy(() => import("@/store/pages/CartPage"));
const StoreCheckout = lazy(() => import("@/store/pages/CheckoutPage"));

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
  <MeetingFormProvider>
    <CartProvider>
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
      <Route
        path="/auth"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <Auth />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <Admin />
          </Suspense>
        }
      />
      <Route
        path="/loja"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <StoreHome />
          </Suspense>
        }
      />
      <Route
        path="/loja/produto/:slug"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <StoreProduct />
          </Suspense>
        }
      />
      <Route
        path="/loja/carrinho"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <StoreCart />
          </Suspense>
        }
      />
      <Route
        path="/loja/checkout"
        element={
          <Suspense fallback={<div className="min-h-screen" />}>
            <StoreCheckout />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <MeetingBookingForm />
    </CartProvider>
  </MeetingFormProvider>
);

export default App;
