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

const CATEGORY_ALIASES: Record<string, string[]> = {
  air: ['air', 'air-quality'],
  water: ['water'],
  'carbon-climate': ['carbon-climate'],
  'plastic-microplastic': ['plastic-microplastic'],
  'chemical-pollution': ['chemical-pollution'],
  industrial: ['industrial'],
  research: ['research'],
};

export async function GET(request: NextRequest) {
  try {
    const params = searchSchema.parse({
      q: request.nextUrl.searchParams.get('q') || undefined,
      type: request.nextUrl.searchParams.get('type') || undefined,
      location: request.nextUrl.searchParams.get('location') || undefined,
      category: request.nextUrl.searchParams.get('category') || undefined,
    });

    if (!params.q && !params.location && !params.category) {
      return NextResponse.json({
        success: true,
        results: [],
        query: '',
        total: 0,
      });
    }

    const query = (params.q || '').toLowerCase();
    const typeFilter =
      !params.type || params.type === 'all' ? undefined : params.type;

    let categoryIds: string[] | undefined;

    if (params.category) {
      const categorySlugs =
        CATEGORY_ALIASES[params.category] || [params.category];

      const categories = await prisma.environmentalCategory.findMany({
        where: {
          slug: {
            in: categorySlugs,
          },
        },
        select: {
          id: true,
        },
      });

      categoryIds = categories.map((category) => category.id);
    }

    const results: Array<{
      type: string;
      title: string;
      description?: string;
      slug?: string;
      id?: string;
      category?: string | null;
      categorySlug?: string | null;
      confidence?: string;
      date?: string;
      value?: string | null;
      unit?: string | null;
      location?: {
        name: string;
        slug: string;
      } | null;
      parameter?: {
        name: string;
        unit?: string | null;
      } | null;
    }> = [];

    if (!typeFilter || typeFilter === 'location') {
      const locations = await prisma.location.findMany({
        where: {
          isDemo: false,
          ...(query
            ? {
                OR: [
                  {
                    name: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    nameBn: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    country: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        take: 20,
      });

      for (const loc of locations) {
        results.push({
          type: 'location',
          title: loc.name,
          description: loc.description || undefined,
          slug: loc.slug,
        });
      }
    }

    if (!typeFilter || typeFilter === 'evidence') {
      const evidence = await prisma.evidenceRecord.findMany({
        where: {
          isDemo: false,
          qualityStatus: {
            not: 'invalid',
          },
          // Fix: Include valid published evidence regardless of verification status
          // Modelled/estimated data with MEDIUM confidence should be visible
          OR: [
            { verificationStatus: 'verified' },
            { verificationStatus: 'pending' },
            { 
              AND: [
                { evidenceType: { in: ['modeled', 'estimated'] } },
                { confidence: { in: ['MEDIUM', 'HIGH'] } },
                { qualityStatus: 'valid' }
              ]
            }
          ],
          ...(categoryIds
            ? {
                categoryId: {
                  in: categoryIds,
                },
              }
            : {}),
          ...(params.location
            ? {
                location: {
                  slug: params.location,
                },
              }
            : {}),
          ...(query
            ? {
                OR: [
                  {
                    claim: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    value: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    sourceTitle: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        take: 100,
        orderBy: [
          {
            observationDate: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        include: {
          location: true,
          category: true,
          parameter: true,
        },
      });

      for (const ev of evidence) {
        results.push({
          type: 'evidence',
          title: ev.claim || ev.value || 'Evidence',
          description: ev.location?.name || undefined,
          id: ev.id,
          category: ev.category?.name ?? undefined,
          categorySlug: ev.category?.slug ?? undefined,
          confidence: ev.confidence,
          date: ev.observationDate?.toISOString(),
          value: ev.value,
          unit: ev.unit,
          location: ev.location
            ? {
                name: ev.location.name,
                slug: ev.location.slug,
              }
            : null,
          parameter: ev.parameter
            ? {
                name: ev.parameter.name,
                unit: ev.parameter.unit,
              }
            : null,
        });
      }
    }

    if (!typeFilter || typeFilter === 'research') {
      const items = await prisma.researchItem.findMany({
        where: {
          isDemo: false,
          ...(query
            ? {
                OR: [
                  {
                    title: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    topic: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        take: 20,
      });

      for (const r of items) {
        results.push({
          type: 'research',
          title: r.title,
          description: r.journal ?? r.sourceName ?? undefined,
          id: r.id,
          category: r.topic ?? undefined,
          date: r.publicationDate?.toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, 100),
      query: params.q || '',
      total: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search parameters',
          results: [],
          query: '',
          total: 0,
        },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        results: [],
        query: '',
        total: 0,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}