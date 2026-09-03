"use client";
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="" className="h-6 w-6" aria-hidden="true" />
              <span className="font-semibold text-base">{t('brand.name', locale)}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
              {t('brand.tagline', locale)}
            </p>
            <div className="flex gap-4">
              <Link href="/sources" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Sources
              </Link>
              <Link href="/methodology" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Methodology
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Intelligence</h4>
            <ul className="space-y-3">
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{t('footer.trust_title', locale)}</h4>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{t('footer.every_claim', locale)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{t('footer.provenance', locale)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{t('footer.evidence_inference', locale)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{t('footer.gaps_transparent', locale)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">{t('footer.copyright', locale)}</p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">{t('footer.disclaimer', locale)}</p>
        </div>
      </div>
    </footer>
  );
}
