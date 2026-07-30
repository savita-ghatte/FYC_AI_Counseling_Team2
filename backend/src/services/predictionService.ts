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
    
    let rank = scoreType === 'rank' ? scoreValue : undefined;
    let percentile = scoreType === 'percentile' ? scoreValue : undefined;

    // Estimate rank if only percentile is given (approximate based on 1.2M candidates for JEE, 300k for others)
    if (!rank && percentile) {
      const totalCandidates = examName === 'JEE' ? 1200000 : 300000;
      rank = Math.max(1, Math.round(((100 - percentile) / 100) * totalCandidates));
    }

    // We'll fetch cutoffs matching the exact parameters for the last 3-5 years.
    const cacheKey = `predictions:${examName}:${category}:${gender}:${homeState}:${preferredState}:${preferredBranches?.join(',')}`;
    
    // Check Cache
    // const cached = await cacheService.get(cacheKey);
    // if (cached) return cached;

    // For simplicity in this engine, we fetch the latest cutoffs per course
    // Ideally, we fetch moving averages. Here we will fetch 2023 or latest available.
    
    const cutoffs = await prisma.cutoff.findMany({
      where: {
        category: category,
        ...(gender ? {
          OR: [
            { genderQuota: null },
            { genderQuota: 'Gender-Neutral' },
            ...(gender === 'Female' ? [{ genderQuota: 'Female-only' }] : [])
          ]
        } : {}),
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
    const fallbackCandidates: any[] = [];

    for (const [courseId, courseCutoffs] of courseCutoffMap.entries()) {
      // Calculate avg closing rank/percentile
      const validRankCutoffs = courseCutoffs.filter(c => c.closingRank).map(c => c.closingRank!);
      const validPercentileCutoffs = courseCutoffs.filter(c => c.closingPercentile).map(c => c.closingPercentile!);

      let avgClosingRank = validRankCutoffs.length > 0 ? validRankCutoffs.reduce((a, b) => a + b, 0) / validRankCutoffs.length : null;
      let avgClosingPercentile = validPercentileCutoffs.length > 0 ? validPercentileCutoffs.reduce((a, b) => a + b, 0) / validPercentileCutoffs.length : null;

      if (!avgClosingRank && !avgClosingPercentile) continue;

      // Determine confidence level based on number of years of data
      const dataPoints = Math.max(validRankCutoffs.length, validPercentileCutoffs.length);
      let confidenceLevel = 'Low';
      if (dataPoints >= 3) confidenceLevel = 'High';
      else if (dataPoints === 2) confidenceLevel = 'Medium';

      const courseInfo = courseCutoffs[0].course;
      const collegeInfo = courseInfo.college;

      // Filter by preferred state if provided
      if (preferredState && collegeInfo.state !== preferredState) continue;
      
      // Filter by preferred branches if provided
      if (preferredBranches && preferredBranches.length > 0) {
        if (!preferredBranches.some(b => courseInfo.name.toLowerCase().includes(b.toLowerCase()))) continue;
      }

      let status = '';
      let probability = 0;

      // Deterministic Logic based on rank
      if (rank && avgClosingRank) {
        const ratio = rank / avgClosingRank;
        
        if (ratio <= 0.85) {
          status = 'Safe';
          probability = Math.max(85, Math.min(100, Math.round(100 - (ratio * 17.6)))); 
        } else if (ratio <= 1.0) {
          status = 'Moderate';
          probability = Math.max(60, Math.min(84, Math.round(84 - ((ratio - 0.85) * 160))));
        } else if (ratio <= 1.3) {
          status = 'Reach';
          probability = Math.max(30, Math.min(59, Math.round(59 - ((ratio - 1.0) * 96))));
        } else if (ratio <= 2.0) {
          status = 'Dream';
          probability = Math.max(10, Math.min(29, Math.round(29 - ((ratio - 1.3) * 27))));
        } else {
          fallbackCandidates.push({ collegeInfo, courseInfo, avgClosingRank, avgClosingPercentile, confidenceLevel });
          continue; // Too far off
        }
      } 
      // Deterministic Logic based on percentile (higher is better)
      else if (percentile && avgClosingPercentile) {
        const diff = percentile - avgClosingPercentile;
        
        if (diff >= 0) {
          status = 'Safe';
          probability = Math.max(85, Math.min(100, Math.round(85 + (diff * 3))));
        } else if (diff >= -2) {
          status = 'Moderate';
          probability = Math.max(60, Math.min(84, Math.round(84 + (diff * 12))));
        } else if (diff >= -5) {
          status = 'Reach';
          probability = Math.max(30, Math.min(59, Math.round(59 + ((diff + 2) * 9.6))));
        } else if (diff >= -10) {
          status = 'Dream';
          probability = Math.max(10, Math.min(29, Math.round(29 + ((diff + 5) * 3.8))));
        } else {
          fallbackCandidates.push({ collegeInfo, courseInfo, avgClosingRank, avgClosingPercentile, confidenceLevel });
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
        probability,
        confidenceLevel,
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

    // Fallback Engine: If no predictions found, recommend the most lenient options
    if (predictions.length === 0 && fallbackCandidates.length > 0) {
      if (rank) {
        fallbackCandidates.sort((a, b) => (b.avgClosingRank || 0) - (a.avgClosingRank || 0));
      } else if (percentile) {
        fallbackCandidates.sort((a, b) => (a.avgClosingPercentile || 100) - (b.avgClosingPercentile || 100));
      }
      
      const topFallbacks = fallbackCandidates.slice(0, 5);
      for (const f of topFallbacks) {
        const matchScore = this.calculateMultiFactorScore(f.collegeInfo, weights);
        predictions.push({
          collegeId: f.collegeInfo.id,
          collegeName: f.collegeInfo.name,
          courseId: f.courseInfo.id,
          courseName: f.courseInfo.name,
          category,
          historicalAvgClosingRank: f.avgClosingRank ? Math.round(f.avgClosingRank) : null,
          historicalAvgClosingPercentile: f.avgClosingPercentile ? f.avgClosingPercentile.toFixed(2) : null,
          status: 'Dream',
          probability: 5,
          confidenceLevel: 'Low',
          matchScore: Math.round(matchScore),
          isFallback: true,
          collegeDetails: {
            location: `${f.collegeInfo.city}, ${f.collegeInfo.state}`,
            nirfRank: f.collegeInfo.nirfRank,
            fees: f.courseInfo.tuitionFee,
            ownership: f.collegeInfo.ownership,
            averageFees: f.collegeInfo.averageFees,
            placementRate: f.collegeInfo.placementRate,
          }
        });
      }
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
