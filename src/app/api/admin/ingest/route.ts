import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runSource } from '@/lib/ingestion/source-runner';

const ingestSchema = z.object({
  password: z.string().min(1).max(100),
  sourceId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, sourceId } = ingestSchema.parse(body);

    // Server-side authentication
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await runSource(sourceId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Ingestion failed';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}