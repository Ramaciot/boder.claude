import { useEffect, useRef, useState } from "react";
import { Eye, Globe, Play } from "lucide-react";
import type { PortfolioSite } from "@/lib/supabase";

interface PortfolioCardProps {
  site: PortfolioSite;
  onOpenModal: (site: PortfolioSite) => void;
}

/** Card do portfólio — thumbnail, prévia de vídeo no hover (desktop) e play. */
export const PortfolioCard = ({ site, onOpenModal }: PortfolioCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (!site.video_url) return;
    hoverTimeout.current = setTimeout(() => setShowPreview(true), 300);
  };

  const handleLeave = () => {
    setShowPreview(false);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (showPreview) previewRef.current?.play().catch(() => undefined);
  }, [showPreview]);

  useEffect(
    () => () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    },
    [],
  );

  return (
    <div
      className="group relative bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-2"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative overflow-hidden bg-muted aspect-video">
        {showPreview && site.video_url && (
          <video
            ref={previewRef}
            src={site.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        )}

        {site.thumbnail_url ? (
          <img
            src={site.thumbnail_url}
            alt={site.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Globe className="w-16 h-16 text-primary/50" />
          </div>
        )}

        {site.video_url && (
          <button
            onClick={() => onOpenModal(site)}
            aria-label={`Ver ${site.title}`}
            className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          >
            <span className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            </span>
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 pointer-events-none z-30" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {site.title}
        </h3>
        {site.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{site.description}</p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onOpenModal(site)}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
