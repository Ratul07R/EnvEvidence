'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search, MapPin, FlaskConical, BookOpen, Tag, ArrowRight } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

type FilterTab = 'all' | 'location' | 'evidence' | 'research' | 'topic';

function SearchPageInner() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  const filtered = activeTab === 'all'
    ? results
    : results.filter((r) => r.type === activeTab);

  const grouped = {
    location: filtered.filter((r) => r.type === 'location'),
    evidence: filtered.filter((r) => r.type === 'evidence'),
    research: filtered.filter((r) => r.type === 'research'),
    topic: filtered.filter((r) => r.type === 'topic'),
  };

  const getResultLink = (r: SearchResult) => {
    switch (r.type) {
      case 'location': return `/location/${r.slug}`;
      case 'evidence': return `/evidence/${r.id}`;
      case 'research': return `/research?q=${encodeURIComponent(r.title)}`;
      case 'topic': return `/environment/${r.slug}`;
      default: return '#';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4 text-foreground/60" />;
      case 'evidence': return <FlaskConical className="h-4 w-4 text-foreground/60" />;
      case 'research': return <BookOpen className="h-4 w-4 text-foreground/60" />;
      case 'topic': return <Tag className="h-4 w-4 text-foreground/60" />;
      default: return <Search className="h-4 w-4 text-foreground/60" />;
    }
  };

  const confidenceColor = (level?: string) => {
    switch (level) {
      case 'HIGH': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'UNVERIFIED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderResultCard = (r: SearchResult) => (
    <Link key={`${r.type}-${r.id || r.slug}`} href={getResultLink(r)} className="block group">
      <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{getResultIcon(r.type)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{r.title}</h3>
              {r.confidence && (
                <Badge variant="outline" className={`text-[10px] ${confidenceColor(r.confidence)}`}>
                  {t(`confidence.${r.confidence.toLowerCase()}`, locale)}
                </Badge>
              )}
              {r.category && (
                <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
              )}
            </div>
            {(r.description || r.date) && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {r.description}{r.description && r.date ? ' · ' : ''}{r.date}
              </p>
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );

  const renderGroup = (title: string, items: SearchResult[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{title}</h2>
        <div className="grid gap-3">
          {items.map(renderResultCard)}
        </div>
      </section>
    );
  };

  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: t('search.filter_all', locale), count: results.length },
    { value: 'location', label: t('search.filter_locations', locale), count: grouped.location.length },
    { value: 'evidence', label: t('search.filter_evidence', locale), count: grouped.evidence.length },
    { value: 'research', label: t('search.filter_research', locale), count: grouped.research.length },
    { value: 'topic', label: t('search.filter_topics', locale), count: grouped.topic.length },
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('search.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('search.title', locale)}</h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            {t('search.results_for', locale)}: <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {loading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent></Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <section className="text-center py-16">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-medium text-muted-foreground">{t('search.no_results', locale)}</h2>
            </section>
          )}

          {!loading && activeTab === 'all' && (
            <>
              {renderGroup(t('search.filter_locations', locale), grouped.location)}
              {renderGroup(t('search.filter_evidence', locale), grouped.evidence)}
              {renderGroup(t('search.filter_research', locale), grouped.research)}
              {renderGroup(t('search.filter_topics', locale), grouped.topic)}
            </>
          )}

          {!loading && activeTab !== 'all' && (
            <div className="grid gap-3">
              {filtered.map(renderResultCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </article>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12"><Skeleton className="h-8 w-48" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}
