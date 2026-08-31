import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  type: z.enum(['all', 'location', 'evidence', 'research', 'topic']).optional(),
  location: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = searchSchema.parse({
      q: request.nextUrl.searchParams.get('q') || undefined,
      type: request.nextUrl.searchParams.get('type') || undefined,
      location: request.nextUrl.searchParams.get('location') || undefined,
      category: request.nextUrl.searchParams.get('category') || undefined,
    });

    if (!params.q && !params.location && !params.category) {
      return NextResponse.json({ results: [], query: '', total: 0 });
    }

    const query = (params.q || '').toLowerCase();
    const typeFilter = (!params.type || params.type === 'all') ? undefined : params.type;
    const results: Array<{
      type: string; title: string; description?: string;
      slug?: string; id?: string; category?: string | null;
      confidence?: string; date?: string;
    }> = [];

    if (!typeFilter || typeFilter === 'location') {
      const locations = await prisma.location.findMany({
        where: {
          isDemo: false,
          ...(query ? { OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameBn: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
          ]} : {}),
        },
        take: 10,
      });
      for (const loc of locations) {
        results.push({ type: 'location', title: loc.name, description: loc.description || undefined, slug: loc.slug });
      }
    }

    if (!typeFilter || typeFilter === 'evidence') {
      const evidence = await prisma.evidenceRecord.findMany({
        where: {
          isDemo: false,
          ...(query ? { OR: [
            { claim: { contains: query, mode: 'insensitive' } },
            { value: { contains: query, mode: 'insensitive' } },
          ]} : {}),
        },
        take: 10,
        include: { location: true, category: true },
      });
      for (const ev of evidence) {
        results.push({
          type: 'evidence', title: ev.claim || ev.value || 'Evidence',
          description: ev.location?.name, id: ev.id,
          category: ev.category?.name ?? undefined,
          confidence: ev.confidence, date: ev.observationDate?.toISOString(),
        });
      }
    }

    if (!typeFilter || typeFilter === 'research') {
      const items = await prisma.researchItem.findMany({
        where: {
          isDemo: false,
          ...(query ? { OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
          ]} : {}),
        },
        take: 10,
      });
      for (const r of items) {
        results.push({
          type: 'research', title: r.title,
          description: r.journal ?? r.sourceName ?? undefined,
          id: r.id, category: r.topic ?? undefined,
          date: r.publicationDate?.toISOString(),
        });
      }
    }

    return NextResponse.json({ results: results.slice(0, 20), query: params.q || '', total: results.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid search parameters', results: [], query: '', total: 0 }, { status: 400 });
    }
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error', results: [], query: '', total: 0 }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}