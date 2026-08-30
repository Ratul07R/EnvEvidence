import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    const results: Array<{
      type: string;
      title: string;
      description?: string;
      slug?: string;
      id?: string;
      category?: string;
      confidence?: string;
      date?: string;
    }> = [];

    // In production, these would query the database.
    // The platform returns honest empty results when no data exists.
    const query = (params.q || '').toLowerCase();

    // If we had database access:
    // const locations = await db.location.findMany({ where: { ... }, take: 20 });
    // const evidence = await db.evidenceRecord.findMany({ where: { ... }, take: 20 });
    // etc.

    // Currently returns empty results — the platform is honest about data availability.
    // When real data is ingested via the source pipeline, results will appear here.

    return NextResponse.json({
      results: results.slice(0, 20),
      query: params.q || '',
      total: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid search parameters', results: [], query: '', total: 0 }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', results: [], query: '', total: 0 }, { status: 500 });
  }
}
