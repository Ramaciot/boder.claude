import { useEffect, useRef, useState } from 'react';

/**
 * BlurText (react-bits) — texto que entra palavra a palavra saindo do blur.
 *
 * Versão sem framer-motion: os mesmos keyframes do original (blur 10→5→0px,
 * opacidade 0→0,5→1, deslocamento ±50px→∓5px→0) viram uma animação CSS por
 * palavra (ver "BlurText" em index.css), disparada por IntersectionObserver.
 * Mantém as props usadas no site: `as`, `delay`, `direction`, `startDelay`,
 * `stepDuration`, `animateBy`, `segmentClassName`.
 */
const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  stepDuration = 0.35,
  as = 'p',
  startDelay = 0,
  segmentClassName = ''
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const Tag = as;
  const duration = stepDuration * 2; // dois passos, como no original

  return (
    <Tag
      ref={ref}
      className={`blur-text blur-text--${direction === 'top' ? 'top' : 'bottom'} ${inView ? 'is-in' : ''} ${className}`}
      style={{ display: 'flex', flexWrap: 'wrap' }}
    >
      {elements.map((segment, index) => (
        <span
          className={`blur-text__seg inline-block ${segmentClassName}`}
          key={index}
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${startDelay + (index * delay) / 1000}s`
          }}
        >
          {segment === ' ' ? ' ' : segment}
          {animateBy === 'words' && index < elements.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
};

export default BlurText;
