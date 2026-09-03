import { db } from '@/lib/db';

/**
 * Intelligence Layer: Generates summaries and insights from stored evidence
 * This service only uses existing evidence - never fabricates data
 */

export async function generateIntelligenceSummary(
  locationId?: string,
  categoryId?: string
) {
  const where: any = {
    isDemo: false,
    qualityStatus: { not: 'invalid' },
    OR: [
      { verificationStatus: 'verified' },
      { verificationStatus: 'pending' },
      { 
        AND: [
          { evidenceType: { in: ['modeled', 'estimated'] } },
          { confidence: { in: ['MEDIUM', 'HIGH'] } },
          { qualityStatus: 'valid' }
        ]
      }
    ]
  };

  if (locationId) where.locationId = locationId;
  if (categoryId) where.categoryId = categoryId;

  const evidence = await db.evidenceRecord.findMany({
    where,
    include: {
      location: true,
      category: true,
      parameter: true,
      source: true,
    },
    orderBy: { observationDate: 'desc' },
    take: 100,
  });

  if (evidence.length === 0) {
    return {
      whatWeKnow: 'No verified evidence is currently available for this context.',
      whatChanged: 'Unable to determine changes without historical data.',
      whatMatters: 'No evidence available to assess significance.',
      whatWeDontKnow: 'No verified evidence exists for this context.',
      evidenceStrength: 'NO_EVIDENCE',
      sourcesSummary: 'No sources have provided data for this context.',
    };
  }

  // Generate summaries based on actual evidence
  const whatWeKnow = generateWhatWeKnow(evidence);
  const whatChanged = generateWhatChanged(evidence);
  const whatMatters = generateWhatMatters(evidence);
  const whatWeDontKnow = generateWhatWeDontKnow(evidence);
  const evidenceStrength = calculateEvidenceStrength(evidence);
  const sourcesSummary = generateSourcesSummary(evidence);

  return {
    whatWeKnow,
    whatChanged,
    whatMatters,
    whatWeDontKnow,
    evidenceStrength,
    sourcesSummary,
  };
}

function generateWhatWeKnow(evidence: any[]): string {
  const sources = new Set(evidence.map(e => e.source?.name).filter(Boolean));
  const parameters = new Set(evidence.map(e => e.parameter?.name || e.parameterId).filter(Boolean));
  const categories = new Set(evidence.map(e => e.category?.name).filter(Boolean));
  
  const recentEvidence = evidence.slice(0, 5);
  const evidenceTypes = new Set(evidence.map(e => e.evidenceType).filter(Boolean));
  const avgConfidence = calculateAverageConfidence(evidence);

  let summary = `Evidence available from ${sources.size} source(s) covering ${categories.size} environmental domain(s). `;
  const paramNames = Array.from(parameters).slice(0, 3);
  if (paramNames.length > 0) {
    summary += `Monitored parameters include ${paramNames.join(', ')}. `;
  }
  
  if (evidenceTypes.has('modeled')) {
    summary += 'Data includes modeled predictions (e.g., CAMS air quality). ';
  }
  if (evidenceTypes.has('measured')) {
    summary += 'Direct measurements are included. ';
  }
  
  if (avgConfidence === 'HIGH') {
    summary += 'Overall evidence confidence is high based on source authority and direct measurement methods.';
  } else if (avgConfidence === 'MEDIUM') {
    summary += 'Overall evidence confidence is medium, indicating reliance on modeled data or indirect measurements.';
  } else {
    summary += 'Overall evidence confidence is low, indicating limited direct measurements or unverified sources.';
  }

  return summary;
}

function generateWhatChanged(evidence: any[]): string {
  if (evidence.length < 2) {
    return 'Insufficient evidence to determine changes over time.';
  }

  const sortedByDate = [...evidence].sort((a, b) => 
    new Date(a.observationDate || 0).getTime() - new Date(b.observationDate || 0).getTime()
  );

  const mostRecent = sortedByDate[0];
  const oldest = sortedByDate[sortedByDate.length - 1];

  if (!mostRecent.observationDate || !oldest.observationDate) {
    return 'Unable to determine changes due to missing observation dates.';
  }

  const daysSpan = Math.floor(
    (new Date(mostRecent.observationDate).getTime() - new Date(oldest.observationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  let summary = `Evidence spans ${daysSpan} days. `;
  
  if (daysSpan < 7) {
    summary += 'Recent evidence is very recent, within the last week. ';
  } else if (daysSpan < 30) {
    summary += 'Evidence is from the last month. ';
  } else if (daysSpan < 365) {
    summary += 'Evidence is from the last year. ';
  } else {
    summary += 'Evidence spans multiple years. ';
  }

  const sourceCount = new Set(evidence.map(e => e.source?.name)).size;
  summary += `Data comes from ${sourceCount} distinct source(s).`;

  return summary;
}

function generateWhatMatters(evidence: any[]): string {
  const highConfidenceEvidence = evidence.filter(e => e.confidence === 'HIGH');
  const verifiedEvidence = evidence.filter(e => e.verificationStatus === 'verified');
  const recentEvidence = evidence.filter(e => {
    if (!e.observationDate) return false;
    const daysSince = Math.floor((Date.now() - new Date(e.observationDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 30;
  });

  let summary = '';
  
  if (highConfidenceEvidence.length > 0) {
    summary += `${highConfidenceEvidence.length} high-confidence evidence record(s) provide reliable insights. `;
  }
  
  if (verifiedEvidence.length > 0) {
    summary += `${verifiedEvidence.length} verified record(s) have undergone quality verification. `;
  }
  
  if (recentEvidence.length > 0) {
    summary += `${recentEvidence.length} record(s) are from the last 30 days, indicating recent monitoring activity. `;
  }

  if (summary === '') {
    summary = 'Evidence quality indicators are limited; most records are pending verification or have lower confidence levels.';
  }

  return summary;
}

function generateWhatWeDontKnow(evidence: any[]): string {
  const categories = new Set(evidence.map(e => e.category?.name).filter(Boolean));
  const expectedCategories = ['Water', 'Air', 'Carbon & Climate', 'Plastic & Microplastic', 'Chemical & Pollution', 'Industrial Environment'];
  const missingCategories = expectedCategories.filter(cat => !categories.has(cat));

  let summary = '';
  
  if (missingCategories.length > 0) {
    summary += `No evidence available for: ${missingCategories.join(', ')}. `;
  }
  
  const hasLocationData = evidence.some(e => e.locationId);
  if (!hasLocationData) {
    summary += 'No location-specific evidence. ';
  }
  
  const parameters = new Set(evidence.map(e => e.parameter?.name).filter(Boolean));
  if (parameters.size < 5) {
    summary += 'Limited parameter coverage (fewer than 5 different parameters monitored). ';
  }

  if (summary === '') {
    summary = 'Evidence covers expected domains and parameters; however, temporal or geographic coverage may have gaps.';
  }

  return summary;
}

function calculateEvidenceStrength(evidence: any[]): string {
  if (evidence.length === 0) return 'NO_EVIDENCE';
  
  const highConfidenceRatio = evidence.filter(e => e.confidence === 'HIGH').length / evidence.length;
  const verifiedRatio = evidence.filter(e => e.verificationStatus === 'verified').length / evidence.length;
  const sourceCount = new Set(evidence.map(e => e.source?.name)).size;
  const recency = calculateRecency(evidence);

  if (highConfidenceRatio > 0.7 && verifiedRatio > 0.5 && sourceCount >= 2 && recency === 'RECENT') {
    return 'STRONG';
  } else if (highConfidenceRatio > 0.5 && sourceCount >= 1) {
    return 'MODERATE';
  } else if (evidence.length > 0) {
    return 'LIMITED';
  } else {
    return 'INSUFFICIENT';
  }
}

function calculateRecency(evidence: any[]): string {
  const mostRecent = evidence.reduce((latest, e) => {
    if (!e.observationDate) return latest;
    return new Date(e.observationDate) > new Date(latest.observationDate || 0) ? e : latest;
  }, evidence[0]);

  if (!mostRecent?.observationDate) return 'UNKNOWN';

  const daysSince = Math.floor((Date.now() - new Date(mostRecent.observationDate).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince <= 7) return 'VERY_RECENT';
  if (daysSince <= 30) return 'RECENT';
  if (daysSince <= 90) return 'MODERATELY_RECENT';
  if (daysSince <= 365) return 'OLD';
  return 'VERY_OLD';
}

function calculateAverageConfidence(evidence: any[]): string {
  if (evidence.length === 0) return 'UNVERIFIED';
  
  const confidenceValues = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'UNVERIFIED': 0 };
  const total = evidence.reduce((sum, e) => sum + (confidenceValues[e.confidence as keyof typeof confidenceValues] || 0), 0);
  const avg = total / evidence.length;
  
  if (avg >= 2.5) return 'HIGH';
  if (avg >= 1.5) return 'MEDIUM';
  if (avg >= 0.5) return 'LOW';
  return 'UNVERIFIED';
}

function generateSourcesSummary(evidence: any[]): string {
  const sourceMap = new Map<string, number>();
  
  evidence.forEach(e => {
    if (e.source?.name) {
      sourceMap.set(e.source.name, (sourceMap.get(e.source.name) || 0) + 1);
    }
  });

  if (sourceMap.size === 0) return 'No sources provided data.';

  const entries = Array.from(sourceMap.entries()).sort((a, b) => b[1] - a[1]);
  const summary = entries.map(([name, count]) => `${name} (${count} record${count !== 1 ? 's' : ''})`).join(', ');
  
  return `Data from: ${summary}.`;
}

export async function generateTimeline(
  locationId?: string,
  categoryId?: string,
  limit: number = 20
) {
  const where: any = {
    isDemo: false,
    qualityStatus: { not: 'invalid' },
    observationDate: { not: null },
  };

  if (locationId) where.locationId = locationId;
  if (categoryId) where.categoryId = categoryId;

  const evidence = await db.evidenceRecord.findMany({
    where,
    include: {
      location: true,
      category: true,
      source: true,
      parameter: true,
    },
    orderBy: { observationDate: 'desc' },
    take: limit,
  });

  return evidence.map(e => ({
    id: e.id,
    date: e.observationDate?.toISOString().split('T')[0],
    year: e.observationDate ? new Date(e.observationDate).getFullYear() : undefined,
    title: e.claim || `${e.parameter?.name || 'Measurement'}: ${e.value || 'N/A'} ${e.unit || ''}`,
    description: e.methodology || e.measurementMethod,
    categorySlug: e.category?.slug,
    evidenceType: e.evidenceType,
    sourceUrl: e.sourceUrl,
    sourceName: e.source?.name,
  }));
}