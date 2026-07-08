import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  useEffect(() => {
    document.title = "Página não encontrada | Boder Space";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-7xl sm:text-8xl font-semibold text-gradient mb-4">404</p>
        <h1 className="text-xl sm:text-2xl mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
