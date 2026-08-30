'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Database, ExternalLink } from 'lucide-react';
import type { SourceRegistry } from '@/lib/types';

export default function SourcesPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [sources, setSources] = useState<SourceRegistry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const json = await res.json();
        setSources(Array.isArray(json) ? json : json.sources || []);
      } else {
        setSources([]);
      }
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'degraded': case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error': case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('sources.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('sources.title', locale)}</h1>
        <p className="mt-2 text-muted-foreground">{t('sources.subtitle', locale)}</p>
      </header>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && sources.length === 0 && (
        <section className="text-center py-16">
          <Database className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-medium text-muted-foreground">{t('sources.no_sources', locale)}</h2>
        </section>
      )}

      {!loading && sources.length > 0 && (
        <section>
          {/* Desktop table view */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sources.name', locale)}</TableHead>
                      <TableHead>{t('sources.publisher', locale)}</TableHead>
                      <TableHead>{t('common.license', locale)}</TableHead>
                      <TableHead>{t('sources.status', locale)}</TableHead>
                      <TableHead>{t('sources.coverage', locale)}</TableHead>
                      <TableHead>{t('sources.frequency', locale)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((src) => (
                      <TableRow key={src.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{src.name}</span>
                            {src.url && (
                              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{src.provider || '—'}</TableCell>
                        <TableCell className="text-sm">{src.license || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${statusColor(src.status)}`}>
                            {src.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {src.geographicCoverage || (src.dataCategories && src.dataCategories.join(', ')) || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{src.updateFrequency || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden grid gap-4">
            {sources.map((src) => (
              <Card key={src.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {src.name}
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('sources.publisher', locale)}</span>
                    <span>{src.provider || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.license', locale)}</span>
                    <span>{src.license || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('sources.status', locale)}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor(src.status)}`}>{src.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('sources.frequency', locale)}</span>
                    <span>{src.updateFrequency || '—'}</span>
                  </div>
                  {src.reliabilityNotes && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      {src.reliabilityNotes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
