'use client';

import { useState } from 'react';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Droplets, Wind, Leaf, Recycle, FlaskConical, Factory, BookOpen, ArrowRight,
} from 'lucide-react';

const DOMAIN_CARDS = [
  { slug: 'water', href: '/environment/water', icon: Droplets, color: '#0e7490', labelKey: 'cat.water', descKey: 'cat.water.desc' },
  { slug: 'air', href: '/environment/air', icon: Wind, color: '#b45309', labelKey: 'cat.air', descKey: 'cat.air.desc' },
  { slug: 'carbon', href: '/environment/carbon-climate', icon: Leaf, color: '#15803d', labelKey: 'cat.carbon', descKey: 'cat.carbon.desc' },
  { slug: 'plastic', href: '/environment/plastic-microplastic', icon: Recycle, color: '#7c3aed', labelKey: 'cat.plastic', descKey: 'cat.plastic.desc' },
  { slug: 'chemical', href: '/environment/chemical-pollution', icon: FlaskConical, color: '#dc2626', labelKey: 'cat.chemical', descKey: 'cat.chemical.desc' },
  { slug: 'industrial', href: '/environment/industrial', icon: Factory, color: '#475569', labelKey: 'cat.industrial', descKey: 'cat.industrial.desc' },
  { slug: 'research', href: '/research', icon: BookOpen, color: '#1d4ed8', labelKey: 'cat.research', descKey: 'cat.research.desc' },
];

export default function TopicsPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">{t('brand.name', locale)}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('topics.title', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('topics.title', locale)}</h1>
        <p className="mt-2 text-muted-foreground">{t('topics.subtitle', locale)}</p>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAIN_CARDS.map((domain) => {
            const IconComp = domain.icon;
            return (
              <Link key={domain.slug} href={domain.href} className="group block">
                <Card className="h-full transition-colors hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="p-5 flex gap-4">
                    <div
                      className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${domain.color}14` }}
                    >
                      <IconComp className="h-5 w-5" style={{ color: domain.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                        {t(domain.labelKey, locale)}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {t(domain.descKey, locale)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}
