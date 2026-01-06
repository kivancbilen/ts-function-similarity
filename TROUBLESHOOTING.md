# Troubleshooting Guide

## Memory Issues

### Problem: "JavaScript heap out of memory" error

**Symptoms:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**

1. **Increase the similarity threshold** to filter out more comparisons:
   ```bash
   npm start -- ./src --min 90
   ```

2. **Increase Node.js heap size** (default is 8GB):
   ```bash
   node --max-old-space-size=16384 dist/index.js ./src --min 90
   ```

   Values are in MB:
   - 8192 = 8GB (default)
   - 12288 = 12GB
   - 16384 = 16GB

3. **Analyze subdirectories separately** instead of the entire codebase:
   ```bash
   npm start -- ./src/components --min 80
   npm start -- ./src/services --min 80
   npm start -- ./src/utils --min 80
   ```

4. **Exclude large directories** like node_modules (already excluded by default):
   - The tool automatically skips `node_modules` and hidden directories

## Performance Issues

### Problem: Tool is running too slowly

**Symptoms:**
- Progress indicator shows very slow progress
- Tool takes hours to complete

**Solutions:**

1. **Use a higher minimum similarity threshold**:
   ```bash
   npm start -- ./src --min 85
   ```
   This dramatically reduces the number of results that need to be stored.

2. **Understanding the complexity**:
   - 1,204 functions = 724,806 comparisons
   - Each comparison involves:
     - Normalizing both function codes
     - Calculating Levenshtein distance
     - Storing results if above threshold

3. **Expected performance**:
   - ~1,000-10,000 comparisons per second (depending on function size)
   - 1,204 functions should take 1-5 minutes on modern hardware

## Parser Errors

### Problem: "Error parsing [file]"

**Symptoms:**
```
Error parsing /path/to/file.ts: SyntaxError: ...
```

**Causes:**
- Invalid TypeScript syntax
- Unsupported TypeScript features
- Missing dependencies

**Solutions:**

1. **Check the file for syntax errors**:
   ```bash
   npx tsc --noEmit path/to/file.ts
   ```

2. **The tool continues** processing other files even if one fails

3. **Update TypeScript parser** if you're using very new syntax:
   ```bash
   npm update @typescript-eslint/typescript-estree
   ```

## No Functions Found

### Problem: "Found 0 functions"

**Causes:**
- Wrong directory path
- No TypeScript files in the directory
- All files are in excluded directories (node_modules, hidden folders)

**Solutions:**

1. **Check the directory path**:
   ```bash
   ls ./src  # Verify the directory exists
   ```

2. **Look for TypeScript files**:
   ```bash
   find ./src -name "*.ts" -o -name "*.tsx"
   ```

3. **Make sure you're not in node_modules**:
   The tool automatically skips `node_modules` and `.hidden` directories

## Progress Not Showing

### Problem: No progress indicator appears

**Causes:**
- Very small number of functions (< 100)
- Progress updates every 1% of total comparisons

**Solutions:**

This is normal for small codebases. Progress indicator is most useful for:
- 500+ functions (124,750+ comparisons)
- 1000+ functions (499,500+ comparisons)

## Results Not as Expected

### Problem: Functions that look similar don't show up

**Causes:**
- Similarity score is below the threshold
- Functions have very different variable names or structure

**Solutions:**

1. **Lower the threshold**:
   ```bash
   npm start -- ./src --min 50
   ```

2. **Check normalization** - the tool removes:
   - Comments
   - Whitespace differences

   But preserves:
   - Variable names
   - Function structure
   - Logic flow

3. **View more results**:
   ```bash
   npm start -- ./src --min 50 --limit 50
   ```

## Global Installation Issues

### Problem: `ts-similarity` command not found after `npm link`

**Solutions:**

1. **Verify the link was created**:
   ```bash
   npm link
   which ts-similarity
   ```

2. **Check Node.js bin directory** is in PATH:
   ```bash
   npm config get prefix
   ```

3. **Use npx instead**:
   ```bash
   cd ts-function-similarity
   npx ts-similarity ./src --min 70
   ```

## Getting Help

If you're still experiencing issues:

1. Check that you're using Node.js 16 or higher:
   ```bash
   node --version
   ```

2. Rebuild the project:
   ```bash
   npm run build
   ```

3. Try with the example directory first:
   ```bash
   npm start -- example --min 60
   ```

4. File an issue with:
   - Node.js version
   - Number of functions in your codebase
   - Command you ran
   - Full error message
