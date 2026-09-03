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
  evidenceType?: 'measured' | 'reported' | 'estimated' | 'modeled' | 'inferred';
  locationSlug?: string;
  parameterSlug?: string;
  categorySlug?: string;
  latitude?: number;
  longitude?: number;
};

export type ConnectorResult = {
  sourceId: string;
  sourceName: string;
  recordsAdded: number;
  recordsUpdated: number;
  recordsRejected: number;
  validationErrors?: string[];
};

export type Connector = {
  id: string;
  name: string;
  ingest: () => Promise<ConnectorResult>;
};