import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// NOAA NCEI Marine Microplastics Data Collection
// Data portal: https://www.ncei.noaa.gov/products/microplastics
// This is a data archive rather than a live API - data is downloadable as CSV/NetCDF
// For automated ingestion, we'll use the most recent downloadable data
// Since there's no live API, we'll mark this as a data-gap scenario with proper documentation

const MICROPLASTIC_LOCATIONS = [
  {
    slug: 'global-ocean-microplastics',
    name: 'Global Ocean Microplastics Monitoring',
    country: 'Global',
    type: 'ocean',
  },
];

const MICROPLASTIC_PARAMETERS = [
  { slug: 'microplastic-concentration', name: 'Microplastic Concentration', unit: 'particles/m³' },
  { slug: 'polymer-type', name: 'Polymer Type Distribution', unit: '%' },
];

export const noaaMicroplasticsConnector: Connector = {
  id: 'noaa-microplastics',
  name: 'NOAA Marine Microplastics',
  ingest: async (): Promise<ConnectorResult> => {
    const plasticCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'plastic-microplastic' },
    });

    if (!plasticCategory) {
      throw new Error('Plastic & Microplastic category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'noaa-microplastics',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'noaa-microplastics',
        name: 'NOAA NCEI Marine Microplastics Data Collection',
        provider: 'National Oceanic and Atmospheric Administration',
        url: 'https://www.ncei.noaa.gov/products/microplastics',
        license: 'Public domain / Creative Commons CC0',
        commercialUse: 'ALLOWED',
        attributionReq: 'NOAA NCEI',
        updateFrequency: 'As needed (data archive)',
        dataCategories: 'plastic-microplastic',
        geographicCoverage: 'Global oceans',
        reliabilityNotes:
          'NOAA NCEI provides a global open access marine microplastics data archive with data from 1972-present. Data is provided by researchers worldwide and is quality-controlled. However, this is a downloadable data archive, not a live API.',
        ingestionMethod: 'Data Archive',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    // Since NOAA NCEI microplastics data is a downloadable archive without a live API,
    // we'll create a data gap record rather than fabricating measurements
    // This accurately represents the limitation while documenting the available source

    for (const location of MICROPLASTIC_LOCATIONS) {
      try {
        const dbLocation = await db.location.upsert({
          where: {
            slug: location.slug,
          },
          update: {},
          create: {
            slug: location.slug,
            name: location.name,
            country: location.country,
            type: location.type,
          },
        });

        // Create data gap record for this category
        const existingGap = await db.dataGap.findFirst({
          where: {
            locationId: dbLocation.id,
            categorySlug: plasticCategory.slug,
          },
        });

        if (!existingGap) {
          await db.dataGap.create({
            data: {
              locationId: dbLocation.id,
              categorySlug: plasticCategory.slug,
              categoryName: plasticCategory.name,
              gapLevel: 'LIMITED',
              description: 'NOAA NCEI Marine Microplastics data is available as a downloadable archive (https://www.ncei.noaa.gov/products/microplastics) with data from 1972-present. However, this is not a live API. The platform currently lacks automated ingestion for this archive. Users can access the raw data directly from NOAA NCEI.',
              availability: true,
              recency: 'OLD',
              isDemo: false,
            },
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        validationErrors.push(`Error processing ${location.name}: ${message}`);
        recordsRejected++;
      }
    }

    await db.source.update({
      where: { id: source.id },
      data: {
        lastSuccessfulFetch: new Date(),
        lastFailureReason: validationErrors.length > 0 ? validationErrors.join('; ') : null,
        errorCount: validationErrors.length,
        nextScheduledUpdate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // Monthly check
        ),
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: 'success',
        recordsAdded,
        recordsUpdated,
        recordsRejected,
        validationErrors: validationErrors.length > 0 ? validationErrors.join('; ') : null,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return {
      sourceId: source.id,
      sourceName: source.name,
      recordsAdded,
      recordsUpdated,
      recordsRejected,
      validationErrors,
    };
  },
};

// Legacy function for backward compatibility
export async function ingestNOAAMicroplastics() {
  return noaaMicroplasticsConnector.ingest();
}