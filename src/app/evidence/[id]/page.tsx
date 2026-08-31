'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ExternalLink, MapPin, Calendar, FlaskConical, Gauge,
  ShieldCheck, AlertTriangle, FileSearch,
} from 'lucide-react';
import type { EvidenceRecord } from '@/lib/types';

function EvidencePageInner() {
  const params = useParams();
  const id = params.id as string;

  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/evidence/${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        setEvidence(json.evidence);
      } else if (res.status === 404) {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const confidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'LOW': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'UNVERIFIED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isVerified = evidence?.evidenceType !== 'inferred' && evidence?.evidenceType !== 'modeled';

  if (loading) {
    return (
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-8 w-24 mb-4" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </article>
    );
  }

  if (notFound || !evidence) {
    return (
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('evidence.detail', locale)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <section className="text-center py-16">
          <FileSearch className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h1 className="text-xl font-semibold text-muted-foreground">{t('evidence.evidence_not_available', locale)}</h1>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('evidence.detail', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {isVerified ? (
            <Badge className={`${confidenceColor(evidence.confidence)} border`}>
              <ShieldCheck className="h-3 w-3 mr-1" />
              {t('evidence.verified', locale)}
            </Badge>
          ) : (
            <Badge className="bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('evidence.inference', locale)}
            </Badge>
          )}
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {evidence.claim || `${evidence.parameter?.name || 'Measurement'}: ${evidence.value || 'N/A'} ${evidence.unit || ''}`}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${confidenceColor(evidence.confidence)}`}>
            {t('evidence.confidence', locale)}: {t(`confidence.${evidence.confidence.toLowerCase()}`, locale)}
          </Badge>
          {evidence.category && (
            <Badge variant="secondary" className="text-xs">{evidence.category.name}</Badge>
          )}
        </div>
      </header>

      {/* Source */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              {t('evidence.source', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">{t('sources.name', locale)}</span>
                <span className="font-medium">{evidence.source?.name || evidence.sourceTitle || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">{t('sources.publisher', locale)}</span>
                <span className="font-medium">{evidence.publisher || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">{t('common.license', locale)}</span>
                <span className="font-medium">{evidence.license || evidence.commercialUseStatus || '—'}</span>
              </div>
              {evidence.attributionRequirements && (
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">{t('sources.attribution', locale)}</span>
                  <span className="font-medium text-xs">{evidence.attributionRequirements}</span>
                </div>
              )}
            </div>
            {(evidence.sourceUrl || evidence.originalDatasetUrl) && (
              <a
                href={evidence.sourceUrl || evidence.originalDatasetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t('evidence.view_source', locale)}
              </a>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Method */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              {t('evidence.method', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {evidence.methodology && (
              <p className="text-muted-foreground">{evidence.methodology}</p>
            )}
            {evidence.measurementMethod && (
              <p className="text-muted-foreground"><span className="text-xs text-muted-foreground/70">Measurement: </span>{evidence.measurementMethod}</p>
            )}
            {!evidence.methodology && !evidence.measurementMethod && (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Date */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {t('evidence.date', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Observation</span>
                <span className="font-medium">{evidence.observationDate || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Retrieval</span>
                <span className="font-medium">{evidence.retrievalDate || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Publication</span>
                <span className="font-medium">{evidence.sourcePublicationDate || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Location & Parameter & Value */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {t('evidence.location', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {evidence.location ? (
                <div>
                  <p className="font-medium">{evidence.location.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[evidence.location.city, evidence.location.region, evidence.location.country].filter(Boolean).join(', ')}
                  </p>
                  {evidence.location.slug && (
                    <Link href={`/location/${evidence.location.slug}`} className="text-xs text-primary hover:underline mt-2 inline-block">
                      {t('common.learn_more', locale)}
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                {t('evidence.parameter', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{evidence.parameter?.name || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-muted-foreground" />
                {t('evidence.value', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{evidence.value || evidence.numericValue || '—'} {evidence.unit || ''}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      <footer className="text-xs text-muted-foreground text-center">
        <p>{t('legal.disclaimer', locale)}</p>
      </footer>
    </article>
  );
}

export default function EvidencePage() {
  return (
    <Suspense fallback={
      <article className="mx-auto max-w-4xl px-4 py-12"><Skeleton className="h-8 w-48" /></article>
    }>
      <EvidencePageInner />
    </Suspense>
  );
}
