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
  ShieldCheck, Database, Scale, AlertTriangle, Eye, ExternalLink, Info,
} from 'lucide-react';

const LEGAL_SECTIONS = [
  {
    key: 'legal.no_fabrication',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    detail: 'EnvEvidence does not generate, fabricate, or hallucinate environmental data. All evidence records are sourced from publicly accessible, verifiable sources. Where data is unavailable, the platform explicitly states the absence rather than constructing plausible but unverified values.',
  },
  {
    key: 'legal.public_info',
    icon: Database,
    color: 'text-foreground',
    detail: 'All data presented on this platform is sourced from publicly accessible information, including government monitoring stations, academic publications, international databases, and open data portals. No proprietary, classified, or non-public information is used without proper authorization.',
  },
  {
    key: 'legal.licenses',
    icon: Scale,
    color: 'text-foreground',
    detail: 'EnvEvidence respects all source licenses and attribution requirements. Data from Creative Commons, Open Government Data, and similar open licenses is used in strict compliance with their terms. Commercial use restrictions are tracked and noted per record.',
  },
  {
    key: 'legal.proximity',
    icon: AlertTriangle,
    color: 'text-amber-600',
    detail: 'Environmental proximity does not prove causation. The presence of an industrial facility near a water body does not establish that the facility caused any observed contamination. Correlation and causation are distinguished in all intelligence summaries.',
  },
  {
    key: 'legal.absence',
    icon: Eye,
    color: 'text-foreground',
    detail: 'Data gaps do not prove the absence of environmental problems. A lack of monitoring data for a parameter at a location reflects insufficient data collection, not a clean bill of environmental health. Users should exercise caution when interpreting absence of evidence.',
  },
  {
    key: 'legal.verify',
    icon: ExternalLink,
    color: 'text-foreground',
    detail: 'Users are strongly encouraged to verify critical information with original sources. EnvEvidence provides direct links to source data wherever possible. For regulatory, legal, or health-critical decisions, original source verification is essential.',
  },
  {
    key: 'legal.not_advice',
    icon: Info,
    color: 'text-foreground',
    detail: 'This platform is not a substitute for regulatory, legal, medical, engineering, or environmental professional advice where such advice is required. Environmental intelligence should be used as one input among many for decision-making, not as a definitive assessment.',
  },
];

export default function LegalPage() {
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
            <BreadcrumbPage>{t('nav.legal', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('legal.title', locale)}</h1>
      </header>

      <div className="grid gap-6">
        {LEGAL_SECTIONS.map((section) => {
          const IconComp = section.icon;
          return (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComp className={`h-5 w-5 ${section.color}`} />
                  {t(section.key, locale)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.detail}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-8" />

      <footer className="text-center">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('legal.disclaimer', locale)}</p>
          </CardContent>
        </Card>
      </footer>
    </article>
  );
}
