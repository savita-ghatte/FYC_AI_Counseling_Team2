import { predictionService } from './src/services/predictionService';

async function test() {
  console.log("Testing with low percentile (50)...");
  const predictions = await predictionService.generatePredictions({
    examName: 'JEE',
    scoreValue: 50, // very low
    scoreType: 'percentile',
    category: 'GEN',
  });
  console.log(`Predictions: ${predictions.length}`);
  predictions.slice(0, 2).forEach((p: any) => console.log(`${p.collegeName} - ${p.status} - Fallback: ${p.isFallback}`));
}

test().catch(console.error);
