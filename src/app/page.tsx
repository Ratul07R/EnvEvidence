'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  Droplets, Wind, Leaf, Recycle, FlaskConical, Factory,
  BookOpen, Search, ArrowRight, CheckCircle2, Shield, Globe, Layers,
} from 'lucide-react';

const DOMAINS = [
  { slug: 'water', icon: Droplets, color: '#0e7490', href: '/environment/water' },
  { slug: 'air', icon: Wind, color: '#b45309', href: '/environment/air' },
  { slug: 'carbon', icon: Leaf, color: '#15803d', href: '/environment/carbon-climate' },
  { slug: 'plastic', icon: Recycle, color: '#7c3aed', href: '/environment/plastic-microplastic' },
  { slug: 'chemical', icon: FlaskConical, color: '#dc2626', href: '/environment/chemical-pollution' },
  { slug: 'industrial', icon: Factory, color: '#475569', href: '/environment/industrial' },
  { slug: 'research', icon: BookOpen, color: '#1d4ed8', href: '/research' },
];

export default function HomePage() {
  const router = useRouter();
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {t('brand.name', locale)}
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-foreground/80 font-medium">
              {t('home.hero.title', locale)}
            </p>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('home.hero.subtitle', locale)}
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mt-8 md:mt-10 relative max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t('home.search.placeholder', locale)}
                  className="h-13 pl-12 pr-4 md:pr-28 text-base rounded-xl border-border/80 bg-card shadow-sm"
                  aria-label="Search environmental intelligence"
                />
                <Button
                  type="submit"
                  className="absolute right-2 h-9 px-5 rounded-lg"
                >
                  {t('home.search.button', locale)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Environmental Intelligence Domains */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-3">
            {t('home.domains.title', locale)}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto text-sm">
            {t('home.domains.subtitle', locale)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAINS.map((domain) => {
              const IconComp = domain.icon;
              return (
                <Link key={domain.slug} href={domain.href} className="text-left group">
                  <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-sm">
                    <CardContent className="p-5 flex gap-4">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${domain.color}14` }}
                      >
                        <IconComp className="h-5 w-5" style={{ color: domain.color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {t(`cat.${domain.slug}`, locale)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {t(`cat.${domain.slug}.desc`, locale)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-10">
            {t('home.trust.title', locale)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: t('home.trust.evidence', locale), desc: 'Every data point can be traced to its original source with full citation and link.' },
              { icon: Shield, title: t('home.trust.provenance', locale), desc: 'Complete data lineage including methodology, collection date, and processing history.' },
              { icon: Layers, title: t('home.trust.gaps', locale), desc: 'We explicitly show what is NOT known — data gaps are a feature, not a failure.' },
              { icon: Globe, title: t('home.trust.multilingual', locale), desc: 'Available in 6 languages while preserving scientific accuracy and source integrity.' },
              { icon: BookOpen, title: t('home.trust.no_fabrication', locale), desc: 'We never fabricate environmental data. If evidence is unavailable, we say so.' },
              { icon: Shield, title: t('home.trust.distinguish', locale), desc: 'Evidence is always distinguished from inference. Proximity never implies causation.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="rounded-xl border border-border/60 bg-card p-8 md:p-12 text-center">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{t('professional.title', locale)}</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('professional.subtitle', locale)}
            </p>
            <Link href="/professional">
              <Button variant="outline" className="mt-6">
                {t('common.learn_more', locale)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
