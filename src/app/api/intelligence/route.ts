import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateIntelligenceSummary, generateTimeline } from '@/lib/intelligence/summary-generator';

const intelligenceSchema = z.object({
  locationId: z.string().optional(),
  categoryId: z.string().optional(),
  timelineLimit: z.number().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = intelligenceSchema.parse({
      locationId: request.nextUrl.searchParams.get('locationId') || undefined,
      categoryId: request.nextUrl.searchParams.get('categoryId') || undefined,
      timelineLimit: request.nextUrl.searchParams.get('timelineLimit') 
        ? parseInt(request.nextUrl.searchParams.get('timelineLimit')!) 
        : undefined,
    });

    // Validate location exists if provided
    if (params.locationId) {
      const location = await db.location.findUnique({
        where: { id: params.locationId },
      });
      if (!location) {
        return NextResponse.json({ 
          success: false,
          error: 'Location not found',
          summary: null,
          timeline: []
        }, { status: 404 });
      }
    }

    // Validate category exists if provided
    if (params.categoryId) {
      const category = await db.environmentalCategory.findUnique({
        where: { id: params.categoryId },
      });
      if (!category) {
        return NextResponse.json({ 
          success: false,
          error: 'Category not found',
          summary: null,
          timeline: []
        }, { status: 404 });
      }
    }

    const summary = await generateIntelligenceSummary(params.locationId, params.categoryId);
    const timeline = await generateTimeline(params.locationId, params.categoryId, params.timelineLimit || 20);

    return NextResponse.json({
      success: true,
      summary,
      timeline,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid parameters',
        summary: null,
        timeline: []
      }, { status: 400 });
    }
    console.error('Intelligence API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      summary: null,
      timeline: []
    }, { status: 500 });
  }
}