import type { CollectedSource, ExtractedEvidence } from './types';

const PARAMETER_PATTERNS: Array<{
  name: string;
  regex: RegExp;
}> = [
  { name: 'PM2.5', regex: /\bpm\s*2\.?5\b/i },
  { name: 'PM10', regex: /\bpm\s*10\b/i },
  { name: 'NO2', regex: /\bno2\b/i },
  { name: 'SO2', regex: /\bso2\b/i },
  { name: 'O3', regex: /\bo3\b/i },
  { name: 'CO', regex: /\bco\b/i },
  { name: 'CO2', regex: /\bco2\b/i },
  { name: 'pH', regex: /\bph\b/i },
  { name: 'dissolved oxygen', regex: /\bdissolved oxygen\b/i },
  { name: 'temperature', regex: /\btemperature\b/i },
  { name: 'humidity', regex: /\bhumidity\b/i },
];

const LOCATION_PATTERNS = [
  'Dhaka',
  'Chattogram',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

function extractNumber(text: string): string | undefined {
  const match = text.match(
    /(?:value|reading|concentration|level|average|mean)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/
  );

  return match?.[1];
}

function extractUnit(text: string): string | undefined {
  const match = text.match(
    /(µg\/m³|ug\/m3|mg\/m³|mg\/m3|ppm|ppb|°C|%|mg\/L|µg\/L|ug\/L)\b/i
  );

  return match?.[1];
}

function extractDate(text: string): string | undefined {
  const match = text.match(
    /\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b/
  );

  return match?.[1];
}

function extractLocation(text: string): string | undefined {
  return LOCATION_PATTERNS.find((location) =>
    new RegExp(`\\b${location}\\b`, 'i').test(text)
  );
}

export function extractEvidence(
  source: CollectedSource
): ExtractedEvidence[] {
  const lines = source.content
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const results: ExtractedEvidence[] = [];

  for (const line of lines) {
    if (line.length < 10 || line.length > 1000) {
      continue;
    }

    for (const parameter of PARAMETER_PATTERNS) {
      if (!parameter.regex.test(line)) {
        continue;
      }

      const value = extractNumber(line);

      if (!value) {
        continue;
      }

      const unit = extractUnit(line);
      const observationDate = extractDate(line);
      const location = extractLocation(line);

      const claimParts = [
        location,
        parameter.name,
        `${value}${unit ? ` ${unit}` : ''}`,
      ].filter(Boolean);

      const claim = `${claimParts.join(' ')} reported in source`;

      results.push({
        claim,
        value,
        unit,
        observationDate,
        sourceTitle: source.title,
        sourceUrl: source.url,
        publisher: source.publisher,
        methodology: 'Deterministic extraction from source content',
        confidence: location && unit ? 'MEDIUM' : 'LOW',
      });

      break;
    }
  }

  const unique = new Map<string, ExtractedEvidence>();

  for (const item of results) {
    const key = [
      item.claim,
      item.value,
      item.unit,
      item.observationDate,
      item.sourceUrl,
    ]
      .join('|')
      .toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return Array.from(unique.values());
}

export const defaultEvidenceExtractor = {
  extract(source: CollectedSource) {
    return Promise.resolve(extractEvidence(source));
  },
};