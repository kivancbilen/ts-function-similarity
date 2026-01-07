import { parentPort, workerData } from 'worker_threads';
import { calculateSimilarityWithThreshold, failsFrequencyCheck } from './levenshtein.js';
import type { ExtractedFunction } from './functionExtractor.js';

interface WorkerData {
  functions: ExtractedFunction[];
  startIdx: number;
  endIdx: number;
  minSimilarity: number;
  normalize: boolean;
}

interface WorkerResult {
  idx1: number;
  idx2: number;
  normalizedScore: number;
  rawScore: number;
  lines1: number;
  lines2: number;
}

const { functions, startIdx, endIdx, minSimilarity, normalize } = workerData as WorkerData;
const results: WorkerResult[] = [];

// Each worker processes a chunk of comparisons
for (let i = startIdx; i < endIdx; i++) {
  const func1 = functions[i];
  const norm1 = normalize ? func1.normalizedCode : func1.code;
  const lines1 = func1.endLine - func1.startLine + 1;

  for (let j = i + 1; j < functions.length; j++) {
    const func2 = functions[j];
    const norm2 = normalize ? func2.normalizedCode : func2.code;
    const lines2 = func2.endLine - func2.startLine + 1;

    // Apply all Phase 2 filters
    const len1 = norm1.length;
    const len2 = norm2.length;
    const maxLength = Math.max(len1, len2);
    const minLength = Math.min(len1, len2);

    // Filter 1: Ratio check
    if ((minLength / maxLength) * 100 < minSimilarity) continue;

    // Filter 2: Absolute difference check
    const maxAllowedDiff = Math.floor(maxLength * (1 - minSimilarity / 100));
    if (Math.abs(len1 - len2) > maxAllowedDiff) continue;

    // Filter 3: Character frequency check
    if (minSimilarity > 0 && failsFrequencyCheck(norm1, norm2, maxAllowedDiff)) continue;

    // Calculate similarity with early termination
    const normalizedScore = calculateSimilarityWithThreshold(
      norm1, norm2, minSimilarity
    );

    if (normalizedScore >= minSimilarity) {
      const rawScore = normalize
        ? calculateSimilarityWithThreshold(func1.code, func2.code, minSimilarity)
        : normalizedScore;

      results.push({
        idx1: i,
        idx2: j,
        normalizedScore,
        rawScore,
        lines1,
        lines2,
      });
    }
  }
}

parentPort?.postMessage(results);
