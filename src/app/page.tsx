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
  TrendingUp, Database, Zap, MapPin, BarChart3, Building2, Users, Award,
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

const TRUST_ICONS = [
  { icon: Building2, name: 'Universities' },
  { icon: Users, name: 'Researchers' },
  { icon: Award, name: 'Institutions' },
  { icon: Shield, name: 'Government' },
  { icon: Globe, name: 'Global' },
  { icon: Database, name: 'Data Science' },
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
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Premium Dark Background with Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-emerald-500/15 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-40 md:pt-48 md:pb-52 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-10">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300 tracking-wide">ENVIRONMENTAL EVIDENCE & INTELLIGENCE</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
              EnvEvidence
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 font-medium mb-6 tracking-wide">
              Environmental Evidence + Intelligence
            </p>
            
            {/* Description */}
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
              Evidence-backed environmental intelligence with transparent sources, confidence levels, provenance, and documented data gaps.
            </p>

            {/* Premium Search Box with Glassmorphism */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16">
              <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl hover:border-emerald-500/30 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/10">
                <Search className="absolute left-5 h-5 w-5 text-gray-500 pointer-events-none" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search environmental evidence, locations, research..."
                  className="h-16 pl-14 pr-40 text-base rounded-2xl border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-gray-500"
                  aria-label="Search environmental intelligence"
                />
                <Button
                  type="submit"
                  className="absolute right-2 h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mb-16">
              <p className="text-sm text-gray-500 mb-6 tracking-wide">Trusted by researchers and environmentalists</p>
              <div className="flex items-center justify-center gap-8 md:gap-12">
                {TRUST_ICONS.map((trust, i) => {
                  const IconComp = trust.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <IconComp className="h-5 w-5" />
                      <span className="text-xs font-medium">{trust.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">7</div>
                <div className="text-sm text-gray-500 tracking-wide">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">Real</div>
                <div className="text-sm text-gray-500 tracking-wide">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">6</div>
                <div className="text-sm text-gray-500 tracking-wide">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Intelligence Domains */}
      <section className="py-32 bg-[#0A0A0A] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Environmental Intelligence Domains
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Explore evidence-backed data across environmental domains
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map((domain) => {
              const IconComp = domain.icon;
              return (
                <Link key={domain.slug} href={domain.href} className="group">
                  <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/30 hover:-translate-y-1 bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${domain.color}20` }}
                      >
                        <IconComp className="h-7 w-7" style={{ color: domain.color }} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-emerald-400 transition-colors">
                        {t(`cat.${domain.slug}`, locale)}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {t(`cat.${domain.slug}.desc`, locale)}
                      </p>
                      <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Evidence-First Principles */}
      <section className="py-32 bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Evidence-First Principles
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
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
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <item.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-32 bg-[#0F0F0F] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Platform Capabilities
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Professional environmental intelligence for research, compliance, and decision-making
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <MapPin className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-white">Location Intelligence</h3>
                <p className="text-sm text-gray-500">Environmental evidence for specific locations with historical context and trends</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BarChart3 className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-white">Evidence Analytics</h3>
                <p className="text-sm text-gray-500">Statistical analysis and confidence assessment of environmental measurements</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-white">Research Discovery</h3>
                <p className="text-sm text-gray-500">Environmental research intelligence with open access metadata and citations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional CTA */}
      <section className="py-32 bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-8 md:p-16 text-center backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">{t('professional.title', locale)}</h2>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
              {t('professional.subtitle', locale)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/professional">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
                  {t('common.learn_more', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/methodology">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium transition-all duration-300">
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
