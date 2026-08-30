'use client';

import { useState } from 'react';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Search, Download, ShieldCheck, Layers, GitBranch,
  BarChart3, Brain, Globe, AlertTriangle, Sparkles, Info,
} from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'methodology.discovery', icon: Search },
  { key: 'methodology.collection', icon: Download },
  { key: 'methodology.validation', icon: ShieldCheck },
  { key: 'methodology.normalization', icon: Layers },
  { key: 'methodology.provenance', icon: GitBranch },
  { key: 'methodology.analysis', icon: BarChart3 },
  { key: 'methodology.intelligence', icon: Brain },
  { key: 'methodology.publication', icon: Globe },
];

export default function MethodologyPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('methodology.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('methodology.title', locale)}</h1>
        <p className="mt-2 text-muted-foreground">{t('methodology.subtitle', locale)}</p>
      </header>

      {/* Intelligence Pipeline */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-6">{t('methodology.pipeline', locale)}</h2>
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div key={step.key} className="relative">
                  <Card className="text-center h-full">
                    <CardContent className="p-4 flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <IconComp className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium mb-1">STEP {idx + 1}</span>
                      <h3 className="text-sm font-medium">{t(step.key, locale)}</h3>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* What is Evidence? */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {t('methodology.evidence_explained', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.evidence_def', locale)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* What is Inference? */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t('methodology.inference_explained', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.inference_def', locale)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How is Confidence Determined? */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('methodology.confidence_explained', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.confidence_factors', locale)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Data Gaps */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-foreground" />
              {t('methodology.data_gaps_explained', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.data_gaps_def', locale)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* AI Role */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              AI Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.ai_role', locale)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <Card className="border-amber-200 dark:border-amber-800/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t('methodology.limitations', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('methodology.limitations_text', locale)}
            </p>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
