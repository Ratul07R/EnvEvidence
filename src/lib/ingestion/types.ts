export type CollectedSource = {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  content: string;
};

export type ExtractedEvidence = {
  claim: string;
  value?: string;
  unit?: string;
  observationDate?: string;
  sourceTitle: string;
  sourceUrl: string;
  publisher?: string;
  methodology?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
};