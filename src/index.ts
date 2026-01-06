#!/usr/bin/env node

import * as path from 'path';
import { FunctionExtractor } from './functionExtractor.js';
import { FunctionComparator } from './comparator.js';

interface CliOptions {
  directories: string[];
  minSimilarity: number;
  minLines: number;
  limit: number;
  duplicatesOnly: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  const options: CliOptions = {
    directories: [],
    minSimilarity: 50,
    minLines: 0,
    limit: 20,
    duplicatesOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--dir' || arg === '-d') {
      options.directories.push(args[++i]);
    } else if (arg === '--min' || arg === '-m') {
      options.minSimilarity = parseFloat(args[++i]);
    } else if (arg === '--min-lines') {
      options.minLines = parseInt(args[++i], 10);
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--duplicates') {
      options.duplicatesOnly = true;
    } else if (!arg.startsWith('-')) {
      options.directories.push(arg);
    }
  }

  // Default to current directory if no directories specified
  if (options.directories.length === 0) {
    options.directories.push('.');
  }

  return options;
}

function printHelp(): void {
  console.log(`
TypeScript Function Similarity Analyzer

Usage: ts-similarity [directories...] [options]

Options:
  -d, --dir <path>         Directory to analyze (can be used multiple times)
  -m, --min <number>       Minimum similarity score to display (0-100, default: 50)
  --min-lines <number>     Minimum number of lines for functions to compare (default: 0)
  -l, --limit <number>     Maximum number of results to display (default: 20)
  --duplicates             Only show potential duplicates (similarity >= 90%)
  -h, --help               Show this help message

Examples:
  ts-similarity                          # Analyze current directory
  ts-similarity ./src                    # Analyze src directory
  ts-similarity ./src ./lib              # Analyze multiple directories
  ts-similarity -d ./src -d ./lib        # Same as above using flags
  ts-similarity --min 70 --limit 10      # Show top 10 with 70%+ similarity
  ts-similarity --min-lines 10           # Only compare functions with 10+ lines
  ts-similarity --duplicates --min-lines 15  # Find duplicates in larger functions
  `);
}

function printResults(results: any[], limit: number): void {
  const displayed = results.slice(0, limit);

  console.log(`\nFound ${results.length} similar function pairs\n`);
  console.log('='.repeat(80));

  displayed.forEach((result, index) => {
    console.log(`\n${index + 1}. Similarity: ${result.normalizedScore.toFixed(2)}% (Raw: ${result.similarityScore.toFixed(2)}%)`);
    console.log(`   Function 1: ${result.function1.name} (${result.lines1} lines)`);
    console.log(`   Location:   ${path.relative(process.cwd(), result.function1.filePath)}:${result.function1.startLine}-${result.function1.endLine}`);
    console.log(`   Function 2: ${result.function2.name} (${result.lines2} lines)`);
    console.log(`   Location:   ${path.relative(process.cwd(), result.function2.filePath)}:${result.function2.startLine}-${result.function2.endLine}`);
  });

  if (results.length > limit) {
    console.log(`\n... and ${results.length - limit} more results`);
    console.log(`Use --limit to see more results`);
  }

  console.log('\n' + '='.repeat(80));
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.directories.length === 1) {
    console.log(`Analyzing TypeScript files in: ${options.directories[0]}\n`);
  } else {
    console.log(`Analyzing TypeScript files in ${options.directories.length} directories:\n`);
    options.directories.forEach((dir, i) => {
      console.log(`  ${i + 1}. ${dir}`);
    });
    console.log();
  }

  const extractor = new FunctionExtractor();
  console.log('Extracting functions...');

  let allFunctions = [];
  for (const directory of options.directories) {
    const targetDir = path.resolve(directory);
    const functions = await extractor.extractFromDirectory(targetDir);
    console.log(`  ${directory}: found ${functions.length} functions`);
    allFunctions.push(...functions);
  }

  console.log(`\nTotal: ${allFunctions.length} functions\n`);

  if (allFunctions.length === 0) {
    console.log('No TypeScript functions found in the specified directories.');
    return;
  }

  const functions = allFunctions;

  // Show filtering info if min-lines is used
  let filteredFunctionCount = functions.length;
  if (options.minLines > 0) {
    filteredFunctionCount = functions.filter((f) => {
      const lines = f.endLine - f.startLine + 1;
      return lines >= options.minLines;
    }).length;
    const filtered = functions.length - filteredFunctionCount;
    const originalComparisons = (functions.length * (functions.length - 1)) / 2;
    const filteredComparisons = (filteredFunctionCount * (filteredFunctionCount - 1)) / 2;
    const reduction = originalComparisons > 0 ? Math.round(((originalComparisons - filteredComparisons) / originalComparisons) * 100) : 0;
    console.log(`Filtering: ${filteredFunctionCount} functions meet minimum ${options.minLines} lines (${filtered} filtered out)`);
    console.log(`Performance: ${filteredComparisons.toLocaleString()} comparisons instead of ${originalComparisons.toLocaleString()} (${reduction}% reduction)\n`);
  }

  const totalComparisons = (filteredFunctionCount * (filteredFunctionCount - 1)) / 2;
  console.log(`Comparing functions (${totalComparisons.toLocaleString()} comparisons)...`);

  const comparator = new FunctionComparator();

  let lastProgress = 0;
  const progressCallback = (current: number, total: number) => {
    const percent = Math.floor((current / total) * 100);
    if (percent > lastProgress) {
      process.stdout.write(`\rProgress: ${percent}% (${current.toLocaleString()}/${total.toLocaleString()})`);
      lastProgress = percent;
    }
  };

  let results;
  if (options.duplicatesOnly) {
    results = comparator.compareAll(functions, {
      minSimilarity: 90,
      minLines: options.minLines,
      normalize: true,
      excludeSelf: true,
      onProgress: progressCallback,
    });
  } else {
    results = comparator.compareAll(functions, {
      minSimilarity: options.minSimilarity,
      minLines: options.minLines,
      normalize: true,
      excludeSelf: true,
      onProgress: progressCallback,
    });
  }

  console.log('\n'); // New line after progress

  printResults(results, options.limit);
}

// Export library API for programmatic use
export { FunctionExtractor } from './functionExtractor.js';
export { FunctionComparator } from './comparator.js';
export { levenshteinDistance } from './levenshtein.js';

// Run CLI when executed directly
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
