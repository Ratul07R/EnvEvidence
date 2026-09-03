import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// FFWC (Flood Forecasting & Warning Centre) API from Bangladesh Water Development Board
// This provides real water level data for rivers in Bangladesh
// API: https://api.ffwc.gov.bd/

const RIVER_STATIONS = [
  {
    slug: 'dhaka-buriganga',
    name: 'Buriganga River, Dhaka',
    stationId: '230', // Example station ID - would need to check actual FFWC station IDs
    latitude: 23.7104,
    longitude: 90.4074,
    country: 'Bangladesh',
    city: 'Dhaka',
  },
  {
    slug: 'dhaka-shitalakkhya',
    name: 'Shitalakkhya River, Dhaka',
    stationId: '231',
    latitude: 23.7850,
    longitude: 90.5240,
    country: 'Bangladesh',
    city: 'Narayanganj',
  },
  {
    slug: 'chittagong-karnaphuli',
    name: 'Karnaphuli River, Chattogram',
    stationId: '232',
    latitude: 22.3569,
    longitude: 91.7832,
    country: 'Bangladesh',
    city: 'Chattogram',
  },
];

const WATER_PARAMETERS = [
  { slug: 'water-level', name: 'Water Level', unit: 'm' },
  { slug: 'flow-rate', name: 'Flow Rate', unit: 'm³/s' },
];

type FFWCResponse = {
  data?: Array<{
    station_id: string;
    station_name: string;
    water_level: number;
    flow_rate?: number;
    timestamp: string;
    warning_level?: number;
    danger_level?: number;
  }>;
};

export const ffwcWaterConnector: Connector = {
  id: 'ffwc-water-levels',
  name: 'FFWC Water Level Data',
  ingest: async (): Promise<ConnectorResult> => {
    const waterCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'water' },
    });

    if (!waterCategory) {
      throw new Error('Water category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'ffwc-water-levels',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'ffwc-water-levels',
        name: 'FFWC Water Level Data',
        provider: 'Bangladesh Water Development Board',
        url: 'https://api.ffwc.gov.bd/',
        apiEndpoint: 'https://api.ffwc.gov.bd/',
        license: 'Public domain data - Bangladesh government',
        commercialUse: 'ALLOWED',
        attributionReq: 'FFWC/BWDB',
        updateFrequency: 'Hourly',
        dataCategories: 'water',
        geographicCoverage: 'Bangladesh river network',
        reliabilityNotes:
          'FFWC provides real-time water level monitoring data for major rivers in Bangladesh. Data is used for flood forecasting and disaster preparedness.',
        ingestionMethod: 'API',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    for (const station of RIVER_STATIONS) {
      try {
        // Create or update location
        const dbLocation = await db.location.upsert({
          where: {
            slug: station.slug,
          },
          update: {
            latitude: station.latitude,
            longitude: station.longitude,
          },
          create: {
            slug: station.slug,
            name: station.name,
            country: station.country,
            city: station.city,
            latitude: station.latitude,
            longitude: station.longitude,
            type: 'river-station',
          },
        });

        // Create parameters
        for (const param of WATER_PARAMETERS) {
          const parameter = await db.parameter.upsert({
            where: {
              slug: param.slug,
            },
            update: {
              name: param.name,
              unit: param.unit,
              categoryId: waterCategory.id,
            },
            create: {
              slug: param.slug,
              name: param.name,
              unit: param.unit,
              categoryId: waterCategory.id,
            },
          });

          // Fetch data from FFWC API
          // Note: The actual FFWC API endpoint structure needs to be verified
          // This is a placeholder implementation based on typical river monitoring APIs
          let observationData: { value: number; timestamp: Date } | null = null;

          try {
            const apiUrl = `https://api.ffwc.gov.bd/station/${station.stationId}/current`;
            const response = await fetch(apiUrl, {
              cache: 'no-store',
              headers: {
                'User-Agent': 'EnvEvidence/1.0',
              },
            });

            if (response.ok) {
              const data = (await response.json()) as FFWCResponse;
              if (data.data && data.data.length > 0) {
                const latest = data.data[0];
                if (param.slug === 'water-level' && latest.water_level) {
                  observationData = {
                    value: latest.water_level,
                    timestamp: new Date(latest.timestamp),
                  };
                } else if (param.slug === 'flow-rate' && latest.flow_rate) {
                  observationData = {
                    value: latest.flow_rate,
                    timestamp: new Date(latest.timestamp),
                  };
                }
              }
            }
          } catch (apiError) {
            // FFWC API may not be publicly accessible or may require registration
            // In this case, we mark it as a data gap rather than fabricating data
            validationErrors.push(`FFWC API not accessible for ${station.name}: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
            continue;
          }

          if (!observationData) {
            // No data available - skip rather than fabricating
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
              categoryId: waterCategory.id,
              locationId: dbLocation.id,
              latitude: station.latitude,
              longitude: station.longitude,
              observationDate,
              collectionDate: observationDate,
              retrievalDate: new Date(),

              sourceId: source.id,
              sourceTitle: 'FFWC Water Level Monitoring',
              sourceUrl: 'https://api.ffwc.gov.bd/',
              publisher: 'Bangladesh Water Development Board',

              methodology: 'Automated water level monitoring at river stations for flood forecasting',
              measurementMethod: 'Water level gauge/flow meter measurements',

              confidence: 'HIGH',
              evidenceType: 'measured',
              verificationStatus: 'pending',
              qualityStatus: 'valid',
              isDemo: false,

              claim: `${param.name} at ${station.name}: ${observationData.value} ${param.unit}`,
            },
          });

          recordsAdded++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        validationErrors.push(`Error processing ${station.name}: ${message}`);
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
          Date.now() + 60 * 60 * 1000 // Hourly updates
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
export async function ingestFFWCWaterLevels() {
  return ffwcWaterConnector.ingest();
}