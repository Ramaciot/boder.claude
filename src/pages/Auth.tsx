import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase, isPortfolioEnabled as isBackendEnabled } from "@/lib/supabase";
import boderLogo from "@/assets/boder-logo.png";

// Variantes de transição entre telas — portadas do site oficial
const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const pageTransition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };

type ScreenState = "splash" | "login" | "redirecting";

const inputCls =
  "w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-shadow";

/** Tela de splash/carregamento — logo pulsando, anel girando e pontos quicando. */
const SplashScreen = ({ message }: { message: string }) => (
  <motion.div
    key="splash"
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="min-h-screen flex flex-col items-center justify-center gap-6"
  >
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <img src={boderLogo} alt="Boder Space" className="h-16 animate-pulse" />
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </motion.div>
  </motion.div>
);

export default function Auth() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<ScreenState>("splash");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redefinição de senha
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    document.title = "Entrar | Boder Space";
    document.documentElement.classList.add("dark");
  }, []);

  // Splash de entrada; se já houver sessão, redireciona ao painel
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const started = Date.now();
      let hasSession = false;
      if (isBackendEnabled()) {
        const { data } = await supabase.auth.getSession();
        hasSession = !!data.session;
      }
      // Garante a entrada suave (mínimo ~1s de splash, como no original)
      const elapsed = Date.now() - started;
      if (elapsed < 1000) await new Promise((r) => setTimeout(r, 1000 - elapsed));
      if (cancelled) return;
      if (hasSession) {
        setScreen("redirecting");
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setScreen("login");
      }
    };
    boot();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isBackendEnabled()) {
      setError("Backend não configurado (VITE_SUPABASE_PUBLISHABLE_KEY ausente).");
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (authError) {
      // Mostra o motivo real do Supabase — evita diagnóstico às cegas
      const knownMessages: Record<string, string> = {
        "Invalid login credentials": "Email ou senha incorretos.",
        "Email not confirmed":
          "Este email ainda não foi confirmado no Supabase. Em Authentication → Users, edite o usuário e marque como confirmado (ou recrie com \"Auto Confirm User\" ativado).",
      };
      setError(knownMessages[authError.message] ?? `Erro do Supabase: ${authError.message}`);
      return;
    }

    setScreen("redirecting");
    setTimeout(() => navigate("/admin"), 1000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBackendEnabled()) return;
    await supabase.auth.resetPasswordForEmail(resetEmail);
    setResetSent(true);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {screen === "splash" && <SplashScreen key="splash" message="Carregando..." />}
        {screen === "redirecting" && <SplashScreen key="redir" message="Entrando no painel..." />}

        {screen === "login" && (
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            {/* Voltar ao site */}
            <Link
              to="/"
              className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </Link>

            <div className="w-full max-w-md space-y-6">
              <motion.div
                className="flex flex-col items-center space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <img src={boderLogo} alt="Boder Space" className="h-12" />
                <h1 className="text-2xl font-bold">Boder Space</h1>
                <p className="text-muted-foreground text-center">
                  Entre na sua conta para acessar o painel
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 p-6 shadow-xl shadow-primary/5">
                  {showReset ? (
                    resetSent ? (
                      <div className="text-center py-4 space-y-3">
                        <h2 className="text-lg font-semibold">Email enviado!</h2>
                        <p className="text-sm text-muted-foreground">
                          Se existir uma conta para {resetEmail}, você receberá um link de
                          redefinição de senha.
                        </p>
                        <button
                          onClick={() => {
                            setShowReset(false);
                            setResetSent(false);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Voltar ao login
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReset} className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold">Redefinir senha</h2>
                          <p className="text-sm text-muted-foreground">
                            Informe seu email para receber o link
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
                          <input
                            id="reset-email"
                            type="email"
                            required
                            placeholder="seu@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:brightness-110 transition-all"
                        >
                          Enviar link
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReset(false)}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Voltar ao login
                        </button>
                      </form>
                    )
                  ) : (
                    <>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold">Login</h2>
                        <p className="text-sm text-muted-foreground">Entre com seu email e senha</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                          <input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputCls}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="login-password" className="text-sm font-medium">Senha</label>
                          <div className="relative">
                            <input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className={`${inputCls} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {error && <p className="text-sm text-destructive text-center">{error}</p>}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            "Entrar"
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowReset(true);
                            setResetEmail(email);
                            setResetSent(false);
                          }}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Esqueceu sua senha?
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
