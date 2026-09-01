import fs from 'node:fs';
import XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { db } from '@/lib/db';

const FILE_PATH = 'who-air-quality.xlsx';

const WHO_SOURCE = {
  name: 'WHO Global Air Quality Database',
  provider: 'World Health Organization',
  url: 'https://www.who.int/data/gho/data/themes/air-pollution/who-air-quality-database',
  license: 'WHO Global Air Quality Database terms',
  commercialUse: 'REQUIRES REVIEW',
};

const PARAMETERS = [
  { slug: 'pm10', name: 'PM10', unit: 'µg/m³' },
  { slug: 'pm25', name: 'PM2.5', unit: 'µg/m³' },
  { slug: 'no2', name: 'NO₂', unit: 'µg/m³' },
];

type WhoRow = {
  who_region: string;
  iso3: string;
  country_name: string;
  city: string;
  year: string;
  version: string;
  pm10_concentration: string;
  pm25_concentration: string;
  no2_concentration: string;
  pm10_tempcov: string;
  pm25_tempcov: string;
  no2_tempcov: string;
  type_of_stations: string;
  number_stations: string;
  reference: string;
  web_link: string;
  population: string;
  population_source: string;
  latitude: string;
  longitude: string;
  who_ms: string;
};

function parseWhoRow(raw: string): WhoRow | null {
  try {
    const parsed = parse(raw.trim(), {
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
    })[0];

    if (!parsed || parsed.length < 21) return null;

    const [
      who_region,
      iso3,
      country_name,
      city,
      year,
      version,
      pm10_concentration,
      pm25_concentration,
      no2_concentration,
      pm10_tempcov,
      pm25_tempcov,
      no2_tempcov,
      type_of_stations,
      number_stations,
      reference,
      web_link,
      population,
      population_source,
      latitude,
      longitude,
      who_ms,
    ] = parsed;

    return {
      who_region,
      iso3,
      country_name,
      city,
      year,
      version,
      pm10_concentration,
      pm25_concentration,
      no2_concentration,
      pm10_tempcov,
      pm25_tempcov,
      no2_tempcov,
      type_of_stations,
      number_stations,
      reference,
      web_link,
      population,
      population_source,
      latitude,
      longitude,
      who_ms,
    };
  } catch {
    return null;
  }
}

function numericValue(value: string): number | null {
  if (!value || value.trim().toUpperCase() === 'NA') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function yearToDate(year: string): Date | null {
  const parsed = Number(year);

  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
    return null;
  }

  return new Date(Date.UTC(parsed, 0, 1));
}

function cleanCity(city: string): string {
  return city
    .replace(/\/[A-Z]{3}$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function locationSlug(country: string, city: string): string {
  return `${country}-${cleanCity(city)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function importWhoAirQuality(options?: {
  dryRun?: boolean;
  limit?: number;
  offset?: number;
}) {
  const dryRun = options?.dryRun ?? true;
  const limit = options?.limit ?? 1000;
  const offset = options?.offset ?? 0;

  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`WHO file not found: ${FILE_PATH}`);
  }

  const workbook = XLSX.readFile(FILE_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const lastRow = Number(sheet['!ref']?.match(/\d+$/)?.[0] ?? 0);

  if (!lastRow) {
    throw new Error('WHO worksheet is empty');
  }

  const source = dryRun
    ? null
    : await db.source.upsert({
        where: {
          id: 'who-global-air-quality-database',
        },
        update: {
          name: WHO_SOURCE.name,
          provider: WHO_SOURCE.provider,
          url: WHO_SOURCE.url,
          license: WHO_SOURCE.license,
          commercialUse: WHO_SOURCE.commercialUse,
          ingestionMethod: 'WHO XLSX → CSV parse → EvidenceRecord',
          status: 'active',
          lastFailureReason: null,
        },
        create: {
          id: 'who-global-air-quality-database',
          name: WHO_SOURCE.name,
          provider: WHO_SOURCE.provider,
          url: WHO_SOURCE.url,
          license: WHO_SOURCE.license,
          commercialUse: WHO_SOURCE.commercialUse,
          ingestionMethod: 'WHO XLSX → CSV parse → EvidenceRecord',
          status: 'active',
        },
      });

  let validRows = 0;
  let invalidRows = 0;
  let evidenceCreated = 0;

  const preview: Array<{
    row: number;
    country: string;
    city: string;
    year: string;
    parameter: string;
    value: number;
  }> = [];

  let processedRows = 0;

  for (
    let sourceRowNumber = 2;
    sourceRowNumber <= lastRow;
    sourceRowNumber++
  ) {
    if (processedRows >= offset + limit) break;

    const raw = sheet[`A${sourceRowNumber}`]?.v;

    if (typeof raw !== 'string' || !raw.trim()) {
      continue;
    }

    if (processedRows < offset) {
      processedRows++;
      continue;
    }

    const row = parseWhoRow(raw);

    if (!row) {
      invalidRows++;
      processedRows++;
      continue;
    }

    validRows++;
    processedRows++;

    const date = yearToDate(row.year);
    const latitude = numericValue(row.latitude);
    const longitude = numericValue(row.longitude);

    const measurements = [
      {
        parameter: PARAMETERS[0],
        value: numericValue(row.pm10_concentration),
      },
      {
        parameter: PARAMETERS[1],
        value: numericValue(row.pm25_concentration),
      },
      {
        parameter: PARAMETERS[2],
        value: numericValue(row.no2_concentration),
      },
    ].filter(
      (
        item
      ): item is {
        parameter: (typeof PARAMETERS)[number];
        value: number;
      } => item.value !== null
    );

    for (const measurement of measurements) {
      if (preview.length < 10) {
        preview.push({
          row: sourceRowNumber,
          country: row.country_name,
          city: cleanCity(row.city),
          year: row.year,
          parameter: measurement.parameter.name,
          value: measurement.value,
        });
      }

      if (dryRun) continue;

      const category = await db.environmentalCategory.upsert({
        where: {
          slug: 'air-quality',
        },
        update: {},
        create: {
          slug: 'air-quality',
          name: 'Air Quality',
          nameBn: 'বায়ু মান',
        },
      });

      const parameter = await db.parameter.upsert({
        where: {
          slug: measurement.parameter.slug,
        },
        update: {
          name: measurement.parameter.name,
          unit: measurement.parameter.unit,
          categoryId: category.id,
        },
        create: {
          slug: measurement.parameter.slug,
          name: measurement.parameter.name,
          unit: measurement.parameter.unit,
          categoryId: category.id,
        },
      });

      const city = cleanCity(row.city);
      const slug = locationSlug(row.country_name, city);

      const location = await db.location.upsert({
        where: {
          slug,
        },
        update: {
          name: city,
          country: row.country_name,
          city,
          latitude,
          longitude,
        },
        create: {
          slug,
          name: city,
          country: row.country_name,
          city,
          latitude,
          longitude,
          type: 'city',
        },
      });

      await db.evidenceRecord.create({
        data: {
          value: String(measurement.value),
          numericValue: measurement.value,
          unit: measurement.parameter.unit,
          parameterId: parameter.id,
          categoryId: category.id,
          locationId: location.id,
          samplingSite: city,
          latitude,
          longitude,
          observationDate: date,
          collectionDate: new Date(),
          sourceId: source!.id,
          sourceTitle: WHO_SOURCE.name,
          sourceUrl: WHO_SOURCE.url,
          originalDatasetUrl: row.web_link || WHO_SOURCE.url,
          publisher: WHO_SOURCE.provider,
          methodology: row.type_of_stations || null,
          measurementMethod: row.reference || null,
          processingHistory:
            `Imported from WHO Global Air Quality Database. ` +
            `WHO region=${row.who_region}; ISO3=${row.iso3}; ` +
            `version=${row.version}; station_count=${row.number_stations}; ` +
            `PM10 coverage=${row.pm10_tempcov}; ` +
            `PM2.5 coverage=${row.pm25_tempcov}; ` +
            `NO2 coverage=${row.no2_tempcov}.`,
          confidence: 'UNVERIFIED',
          evidenceType: 'environmental_measurement',
          verificationStatus: 'pending',
          claim:
            `${measurement.parameter.name} concentration in ${city}, ` +
            `${row.country_name} was ${measurement.value} ${measurement.parameter.unit} ` +
            `in ${row.year}.`,
          qualityStatus: 'valid',
          qualityNotes:
            'Imported from WHO dataset. Source record requires verification before high-confidence use.',
          license: WHO_SOURCE.license,
          commercialUseStatus: WHO_SOURCE.commercialUse,
          attributionRequirements:
            'WHO attribution and dataset terms must be reviewed before commercial redistribution.',
          originalLanguage: 'en',
          isDemo: false,
        },
      });

      evidenceCreated++;
    }
  }

  return {
    dryRun,
    file: FILE_PATH,
    offset,
    limit,
    processedRows,
    validRows,
    invalidRows,
    evidenceCreated,
    preview,
  };
}