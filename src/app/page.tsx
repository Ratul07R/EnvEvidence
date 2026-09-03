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
  TrendingUp, Database, Zap,
} from 'lucide-react';

const DOMAINS = [
  { slug: 'water', icon: Droplets, color: '#0ea5e9', href: '/environment/water' },
  { slug: 'air', icon: Wind, color: '#f59e0b', href: '/environment/air' },
  { slug: 'carbon', icon: Leaf, color: '#10b981', href: '/environment/carbon-climate' },
  { slug: 'plastic', icon: Recycle, color: '#8b5cf6', href: '/environment/plastic-microplastic' },
  { slug: 'chemical', icon: FlaskConical, color: '#ef4444', href: '/environment/chemical-pollution' },
  { slug: 'industrial', icon: Factory, color: '#64748b', href: '/environment/industrial' },
  { slug: 'research', icon: BookOpen, color: '#3b82f6', href: '/research' },
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Environmental Intelligence Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              {t('brand.name', locale)}
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 font-semibold mb-4">
              {t('home.hero.title', locale)}
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              {t('home.hero.subtitle', locale)}
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-card border-2 border-border/50 rounded-2xl shadow-lg hover:border-primary/30 transition-colors">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t('home.search.placeholder', locale)}
                  className="h-14 pl-14 pr-32 text-base rounded-2xl border-0 bg-transparent focus-visible:ring-0"
                  aria-label="Search environmental intelligence"
                />
                <Button
                  type="submit"
                  className="absolute right-2 h-10 px-6 rounded-xl"
                >
                  {t('home.search.button', locale)}
                </Button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">7</div>
                <div className="text-xs text-muted-foreground">Environmental Domains</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">Real</div>
                <div className="text-xs text-muted-foreground">Public Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">6</div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Intelligence Domains */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.domains.title', locale)}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.domains.subtitle', locale)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map((domain) => {
              const IconComp = domain.icon;
              return (
                <Link key={domain.slug} href={domain.href} className="group">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${domain.color}15` }}
                      >
                        <IconComp className="h-7 w-7" style={{ color: domain.color }} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {t(`cat.${domain.slug}`, locale)}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`cat.${domain.slug}.desc`, locale)}
                      </p>
                      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
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
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.trust.title', locale)}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on principles of transparency, provenance, and scientific integrity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Database, title: 'Complete Provenance', desc: 'Every data point traces to its original source with full citation, methodology, and processing history.' },
              { icon: CheckCircle2, title: 'Evidence-First', desc: 'We never fabricate environmental data. If evidence is unavailable, we explicitly state the data gap.' },
              { icon: Shield, title: 'Quality Assurance', desc: 'Multi-tier validation, deduplication, and confidence scoring ensure data reliability.' },
              { icon: Layers, title: 'Transparent Gaps', desc: 'We show what is NOT known — data gaps are features, not failures to hide.' },
              { icon: Globe, title: 'Global Coverage', desc: 'Available in 6 languages while preserving scientific accuracy and source integrity.' },
              { icon: TrendingUp, title: 'Real-Time Updates', desc: 'Automated ingestion from trusted sources with regular updates and health monitoring.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional CTA */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:p-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{t('professional.title', locale)}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              {t('professional.subtitle', locale)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/professional">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('common.learn_more', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/methodology">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Methodology
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
