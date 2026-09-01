import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const searchSchema = z.object({
  q: z.string().max(200).optional(),
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
      return NextResponse.json({
        results: [],
        query: '',
        total: 0,
      });
    }

    const query = (params.q || '').trim();
    const typeFilter =
      !params.type || params.type === 'all' ? undefined : params.type;

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
      claim?: string | null;
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

    /*
     * LOCATIONS
     */
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
        orderBy: {
          name: 'asc',
        },
      });

      for (const loc of locations) {
        results.push({
          type: 'location',
          title: loc.name,
          description: loc.description || undefined,
          slug: loc.slug,
          id: loc.id,
        });
      }
    }

    /*
     * EVIDENCE
     *
     * IMPORTANT:
     * category is filtered through EnvironmentalCategory.slug.
     * This is what makes /environment/air, /environment/water, etc.
     * work correctly.
     */
    if (!typeFilter || typeFilter === 'evidence') {
      let categoryId: string | undefined;

      if (params.category) {
        const category = await prisma.environmentalCategory.findUnique({
          where: {
            slug: params.category,
          },
          select: {
            id: true,
          },
        });

        categoryId = category?.id;

        // If the requested category does not exist,
        // return no evidence instead of returning unrelated records.
        if (!categoryId) {
          return NextResponse.json({
            results: [],
            query: params.q || '',
            total: 0,
          });
        }
      }

      const evidence = await prisma.evidenceRecord.findMany({
        where: {
          isDemo: false,

          ...(categoryId
            ? {
                categoryId,
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
                  {
                    publisher: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),

          qualityStatus: {
            not: 'invalid',
          },
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
          location: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          parameter: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      });

      for (const ev of evidence) {
        results.push({
          type: 'evidence',
          title:
            ev.claim ||
            `${ev.parameter?.name || 'Measurement'}: ${ev.value || 'N/A'} ${
              ev.unit || ''
            }`.trim(),

          description: ev.location?.name || ev.sourceTitle || undefined,

          id: ev.id,

          category: ev.category?.name ?? undefined,

          categorySlug: ev.category?.slug ?? undefined,

          confidence: ev.confidence,

          date: ev.observationDate?.toISOString(),

          claim: ev.claim,

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

    /*
     * RESEARCH
     */
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
                  {
                    abstract: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },

        take: 20,

        orderBy: {
          publicationDate: 'desc',
        },
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
      results: results.slice(0, 100),
      query: params.q || '',
      total: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
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