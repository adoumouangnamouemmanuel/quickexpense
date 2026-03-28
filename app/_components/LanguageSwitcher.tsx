'use client';

// Language switcher (EN / FR)
import { useLanguage, type Language } from '../_lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const opts: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ];

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{ border: '1.5px solid var(--color-surface-3)' }}
    >
      {opts.map(({ code, label, flag }) => (
        <button
          key={code}
          className="btn btn-sm"
          style={{
            borderRadius: 0,
            background: language === code ? 'oklch(0.52 0.24 265)' : 'transparent',
            color: language === code ? 'white' : 'inherit',
            padding: '0.25rem 0.5rem',
            gap: '0.2rem',
            fontWeight: language === code ? 700 : 500,
          }}
          onClick={() => setLanguage(code)}
          aria-label={`Switch to ${label}`}
          id={`lang-switch-${code}`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
