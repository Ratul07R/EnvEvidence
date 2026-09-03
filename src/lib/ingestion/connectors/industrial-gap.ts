import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// Industrial Environment Data Gap Documentation
// Industrial facility data typically comes from:
// - Environmental regulatory agencies (e.g., Bangladesh Department of Environment)
// - Company sustainability reports
// - Industry-specific monitoring networks
// - EIA reports and compliance databases
// Most of these are document archives or require access credentials

const INDUSTRIAL_LOCATIONS = [
  {
    slug: 'bangladesh-industrial',
    name: 'Bangladesh Industrial Environment',
    country: 'Bangladesh',
    type: 'country',
  },
];

const INDUSTRIAL_PARAMETERS = [
  { slug: 'emissions', name: 'Industrial Emissions', unit: 'tons/year' },
  { slug: 'effluent', name: 'Industrial Effluent', unit: 'm³/day' },
  { slug: 'compliance', name: 'Environmental Compliance Status', unit: 'status' },
];

export const industrialGapConnector: Connector = {
  id: 'industrial-environment-gap',
  name: 'Industrial Environment Gap',
  ingest: async (): Promise<ConnectorResult> => {
    const industrialCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'industrial' },
    });

    if (!industrialCategory) {
      throw new Error('Industrial Environment category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'industrial-environment-gap',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'industrial-environment-gap',
        name: 'Industrial Environment Data Gap Documentation',
        provider: 'Documented Data Sources',
        url: null,
        apiEndpoint: null,
        license: 'Varies by source',
        commercialUse: 'Varies by source',
        attributionReq: 'Source-specific',
        updateFrequency: 'Varies by source',
        dataCategories: 'industrial',
        geographicCoverage: 'Varies by source',
        reliabilityNotes:
          'Industrial environment data typically comes from regulatory agencies (e.g., Bangladesh Department of Environment), company sustainability reports, industry monitoring networks, and EIA compliance databases. Most sources are document archives or require access credentials. The platform currently lacks automated ingestion for these sources.',
        ingestionMethod: 'Document Archive',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    // Since industrial environment data is primarily document-based without live APIs,
    // we'll create a data gap record rather than fabricating measurements
    // This accurately represents the limitation while documenting the available sources

    for (const location of INDUSTRIAL_LOCATIONS) {
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
            categorySlug: industrialCategory.slug,
          },
        });

        if (!existingGap) {
          await db.dataGap.create({
            data: {
              locationId: dbLocation.id,
              categorySlug: industrialCategory.slug,
              categoryName: industrialCategory.name,
              gapLevel: 'LIMITED',
              description: 'Industrial environment data typically comes from regulatory agencies (e.g., Bangladesh Department of Environment), company sustainability reports, industry monitoring networks, and EIA compliance databases. Most sources are document archives or require access credentials. The platform currently lacks automated ingestion for these sources. Users should consult original regulatory databases and company reports for industrial facility data.',
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
          Date.now() + 90 * 24 * 60 * 60 * 1000 // Quarterly check
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
export async function ingestIndustrialGap() {
  return industrialGapConnector.ingest();
}