import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  Maximize,
  Pause,
  Play,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { FloatingNav } from "@/components/FloatingNav";
import { LiquidEtherBackground } from "@/components/LiquidEtherBackground";
import { PortfolioCard } from "@/components/PortfolioCard";
import { NicheIcon } from "@/components/NicheIcon";
import { supabase, isPortfolioEnabled, type Niche, type PortfolioSite } from "@/lib/supabase";
import { whatsappLink } from "@/content/site";

type SortBy = "newest" | "oldest" | "alphabetical";

const Portfolio = () => {
  const [sites, setSites] = useState<PortfolioSite[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    document.title = "Portfólio de Sites e Landing Pages | Boder Space";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isPortfolioEnabled()) {
        setLoading(false);
        return;
      }
      const [sitesRes, nichesRes] = await Promise.all([
        supabase.from("portfolio_sites").select("*").order("created_at", { ascending: false }),
        supabase.from("niches").select("id, name, parent_id, icon").order("name", { ascending: true }),
      ]);
      if (!sitesRes.error && sitesRes.data) setSites(sitesRes.data as PortfolioSite[]);
      if (!nichesRes.error && nichesRes.data) setNiches(nichesRes.data as Niche[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const parentNiches = useMemo(() => niches.filter((n) => !n.parent_id), [niches]);
  const childrenOf = useCallback(
    (parentId: string) => niches.filter((n) => n.parent_id === parentId),
    [niches],
  );

  const nicheIdsForFilter = useCallback(
    (nicheId: string) => [nicheId, ...childrenOf(nicheId).map((c) => c.id)],
    [childrenOf],
  );

  const countByNiche = useCallback(
    (nicheId: string) => {
      const ids = nicheIdsForFilter(nicheId);
      return sites.filter((s) => s.niche_id && ids.includes(s.niche_id)).length;
    },
    [sites, nicheIdsForFilter],
  );

  const nicheName = useCallback(
    (id: string | null) => (id ? niches.find((n) => n.id === id)?.name ?? null : null),
    [niches],
  );

  const filteredSites = useMemo(() => {
    let result = sites;
    if (selectedNiche) {
      const ids = nicheIdsForFilter(selectedNiche);
      result = result.filter((s) => s.niche_id && ids.includes(s.niche_id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title, "pt-BR");
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [sites, selectedNiche, searchQuery, sortBy, nicheIdsForFilter]);

  const selectedSite = selectedIndex !== null ? filteredSites[selectedIndex] : null;
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < filteredSites.length - 1;

  const openModal = (site: PortfolioSite) => {
    setSelectedIndex(filteredSites.findIndex((s) => s.id === site.id));
    setVideoPlaying(false);
    setVideoMuted(true);
  };
  const closeModal = useCallback(() => setSelectedIndex(null), []);
  const goPrev = useCallback(() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(
    () => setSelectedIndex((i) => (i !== null && i < filteredSites.length - 1 ? i + 1 : i)),
    [filteredSites.length],
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, goPrev, goNext, closeModal]);

  return (
    <div className="min-h-screen">
      <LiquidEtherBackground />
      <div className="relative z-10">
        <Header />
        <FloatingNav />
        <main>
          {/* Hero */}
          <section className="pt-32 sm:pt-40 pb-16 relative overflow-hidden">
            <div className="container text-center max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Portfólio de Sites
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Sites & Landing Pages que <span className="text-primary">Convertem</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore nossa coleção de sites profissionais desenvolvidos com foco em performance,
                design moderno e alta conversão.
              </p>
            </div>
          </section>

          {/* Busca + filtros */}
          <section className="pb-8">
            <div className="container">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar projetos por título ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-full bg-card/70 border border-border/60 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      aria-label="Limpar busca"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="h-11 rounded-full bg-card/70 border border-border/60 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                    <option value="alphabetical">A-Z (Alfabética)</option>
                  </select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredSites.length} {filteredSites.length === 1 ? "projeto" : "projetos"}
                  </span>
                </div>
              </div>

              {/* Filtros por nicho */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtrar por:</span>
                </div>
                <button
                  onClick={() => setSelectedNiche(null)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedNiche === null
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 hover:border-primary/40"
                  }`}
                >
                  Todos
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-foreground/10">{sites.length}</span>
                </button>
                {parentNiches
                  .filter((n) => countByNiche(n.id) > 0)
                  .map((niche) => {
                    const isSelected = selectedNiche === niche.id;
                    return (
                      <button
                        key={niche.id}
                        onClick={() => setSelectedNiche(niche.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <NicheIcon iconName={niche.icon} className="w-4 h-4" />
                        {niche.name}
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-foreground/10">
                          {countByNiche(niche.id)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </section>

          {/* Grade */}
          <section className="py-12 pb-28">
            <div className="container">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-card/60 rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <div className="p-6 space-y-3">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSites.length === 0 ? (
                <div className="text-center py-20 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    {searchQuery ? (
                      <Search className="w-10 h-10 text-primary" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {searchQuery
                      ? "Nenhum resultado encontrado"
                      : selectedNiche
                        ? "Nenhum site neste nicho"
                        : "Em breve, novos projetos"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? `Não encontramos projetos com “${searchQuery}”. Tente outra busca.`
                      : selectedNiche
                        ? "Tente outro filtro ou veja todos os projetos."
                        : "Estamos preparando nosso portfólio. Enquanto isso, fale com a gente e crie o seu site."}
                  </p>
                  {selectedNiche || searchQuery ? (
                    <button
                      onClick={() => {
                        setSelectedNiche(null);
                        setSearchQuery("");
                      }}
                      className="inline-flex items-center rounded-full border border-border/60 px-6 py-2.5 text-sm font-medium hover:border-primary/40 transition-colors"
                    >
                      Limpar filtros
                    </button>
                  ) : (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      Quero meu site
                    </a>
                  )}
                </div>
              ) : (
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                >
                  {filteredSites.map((site) => (
                    <motion.div
                      key={site.id}
                      variants={{
                        hidden: { opacity: 0, y: 30, scale: 0.96 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
                      }}
                    >
                      <PortfolioCard site={site} onOpenModal={openModal} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="py-20">
            <div className="container text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-5">Quer um site como esses?</h2>
              <p className="text-muted-foreground mb-8">
                Fale com a gente e criamos um site profissional e de alta conversão para o seu negócio.
              </p>
              <Link
                to="/servicos/sites-landing-pages"
                className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-4 font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
              >
                Solicitar Orçamento
              </Link>
            </div>
          </section>
        </main>
        <Footer />
        <ChatBot />
      </div>

      {/* Modal de detalhe */}
      <AnimatePresence>
        {selectedSite && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border/60 shadow-2xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                aria-label="Fechar"
                className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {filteredSites.length > 1 && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm border border-border/60 px-3 py-1 rounded-full text-sm font-medium">
                  {(selectedIndex ?? 0) + 1} / {filteredSites.length}
                </span>
              )}
              {hasPrev && (
                <button
                  onClick={goPrev}
                  aria-label="Anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={goNext}
                  aria-label="Próximo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Mídia */}
              <div className="relative aspect-[9/16] max-h-[60vh] bg-black">
                {selectedSite.video_url ? (
                  <ModalVideo
                    key={selectedSite.id}
                    src={selectedSite.video_url}
                    muted={videoMuted}
                    playing={videoPlaying}
                    onTogglePlay={() => setVideoPlaying((p) => !p)}
                    onToggleMute={() => setVideoMuted((m) => !m)}
                  />
                ) : selectedSite.thumbnail_url ? (
                  <img
                    src={selectedSite.thumbnail_url}
                    alt={selectedSite.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Globe className="w-24 h-24 text-primary/50" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">{selectedSite.title}</h3>
                {nicheName(selectedSite.niche_id) && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    <Globe className="w-3.5 h-3.5" />
                    {nicheName(selectedSite.niche_id)}
                  </span>
                )}
                {selectedSite.description && (
                  <p className="text-muted-foreground leading-relaxed">{selectedSite.description}</p>
                )}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    Gostou deste projeto? Podemos criar algo similar para você!
                  </p>
                  <Link
                    to="/servicos/sites-landing-pages"
                    onClick={closeModal}
                    className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    Solicitar Orçamento
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ModalVideoProps {
  src: string;
  muted: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

const ModalVideo = ({ src, muted, playing, onTogglePlay, onToggleMute }: ModalVideoProps) => {
  const ref = useState<HTMLVideoElement | null>(null);
  const [, setEl] = ref;
  const videoEl = ref[0];

  useEffect(() => {
    if (!videoEl) return;
    if (playing) videoEl.play().catch(() => undefined);
    else videoEl.pause();
  }, [playing, videoEl]);

  useEffect(() => {
    if (videoEl) videoEl.muted = muted;
  }, [muted, videoEl]);

  return (
    <>
      <video
        ref={setEl}
        src={src}
        loop
        playsInline
        muted={muted}
        className="w-full h-full object-contain"
        onClick={onTogglePlay}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onTogglePlay}
            aria-label={playing ? "Pausar" : "Reproduzir"}
            className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={onToggleMute}
            aria-label={muted ? "Ativar som" : "Silenciar"}
            className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => videoEl?.requestFullscreen?.()}
            aria-label="Tela cheia"
            className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!playing && (
        <button
          onClick={onTogglePlay}
          aria-label="Reproduzir"
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <span className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </span>
        </button>
      )}
    </>
  );
};

export default Portfolio;
