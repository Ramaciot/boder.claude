import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { supabase, isPortfolioEnabled as isBackendEnabled } from "@/lib/supabase";
import { useMeetingForm } from "@/contexts/MeetingFormContext";
import { contact } from "@/content/site";

const allTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

interface ConfirmedSlot {
  meeting_date: string;
  meeting_time: string;
}

const emptyForm = { name: "", email: "", phone: "", company: "", subject: "", message: "" };

const inputCls =
  "w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-shadow";

/** Modal de agendamento de reunião — portado do site oficial. */
export const MeetingBookingForm = () => {
  const { isOpen, closeMeetingForm } = useMeetingForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmedSlots, setConfirmedSlots] = useState<ConfirmedSlot[]>([]);
  const [formData, setFormData] = useState(emptyForm);

  // Busca horários já confirmados para bloquear slots ocupados
  useEffect(() => {
    if (!isOpen || !isBackendEnabled()) return;
    supabase
      .from("meetings")
      .select("meeting_date, meeting_time")
      .eq("status", "confirmed")
      .then(({ data, error }) => {
        if (!error && data) setConfirmedSlots(data as ConfirmedSlot[]);
      });
  }, [isOpen]);

  const bookedTimes = confirmedSlots.filter((s) => s.meeting_date === date).map((s) => s.meeting_time);
  const availableTimeSlots = allTimeSlots.filter((s) => !bookedTimes.includes(s));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setFormData(emptyForm);
    setDate("");
    setTime("");
    setSuccess(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    closeMeetingForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!date || !time) {
      setErrorMsg("Por favor, selecione uma data e horário.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Email inválido.");
      return;
    }

    // Sem backend configurado: encaminha a solicitação pelo WhatsApp
    if (!isBackendEnabled()) {
      const msg =
        `Olá! Quero agendar uma reunião.\n` +
        `Nome: ${formData.name || formData.email.split("@")[0]}\n` +
        `Email: ${formData.email}\n` +
        (formData.phone ? `Telefone: ${formData.phone}\n` : "") +
        (formData.company ? `Empresa: ${formData.company}\n` : "") +
        `Data: ${date} às ${time}\n` +
        (formData.subject ? `Assunto: ${formData.subject}\n` : "") +
        (formData.message ? `Mensagem: ${formData.message}` : "");
      window.open(`${contact.whatsappUrl}?text=${encodeURIComponent(msg)}`, "_blank");
      setSuccess(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("meetings").insert({
        requester_name: formData.name || formData.email.split("@")[0],
        requester_email: formData.email,
        requester_phone: formData.phone || null,
        requester_company: formData.company || null,
        meeting_date: date,
        meeting_time: time,
        subject: formData.subject || null,
        message: formData.message || null,
        status: "pending",
      });
      if (error) throw error;

      // Notificação push para admins (opcional — igual ao original)
      supabase.functions
        .invoke("notify-admins", {
          body: {
            title: "📅 Nova Solicitação de Reunião",
            body: `${formData.name || formData.email} solicitou uma reunião para ${date} às ${time}`,
            data: { type: "new_meeting" },
          },
        })
        .catch(() => undefined);

      setSuccess(true);
    } catch {
      setErrorMsg("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-2xl my-8 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl shadow-primary/10 p-6 sm:p-10"
            initial={{ scale: 0.95, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Solicitação Enviada!</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Sua solicitação de reunião foi enviada com sucesso. Você receberá um email de
                  confirmação em breve.
                </p>
                <button
                  onClick={handleClose}
                  className="rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold hover:brightness-110 transition-all"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                    <CalendarIcon className="w-4 h-4" />
                    Agendamento
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Agendar Reunião</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Preencha os dados para solicitar uma reunião com nossa equipe
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="mf-name" className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-4 h-4 text-primary" />
                        Nome
                      </label>
                      <input id="mf-name" name="name" value={formData.name} onChange={handleChange} placeholder="Seu primeiro nome" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="mf-email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 text-primary" />
                        Email *
                      </label>
                      <input id="mf-email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="seu@email.com" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="mf-phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="w-4 h-4 text-primary" />
                        Telefone
                      </label>
                      <input id="mf-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="mf-company" className="flex items-center gap-2 text-sm font-medium">
                        <Building className="w-4 h-4 text-primary" />
                        Empresa
                      </label>
                      <input id="mf-company" name="company" value={formData.company} onChange={handleChange} placeholder="Nome da empresa" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="mf-date" className="flex items-center gap-2 text-sm font-medium">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Data *
                      </label>
                      <input id="mf-date" type="date" required min={today} value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="mf-time" className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4 text-primary" />
                        Horário *
                      </label>
                      <select id="mf-time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
                        <option value="" disabled>
                          {availableTimeSlots.length === 0 ? "Sem horários disponíveis" : "Selecione o horário"}
                        </option>
                        {availableTimeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      {date && availableTimeSlots.length < allTimeSlots.length && (
                        <p className="text-xs text-muted-foreground">Alguns horários já estão ocupados</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mf-subject" className="text-sm font-medium">Assunto</label>
                    <input id="mf-subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Sobre o que você gostaria de falar?" className={inputCls} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mf-message" className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Mensagem
                    </label>
                    <textarea id="mf-message" name="message" rows={4} value={formData.message} onChange={handleChange} placeholder="Conte-nos mais sobre seu projeto..." className={`${inputCls} h-auto py-3 resize-none`} />
                  </div>

                  {errorMsg && <p className="text-sm text-destructive text-center">{errorMsg}</p>}

                  <div className="flex justify-center pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-10 py-4 font-semibold shadow-lg shadow-primary/25 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span className="w-8 h-8 -ml-2 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                            <Send className="w-4 h-4" />
                          </span>
                          Solicitar Reunião
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
