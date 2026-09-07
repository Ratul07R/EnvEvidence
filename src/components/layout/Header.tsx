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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#0A0A0A]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
          aria-label={t('nav.explore', locale)}
        >
          <div className="h-8 w-8 text-emerald-400">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C8.268 4 2 10.268 2 18C2 25.732 8.268 32 16 32C23.732 32 30 25.732 30 18C30 10.268 23.732 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14L16 18L20 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="24" r="2" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white hidden sm:block font-['Plus_Jakarta_Sans',sans-serif]">
            EnvEvidence
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                size="sm"
                className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                {t(`nav.${item.key}`, locale)}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5" aria-label="Select language">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{localeConfig[locale].nativeName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10">
              {(Object.entries(localeConfig) as [Locale, typeof localeConfig.en][]).map(([code, config]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLocaleChange(code)}
                  className={locale === code ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                >
                  <span className={config.dir === 'rtl' ? 'font-mono text-sm' : ''}>{config.nativeName}</span>
                  <span className="ml-2 text-xs text-gray-500">{config.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 bg-[#0A0A0A]" aria-label="Mobile navigation">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  size="lg"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {t(`nav.${item.key}`, locale)}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-4">
              <Link href="/legal" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="lg" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
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
