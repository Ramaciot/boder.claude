import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Globe,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase, isPortfolioEnabled as isBackendEnabled, type Niche, type PortfolioSite } from "@/lib/supabase";
import { NicheIcon } from "@/components/NicheIcon";
import logoWhite from "@/assets/boder-logo.png";

interface Meeting {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_company: string | null;
  meeting_date: string;
  meeting_time: string;
  subject: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
}

const inputCls =
  "w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const statusBadge = (status: Meeting["status"]) => {
  const map = {
    pending: { label: "Pendente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    confirmed: { label: "Confirmada", cls: "bg-primary/15 text-primary border-primary/30" },
    rejected: { label: "Recusada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  } as const;
  const it = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${it.cls}`}>
      {it.label}
    </span>
  );
};

/* --------------------------------- Reuniões -------------------------------- */

const MeetingsPanel = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: true })
      .order("meeting_time", { ascending: true });
    if (!error && data) setMeetings(data as Meeting[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const setStatus = async (meeting: Meeting, status: "confirmed" | "rejected") => {
    setBusyId(meeting.id);
    const patch: Record<string, unknown> = { status };
    if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
    const { error } = await supabase.from("meetings").update(patch).eq("id", meeting.id);
    if (!error) {
      setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status } : m)));
    }
    setBusyId(null);
  };

  const pending = meetings.filter((m) => m.status === "pending");
  const confirmed = meetings.filter((m) => m.status === "confirmed");
  const rejected = meetings.filter((m) => m.status === "rejected");

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <div className="rounded-2xl bg-card/70 border border-border/50 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{meeting.requester_name}</p>
          {meeting.requester_company && (
            <p className="text-xs text-muted-foreground">{meeting.requester_company}</p>
          )}
        </div>
        {statusBadge(meeting.status)}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {format(parseISO(meeting.meeting_date), "dd 'de' MMMM", { locale: ptBR })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          {meeting.meeting_time}
        </span>
        <a href={`mailto:${meeting.requester_email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
          <Mail className="w-3.5 h-3.5 text-primary" />
          {meeting.requester_email}
        </a>
        {meeting.requester_phone && (
          <a
            href={`https://wa.me/55${meeting.requester_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            {meeting.requester_phone}
          </a>
        )}
      </div>

      {meeting.subject && <p className="text-sm"><span className="text-muted-foreground">Assunto:</span> {meeting.subject}</p>}
      {meeting.message && <p className="text-sm text-muted-foreground leading-relaxed">{meeting.message}</p>}

      {meeting.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setStatus(meeting, "confirmed")}
            disabled={busyId === meeting.id}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            Confirmar
          </button>
          <button
            onClick={() => setStatus(meeting, "rejected")}
            disabled={busyId === meeting.id}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/40 text-destructive py-2 text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-60"
          >
            <X className="w-4 h-4" />
            Recusar
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">{pending.length} pendentes</span>
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">{confirmed.length} confirmadas</span>
        </div>
        <button
          onClick={fetchMeetings}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary/40" />
          Nenhuma solicitação de reunião ainda.
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pendentes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {pending.map((m) => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </section>
          )}
          {confirmed.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Confirmadas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {confirmed.map((m) => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </section>
          )}
          {rejected.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Recusadas</h3>
              <div className="grid md:grid-cols-2 gap-4 opacity-60">
                {rejected.map((m) => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

/* --------------------------------- Portfólio -------------------------------- */

const PortfolioPanel = () => {
  const [sites, setSites] = useState<PortfolioSite[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [nicheId, setNicheId] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [sitesRes, nichesRes] = await Promise.all([
      supabase.from("portfolio_sites").select("*").order("created_at", { ascending: false }),
      supabase.from("niches").select("id, name, parent_id, icon").order("name", { ascending: true }),
    ]);
    if (!sitesRes.error && sitesRes.data) setSites(sitesRes.data as PortfolioSite[]);
    if (!nichesRes.error && nichesRes.data) setNiches(nichesRes.data as Niche[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Upload para o bucket `portfolio` (pastas thumbnails/ e videos/) — igual ao painel original
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(fileName, file);
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("portfolio").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNicheId("");
    setThumbnailFile(null);
    setVideoFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let thumbnailUrl: string | null = null;
      let videoUrl: string | null = null;

      if (thumbnailFile) {
        setProgress("Enviando thumbnail...");
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }
      if (videoFile) {
        setProgress("Enviando vídeo...");
        videoUrl = await uploadFile(videoFile, "videos");
      }

      setProgress("Salvando...");
      const { error: insErr } = await supabase.from("portfolio_sites").insert({
        title,
        description: description || null,
        niche_id: nicheId || null,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
      });
      if (insErr) throw insErr;

      setShowForm(false);
      resetForm();
      fetchData();
    } catch {
      setError("Não foi possível publicar. Verifique os arquivos e tente novamente.");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const handleDelete = async (site: PortfolioSite) => {
    if (!window.confirm(`Remover "${site.title}" do portfólio?`)) return;
    const { error: delErr } = await supabase.from("portfolio_sites").delete().eq("id", site.id);
    if (!delErr) setSites((prev) => prev.filter((s) => s.id !== site.id));
  };

  const nicheName = (id: string | null) => (id ? niches.find((n) => n.id === id)?.name ?? null : null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sites.length} {sites.length === 1 ? "site publicado" : "sites publicados"} — aparecem
          automaticamente na página{" "}
          <Link to="/portfolio" className="text-primary hover:underline">/portfolio</Link>
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Publicar Site"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-card/70 border border-border/50 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pf-title">Título *</label>
              <input id="pf-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do projeto" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pf-niche">Nicho</label>
              <select id="pf-niche" value={nicheId} onChange={(e) => setNicheId(e.target.value)} className={inputCls}>
                <option value="">Sem nicho</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.parent_id ? `— ${n.name}` : n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="pf-desc">Descrição</label>
            <textarea id="pf-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do projeto..." className={`${inputCls} h-auto py-3 resize-none`} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Thumbnail (imagem)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20 file:cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Vídeo do site
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-primary/20 file:cursor-pointer"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress ?? "Publicando..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publicar no Portfólio
              </>
            )}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-4 text-primary/40" />
          Nenhum site publicado ainda. Clique em “Publicar Site”.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="rounded-2xl bg-card/70 border border-border/50 overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {site.thumbnail_url ? (
                  <img src={site.thumbnail_url} alt={site.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Globe className="w-10 h-10 text-primary/50" />
                  </div>
                )}
                {site.video_url && (
                  <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs inline-flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    vídeo
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-tight">{site.title}</p>
                    {nicheName(site.niche_id) && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <NicheIcon iconName={niches.find((n) => n.id === site.niche_id)?.icon ?? null} className="w-3 h-3" />
                        {nicheName(site.niche_id)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(site)}
                    aria-label={`Remover ${site.title}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------- Página --------------------------------- */

const Admin = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"meetings" | "portfolio">("meetings");

  useEffect(() => {
    document.title = "Painel Interno | Boder Space";
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(false);
  };

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Topo */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="Boder Space" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Painel Interno</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
              Ver site
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {!isBackendEnabled() && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 p-4 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            Backend não configurado: defina VITE_SUPABASE_PUBLISHABLE_KEY para carregar reuniões e publicar no portfólio.
          </div>
        )}

        {/* Abas */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("meetings")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === "meetings" ? "bg-primary text-primary-foreground" : "border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reuniões
          </button>
          <button
            onClick={() => setTab("portfolio")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === "portfolio" ? "bg-primary text-primary-foreground" : "border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" />
            Portfólio
          </button>
        </div>

        {tab === "meetings" ? <MeetingsPanel /> : <PortfolioPanel />}
      </main>
    </div>
  );
};

export default Admin;
