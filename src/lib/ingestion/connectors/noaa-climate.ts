import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// World Bank Climate Change Knowledge Portal (CCKP) API
// API is publicly accessible without API key for basic use
// API Documentation: https://climateknowledgeportal.worldbank.org/download-data
// Base URL: https://cckpapi.worldbank.org/cckp/v1/

const COUNTRIES = [
  {
    slug: 'bangladesh-climate',
    name: 'Bangladesh Climate Data',
    geocode: 'BGD', // ISO country code for Bangladesh
    country: 'Bangladesh',
  },
];

const CLIMATE_PARAMETERS = [
  { 
    slug: 'temperature', 
    name: 'Temperature', 
    unit: '°C',
    apiCode: 'tas' // Temperature at surface
  },
  { 
    slug: 'precipitation', 
    name: 'Precipitation', 
    unit: 'mm',
    apiCode: 'pr' // Precipitation
  },
];

type WorldBankClimateResponse = {
  data?: Array<{
    variable: string;
    period: string;
    value: number;
    unit: string;
    model?: string;
    scenario?: string;
  }>;
  metadata?: {
    geocode: string;
    name: string;
  };
};

export const worldBankClimateConnector: Connector = {
  id: 'worldbank-climate-data',
  name: 'World Bank Climate Data',
  ingest: async (): Promise<ConnectorResult> => {
    const climateCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'carbon-climate' },
    });

    if (!climateCategory) {
      throw new Error('Carbon & Climate category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'worldbank-climate-data',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'worldbank-climate-data',
        name: 'World Bank Climate Change Knowledge Portal',
        provider: 'World Bank',
        url: 'https://climateknowledgeportal.worldbank.org/',
        apiEndpoint: 'https://cckpapi.worldbank.org/cckp/v1/',
        license: 'World Bank Open Data - CC BY 4.0',
        commercialUse: 'ALLOWED',
        attributionReq: 'World Bank CCKP',
        updateFrequency: 'Monthly to Annually',
        dataCategories: 'carbon-climate',
        geographicCoverage: 'Global',
        reliabilityNotes:
          'World Bank CCKP provides observed and projected climate data from validated sources including ERA5 reanalysis and CMIP6 models. API is publicly accessible.',
        ingestionMethod: 'API',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    for (const country of COUNTRIES) {
      try {
        // Create or update location
        const dbLocation = await db.location.upsert({
          where: {
            slug: country.slug,
          },
          update: {},
          create: {
            slug: country.slug,
            name: country.name,
            country: country.country,
            type: 'country',
          },
        });

        // Create parameters
        for (const param of CLIMATE_PARAMETERS) {
          const parameter = await db.parameter.upsert({
            where: {
              slug: param.slug,
            },
            update: {
              name: param.name,
              unit: param.unit,
              categoryId: climateCategory.id,
            },
            create: {
              slug: param.slug,
              name: param.name,
              unit: param.unit,
              categoryId: climateCategory.id,
            },
          });

          // Fetch data from World Bank CCKP API
          // API structure: GET https://cckpapi.worldbank.org/cckp/v1/{collection}_{type}_{variable}_{product}_{aggregation}_{period}_{percentile}_{scenario}_{model}_{calc}_{stat}/{geocode}?_format=json
          // For observed climate data (ERA5): cmip6-x0.25_climatology_tas_climatology_annual_1995-2014_median_historical_ensemble_all_mean
          
          let observationData: { value: number; timestamp: Date } | null = null;

          try {
            // Using ERA5 observed data (climatology)
            const apiUrl = `https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_climatology_${param.apiCode}_climatology_annual_1995-2014_median_historical_ensemble_all_mean/${country.geocode}?_format=json`;
            
            const response = await fetch(apiUrl, {
              cache: 'no-store',
              headers: {
                'User-Agent': 'EnvEvidence/1.0',
              },
            });

            if (response.ok) {
              const data = (await response.json()) as WorldBankClimateResponse;
              if (data.data && data.data.length > 0) {
                const latest = data.data[0];
                if (latest.value !== null && latest.value !== undefined) {
                  observationData = {
                    value: latest.value,
                    timestamp: new Date(), // CCKP climatological data represents annual averages
                  };
                }
              }
            }
          } catch (apiError) {
            validationErrors.push(`World Bank CCKP API error for ${country.name}: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
            continue;
          }

          if (!observationData) {
            // No data available - skip rather than fabricate
            continue;
          }

          const observationDate = observationData.timestamp;

          const existing = await db.evidenceRecord.findFirst({
            where: {
              sourceId: source.id,
              locationId: dbLocation.id,
              parameterId: parameter.id,
              observationDate,
            },
          });

          if (existing) {
            await db.evidenceRecord.update({
              where: { id: existing.id },
              data: {
                value: String(observationData.value),
                numericValue: observationData.value,
                retrievalDate: new Date(),
                updatedAt: new Date(),
              },
            });

            recordsUpdated++;
            continue;
          }

          await db.evidenceRecord.create({
            data: {
              value: String(observationData.value),
              numericValue: observationData.value,
              unit: param.unit,
              parameterId: parameter.id,
              categoryId: climateCategory.id,
              locationId: dbLocation.id,
              observationDate,
              collectionDate: observationDate,
              retrievalDate: new Date(),

              sourceId: source.id,
              sourceTitle: 'World Bank Climate Change Knowledge Portal',
              sourceUrl: 'https://climateknowledgeportal.worldbank.org/',
              publisher: 'World Bank',

              methodology: 'ERA5 reanalysis climatology data (1995-2014 baseline) from World Bank CCKP',
              measurementMethod: 'Model-based reanalysis data assimilation',

              confidence: 'HIGH',
              evidenceType: 'modeled',
              verificationStatus: 'pending',
              qualityStatus: 'valid',
              isDemo: false,

              claim: `${param.name} climatology for ${country.name}: ${observationData.value} ${param.unit} (1995-2014 baseline)`,
            },
          });

          recordsAdded++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        validationErrors.push(`Error processing ${country.name}: ${message}`);
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
          Date.now() + 30 * 24 * 60 * 60 * 1000 // Monthly updates
        ),
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: validationErrors.length > 0 ? 'partial_success' : 'success',
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
export async function ingestWorldBankClimateData() {
  return worldBankClimateConnector.ingest();
}