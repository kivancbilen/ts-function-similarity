# TypeScript Function Similarity Analyzer

A tool that recursively extracts TypeScript functions from a directory, parses them using the TypeScript AST parser, and compares them using Levenshtein distance to calculate similarity scores.

## Features

- Recursively scans directories for TypeScript files (.ts, .tsx)
- **Supports multiple directories and individual files**
- Extracts all function declarations, expressions, arrow functions, and methods
- Parses functions using `@typescript-eslint/typescript-estree`
- Calculates similarity scores using Levenshtein distance algorithm
- Normalizes code (removes comments and whitespace) for better comparison
- CLI tool with various options
- Real-time progress indicator for large codebases
- Memory optimizations:
  - Pre-caches normalized code to avoid repeated normalization
  - Early filtering based on length differences
  - Increased heap size (8GB) for large codebases
  - Progressive memory cleanup during comparison

## Installation

### From npm (recommended after publishing)

```bash
npm install -g ts-function-similarity
# Now you can use 'ts-similarity' command anywhere
ts-similarity ./src --min 70
```

### From source

```bash
cd ts-function-similarity
npm install
npm run build

# Optional: Link globally
npm link
ts-similarity ./src --min 70
```

## Usage

### Command Line

```bash
# Analyze current directory
npm start

# Analyze specific directory
npm start ./src

# Analyze multiple directories
npm start ./src ./lib ./utils

# Analyze specific files
npm start src/file1.ts src/file2.ts

# Mix directories and files
npm start ./src file.ts

# Using --dir flag (can be used multiple times)
npm start -- -d ./src -d ./lib --min 70

# Show only functions with 70%+ similarity
npm start -- --min 70

# Find potential duplicates (90%+ similarity)
npm start -- --duplicates

# Limit results to top 10
npm start -- --limit 10
```

### CLI Options

- `-d, --dir <path>` - Directory or file to analyze (can be used multiple times, default: current directory)
- `-m, --min <number>` - Minimum similarity score to display (0-100, default: 50)
- `--min-lines <number>` - Minimum number of lines for functions to compare (default: 0, no filter)
- `-l, --limit <number>` - Maximum number of results to display (default: 20)
- `--duplicates` - Only show potential duplicates (similarity >= 90%)
- `-h, --help` - Show help message

### Multiple Directories and Files

The tool supports analyzing multiple directories and files in a single run. This is useful for:

1. **Cross-module comparison**: Compare functions across different parts of your codebase
   ```bash
   npm start ./src/components ./src/services ./src/utils
   ```

2. **Monorepo analysis**: Compare functions across multiple packages
   ```bash
   npm start ./packages/core ./packages/ui ./packages/api
   ```

3. **Specific file comparison**: Compare only certain files
   ```bash
   npm start src/auth.ts src/user.ts lib/helpers.ts
   ```

4. **Mixed analysis**: Combine directories and files
   ```bash
   npm start ./src specific-file.ts
   ```

**Output example:**
```
Analyzing TypeScript files in 3 directories:

  1. ./src/components
  2. ./src/services
  3. ./src/utils

Extracting functions...
  ./src/components: found 342 functions
  ./src/services: found 189 functions
  ./src/utils: found 127 functions

Total: 658 functions
```

### Programmatic Usage

```typescript
import { FunctionExtractor } from './functionExtractor';
import { FunctionComparator } from './comparator';

// Extract functions from multiple directories
const extractor = new FunctionExtractor();
const functions1 = await extractor.extractFromDirectory('./src');
const functions2 = await extractor.extractFromDirectory('./lib');
const allFunctions = [...functions1, ...functions2];

// Compare all functions
const comparator = new FunctionComparator();
const results = comparator.compareAll(allFunctions, {
  minSimilarity: 50,
  normalize: true,
  excludeSelf: true,
});

// Find duplicates
const duplicates = comparator.findDuplicates(allFunctions, 90);
```

## How It Works

1. **Extraction**: The tool recursively scans the specified directory for TypeScript files
2. **Parsing**: Each file is parsed into an AST using `@typescript-eslint/typescript-estree`
3. **Function Detection**: The AST is traversed to find all function nodes:
   - Function declarations
   - Function expressions
   - Arrow functions
   - Method definitions
4. **Comparison**: Functions are compared pairwise using Levenshtein distance
5. **Normalization**: Code is normalized by removing comments and whitespace for better comparison
6. **Scoring**: Similarity scores are calculated as a percentage (0-100%)

## Levenshtein Distance

The Levenshtein distance measures the minimum number of single-character edits (insertions, deletions, or substitutions) needed to transform one string into another. This tool converts that distance into a similarity percentage:

```
similarity = ((max_length - distance) / max_length) × 100
```

## Output

The tool displays:
- Number of functions found
- Number of similar pairs
- For each pair:
  - Similarity score (normalized and raw)
  - Function names
  - File locations with line numbers

## Example Output

```
Analyzing TypeScript files in: src

Extracting functions...
Found 1204 functions

Comparing functions (724,806 comparisons)...
Progress: 25% (181,201/724,806)
Progress: 50% (362,403/724,806)
Progress: 75% (543,604/724,806)
Progress: 100% (724,806/724,806)


Found 10 similar function pairs

================================================================================

1. Similarity: 85.32% (Raw: 78.45%)
   Function 1: calculateTotal (11 lines)
   Location:   src/utils/math.ts:15-25
   Function 2: computeSum (11 lines)
   Location:   src/helpers/calculator.ts:42-52

================================================================================
```

## Filtering by Function Size

The `--min-lines` option allows you to focus on substantial code blocks and ignore small utility functions that might coincidentally match.

### Why Use --min-lines?

**Problem**: Small functions (2-3 lines) often have high similarity scores but aren't meaningful duplicates:
```typescript
// These might show 100% similarity but aren't really duplicates
const add = (a, b) => a + b;
const sum = (x, y) => x + y;
```

**Solution**: Use `--min-lines` to filter out small functions and prioritize larger code blocks:

```bash
# Only compare functions with 10 or more lines
npm start -- ./src --min-lines 10

# Find duplicates in substantial functions (15+ lines)
npm start -- ./src --duplicates --min-lines 15

# Focus on larger functions with high similarity
npm start -- ./src --min 80 --min-lines 20
```

### Benefits

1. **Reduces noise**: Eliminates trivial matches like simple getters/setters
2. **Finds meaningful duplicates**: Focuses on substantial code that's worth refactoring
3. **Massive performance boost**: Pre-filters functions before comparison, dramatically reducing comparisons
4. **Better results**: Prioritizes functions where duplication actually matters

### Performance Impact

The `--min-lines` filter provides **dramatic performance improvements** by pre-filtering functions before comparison:

```bash
$ npm start -- ./src --min-lines 10

# Example with 1204 functions:
# Without filter: 724,806 comparisons
# With --min-lines 10 (500 functions): 124,750 comparisons (83% reduction)
# With --min-lines 20 (200 functions): 19,900 comparisons (97% reduction)
```

**Real-world example:**
```
Filtering: 7 functions meet minimum 4 lines (5 filtered out)
Performance: 21 comparisons instead of 66 (68% reduction)
```

### Example Output

```bash
$ npm start -- ./src --min 70 --min-lines 10

# Without --min-lines: 150 results (many 2-3 line functions)
# With --min-lines 10: 23 results (only substantial functions)
```

### Recommended Values

- **10 lines**: Good default for filtering trivial functions
- **15 lines**: Focus on medium-to-large functions
- **20+ lines**: Only compare substantial code blocks
- **5 lines**: Light filtering, keeps most functions

## Project Structure

```
ts-function-similarity/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── functionExtractor.ts  # AST parsing and function extraction
│   ├── levenshtein.ts        # Levenshtein distance algorithm
│   └── comparator.ts         # Function comparison logic
├── package.json
├── tsconfig.json
└── README.md
```

## Performance Tips

### For Large Codebases (1000+ functions)

When analyzing large codebases, consider these optimization strategies:

1. **Use a higher similarity threshold**: Set `--min 80` or `--min 90` to filter out most comparisons early
   ```bash
   npm start -- ./src --min 90
   ```

2. **Use duplicates mode**: This automatically sets the threshold to 90%
   ```bash
   npm start -- ./src --duplicates
   ```

3. **Memory usage**: The tool is configured with 8GB heap size by default. For very large codebases (2000+ functions), you may need more:
   ```bash
   node --max-old-space-size=16384 dist/index.js ./src --min 90
   ```

4. **Complexity**: With N functions, the tool performs N×(N-1)/2 comparisons:
   - 100 functions = 4,950 comparisons
   - 500 functions = 124,750 comparisons
   - 1,000 functions = 499,500 comparisons
   - 1,500 functions = 1,124,250 comparisons
   - 2,000 functions = 1,999,000 comparisons

## Use Cases

- Find duplicate or near-duplicate functions in a codebase
- Identify refactoring opportunities
- Detect copy-pasted code
- Code review assistance
- Technical debt analysis

## MCP Server

This package includes an MCP (Model Context Protocol) server that allows AI assistants like Claude to analyze your TypeScript code for function similarity.

See [MCP.md](./MCP.md) for detailed setup instructions and usage examples.

**Quick setup for Claude Desktop:**

1. Install the package globally: `npm install -g ts-function-similarity`
2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "ts-function-similarity": {
         "command": "ts-similarity-mcp"
       }
     }
   }
   ```
3. Restart Claude Desktop
4. Ask Claude to analyze your TypeScript code for similarities!

## License

MIT - See [LICENSE](./LICENSE) file for details
