import { NextResponse } from 'next/server';
import { runSource } from '@/lib/ingestion/source-runner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sourceId = body?.sourceId;

    if (!sourceId || typeof sourceId !== 'string') {
      return NextResponse.json(
        { error: 'sourceId is required' },
        { status: 400 }
      );
    }

    const result = await runSource(sourceId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
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