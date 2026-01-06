# Changelog

## Version 1.2.0 - Minimum Lines Filter

### New Features

#### Minimum Lines Threshold (`--min-lines`)
- **Filter by function size**: Only compare functions with a minimum number of lines
- **Focus on substantial code**: Eliminate noise from trivial 2-3 line functions
- **Better duplicate detection**: Find meaningful duplicates in larger code blocks
- **Performance improvement**: Skip comparisons of small functions

**Usage:**
```bash
# Only compare functions with 10+ lines
npm start -- ./src --min-lines 10

# Find duplicates in substantial functions
npm start -- ./src --duplicates --min-lines 15
```

**Benefits:**
- Reduces false positives from simple utility functions
- Focuses refactoring efforts on meaningful duplicates
- **Massive performance boost**: Pre-filters functions before comparison

**Performance Optimization:**
- Functions are filtered BEFORE comparison loops (not during)
- Dramatically reduces number of comparisons
- Example: 1204 functions with --min-lines 20
  - Without filter: 724,806 comparisons
  - With filter (200 functions): 19,900 comparisons
  - **97% reduction in comparisons!**

**Output Enhancements:**
- Line counts displayed for each function in results
- Performance metrics showing comparison reduction
- Example output:
  ```
  Filtering: 7 functions meet minimum 4 lines (5 filtered out)
  Performance: 21 comparisons instead of 66 (68% reduction)
  ```

---

## Version 1.1.0 - Multiple Directory Support

### New Features

#### Multiple Directories and Files Support
- **Analyze multiple directories**: Pass multiple directory paths to compare functions across different parts of your codebase
- **Individual file support**: Can now analyze specific TypeScript files, not just directories
- **Mixed input**: Combine directories and files in a single command

**Examples:**
```bash
# Multiple directories
npm start ./src ./lib ./utils

# Multiple files
npm start src/auth.ts src/user.ts

# Mixed
npm start ./src specific-file.ts

# Using flags (can be repeated)
npm start -- -d ./src -d ./lib -d ./utils
```

**Benefits:**
- Compare functions across different modules or packages
- Analyze monorepo structures
- Focus on specific files when needed
- Find duplicates between different parts of your codebase

### Improvements

#### Progress Indicator
- Real-time progress updates during comparison
- Shows percentage complete and comparison count
- Updates every 1% for smooth progress tracking
- Format: `Progress: 45% (181,201/724,806)`

#### Memory Optimizations
- Increased default heap size to 8GB
- Pre-caching of normalized code
- Early filtering based on length differences (skips impossible matches)
- Progressive memory cleanup during iteration
- Reduced redundant calculations

**Performance improvements:**
- ~30-40% faster for large codebases
- Can now handle 1500+ functions without running out of memory
- More efficient memory usage through incremental cleanup

#### Enhanced Output
- Shows per-directory/file function counts during extraction
- Clear indication when analyzing multiple sources
- Better formatted output for multi-directory analysis

### Bug Fixes
- Fixed memory overflow with large codebases (1000+ functions)
- Fixed missing progress indicator

### Documentation
- Added comprehensive troubleshooting guide
- Updated README with multiple directory examples
- Added performance tips for large codebases
- Documented memory optimization strategies

---

## Version 1.0.0 - Initial Release

### Features
- Recursive TypeScript file scanning
- Function extraction using TypeScript AST parser
- Levenshtein distance-based similarity calculation
- Code normalization (removes comments and whitespace)
- CLI tool with configurable options
- Support for all function types:
  - Function declarations
  - Function expressions
  - Arrow functions
  - Method definitions
