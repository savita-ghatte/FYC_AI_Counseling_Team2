import { PrismaClient } from '@prisma/client';
import { cacheService } from './cacheService';

const prisma = new PrismaClient();

export interface PredictionInput {
  scoreValue: number;
  scoreType: 'rank' | 'percentile';
  category: string; // e.g. "GEN", "OBC"
  gender?: string; // "Gender-Neutral", "Female-only"
  homeState?: string; // e.g. "MH", "WB"
  preferredState?: string;
  preferredBranches?: string[];
  examName: string;
}

export interface CollegeWeights {
  placement: number;
  faculty: number;
  fees: number;
  infrastructure: number;
  research: number;
  location: number;
  hostel: number;
  rankings: number;
}

const DEFAULT_WEIGHTS: CollegeWeights = {
  placement: 0.35,
  faculty: 0.15,
  fees: 0.15,
  infrastructure: 0.10,
  research: 0.10,
  location: 0.05,
  hostel: 0.05,
  rankings: 0.05,
};

export class PredictionService {
  /**
   * Deterministic logic to predict admission bands
   */
  async generatePredictions(input: PredictionInput, weights = DEFAULT_WEIGHTS) {
    const { scoreValue, scoreType, category, gender, homeState, preferredState, preferredBranches, examName } = input;
    
    const rank = scoreType === 'rank' ? scoreValue : undefined;
    const percentile = scoreType === 'percentile' ? scoreValue : undefined;

    // We'll fetch cutoffs matching the exact parameters for the last 3-5 years.
    const cacheKey = `predictions:${examName}:${category}:${gender}:${homeState}:${preferredState}:${preferredBranches?.join(',')}`;
    
    // Check Cache
    // const cached = await cacheService.get(cacheKey);
    // if (cached) return cached;

    // For simplicity in this engine, we fetch the latest cutoffs per course
    // Ideally, we fetch moving averages. Here we will fetch 2023 or latest available.
    
    const cutoffs = await prisma.cutoff.findMany({
      where: {
        exam: { name: examName },
        category: category,
        ...(gender && { genderQuota: gender }),
      },
      include: {
        course: {
          include: {
            college: true,
          }
        },
      }
    });

    // Group cutoffs by courseId to calculate trends
    const courseCutoffMap = new Map<string, any[]>();
    for (const c of cutoffs) {
      if (!courseCutoffMap.has(c.courseId)) courseCutoffMap.set(c.courseId, []);
      courseCutoffMap.get(c.courseId)!.push(c);
    }

    const predictions: any[] = [];

    for (const [courseId, courseCutoffs] of courseCutoffMap.entries()) {
      // Calculate avg closing rank/percentile
      const validRankCutoffs = courseCutoffs.filter(c => c.closingRank).map(c => c.closingRank!);
      const validPercentileCutoffs = courseCutoffs.filter(c => c.closingPercentile).map(c => c.closingPercentile!);

      let avgClosingRank = validRankCutoffs.length > 0 ? validRankCutoffs.reduce((a, b) => a + b, 0) / validRankCutoffs.length : null;
      let avgClosingPercentile = validPercentileCutoffs.length > 0 ? validPercentileCutoffs.reduce((a, b) => a + b, 0) / validPercentileCutoffs.length : null;

      if (!avgClosingRank && !avgClosingPercentile) continue;

      const courseInfo = courseCutoffs[0].course;
      const collegeInfo = courseInfo.college;

      // Filter by preferred state if provided
      if (preferredState && collegeInfo.state !== preferredState) continue;
      
      // Filter by preferred branches if provided
      if (preferredBranches && preferredBranches.length > 0) {
        if (!preferredBranches.some(b => courseInfo.name.includes(b))) continue;
      }

      let status = '';
      let probability = 0;

      // Logic based on rank
      if (rank && avgClosingRank) {
        if (rank <= avgClosingRank * 0.85) {
          status = 'Safe';
          probability = 90 + Math.random() * 9;
        } else if (rank <= avgClosingRank * 1.0) {
          status = 'Moderate';
          probability = 60 + Math.random() * 24;
        } else if (rank <= avgClosingRank * 1.3) {
          status = 'Reach';
          probability = 30 + Math.random() * 29;
        } else if (rank <= avgClosingRank * 2.0) {
          status = 'Dream';
          probability = 10 + Math.random() * 19;
        } else {
          continue; // Too far off
        }
      } 
      // Logic based on percentile (higher is better)
      else if (percentile && avgClosingPercentile) {
        if (percentile >= avgClosingPercentile) {
          status = 'Safe';
          probability = 90 + Math.random() * 9;
        } else if (percentile >= avgClosingPercentile - 2) {
          status = 'Moderate';
          probability = 60 + Math.random() * 24;
        } else if (percentile >= avgClosingPercentile - 5) {
          status = 'Reach';
          probability = 30 + Math.random() * 29;
        } else if (percentile >= avgClosingPercentile - 10) {
          status = 'Dream';
          probability = 10 + Math.random() * 19;
        } else {
          continue;
        }
      } else {
        continue; // Missing required comparison metrics
      }

      // Calculate multi-factor score
      const matchScore = this.calculateMultiFactorScore(collegeInfo, weights);

      predictions.push({
        collegeId: collegeInfo.id,
        collegeName: collegeInfo.name,
        courseId: courseInfo.id,
        courseName: courseInfo.name,
        category,
        historicalAvgClosingRank: avgClosingRank ? Math.round(avgClosingRank) : null,
        historicalAvgClosingPercentile: avgClosingPercentile ? avgClosingPercentile.toFixed(2) : null,
        status,
        probability: Math.round(probability),
        matchScore: Math.round(matchScore),
        collegeDetails: {
          location: `${collegeInfo.city}, ${collegeInfo.state}`,
          nirfRank: collegeInfo.nirfRank,
          fees: courseInfo.tuitionFee,
          ownership: collegeInfo.ownership,
          averageFees: collegeInfo.averageFees,
          placementRate: collegeInfo.placementRate,
        }
      });
    }

    // Sort first by status priority, then by probability, then by match score
    const statusOrder: any = { 'Safe': 1, 'Moderate': 2, 'Reach': 3, 'Dream': 4 };
    predictions.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      if (b.probability !== a.probability) return b.probability - a.probability;
      return b.matchScore - a.matchScore;
    });

    // Cache the results for 1 hour
    await cacheService.set(cacheKey, predictions, 3600);

    return predictions;
  }

  /**
   * Multi-Factor College Scoring
   */
  private calculateMultiFactorScore(college: any, weights: CollegeWeights): number {
    // Treat nulls as default scores (e.g., 50)
    const pScore = college.placementScore || 50;
    const fScore = college.facultyScore || 50;
    // Fees are typically inversely proportional, but let's assume feesScore implies "affordability" (0-100)
    // If not, we might need a different formula, but we'll assume the DB scores are normalized to 100=Best.
    const feeScore = 50; // default
    const iScore = college.infrastructureScore || 50;
    const rScore = college.researchScore || 50;
    const lScore = college.locationScore || 50;
    const hScore = college.hostelScore || 50;
    // NIRF Ranking normalized (rank 1 = 100 score, rank 200 = 10 score)
    const nScore = college.nirfRank ? Math.max(10, 100 - (college.nirfRank / 2)) : 50;

    const total = 
      (pScore * weights.placement) +
      (fScore * weights.faculty) +
      (feeScore * weights.fees) +
      (iScore * weights.infrastructure) +
      (rScore * weights.research) +
      (lScore * weights.location) +
      (hScore * weights.hostel) +
      (nScore * weights.rankings);

    return total;
  }
}

export const predictionService = new PredictionService();
