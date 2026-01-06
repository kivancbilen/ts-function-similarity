# Example Results

This directory contains example TypeScript files to demonstrate the similarity analyzer.

## Files

- **math.ts** - Contains similar mathematical functions (sum, multiply, etc.)
- **utils.ts** - Contains similar string formatting functions and a sum function
- **duplicates.ts** - Contains near-duplicate email validation functions

## Running the Examples

### Find all similar functions (60%+ similarity)
```bash
npm start -- example --min 60
```

### Find high similarity functions (80%+)
```bash
npm start -- example --min 80
```

### Find potential duplicates (90%+)
```bash
npm start -- example --duplicates
```

### Limit results to top 5
```bash
npm start -- example --limit 5
```

## Expected Results

The tool should identify several groups of similar functions:

1. **Email validation functions** (~83% similarity)
   - `validateEmail`, `checkEmail`, `isValidEmail`
   - These are near-duplicates with only variable name differences

2. **Multiply functions** (~81% similarity)
   - `multiply` and `product`
   - Identical logic, different function names

3. **Name formatting functions** (~80% similarity)
   - `getUserName`, `getFullName`, `formatName`
   - Similar string concatenation logic

4. **Sum functions** (~65-76% similarity)
   - `calculateSum`, `addNumbers`, `sum`
   - Similar addition logic with different variable names
