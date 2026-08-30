'use client';

import { useState, useEffect, useCallback } from 'react';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  Lock, Database, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { SourceRegistry } from '@/lib/types';

export default function AdminPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [sources, setSources] = useState<SourceRegistry[]>([]);
  const [loading, setLoading] = useState(false);


  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const json = await res.json();
        setSources(Array.isArray(json) ? json : json.sources || []);
      }
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (password === adminPassword) {
      setAuthenticated(true);
      setAuthError(false);
      fetchSources();
    } else {
      setAuthError(true);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'degraded': case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error': case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const healthyCount = sources.filter((s) => s.status === 'active' || s.status === 'healthy').length;
  const failedCount = sources.filter((s) => s.status === 'error' || s.status === 'failed').length;

  // Auth Gate
  if (!authenticated) {
    return (
      <article className="mx-auto max-w-md px-4 py-16 md:py-24">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">{t('admin.title', locale)}</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
              placeholder="Password"
              className="h-10"
              autoFocus
              aria-label="Admin password"
            />
            {authError && (
              <p className="text-xs text-destructive mt-1.5">Invalid password. Please try again.</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {t('admin.title', locale)}
          </Button>
        </form>
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
            <BreadcrumbPage>{t('admin.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('admin.title', locale)}</h1>
        <Button variant="outline" size="sm" onClick={() => setAuthenticated(false)}>
          <Lock className="h-3.5 w-3.5 mr-1.5" />
          Lock
        </Button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin.sources', locale)}</p>
              <p className="text-lg font-bold">{sources.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin.healthy', locale)}</p>
              <p className="text-lg font-bold text-emerald-600">{healthyCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin.failed_checks', locale)}</p>
              <p className="text-lg font-bold text-red-600">{failedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('admin.freshness', locale)}</p>
              <p className="text-lg font-bold">{t('admin.monitoring', locale)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Registry Health */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('admin.sources', locale)}</h2>

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!loading && sources.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t('sources.no_sources', locale)}</p>
            </CardContent>
          </Card>
        )}

        {!loading && sources.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sources.name', locale)}</TableHead>
                    <TableHead>{t('sources.publisher', locale)}</TableHead>
                    <TableHead>{t('sources.status', locale)}</TableHead>
                    <TableHead>{t('admin.last_update', locale)}</TableHead>
                    <TableHead>{t('sources.frequency', locale)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((src) => (
                    <TableRow key={src.id}>
                      <TableCell className="font-medium text-sm">{src.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{src.provider || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusColor(src.status)}`}>
                          {src.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {src.lastSuccessfulFetch || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {src.updateFrequency || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Verification Status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('admin.verification', locale)}</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t('admin.monitoring', locale)}</p>
          </CardContent>
        </Card>
      </section>

      {/* Data Freshness */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('admin.freshness', locale)}</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t('admin.monitoring', locale)}</p>
          </CardContent>
        </Card>
      </section>

      {/* Ingestion Logs */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t('admin.ingestion', locale)}</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t('admin.monitoring', locale)}</p>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
