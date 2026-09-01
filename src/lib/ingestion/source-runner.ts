import { db } from '@/lib/db';
import { collectUrl } from './collector';

export async function runSource(sourceId: string) {
  const source = await db.source.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  const targetUrl = source.apiEndpoint || source.url;

  if (!targetUrl) {
    throw new Error(`Source has no URL or API endpoint: ${source.name}`);
  }

  const startedAt = new Date();

  try {
    const collected = await collectUrl(targetUrl);

    await db.source.update({
      where: { id: source.id },
      data: {
        lastSuccessfulFetch: new Date(),
        lastFailureReason: null,
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: 'success',
        startedAt,
        completedAt: new Date(),
      },
    });

    return collected;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown collection error';

    await db.source.update({
      where: { id: source.id },
      data: {
        lastFailureReason: message,
      },
    });

    await db.updateLog.create({
      data: {
        sourceId: source.id,
        status: 'failed',
        errorMessage: message,
        startedAt,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}