import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}

export const SectionHeading = ({ badge, title, highlight, subtitle }: SectionHeadingProps) => (
  <Reveal className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
    {badge && (
      <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium tracking-wide mb-5">
        {badge}
      </span>
    )}
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 text-balance">
      {title}
      {highlight && (
        <>
          {" "}
          <span className="text-primary">{highlight}</span>
        </>
      )}
    </h2>
    {subtitle && (
      <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
        {subtitle}
      </p>
    )}
  </Reveal>
);
