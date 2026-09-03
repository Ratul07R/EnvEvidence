import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runSource } from '@/lib/ingestion/source-runner';
import { openMeteoAirConnector } from '@/lib/ingestion/connectors/open-meteo-air';
import { ffwcWaterConnector } from '@/lib/ingestion/connectors/usgs-water';
import { worldBankClimateConnector } from '@/lib/ingestion/connectors/noaa-climate';
import { openAlexResearchConnector } from '@/lib/ingestion/connectors/openalex-research';
import { noaaMicroplasticsConnector } from '@/lib/ingestion/connectors/noaa-microplastics';
import { doeChemicalConnector } from '@/lib/ingestion/connectors/doe-chemical';
import { industrialGapConnector } from '@/lib/ingestion/connectors/industrial-gap';
import { generateDataGaps } from '@/lib/ingestion/data-gap-generator';

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
    // 1. Open-Meteo air-quality ingestion using new connector interface
    try {
      const openMeteoResult = await openMeteoAirConnector.ingest();

      results.push({
        sourceId: 'open-meteo-air-quality',
        sourceName: 'Open-Meteo Air Quality',
        success: true,
        result: openMeteoResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'open-meteo-air-quality',
        sourceName: 'Open-Meteo Air Quality',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Open-Meteo ingestion failed',
      });
    }

    // 2. FFWC water level ingestion using new connector interface
    try {
      const ffwcResult = await ffwcWaterConnector.ingest();

      results.push({
        sourceId: 'ffwc-water-levels',
        sourceName: 'FFWC Water Level Data',
        success: true,
        result: ffwcResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'ffwc-water-levels',
        sourceName: 'FFWC Water Level Data',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'FFWC water ingestion failed',
      });
    }

    // 3. World Bank climate data ingestion using new connector interface
    try {
      const wbResult = await worldBankClimateConnector.ingest();

      results.push({
        sourceId: 'worldbank-climate-data',
        sourceName: 'World Bank Climate Data',
        success: true,
        result: wbResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'worldbank-climate-data',
        sourceName: 'World Bank Climate Data',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'World Bank climate ingestion failed',
      });
    }

    // 4. OpenAlex research ingestion using new connector interface
    try {
      const openAlexResult = await openAlexResearchConnector.ingest();

      results.push({
        sourceId: 'openalex-research',
        sourceName: 'OpenAlex Research',
        success: true,
        result: openAlexResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'openalex-research',
        sourceName: 'OpenAlex Research',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'OpenAlex research ingestion failed',
      });
    }

    // 5. NOAA microplastics archive check (data gap documentation)
    try {
      const noaaResult = await noaaMicroplasticsConnector.ingest();

      results.push({
        sourceId: 'noaa-microplastics',
        sourceName: 'NOAA Marine Microplastics',
        success: true,
        result: noaaResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'noaa-microplastics',
        sourceName: 'NOAA Marine Microplastics',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'NOAA microplastics check failed',
      });
    }

    // 6. DoE chemical pollution archive check (data gap documentation)
    try {
      const doeResult = await doeChemicalConnector.ingest();

      results.push({
        sourceId: 'doe-chemical-pollution',
        sourceName: 'DoE Chemical Pollution',
        success: true,
        result: doeResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'doe-chemical-pollution',
        sourceName: 'DoE Chemical Pollution',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'DoE chemical check failed',
      });
    }

    // 7. Industrial environment gap documentation
    try {
      const industrialResult = await industrialGapConnector.ingest();

      results.push({
        sourceId: 'industrial-environment-gap',
        sourceName: 'Industrial Environment Gap',
        success: true,
        result: industrialResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'industrial-environment-gap',
        sourceName: 'Industrial Environment Gap',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Industrial gap check failed',
      });
    }

    // 8. Run all other active registered sources using legacy source-runner
    const sources = await db.source.findMany({
      where: {
        status: 'active',
        id: {
          notIn: ['open-meteo-air-quality', 'ffwc-water-levels', 'worldbank-climate-data', 'openalex-research', 'noaa-microplastics', 'doe-chemical-pollution', 'industrial-environment-gap'],
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

    // 8. Generate/update data gaps after ingestion
    try {
      const gapResult = await generateDataGaps();
      results.push({
        sourceId: 'data-gap-generator',
        sourceName: 'Data Gap Generator',
        success: true,
        result: gapResult,
      });
    } catch (error) {
      results.push({
        sourceId: 'data-gap-generator',
        sourceName: 'Data Gap Generator',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Data gap generation failed',
      });
    }

    const successfulSources = results.filter(
      (result) => result.success
    ).length;

    return NextResponse.json({
      success: true,
      startedAt,
      completedAt: new Date(),
      sourcesProcessed: results.length,
      successfulSources,
      failedSources: results.length - successfulSources,
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