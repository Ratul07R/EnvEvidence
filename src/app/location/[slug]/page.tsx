'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MapPin, Droplets, Wind, Leaf, Recycle, FlaskConical, Factory, BookOpen, ArrowRight, AlertTriangle } from 'lucide-react';
import type { Location, EvidenceRecord, DataGap, TimelineEvent } from '@/lib/types';

const DOMAIN_CATEGORIES = [
  { slug: 'water', icon: Droplets, label: 'cat.water' },
  { slug: 'air', icon: Wind, label: 'cat.air' },
  { slug: 'carbon', icon: Leaf, label: 'cat.carbon' },
  { slug: 'plastic', icon: Recycle, label: 'cat.plastic' },
  { slug: 'chemical', icon: FlaskConical, label: 'cat.chemical' },
  { slug: 'industrial', icon: Factory, label: 'cat.industrial' },
  { slug: 'research', icon: BookOpen, label: 'cat.research' },
];

interface LocationApiResponse {
  location?: Location;
  evidence?: EvidenceRecord[];
  dataGaps?: DataGap[];
  timeline?: TimelineEvent[];
}

function LocationPageInner() {
  const params = useParams();
  const slug = params.slug as string;

  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [data, setData] = useState<LocationApiResponse>({});
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/locations?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const location = data.location;
  const evidence = data.evidence || [];
  const dataGaps = data.dataGaps || [];
  const timeline = data.timeline || [];

  // Group evidence by category
  const evidenceByCategory = DOMAIN_CATEGORIES.map((cat) => {
    const items = evidence.filter((e) => e.category?.slug === cat.slug);
    return { ...cat, items };
  });

  const confidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'UNVERIFIED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/topics">{t('nav.topics', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{location?.name || slug}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{location?.name || slug}</h1>
        {location && (
          <p className="mt-2 text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {[location.city, location.region, location.country].filter(Boolean).join(', ')}
          </p>
        )}
        {location?.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">{location.description}</p>
        )}
      </header>

      {/* Evidence Coverage by Domain */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('location.evidence_coverage', locale)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidenceByCategory.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Card key={cat.slug} className="transition-colors hover:border-primary/20">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconComp className="h-4 w-4 text-muted-foreground" />
                    {t(cat.label, locale)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cat.items.length > 0 ? (
                    <div className="text-2xl font-bold">{cat.items.length}</div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('location.no_evidence', locale)}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Data Gaps */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t('location.data_gaps', locale)}</h2>
        {dataGaps.length > 0 ? (
          <div className="grid gap-3">
            {dataGaps.map((gap) => (
              <Card key={gap.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{gap.categoryName || gap.categorySlug}</p>
                    {gap.description && (
                      <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                    )}
                    {gap.gapLevel && (
                      <Badge variant="outline" className="mt-2 text-[10px]">{gap.gapLevel}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p>{t('gaps.absence_note', locale)}</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">{t('location.timeline', locale)}</h2>
          <div className="relative ml-3 border-l-2 border-border pl-6 space-y-6">
            {timeline.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                <p className="text-xs text-muted-foreground mb-1">{event.date || (event.year ? String(event.year) : '')}</p>
                <h3 className="text-sm font-medium">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
                {event.evidenceType && (
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    {t(`timeline.${event.evidenceType}`, locale)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evidence List */}
      {evidence.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">{t('evidence.provenance', locale)}</h2>
          <div className="grid gap-3">
            {evidence.map((ev) => (
              <Link key={ev.id} href={`/evidence/${ev.id}`} className="block group">
                <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {ev.claim || `${ev.parameter?.name || 'Measurement'}: ${ev.value || 'N/A'} ${ev.unit || ''}`}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${confidenceColor(ev.confidence)}`}>
                          {t(`confidence.${ev.confidence.toLowerCase()}`, locale)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    {ev.observationDate && (
                      <p className="text-xs text-muted-foreground mt-1">{t('evidence.date', locale)}: {ev.observationDate}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={
      <article className="mx-auto max-w-6xl px-4 py-12"><Skeleton className="h-8 w-48" /></article>
    }>
      <LocationPageInner />
    </Suspense>
  );
}
