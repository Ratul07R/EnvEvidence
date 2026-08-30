import Link from 'next/link';
import { t, localeConfig, type Locale } from '@/lib/i18n';
import { useState } from 'react';

export function Footer() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="" className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold text-sm">{t('brand.name', locale)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t('brand.tagline', locale)}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.sources', locale)}
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.methodology', locale)}
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.topics', locale)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Intelligence</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.research', locale)}
                </Link>
              </li>
              <li>
                <Link href="/professional" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.professional', locale)}
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.legal', locale)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('footer.trust_title', locale)}</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>{t('footer.every_claim', locale)}</li>
              <li>{t('footer.provenance', locale)}</li>
              <li>{t('footer.evidence_inference', locale)}</li>
              <li>{t('footer.gaps_transparent', locale)}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">{t('footer.copyright', locale)}</p>
          <p className="text-xs text-muted-foreground">{t('footer.disclaimer', locale)}</p>
        </div>
      </div>
    </footer>
  );
}
