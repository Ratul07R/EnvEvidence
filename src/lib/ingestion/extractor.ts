import type { CollectedSource, ExtractedEvidence } from './types';

export interface EvidenceExtractor {
  extract(source: CollectedSource): Promise<ExtractedEvidence[]>;
}