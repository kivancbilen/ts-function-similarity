# Performance Guide

## Impact of --min-lines Filter

The `--min-lines` filter provides **dramatic performance improvements** by pre-filtering functions before any comparisons are made.

### How It Works

**Before optimization:**
- Filter check inside nested loops
- Still iterates through all function pairs
- Performance: O(n²) with conditional checks

**After optimization (current):**
- Pre-filters array once before loops
- Reduces array size before comparison
- Performance: O(n²) but with much smaller n

### Real-World Performance Impact

#### For 1204 Functions (Your Use Case)

Assuming typical distribution where 30% are small utility functions:

| --min-lines | Functions Kept | Comparisons | Reduction | Est. Time* |
|-------------|----------------|-------------|-----------|------------|
| 0 (none)    | 1,204          | 724,806     | 0%        | ~5-10 min  |
| 5           | ~1,000         | 499,500     | 31%       | ~3-7 min   |
| 10          | ~800           | 319,600     | 56%       | ~2-4 min   |
| 15          | ~600           | 179,700     | 75%       | ~1-2 min   |
| 20          | ~400           | 79,800      | 89%       | ~30-60 sec |
| 30          | ~200           | 19,900      | 97%       | ~10-20 sec |

\* Approximate times on modern hardware (M1/M2/equivalent)

### Memory Impact

**Memory usage is also dramatically reduced:**

```
1204 functions:
- Without filter: ~1204 normalized strings in memory
- With --min-lines 20 (400 functions): ~400 normalized strings
- Memory reduction: 67%
```

### Performance by Codebase Size

#### Small Codebase (100 functions)
```bash
# Without filter: 4,950 comparisons
npm start -- ./src

# With --min-lines 10 (60 functions): 1,770 comparisons (64% reduction)
npm start -- ./src --min-lines 10
```

#### Medium Codebase (500 functions)
```bash
# Without filter: 124,750 comparisons (~30 sec)
npm start -- ./src

# With --min-lines 10 (350 functions): 61,075 comparisons (51% reduction, ~15 sec)
npm start -- ./src --min-lines 10

# With --min-lines 20 (200 functions): 19,900 comparisons (84% reduction, ~5 sec)
npm start -- ./src --min-lines 20
```

#### Large Codebase (1500 functions)
```bash
# Without filter: 1,124,250 comparisons (~10-15 min)
npm start -- ./src

# With --min-lines 10 (1000 functions): 499,500 comparisons (56% reduction, ~5-7 min)
npm start -- ./src --min-lines 10

# With --min-lines 20 (500 functions): 124,750 comparisons (89% reduction, ~1-2 min)
npm start -- ./src --min-lines 20
```

#### Very Large Codebase (2000+ functions)
```bash
# Without filter: 1,999,000+ comparisons (~20-30 min, may run out of memory)
npm start -- ./src

# With --min-lines 20 (800 functions): 319,600 comparisons (84% reduction, ~3-5 min)
npm start -- ./src --min-lines 20

# With --min-lines 30 (400 functions): 79,800 comparisons (96% reduction, ~1 min)
npm start -- ./src --min-lines 30
```

## Recommended Strategy

### For Your 1204 Functions

**Start aggressive, then broaden:**

1. **First pass - Find big duplicates:**
   ```bash
   npm start -- <your-dir> --min 90 --min-lines 20
   # Fast (~1 min), finds substantial duplicates worth refactoring
   ```

2. **Second pass - Medium functions:**
   ```bash
   npm start -- <your-dir> --min 85 --min-lines 10
   # Moderate speed (~3 min), finds more potential issues
   ```

3. **Optional - All similar code:**
   ```bash
   npm start -- <your-dir> --min 70 --min-lines 5
   # Slower (~5 min), comprehensive analysis
   ```

### General Guidelines

| Codebase Size | Recommended --min-lines | Why |
|---------------|------------------------|-----|
| < 200 functions | 5 or none | Fast enough without filter |
| 200-500 functions | 10 | Good balance of coverage and speed |
| 500-1000 functions | 15 | Focuses on meaningful code |
| 1000-2000 functions | 20 | Essential for reasonable performance |
| 2000+ functions | 20-30 | Required to avoid memory issues |

## Optimization Tips

1. **Use --min-lines 20 for initial exploration** of large codebases
2. **Combine with --min 85** to further reduce false positives
3. **Use --duplicates --min-lines 15** to quickly find refactoring targets
4. **Analyze subdirectories separately** if you have very large codebases:
   ```bash
   npm start -- ./src/services --min-lines 15
   npm start -- ./src/components --min-lines 15
   npm start -- ./src/utils --min-lines 10
   ```

## Complexity Formula

```
Without filter:
Comparisons = N × (N - 1) / 2
Memory = N normalized strings

With --min-lines:
Comparisons = F × (F - 1) / 2  (where F = filtered count)
Memory = F normalized strings
Reduction = ((N-F)/N) × 100%

Example (1204 functions, 400 kept):
Reduction = ((1204-400)/1204) × 100% = 67% fewer functions
Comparison reduction = ((724,806-79,800)/724,806) × 100% = 89%
```

## When NOT to Use --min-lines

- Small codebases (< 200 functions) - overhead not worth it
- When specifically looking for small utility function duplication
- Initial exploration phase (run once without filter to understand codebase)
- Testing/validation of the tool itself
