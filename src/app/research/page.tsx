'use client';

import { useState, useEffect, useCallback, type FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search, ExternalLink, BookOpen, Users, Calendar, Building2 } from 'lucide-react';
import type { ResearchItem } from '@/lib/types';

function ResearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  const fetchResearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const url = `/api/research${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setResults(Array.isArray(json) ? json : json.results || json.items || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      fetchResearch(initialQuery);
    }
  }, [initialQuery, fetchResearch]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/research?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('research.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('research.title', locale)}</h1>
        <p className="mt-2 text-muted-foreground">{t('research.subtitle', locale)}</p>
      </header>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="mb-8 relative max-w-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', locale)}
            className="h-10 pl-10 pr-24 text-sm rounded-lg"
            aria-label="Search research"
          />
          <Button type="submit" size="sm" className="absolute right-1.5 h-7 px-3">
            {t('common.search', locale)}
          </Button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-3" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent></Card>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <section className="text-center py-16">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-medium text-muted-foreground">{t('research.no_results', locale)}</h2>
        </section>
      )}

      {!loading && results.length > 0 && (
        <section>
          <div className="grid gap-4">
            {results.map((item) => (
              <article key={item.id}>
                <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="p-5">
                    <h2 className="font-medium text-sm leading-snug mb-3">
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {item.title}
                          <ExternalLink className="inline h-3 w-3 ml-1 text-muted-foreground" />
                        </a>
                      ) : (
                        item.title
                      )}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {item.authors && item.authors.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.authors.join(', ')}
                        </span>
                      )}
                      {item.journal && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {item.journal}
                        </span>
                      )}
                      {item.publicationDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.publicationDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      {item.doi && (
                        <a
                          href={`https://doi.org/${item.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          DOI: {item.doi}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {t('research.view_paper', locale)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && !searched && (
        <section className="text-center py-16">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm">{t('research.subtitle', locale)}</p>
        </section>
      )}
    </article>
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={
      <article className="mx-auto max-w-5xl px-4 py-12"><Skeleton className="h-8 w-48" /></article>
    }>
      <ResearchPageInner />
    </Suspense>
  );
}
