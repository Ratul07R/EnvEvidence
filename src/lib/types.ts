// ============================================================
// ENVIRONMENTAL EVIDENCE & INTELLIGENCE PLATFORM - CORE TYPES
// ============================================================

// Navigation Views (client-side routing)
export type AppView =
  | 'home'
  | 'search'
  | 'location'
  | 'evidence'
  | 'research'
  | 'timeline'
  | 'data-gaps'
  | 'sources'
  | 'methodology'
  | 'knowledge'
  | 'knowledge-article'
  | 'admin'
  | 'professional'
  | 'legal'
  | 'topics';

// Confidence Levels
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

// Evidence Types
export type EvidenceType = 'measured' | 'reported' | 'estimated' | 'modeled' | 'inferred';

// Quality Status
export type QualityStatus = 'valid' | 'flagged' | 'rejected';

// Verification Status
export type VerificationStatus = 'verified' | 'flagged' | 'rejected' | 'pending';

// Environmental Categories
export interface EnvironmentalCategory {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  icon?: string;
  color?: string;
  order: number;
}

// Evidence Record (full provenance)
export interface EvidenceRecord {
  id: string;
  value?: string;
  numericValue?: number;
  unit?: string;
  parameter?: {
    name: string;
    slug: string;
    unit?: string;
  };
  category?: EnvironmentalCategory;
  location?: {
    name: string;
    slug: string;
    country: string;
    region?: string;
    city?: string;
  };
  samplingSite?: string;
  latitude?: number;
  longitude?: number;
  geographicPrecision?: string;
  observationDate?: string;
  sourcePublicationDate?: string;
  collectionDate?: string;
  retrievalDate?: string;
  source?: {
    name: string;
    url?: string;
    provider?: string;
  };
  sourceTitle?: string;
  sourceUrl?: string;
  doi?: string;
  originalDatasetUrl?: string;
  publisher?: string;
  originalLanguage?: string;
  methodology?: string;
  measurementMethod?: string;
  license?: string;
  commercialUseStatus?: string;
  attributionRequirements?: string;
  confidence: ConfidenceLevel;
  evidenceType?: EvidenceType;
  verificationStatus: VerificationStatus;
  claim?: string;
  qualityStatus: QualityStatus;
  qualityNotes?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Location
export interface Location {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  country: string;
  region?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  type: string;
  description?: string;
  isDemo: boolean;
}

// Search Result
export interface SearchResult {
  type: 'location' | 'research' | 'evidence' | 'topic';
  title: string;
  description?: string;
  slug?: string;
  id?: string;
  category?: string;
  confidence?: ConfidenceLevel;
  date?: string;
}

// Data Gap
export interface DataGap {
  id: string;
  categoryName?: string;
  categorySlug?: string;
  gapLevel?: string;
  description?: string;
  availability?: boolean;
  recency?: string;
  geographicCoverage?: string;
  temporalCoverage?: string;
  parameterCoverage?: string;
  sourceDiversity?: string;
  measurementFrequency?: string;
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  date?: string;
  year?: number;
  title: string;
  description?: string;
  categorySlug?: string;
  evidenceType?: EvidenceType;
  sourceUrl?: string;
  sourceName?: string;
}

// Source (Registry)
export interface SourceRegistry {
  id: string;
  name: string;
  provider?: string;
  url?: string;
  license?: string;
  commercialUse?: string;
  attributionReq?: string;
  updateFrequency?: string;
  dataCategories?: string[];
  geographicCoverage?: string;
  status: string;
  lastSuccessfulFetch?: string;
  nextScheduledUpdate?: string;
  reliabilityNotes?: string;
}

// Research Item
export interface ResearchItem {
  id: string;
  title: string;
  authors?: string[];
  publicationDate?: string;
  journal?: string;
  doi?: string;
  abstract?: string;
  sourceName?: string;
  sourceUrl?: string;
  topic?: string;
  language?: string;
}

// Intelligence Summary
export interface IntelligenceSummary {
  whatWeKnow?: string;
  whatChanged?: string;
  whatMatters?: string;
  whatWeDontKnow?: string;
  evidenceStrength?: string;
  sourcesSummary?: string;
}

// Multilingual
export type Locale = 'en' | 'bn' | 'zh' | 'ja' | 'ar' | 'ru';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

// Source Status for Admin
export interface SourceStatus {
  sourceId: string;
  name: string;
  status: string;
  lastUpdate?: string;
  recordsAdded: number;
  recordsRejected: number;
}

// Navigation State
export interface NavigationState {
  currentView: AppView;
  previousView: AppView | null;
  locationSlug: string | null;
  searchQuery: string | null;
  evidenceId: string | null;
  knowledgeSlug: string | null;
  topicSlug: string | null;
}
