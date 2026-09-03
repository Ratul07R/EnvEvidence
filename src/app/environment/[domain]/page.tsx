'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Droplets,
  Wind,
  Leaf,
  Recycle,
  FlaskConical,
  Factory,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

type EvidenceView = {
  id: string;
  type?: string;
  title?: string | null;
  claim?: string | null;
  value?: string | null;
  unit?: string | null;
  confidence?: string | null;
  date?: string | null;
  observationDate?: string | null;
  location?: {
    name: string;
    slug: string;
  } | null;
  parameter?: {
    name: string;
    unit?: string | null;
  } | null;
  category?: string | null;
  categorySlug?: string | null;
};

type DataGap = {
  id: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  description?: string | null;
};

const DOMAIN_META: Record<
  string,
  { icon: typeof Droplets; labelKey: string; descKey: string }
> = {
  water: {
    icon: Droplets,
    labelKey: 'cat.water',
    descKey: 'cat.water.desc',
  },
  air: {
    icon: Wind,
    labelKey: 'cat.air',
    descKey: 'cat.air.desc',
  },
  'carbon-climate': {
    icon: Leaf,
    labelKey: 'cat.carbon',
    descKey: 'cat.carbon.desc',
  },
  'plastic-microplastic': {
    icon: Recycle,
    labelKey: 'cat.plastic',
    descKey: 'cat.plastic.desc',
  },
  'chemical-pollution': {
    icon: FlaskConical,
    labelKey: 'cat.chemical',
    descKey: 'cat.chemical.desc',
  },
  industrial: {
    icon: Factory,
    labelKey: 'cat.industrial',
    descKey: 'cat.industrial.desc',
  },
  research: {
    icon: BookOpen,
    labelKey: 'cat.research',
    descKey: 'cat.research.desc',
  },
};

function DomainPageInner() {
  const params = useParams();
  const domain = params.domain as string;

  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;

      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) {
        return saved;
      }
    }

    return 'en';
  });

  const [evidence, setEvidence] = useState<EvidenceView[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [searchRes, gapsRes] = await Promise.all([
        fetch(
          `/api/search?type=evidence&category=${encodeURIComponent(domain)}`,
          { cache: 'no-store' }
        ),
        fetch(
          `/api/data-gaps?category=${encodeURIComponent(domain)}`,
          { cache: 'no-store' }
        ),
      ]);

      if (searchRes.ok) {
        const json = await searchRes.json();

        const results: EvidenceView[] = Array.isArray(json.results)
          ? json.results
          : [];

        setEvidence(results);
      } else {
        setEvidence([]);
      }

      if (gapsRes.ok) {
        const json = await gapsRes.json();

        setDataGaps(
          Array.isArray(json.gaps) ? json.gaps : []
        );
      } else {
        setDataGaps([]);
      }
    } catch (error) {
      console.error('Domain data fetch error:', error);
      setEvidence([]);
      setDataGaps([]);
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const meta = DOMAIN_META[domain] || {
    icon: Droplets,
    labelKey: 'topics.title',
    descKey: 'topics.subtitle',
  };

  const IconComp = meta.icon;

  const confidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'UNVERIFIED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const evidenceTypeColor = (type?: string) => {
    switch (type) {
      case 'measured': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'modeled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'estimated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'reported': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'inferred': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const evidenceTypeLabel = (type?: string) => {
    switch (type) {
      case 'measured': return 'Measured';
      case 'modeled': return 'Modelled';
      case 'estimated': return 'Estimated';
      case 'reported': return 'Reported';
      case 'inferred': return 'Inferred';
      default: return 'Unknown';
    }
  };

  const evidenceByLocation = evidence.reduce<
    Record<string, EvidenceView[]>
  >((acc, ev) => {
    const locKey = ev.location?.slug || '_none';

    if (!acc[locKey]) {
      acc[locKey] = [];
    }

    acc[locKey].push(ev);
    return acc;
  }, {});

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                {t('brand.name', locale)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/topics">
                {t('topics.title', locale)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>
              {t(meta.labelKey, locale)}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconComp className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t(meta.labelKey, locale)}
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground mt-1">
          {t(meta.descKey, locale)}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">
          {t('evidence.provenance', locale)}
        </h2>

        {loading && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-xl"
              />
            ))}
          </div>
        )}

        {!loading && evidence.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />

              <p className="text-sm text-muted-foreground">
                {t('evidence.no_evidence', locale)}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && evidence.length > 0 && (
          <div className="grid gap-3">
            {evidence.map((ev) => {
              const displayTitle =
                ev.title ||
                ev.claim ||
                `${ev.parameter?.name || 'Measurement'}: ${
                  ev.value || 'N/A'
                } ${ev.unit || ev.parameter?.unit || ''}`;

              const displayDate =
                ev.date || ev.observationDate || null;

              const confidence =
                ev.confidence || 'UNVERIFIED';

              return (
                <Link
                  key={ev.id}
                  href={`/evidence/${ev.id}`}
                  className="block group"
                >
                  <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {displayTitle}
                          </h3>

                          {ev.type && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${evidenceTypeColor(ev.type)}`}
                            >
                              {evidenceTypeLabel(ev.type)}
                            </Badge>
                          )}

                          <Badge
                            variant="outline"
                            className={`text-[10px] ${confidenceColor(
                              confidence
                            )}`}
                          >
                            {t(
                              `confidence.${confidence.toLowerCase()}`,
                              locale
                            )}
                          </Badge>
                        </div>

                        {ev.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ev.location.name}
                          </p>
                        )}

                        {displayDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {displayDate}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {!loading &&
        Object.keys(evidenceByLocation).length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">
              Locations
            </h2>

            <div className="flex flex-wrap gap-2">
              {Object.entries(evidenceByLocation).map(
                ([locSlug, items]) => (
                  <Link
                    key={locSlug}
                    href={
                      locSlug === '_none'
                        ? '#'
                        : `/location/${locSlug}`
                    }
                    className="block"
                  >
                    <Badge
                      variant="outline"
                      className="text-xs hover:bg-accent cursor-pointer"
                    >
                      {items[0]?.location?.name || locSlug}

                      <span className="ml-1 text-muted-foreground">
                        ({items.length})
                      </span>
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">
          {t('location.data_gaps', locale)}
        </h2>

        {loading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : dataGaps.length > 0 ? (
          <div className="grid gap-3">
            {dataGaps.map((gap) => (
              <Card key={gap.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {gap.categoryName ||
                        gap.categorySlug ||
                        'Data Gap'}
                    </p>

                    {gap.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {gap.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('gaps.absence_note', locale)}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </article>
  );
}

export default function DomainPage() {
  return (
    <Suspense
      fallback={
        <article className="mx-auto max-w-6xl px-4 py-12">
          <Skeleton className="h-8 w-48" />
        </article>
      }
    >
      <DomainPageInner />
    </Suspense>
  );
}