# Publishing to npm

This guide will help you publish the ts-function-similarity package to npm.

## Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup) if you don't have one
2. **npm CLI**: Make sure you have npm installed (comes with Node.js)

## Step 1: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Step 2: Verify Package Name

Check if the package name `ts-function-similarity` is available:

```bash
npm view ts-function-similarity
```

If the package doesn't exist, you're good to go! If it does exist, you'll need to:
- Choose a different name, or
- Use a scoped package name like `@yourusername/ts-function-similarity`

To use a scoped package, update `package.json`:
```json
{
  "name": "@yourusername/ts-function-similarity",
  ...
}
```

## Step 3: Final Pre-Publish Checks

```bash
# Make sure everything builds correctly
npm run build

# Test the package locally (optional but recommended)
npm pack
# This creates a .tgz file you can test with: npm install ./ts-function-similarity-1.2.0.tgz

# Check what files will be published
npm pack --dry-run
```

## Step 4: Publish

For a public package (free):
```bash
npm publish
```

For a scoped package, make it public:
```bash
npm publish --access public
```

## Step 5: Verify Publication

Check that your package is live:
```bash
npm view ts-function-similarity
```

Or visit: `https://www.npmjs.com/package/ts-function-similarity`

## Step 6: Test Installation

Test installing your package globally:
```bash
npm install -g ts-function-similarity

# Test CLI
ts-similarity --help

# Test MCP server
ts-similarity-mcp
# (Press Ctrl+C to exit)
```

## Updating the Package

When you want to publish updates:

1. Make your changes
2. Update the version in `package.json`:
   - Patch release (bug fixes): `1.2.0` → `1.2.1`
   - Minor release (new features): `1.2.0` → `1.3.0`
   - Major release (breaking changes): `1.2.0` → `2.0.0`

3. Or use npm version command:
   ```bash
   npm version patch  # For bug fixes
   npm version minor  # For new features
   npm version major  # For breaking changes
   ```

4. Commit the version change:
   ```bash
   git add package.json package-lock.json
   git commit -m "Bump version to x.x.x"
   git push
   ```

5. Publish:
   ```bash
   npm publish
   ```

## Common Issues

### "You do not have permission to publish"
- The package name might be taken
- Try a scoped package: `@yourusername/ts-function-similarity`

### "Must be logged in to publish"
- Run `npm login` again
- Verify with `npm whoami`

### "Package name too similar to existing package"
- npm might flag similar names
- Choose a more unique name

## Best Practices

1. **Always test before publishing**: Run `npm pack --dry-run` to see what will be published
2. **Use semantic versioning**: Follow the major.minor.patch format
3. **Keep your README updated**: It's the first thing users see on npm
4. **Tag releases in git**: Create git tags for each release
   ```bash
   git tag v1.2.0
   git push --tags
   ```
5. **Update CHANGELOG.md**: Document what changed in each version

## Setting up GitHub Repository (Recommended)

If you haven't already, push to GitHub:

```bash
# If repository doesn't exist yet
git remote add origin https://github.com/kivancbilen/ts-function-similarity.git
git push -u origin main

# Create releases on GitHub to match your npm versions
# Go to: https://github.com/kivancbilen/ts-function-similarity/releases
# Click "Create a new release"
```

This ensures the repository links in your package.json work correctly.

## Unpublishing (Emergency Only)

If you need to unpublish (avoid if possible):

```bash
# Unpublish a specific version (within 72 hours of publishing)
npm unpublish ts-function-similarity@1.2.0

# Deprecate instead (better option)
npm deprecate ts-function-similarity@1.2.0 "This version has critical bugs, please upgrade"
```

**Note**: You can only unpublish within 72 hours of publishing. After that, you should deprecate instead.

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm Package Naming Guidelines](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#name)
