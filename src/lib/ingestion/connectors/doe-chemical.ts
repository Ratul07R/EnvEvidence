import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// Bangladesh Department of Environment (DoE) Chemical Pollution Monitoring
// DoE publishes annual Surface and Ground Water Quality Reports with chemical parameters
// Reports are available as PDFs: https://doe.gov.bd/ or via Bangladesh Open Data
// Parameters include: pH, EC, TDS, DO, BOD, COD, SS, Chloride, Turbidity, Salinity
// This is a document archive, not a live API

const POLLUTION_LOCATIONS = [
  {
    slug: 'bangladesh-chemical-monitoring',
    name: 'Bangladesh Chemical Pollution Monitoring',
    country: 'Bangladesh',
    type: 'country',
  },
];

const CHEMICAL_PARAMETERS = [
  { slug: 'bod', name: 'Biochemical Oxygen Demand', unit: 'mg/L' },
  { slug: 'cod', name: 'Chemical Oxygen Demand', unit: 'mg/L' },
  { slug: 'total-dissolved-solids', name: 'Total Dissolved Solids', unit: 'mg/L' },
  { slug: 'electrical-conductivity', name: 'Electrical Conductivity', unit: 'µS/cm' },
  { slug: 'chloride', name: 'Chloride', unit: 'mg/L' },
];

export const doeChemicalConnector: Connector = {
  id: 'doe-chemical-pollution',
  name: 'DoE Chemical Pollution',
  ingest: async (): Promise<ConnectorResult> => {
    const chemicalCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'chemical-pollution' },
    });

    if (!chemicalCategory) {
      throw new Error('Chemical & Pollution category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'doe-chemical-pollution',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'doe-chemical-pollution',
        name: 'Bangladesh Department of Environment Chemical Monitoring',
        provider: 'Department of Environment, Bangladesh',
        url: 'https://doe.gov.bd/',
        apiEndpoint: null,
        license: 'Government of Bangladesh public data',
        commercialUse: 'ALLOWED',
        attributionReq: 'DoE Bangladesh',
        updateFrequency: 'Annual',
        dataCategories: 'chemical-pollution',
        geographicCoverage: 'Bangladesh (rivers, lakes, groundwater)',
        reliabilityNotes:
          'DoE monitors surface and ground water quality across Bangladesh with chemical parameters including BOD, COD, TDS, EC, chloride, turbidity, and salinity. Data is published in annual reports as PDF documents. The platform currently lacks automated PDF parsing for this archive.',
        ingestionMethod: 'Document Archive',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    // Since DoE chemical data is published as annual PDF reports without a live API,
    // we'll create a data gap record rather than fabricating measurements
    // This accurately represents the limitation while documenting the available source

    for (const location of POLLUTION_LOCATIONS) {
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
            categorySlug: chemicalCategory.slug,
          },
        });

        if (!existingGap) {
          await db.dataGap.create({
            data: {
              locationId: dbLocation.id,
              categorySlug: chemicalCategory.slug,
              categoryName: chemicalCategory.name,
              gapLevel: 'LIMITED',
              description: 'Bangladesh Department of Environment (DoE) publishes annual Surface and Ground Water Quality Reports with chemical pollution parameters (BOD, COD, TDS, EC, chloride, turbidity, salinity) for rivers, lakes, and groundwater. Reports are available as PDF documents at https://doe.gov.bd/. The platform currently lacks automated PDF parsing for this archive. Users can access the raw reports directly from DoE.',
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
export async function ingestDOEChemical() {
  return doeChemicalConnector.ingest();
}