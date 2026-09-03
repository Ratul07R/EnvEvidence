import { db } from '@/lib/db';
import type { Connector, ConnectorResult } from '../types';

// OpenAlex API for research metadata
// API is publicly accessible without API key for basic use (10x more with free key)
// Base URL: https://api.openalex.org
// Documentation: https://developers.openalex.org/

const ENVIRONMENTAL_TOPICS = [
  { slug: 'environmental-science', name: 'Environmental Science', topic: '2101' },
  { slug: 'water-quality', name: 'Water Quality', topic: '2223' },
  { slug: 'air-pollution', name: 'Air Pollution', topic: '2210' },
  { slug: 'climate-change', name: 'Climate Change', topic: '2211' },
  { slug: 'plastic-pollution', name: 'Plastic Pollution', topic: '2215' },
];

type OpenAlexWork = {
  id: string;
  title: string;
  publication_date: string;
  primary_location?: {
    source?: {
      display_name: string;
      is_oa: boolean;
    };
  };
  type: string;
  open_access?: {
    is_oa: boolean;
    oa_url?: string;
  };
  best_oa_location?: {
    pdf_url?: string;
    license?: string;
  };
  authorships?: Array<{
    author?: {
      display_name: string;
    };
  }>;
  concepts?: Array<{
    display_name: string;
    score: number;
  }>;
  doi?: string;
};

type OpenAlexResponse = {
  meta: {
    count: number;
    resultsreturned: number;
  };
  results: OpenAlexWork[];
};

export const openAlexResearchConnector: Connector = {
  id: 'openalex-research',
  name: 'OpenAlex Research',
  ingest: async (): Promise<ConnectorResult> => {
    const researchCategory = await db.environmentalCategory.findUnique({
      where: { slug: 'research' },
    });

    if (!researchCategory) {
      throw new Error('Research category not found');
    }

    const source = await db.source.upsert({
      where: {
        id: 'openalex-research',
      },
      update: {
        status: 'active',
        lastFailureReason: null,
      },
      create: {
        id: 'openalex-research',
        name: 'OpenAlex Research Index',
        provider: 'OpenAlex / Our Research',
        url: 'https://openalex.org/',
        apiEndpoint: 'https://api.openalex.org/',
        license: 'CC0 (Public Domain)',
        commercialUse: 'ALLOWED',
        attributionReq: 'OpenAlex',
        updateFrequency: 'Daily',
        dataCategories: 'research',
        geographicCoverage: 'Global',
        reliabilityNotes:
          'OpenAlex provides a comprehensive index of global research publications with open access metadata. Basic API use is free without authentication.',
        ingestionMethod: 'API',
        status: 'active',
      },
    });

    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsRejected = 0;
    const validationErrors: string[] = [];

    for (const topic of ENVIRONMENTAL_TOPICS) {
      try {
        // Fetch recent environmental research papers from OpenAlex
        // Filter for recent (last 5 years), open access papers
        const apiUrl = `https://api.openalex.org/works?filter=concepts.id:${topic.topic},publication_year:2020-2024,is_oa:true,type:journal-article&per_page=20&sort=publication_date:desc`;
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'User-Agent': 'EnvEvidence/1.0',
          },
        });

        if (!response.ok) {
          validationErrors.push(`OpenAlex API error for ${topic.name}: HTTP ${response.status}`);
          continue;
        }

        const data = (await response.json()) as OpenAlexResponse;

        if (!data.results || data.results.length === 0) {
          continue;
        }

        for (const work of data.results) {
          try {
            // Extract authors - schema expects String, not array
            const authorNames = work.authorships
              ?.map(a => a.author?.display_name)
              .filter((n): n is string => Boolean(n))
              .slice(0, 10)
              .join(', ') || '';

            // Extract relevant concepts
            const relevantConcepts = work.concepts
              ?.filter(c => c.score > 0.3)
              .map(c => c.display_name)
              .slice(0, 5) || [];

            const publicationDate = work.publication_date ? new Date(work.publication_date) : null;

            if (!publicationDate) {
              recordsRejected++;
              continue;
            }

            // Check if this research item already exists
            const existing = await db.researchItem.findFirst({
              where: {
                doi: work.doi || undefined,
              },
            });

            if (existing) {
              await db.researchItem.update({
                where: { id: existing.id },
                data: {
                  updatedAt: new Date(),
                },
              });
              recordsUpdated++;
              continue;
            }

            await db.researchItem.create({
              data: {
                title: work.title,
                authors: authorNames,
                publicationDate: publicationDate,
                journal: work.primary_location?.source?.display_name,
                doi: work.doi,
                abstract: '', // OpenAlex abstracts require separate endpoint
                sourceName: 'OpenAlex',
                sourceUrl: work.id,
                topic: topic.name,
                language: 'en', // OpenAlex primarily English
                isDemo: false,
              },
            });

            recordsAdded++;
          } catch (workError) {
            const message = workError instanceof Error ? workError.message : 'Unknown error';
            validationErrors.push(`Error processing research item: ${message}`);
            recordsRejected++;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        validationErrors.push(`Error processing ${topic.name}: ${message}`);
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
          Date.now() + 24 * 60 * 60 * 1000 // Daily updates
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
export async function ingestOpenAlexResearch() {
  return openAlexResearchConnector.ingest();
}