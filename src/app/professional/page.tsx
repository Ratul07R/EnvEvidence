'use client';

import { useState, type FormEvent } from 'react';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText, Brain, BarChart3, Map, BookOpen, Send, CheckCircle2, Info,
} from 'lucide-react';

const SERVICES = [
  { key: 'professional.reports', icon: FileText, desc: 'Comprehensive research reports on specific environmental locations, parameters, or topics with full provenance and source citations.' },
  { key: 'professional.intelligence', icon: Brain, desc: 'Custom intelligence briefings combining evidence, data gaps, and trend analysis for strategic environmental decision-making.' },
  { key: 'professional.analysis', icon: BarChart3, desc: 'In-depth data analysis of environmental datasets including statistical summaries, trend identification, and comparative assessments.' },
  { key: 'professional.mapping', icon: Map, desc: 'Evidence mapping for specific geographic areas, identifying all available data sources, coverage, and critical data gaps.' },
  { key: 'professional.support', icon: BookOpen, desc: 'Research support for academic, regulatory, or organizational environmental investigations with methodology guidance.' },
];

const SERVICE_TYPES = [
  'professional.reports',
  'professional.intelligence',
  'professional.analysis',
  'professional.mapping',
  'professional.support',
];

export default function ProfessionalPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('envevidence-locale') as Locale | null;
      if (saved && ['en', 'bn', 'zh', 'ja', 'ar', 'ru'].includes(saved)) return saved;
    }
    return 'en';
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    serviceType: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      // Silently handle — user sees no change
    } finally {
      setSubmitting(false);
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
            <BreadcrumbPage>{t('nav.professional', locale)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('professional.title', locale)}</h1>
        <p className="mt-2 text-muted-foreground">{t('professional.subtitle', locale)}</p>
      </header>

      {/* Services Grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((svc) => {
            const IconComp = svc.icon;
            return (
              <Card key={svc.key} className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconComp className="h-4 w-4 text-primary" />
                    {t(svc.key, locale)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{svc.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Inquiry Form */}
      <section>
        <h2 className="text-lg font-semibold mb-6">{t('professional.inquiry_title', locale)}</h2>

        {submitted ? (
          <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 mb-3" />
              <h3 className="font-medium">Inquiry Submitted</h3>
              <p className="text-sm text-muted-foreground mt-2">{t('professional.inquiry_note', locale)}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('professional.inquiry_name', locale)}</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{t('professional.inquiry_email', locale)}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="org">{t('professional.inquiry_org', locale)}</Label>
                  <Input
                    id="org"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">{t('professional.inquiry_type', locale)}</Label>
                  <Select value={form.serviceType} onValueChange={(v) => setForm({ ...form, serviceType: v })}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((st) => (
                        <SelectItem key={st} value={st}>{t(st, locale)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">{t('professional.inquiry_message', locale)}</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="text-sm resize-none"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="mt-2">
                  <Send className="h-4 w-4 mr-2" />
                  {t('professional.inquiry_submit', locale)}
                </Button>

                <div className="flex items-start gap-2 mt-1">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{t('professional.inquiry_note', locale)}</p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </article>
  );
}
