import { ExtractedFunction } from './functionExtractor.js';
import { calculateSimilarity, normalizeCode } from './levenshtein.js';

export interface SimilarityResult {
  function1: FunctionReference;
  function2: FunctionReference;
  similarityScore: number;
  normalizedScore: number;
  lines1: number;
  lines2: number;
}

export interface FunctionReference {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
}

export interface ComparisonOptions {
  minSimilarity?: number;
  minLines?: number;
  normalize?: boolean;
  excludeSelf?: boolean;
  onProgress?: (current: number, total: number) => void;
}

export class FunctionComparator {
  /**
   * Compare all functions with each other and return similarity scores
   */
  public compareAll(
    functions: ExtractedFunction[],
    options: ComparisonOptions = {}
  ): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    const {
      minSimilarity = 0,
      minLines = 0,
      normalize = true,
      excludeSelf = true,
      onProgress,
    } = options;

    // Pre-filter functions by minimum lines (MAJOR performance boost)
    let filteredFunctions = functions;
    if (minLines > 0) {
      filteredFunctions = functions.filter((f) => {
        const lines = f.endLine - f.startLine + 1;
        return lines >= minLines;
      });
    }

    const totalComparisons = (filteredFunctions.length * (filteredFunctions.length - 1)) / 2;
    let completedComparisons = 0;
    const progressInterval = Math.max(1, Math.floor(totalComparisons / 100)); // Report every 1%

    // Pre-normalize all function codes if needed (cache for performance)
    const normalizedCodes = normalize
      ? filteredFunctions.map((f) => normalizeCode(f.code))
      : [];

    for (let i = 0; i < filteredFunctions.length; i++) {
      const func1 = filteredFunctions[i];
      const lines1 = func1.endLine - func1.startLine + 1;
      const norm1 = normalize ? normalizedCodes[i] : func1.code;

      for (let j = i + 1; j < filteredFunctions.length; j++) {
        const func2 = filteredFunctions[j];
        const lines2 = func2.endLine - func2.startLine + 1;

        // Skip if same function (same file and location)
        if (
          excludeSelf &&
          func1.filePath === func2.filePath &&
          func1.startLine === func2.startLine
        ) {
          completedComparisons++;
          continue;
        }

        const norm2 = normalize ? normalizedCodes[j] : func2.code;

        // Quick filter: skip if length difference is too large
        const maxLength = Math.max(norm1.length, norm2.length);
        const minLength = Math.min(norm1.length, norm2.length);
        const maxPossibleSimilarity = (minLength / maxLength) * 100;

        if (maxPossibleSimilarity < minSimilarity) {
          completedComparisons++;
          if (onProgress && completedComparisons % progressInterval === 0) {
            onProgress(completedComparisons, totalComparisons);
          }
          continue;
        }

        // Calculate actual similarity
        const normalizedScore = calculateSimilarity(norm1, norm2);

        if (normalizedScore >= minSimilarity) {
          // Only calculate raw score if we need it
          const rawScore = normalize
            ? calculateSimilarity(func1.code, func2.code)
            : normalizedScore;

          results.push({
            function1: {
              name: func1.name,
              filePath: func1.filePath,
              startLine: func1.startLine,
              endLine: func1.endLine,
            },
            function2: {
              name: func2.name,
              filePath: func2.filePath,
              startLine: func2.startLine,
              endLine: func2.endLine,
            },
            similarityScore: rawScore,
            normalizedScore,
            lines1,
            lines2,
          });
        }

        completedComparisons++;

        // Report progress
        if (onProgress && completedComparisons % progressInterval === 0) {
          onProgress(completedComparisons, totalComparisons);
        }
      }

      // Help garbage collector by clearing reference
      if (normalize) {
        normalizedCodes[i] = '';
      }
    }

    // Report final progress
    if (onProgress) {
      onProgress(totalComparisons, totalComparisons);
    }

    // Sort by normalized similarity score (descending)
    return results.sort((a, b) => b.normalizedScore - a.normalizedScore);
  }

  /**
   * Find duplicates or near-duplicates (functions with high similarity)
   */
  public findDuplicates(
    functions: ExtractedFunction[],
    threshold: number = 90
  ): SimilarityResult[] {
    return this.compareAll(functions, {
      minSimilarity: threshold,
      normalize: true,
      excludeSelf: true,
    });
  }

  /**
   * Compare a specific function against all others
   */
  public compareOne(
    targetFunction: ExtractedFunction,
    allFunctions: ExtractedFunction[],
    options: ComparisonOptions = {}
  ): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    const { minSimilarity = 0, minLines = 0, normalize = true } = options;

    const lines1 = targetFunction.endLine - targetFunction.startLine + 1;

    // Skip if target function is too small
    if (minLines > 0 && lines1 < minLines) {
      return results;
    }

    for (const func of allFunctions) {
      const lines2 = func.endLine - func.startLine + 1;

      // Skip if function is too small
      if (minLines > 0 && lines2 < minLines) {
        continue;
      }

      // Skip self
      if (
        func.filePath === targetFunction.filePath &&
        func.startLine === targetFunction.startLine
      ) {
        continue;
      }

      const rawScore = calculateSimilarity(targetFunction.code, func.code);
      const normalizedScore = normalize
        ? calculateSimilarity(
            normalizeCode(targetFunction.code),
            normalizeCode(func.code)
          )
        : rawScore;

      if (normalizedScore >= minSimilarity) {
        results.push({
          function1: {
            name: targetFunction.name,
            filePath: targetFunction.filePath,
            startLine: targetFunction.startLine,
            endLine: targetFunction.endLine,
          },
          function2: {
            name: func.name,
            filePath: func.filePath,
            startLine: func.startLine,
            endLine: func.endLine,
          },
          similarityScore: rawScore,
          normalizedScore,
          lines1,
          lines2,
        });
      }
    }

    return results.sort((a, b) => b.normalizedScore - a.normalizedScore);
  }
}
