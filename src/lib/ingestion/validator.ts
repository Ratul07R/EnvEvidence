import type { CollectedSource, ExtractedEvidence } from './types';

export function validateCollectedSource(
  source: CollectedSource
): { valid: true } | { valid: false; reason: string } {
  if (!source.url.trim()) {
    return { valid: false, reason: 'Source URL is missing' };
  }

  if (!source.content.trim()) {
    return { valid: false, reason: 'Source returned empty content' };
  }

  if (source.content.trim().length < 100) {
    return { valid: false, reason: 'Source content is too short to extract evidence' };
  }

  return { valid: true };
}

export function validateExtractedEvidence(
  evidence: ExtractedEvidence
): { valid: true } | { valid: false; reason: string } {
  if (!evidence.claim.trim()) {
    return { valid: false, reason: 'Evidence claim is missing' };
  }

  if (!evidence.sourceUrl.trim()) {
    return { valid: false, reason: 'Evidence source URL is missing' };
  }

  if (!evidence.sourceTitle.trim()) {
    return { valid: false, reason: 'Evidence source title is missing' };
  }

  if (!['HIGH', 'MEDIUM', 'LOW', 'UNVERIFIED'].includes(evidence.confidence)) {
    return { valid: false, reason: 'Invalid confidence level' };
  }

  return { valid: true };
}