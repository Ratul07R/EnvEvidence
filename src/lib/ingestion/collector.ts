import type { CollectedSource } from './types';

export async function collectUrl(url: string): Promise<CollectedSource> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'EnvEvidence/1.0 (+https://env-evidence.vercel.app)',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Source request failed: ${response.status}`);
  }

  const content = await response.text();

  return {
    title: url,
    url,
    content,
  };
}