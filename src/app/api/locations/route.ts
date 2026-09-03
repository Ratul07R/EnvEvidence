import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const locationsSchema = z.object({
  slug: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = locationsSchema.parse({
      slug: request.nextUrl.searchParams.get('slug') || undefined,
      country: request.nextUrl.searchParams.get('country') || undefined,
      type: request.nextUrl.searchParams.get('type') || undefined,
    });

    if (params.slug) {
      const location = await prisma.location.findUnique({
        where: { slug: params.slug },
        include: {
          evidenceRecords: { 
            where: { 
              isDemo: false,
              qualityStatus: { not: 'invalid' },
              // Include valid published evidence regardless of verification status
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
              ]
            }, 
            take: 20, 
            orderBy: { observationDate: 'desc' },
            include: {
              source: true,
              parameter: true,
              category: true,
            }
          },
          dataGaps: { where: { isDemo: false } },
          timelineEvents: { where: { isDemo: false }, orderBy: { date: 'desc' } },
          intelligenceSummaries: { where: { isDemo: false }, take: 1 },
        },
      });

      if (!location) {
        return NextResponse.json({ 
          success: false,
          location: null, 
          evidence: [], 
          dataGaps: [], 
          timeline: [], 
          summary: null 
        });
      }

      return NextResponse.json({
        success: true,
        location,
        evidence: location.evidenceRecords,
        dataGaps: location.dataGaps,
        timeline: location.timelineEvents,
        summary: location.intelligenceSummaries[0] || null,
      });
    }

    const locations = await prisma.location.findMany({
      where: {
        ...(params.country && { country: params.country }),
        ...(params.type && { type: params.type }),
        isDemo: false,
      },
      include: {
        _count: { select: { evidenceRecords: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ 
      success: true,
      locations, 
      total: locations.length 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid parameters',
        locations: [],
        total: 0
      }, { status: 400 });
    }
    console.error('Locations API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      locations: [],
      total: 0
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}