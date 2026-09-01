import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSource } from '@/lib/ingestion/source-runner';
import { ingestOpenMeteoAirQuality } from '@/lib/ingestion/connectors/open-meteo-air';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type CronResult =
  | {
      sourceId: string;
      sourceName: string;
      success: true;
      result: unknown;
    }
  | {
      sourceId: string;
      sourceName: string;
      success: false;
      error: string;
    };

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startedAt = new Date();
  const results: CronResult[] = [];

  try {
    const openMeteoResult = await ingestOpenMeteoAirQuality();

    results.push({
      sourceId: 'open-meteo-air-quality',
      sourceName: 'Open-Meteo Air Quality',
      success: true,
      result: openMeteoResult,
    });

    const sources = await db.source.findMany({
      where: {
        status: 'active',
        id: {
          not: 'open-meteo-air-quality',
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const source of sources) {
      try {
        const result = await runSource(source.id);

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unknown ingestion error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      startedAt,
      completedAt: new Date(),
      sourcesProcessed: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        startedAt,
        completedAt: new Date(),
        error:
          error instanceof Error
            ? error.message
            : 'Cron ingestion failed',
        results,
      },
      { status: 500 }
    );
  }
}