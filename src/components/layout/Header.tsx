'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t, localeConfig, type Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const validLocales: Locale[] = ['en', 'bn', 'zh', 'ja', 'ar', 'ru'];

const NAV_ITEMS = [
  { key: 'explore', href: '/' },
  { key: 'topics', href: '/topics' },
  { key: 'research', href: '/research' },
  { key: 'methodology', href: '/methodology' },
  { key: 'sources', href: '/sources' },
  { key: 'professional', href: '/professional' },
];

export function Header() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && validLocales.includes(saved)) return saved;
    }
    return 'en';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const dir = localeConfig[locale].dir;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const handleLocaleChange = (code: Locale) => {
    setLocale(code);
    localStorage.setItem('envevidence-locale', code);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label={t('nav.explore', locale)}
        >
          <img src="/logo.svg" alt="" className="h-8 w-8" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:block">
            {t('brand.name', locale)}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                {t(`nav.${item.key}`, locale)}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm" aria-label="Select language">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{localeConfig[locale].nativeName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(localeConfig) as [Locale, typeof localeConfig.en][]).map(([code, config]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLocaleChange(code)}
                  className={locale === code ? 'bg-accent' : ''}
                >
                  <span className={config.dir === 'rtl' ? 'font-mono text-sm' : ''}>{config.nativeName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{config.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border/60 bg-background" aria-label="Mobile navigation">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  size="lg"
                  className="w-full justify-start"
                >
                  {t(`nav.${item.key}`, locale)}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t border-border/40 mt-4">
              <Link href="/legal" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="lg" className="w-full justify-start">
                  {t('nav.legal', locale)}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
