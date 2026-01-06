# Project Summary

## Overview
A complete TypeScript project that analyzes code similarity by extracting functions from TypeScript files and comparing them using the Levenshtein distance algorithm.

## Project Structure

```
ts-function-similarity/
├── src/
│   ├── index.ts              # CLI entry point with argument parsing
│   ├── functionExtractor.ts  # AST parsing and function extraction
│   ├── levenshtein.ts        # Levenshtein distance implementation
│   └── comparator.ts         # Function comparison logic
├── example/                  # Example TypeScript files for testing
│   ├── math.ts
│   ├── utils.ts
│   ├── duplicates.ts
│   └── EXAMPLE_RESULTS.md
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Core Components

### 1. Function Extractor (functionExtractor.ts)
- Recursively scans directories for .ts and .tsx files
- Uses `@typescript-eslint/typescript-estree` to parse files into AST
- Identifies function nodes:
  - Function declarations
  - Function expressions
  - Arrow functions
  - Method definitions
- Extracts function code, name, location, and line numbers

### 2. Levenshtein Distance Calculator (levenshtein.ts)
- Implements dynamic programming algorithm for Levenshtein distance
- Converts distance to similarity percentage (0-100%)
- Includes code normalization (removes comments and whitespace)

### 3. Function Comparator (comparator.ts)
- Compares all functions pairwise
- Calculates both raw and normalized similarity scores
- Supports filtering by minimum similarity threshold
- Finds duplicates (90%+ similarity)
- Sorts results by similarity score

### 4. CLI Tool (index.ts)
- Command-line interface with argument parsing
- Configurable options:
  - Directory path
  - Minimum similarity threshold
  - Result limit
  - Duplicates-only mode
- Formatted output with file paths and line numbers

## Key Features

1. **AST-based Parsing**: Uses TypeScript's official parser for accurate extraction
2. **Recursive Directory Scanning**: Analyzes entire codebases
3. **Smart Comparison**: Normalizes code for better similarity detection
4. **Flexible CLI**: Multiple options for different use cases
5. **Performance**: Efficient pairwise comparison with early filtering

## Use Cases

- Detect duplicate or copy-pasted code
- Identify refactoring opportunities
- Code review assistance
- Technical debt analysis
- Find similar implementations across a codebase

## Technical Decisions

- **Parser**: `@typescript-eslint/typescript-estree` for TypeScript AST parsing
- **Algorithm**: Levenshtein distance for string similarity
- **Module System**: Node16 for proper ESM support
- **Type Safety**: Full TypeScript with strict mode enabled

## Example Output

```
Found 12 functions

Comparing functions...

Found 3 similar function pairs

1. Similarity: 83.47% (Raw: 84.00%)
   Function 1: validateEmail
   Location:   example/duplicates.ts:3-6
   Function 2: checkEmail
   Location:   example/duplicates.ts:8-11
```

## Testing

The `example/` directory contains sample TypeScript files demonstrating:
- Similar mathematical functions
- Near-duplicate string formatting functions
- Identical validation logic with different names

Run: `npm start -- example --min 60` to see results.
