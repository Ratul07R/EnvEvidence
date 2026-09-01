import { db } from '@/lib/db';
import { collectUrl } from './collector';
import {
  defaultEvidenceExtractor,
} from './extractor';
import {
  validateCollectedSource,
  validateExtractedEvidence,
} from './validator';

export async function runSource(sourceId: string) {
  const source = await db.source.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  if (source.status !== 'active') {
    throw new Error(`Source is not active: ${source.name}`);
  }

  const targetUrl = source.apiEndpoint || source.url;

  if (!targetUrl) {
    throw new Error(`Source has no URL or API endpoint: ${source.name}`);
  }

  const startedAt = new Date();

  let recordsAdded = 0;
  let recordsUpdated = 0;
  let recordsRejected = 0;

  try {
    const collected = await collectUrl(targetUrl);

    const sourceValidation = validateCollectedSource(collected);

    if (!sourceValidation.valid) {
      throw new Error(sourceValidation.reason);
    }

    const extracted = await defaultEvidenceExtractor.extract({
      ...collected,
      publisher: source.provider || undefined,
    });

    for (const evidence of extracted) {
      const validation = validateExtractedEvidence(evidence);

      if (!validation.valid) {
        recordsRejected += 1;
        continue;
      }

      const numericValue =
        evidence.value !== undefined &&
        evidence.value !== null &&
        !Number.isNaN(Number(evidence.value))
          ? Number(evidence.value)
          : undefined;

      const existing = await db.evidenceRecord.findFirst({
        where: {
          sourceId: source.id,
          sourceUrl: evidence.sourceUrl,
          claim: evidence.claim,
          value: evidence.value ?? undefined,
          observationDate: evidence.observationDate
            ? new Date(evidence.observationDate)
            : undefined,
        },
      });

      if (existing) {
        await db.evidenceRecord.update({
          where: { id: existing.id },
          data: {
            retrievalDate: new Date(),
            updatedAt: new Date(),
          },
        });

        recordsUpdated += 1;
        continue;
      }

      await db.evidenceRecord.create({
        data: {
          value: evidence.value ?? null,
          numericValue: numericValue ?? null,
          unit: evidence.unit ?? null,

          observationDate: evidence.observationDate
            ? new Date(evidence.observationDate)
            : null,

          sourceId: source.id,
          sourceTitle: evidence.sourceTitle,
          sourceUrl: evidence.sourceUrl,
          publisher: evidence.publisher ?? source.provider ?? null,

          methodology:
            evidence.methodology ??
            'Deterministic extraction from source content',

          confidence: evidence.confidence,

          claim: evidence.claim,

          evidenceType: 'MEASUREMENT',
          verificationStatus: 'PENDING',
          qualityStatus: 'UNVERIFIED',

          retrievalDate: new Date(),
          isDemo: false,
        },
      });

      recordsAdded += 1;
    }

    await db.source.update({
      where: { id: source.id },
      data: {
        lastSuccessfulFetch: new Date(),
        lastFailureReason: null,
        errorCount: 0,
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: 'success',
        recordsAdded,
        recordsUpdated,
        recordsRejected,
        startedAt,
        completedAt: new Date(),
      },
    });

    return {
      sourceId: source.id,
      sourceName: source.name,
      recordsFound: extracted.length,
      recordsAdded,
      recordsUpdated,
      recordsRejected,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown ingestion error';

    await db.source.update({
      where: { id: source.id },
      data: {
        lastFailureReason: message,
        errorCount: {
          increment: 1,
        },
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: 'failed',
        recordsAdded,
        recordsUpdated,
        recordsRejected,
        errorMessage: message,
        startedAt,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}