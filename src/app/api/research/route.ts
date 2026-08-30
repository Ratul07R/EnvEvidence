import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const researchSchema = z.object({
  q: z.string().max(200).optional(),
  topic: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = researchSchema.parse({
      q: request.nextUrl.searchParams.get('q') || undefined,
      topic: request.nextUrl.searchParams.get('topic') || undefined,
    });

    // In production, can query OpenAlex API:
    // const response = await fetch(`https://api.openalex.org/works?search=${params.q}&per_page=20`);

    return NextResponse.json({ research: [], total: 0 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', research: [], total: 0 }, { status: 500 });
  }
}
