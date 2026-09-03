import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

const LOCATIONS = [
  {
    slug: 'dhaka',
    name: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
  },
  {
    slug: 'chittagong',
    name: 'Chattogram',
    latitude: 22.3569,
    longitude: 91.7832,
  },
  {
    slug: 'sylhet',
    name: 'Sylhet',
    latitude: 24.8949,
    longitude: 91.8687,
  },
  {
    slug: 'rajshahi',
    name: 'Rajshahi',
    latitude: 24.3745,
    longitude: 88.6042,
  },
  {
    slug: 'khulna',
    name: 'Khulna',
    latitude: 22.8456,
    longitude: 89.5403,
  },
];

const VARIABLES = [
  { api: 'pm2_5', parameter: 'pm25', name: 'PM2.5', unit: 'μg/m³' },
  { api: 'pm10', parameter: 'pm10', name: 'PM10', unit: 'μg/m³' },
  {
    api: 'carbon_monoxide',
    parameter: 'co',
    name: 'Carbon Monoxide',
    unit: 'μg/m³',
  },
  {
    api: 'carbon_dioxide',
    parameter: 'co2',
    name: 'Carbon Dioxide',
    unit: 'ppm',
  },
  {
    api: 'nitrogen_dioxide',
    parameter: 'no2',
    name: 'Nitrogen Dioxide',
    unit: 'μg/m³',
  },
  {
    api: 'sulphur_dioxide',
    parameter: 'so2',
    name: 'Sulphur Dioxide',
    unit: 'μg/m³',
  },
  {
    api: 'ozone',
    parameter: 'o3',
    name: 'Ozone',
    unit: 'μg/m³',
  },
];

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    [key: string]: unknown;
  };
};

export const openMeteoAirConnector: Connector = {
  id: 'open-meteo-air-quality',
  name: 'Open-Meteo Air Quality',
  ingest: async (): Promise<ConnectorResult> => {
    const airCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'air' },
    });

    if (!airCategory) {
      throw new Error('Air category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'open-meteo-air-quality',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'open-meteo-air-quality',
        name: 'Open-Meteo Air Quality',
        provider: 'Open-Meteo / CAMS',
        url: 'https://open-meteo.com/en/docs/air-quality-api',
        apiEndpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
        license: 'Open-Meteo / CAMS attribution required',
        commercialUse: 'REQUIRES REVIEW',
        attributionReq: 'Open-Meteo and CAMS',
        updateFrequency: 'Hourly',
        dataCategories: 'air',
        geographicCoverage: 'Global',
        reliabilityNotes:
          'Model-based air-quality data from CAMS via Open-Meteo. Not a ground station measurement.',
        ingestionMethod: 'API',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    for (const location of LOCATIONS) {
      try {
        const url = new URL(
          'https://air-quality-api.open-meteo.com/v1/air-quality'
        );

        url.searchParams.set('latitude', String(location.latitude));
        url.searchParams.set('longitude', String(location.longitude));
        url.searchParams.set(
          'hourly',
          VARIABLES.map((item) => item.api).join(',')
        );
        url.searchParams.set('past_hours', '24');
        url.searchParams.set('forecast_hours', '1');
        url.searchParams.set('timezone', 'UTC');

        const response = await fetch(url.toString(), {
          cache: 'no-store',
          headers: {
            'User-Agent': 'EnvEvidence/1.0',
          },
        });

        if (!response.ok) {
          validationErrors.push(
            `Open-Meteo request failed for ${location.name}: ${response.status}`
          );
          continue;
        }

        const data = (await response.json()) as OpenMeteoResponse;

        const times = data.hourly?.time ?? [];

        const dbLocation = await db.location.upsert({
          where: {
            slug: location.slug,
          },
          update: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          create: {
            slug: location.slug,
            name: location.name,
            country: 'Bangladesh',
            city: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            type: 'city',
          },
        });

        for (const variable of VARIABLES) {
          const values = data.hourly?.[variable.api];

          if (!Array.isArray(values)) {
            continue;
          }

          const parameter = await db.parameter.upsert({
            where: {
              slug: variable.parameter,
            },
            update: {
              name: variable.name,
              unit: variable.unit,
              categoryId: airCategory.id,
            },
            create: {
              slug: variable.parameter,
              name: variable.name,
              unit: variable.unit,
              categoryId: airCategory.id,
            },
          });

          for (let i = 0; i < times.length; i++) {
            const rawValue = values[i];

            if (
              typeof rawValue !== 'number' ||
              !Number.isFinite(rawValue)
            ) {
              recordsRejected++;
              continue;
            }

            const observationDate = new Date(times[i]);

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
                  value: String(rawValue),
                  numericValue: rawValue,
                  retrievalDate: new Date(),
                  updatedAt: new Date(),
                },
              });

              recordsUpdated++;
              continue;
            }

            await db.evidenceRecord.create({
              data: {
                value: String(rawValue),
                numericValue: rawValue,
                unit: variable.unit,
                parameterId: parameter.id,
                categoryId: airCategory.id,
                locationId: dbLocation.id,
                latitude: location.latitude,
                longitude: location.longitude,
                observationDate,
                collectionDate: observationDate,
                retrievalDate: new Date(),

                sourceId: source.id,
                sourceTitle: 'Open-Meteo Air Quality',
                sourceUrl:
                  'https://open-meteo.com/en/docs/air-quality-api',
                publisher: 'Open-Meteo / CAMS',

                methodology:
                  'CAMS air-quality model data retrieved through Open-Meteo API',

                measurementMethod: 'Modelled',
                confidence: 'MEDIUM',
                evidenceType: 'modeled',
                verificationStatus: 'pending',
                qualityStatus: 'valid',
                isDemo: false,

                claim: `${variable.name} in ${location.name}: ${rawValue} ${variable.unit}`,
              },
            });

            recordsAdded++;
          }
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
          Date.now() + 60 * 60 * 1000
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
export async function ingestOpenMeteoAirQuality() {
  return openMeteoAirConnector.ingest();
}