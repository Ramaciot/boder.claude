import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { contact, footer, services, social } from "@/content/site";
import logo from "@/assets/boder-logo.png";

const socialIcons: Record<string, typeof Instagram> = {
  WhatsApp: MessageCircle,
  Instagram: Instagram,
  Facebook: Facebook,
  LinkedIn: Linkedin,
};

const navigation = [
  { label: "Início", href: "/#home" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Depoimentos", href: "/#depoimentos" },
  { label: "FAQ", href: "/#faq" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[hsl(0,0%,3%)] text-white">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container pt-16 sm:pt-20 pb-8 relative z-10">
        {/* Logo e tagline */}
        <div className="flex flex-col items-center justify-center gap-4 pb-12 sm:pb-16 border-b border-white/10">
          <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="Boder Space" className="h-12 sm:h-14 w-auto" />
          </Link>
          <p className="text-white/50 text-sm sm:text-base text-center max-w-md leading-relaxed">
            {footer.tagline}
          </p>
        </div>

        {/* Grade de links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 py-12 sm:py-16">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Serviços
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/servicos/${service.slug}`}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {service.shortTitle}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Navegação
            </h4>
            <ul className="space-y-3">
              {navigation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={contact.appUrl}
              className="inline-flex items-center gap-1 mt-4 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
            >
              App Boder Space
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="col-span-2 md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Contato
            </h4>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors duration-200 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span className="break-all">{contact.email}</span>
                </a>
                <a
                  href={contact.phoneHref}
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors duration-200 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                  </span>
                  {contact.phoneDisplay}
                </a>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                  {footer.hours.title}
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  {footer.hours.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-primary mt-2 font-medium">{footer.hours.highlight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
          <p className="text-xs sm:text-sm text-white/40 text-center sm:text-left">
            © {currentYear} Boder Space. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            {social.map((item) => {
              const Icon = socialIcons[item.label] ?? MessageCircle;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                  aria-label={item.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
