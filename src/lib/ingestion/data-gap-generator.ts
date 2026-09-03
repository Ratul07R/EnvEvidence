import { db } from '@/lib/db';

/**
 * Automatically generates and updates data gap records based on evidence coverage
 * This should be called after each ingestion cycle to keep data gaps current
 */
export async function generateDataGaps() {
  const categories = await db.environmentalCategory.findMany({
    orderBy: { order: 'asc' },
  });

  const locations = await db.location.findMany({
    where: { isDemo: false },
  });

  const gapResults: Array<{ location: string; category: string; action: string }> = [];

  for (const category of categories) {
    for (const location of locations) {
      // Check if evidence exists for this category/location combination
      const evidenceCount = await db.evidenceRecord.count({
        where: {
          categoryId: category.id,
          locationId: location.id,
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
        },
      });

      // Determine gap level based on evidence count and recency
      let gapLevel: string;
      let description: string;
      let availability: boolean;

      if (evidenceCount === 0) {
        gapLevel = 'NO_EVIDENCE';
        description = `No ${category.name.toLowerCase()} evidence available for ${location.name}. Data may exist but is not currently ingested by the platform.`;
        availability = false;
      } else if (evidenceCount < 5) {
        gapLevel = 'LIMITED';
        description = `Limited ${category.name.toLowerCase()} evidence available for ${location.name} (${evidenceCount} records). Coverage may be insufficient for comprehensive analysis.`;
        availability = true;
      } else if (evidenceCount < 20) {
        gapLevel = 'MODERATE';
        description = `Moderate ${category.name.toLowerCase()} evidence available for ${location.name} (${evidenceCount} records). Data exists but may have temporal or parameter gaps.`;
        availability = true;
      } else {
        gapLevel = 'STRONG';
        description = `Strong ${category.name.toLowerCase()} evidence coverage for ${location.name} (${evidenceCount} records). Multiple sources and parameters available.`;
        availability = true;
      }

      // Check recency of most recent evidence
      const recentEvidence = await db.evidenceRecord.findFirst({
        where: {
          categoryId: category.id,
          locationId: location.id,
          isDemo: false,
          qualityStatus: { not: 'invalid' },
        },
        orderBy: { observationDate: 'desc' },
      });

      let recency: string;
      if (!recentEvidence) {
        recency = 'NO_DATA';
      } else {
        const daysSinceObservation = Math.floor(
          (Date.now() - recentEvidence.observationDate!.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceObservation <= 7) {
          recency = 'VERY_RECENT';
        } else if (daysSinceObservation <= 30) {
          recency = 'RECENT';
        } else if (daysSinceObservation <= 90) {
          recency = 'MODERATELY_RECENT';
        } else if (daysSinceObservation <= 365) {
          recency = 'OLD';
        } else {
          recency = 'VERY_OLD';
        }
      }

      // Upsert data gap record
      const existingGap = await db.dataGap.findFirst({
        where: {
          locationId: location.id,
          categorySlug: category.slug,
        },
      });

      if (existingGap) {
        await db.dataGap.update({
          where: { id: existingGap.id },
          data: {
            categoryName: category.name,
            gapLevel,
            description,
            availability,
            recency,
            updatedAt: new Date(),
          },
        });
        gapResults.push({ location: location.name, category: category.name, action: 'updated' });
      } else {
        await db.dataGap.create({
          data: {
            locationId: location.id,
            categorySlug: category.slug,
            categoryName: category.name,
            gapLevel,
            description,
            availability,
            recency,
            isDemo: false,
          },
        });
        gapResults.push({ location: location.name, category: category.name, action: 'created' });
      }
    }
  }

  return {
    success: true,
    gapsProcessed: gapResults.length,
    results: gapResults,
  };
}

/**
 * Analyzes parameter coverage within a category/location combination
 */
export async function analyzeParameterCoverage(categoryId: string, locationId: string) {
  const parameters = await db.parameter.findMany({
    where: { categoryId },
  });

  const coverage: Record<string, { hasData: boolean; recordCount: number }> = {};

  for (const parameter of parameters) {
    const count = await db.evidenceRecord.count({
      where: {
        parameterId: parameter.id,
        locationId,
        isDemo: false,
        qualityStatus: { not: 'invalid' },
      },
    });

    coverage[parameter.slug] = {
      hasData: count > 0,
      recordCount: count,
    };
  }

  const availableParameters = Object.values(coverage).filter(c => c.hasData).length;
  const totalParameters = Object.keys(coverage).length;
  const coveragePercentage = totalParameters > 0 ? (availableParameters / totalParameters) * 100 : 0;

  return {
    totalParameters,
    availableParameters,
    coveragePercentage,
    parameterDetails: coverage,
  };
}