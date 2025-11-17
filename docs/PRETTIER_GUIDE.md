# Prettier Configuration Guide

This project uses Prettier to automatically format markdown files, ensuring
consistent spacing, line endings, and code style across all documentation.

## Configuration

### Prettier Settings

The project uses the following Prettier configuration (`.prettierrc.json`):

- **Line Width**: 80 characters
- **Tab Width**: 2 spaces
- **Use Tabs**: false (spaces only)
- **End of Line**: LF (Linux/Mac style)
- **Prose Wrap**: Always (for markdown files)

### Markdown-Specific Settings

For markdown files (`*.md`), Prettier will:

- Wrap text at 80 characters for better readability
- Ensure consistent spacing around headers and lists
- Standardize line endings to LF
- Format embedded code blocks
- Normalize quote styles in YAML frontmatter

## Available Scripts

### Format All Markdown Files

```bash
npm run format:md
```

This command will format all markdown files in the project.

### Check Markdown Formatting

```bash
npm run format:md:check
```

This command checks if markdown files follow the formatting rules without
modifying them.

### Format All Files

```bash
npm run format
```

This command formats all supported files in the project (JS, TS, JSON, MD,
etc.).

### Check All File Formatting

```bash
npm run format:check
```

This command checks formatting for all supported files without modifying them.

## What Gets Formatted

Prettier will format these markdown files:

- All `.md` files in the project root
- Beer descriptions in `src/data/beers/`
- Food item descriptions in `src/data/food/`
- Event descriptions in `src/data/events/`
- Template files in `src/data/templates/`
- Documentation files throughout the project

## What Gets Ignored

The following files/directories are excluded from formatting:

- `node_modules/`
- `dist/` and `build/` directories
- Binary files (images, fonts, etc.)
- Generated files and lockfiles
- Cache directories

## Example Formatting Changes

### Before Prettier

```markdown
---
name: 'Beer Name'
description:
  'This is a very long description that exceeds the 80 character limit and
  should be wrapped to multiple lines for better readability.'
---

# Heading

This is a paragraph that is really long and goes beyond the recommended line
length which makes it harder to read in editors and diff tools.

- Uneven spacing in lists
- Mixed indentation
```

### After Prettier

```markdown
---
name: 'Beer Name'
description:
  'This is a very long description that exceeds the 80 character limit and
  should be wrapped to multiple lines for better readability.'
---

# Heading

This is a paragraph that is really long and goes beyond the recommended line
length which makes it harder to read in editors and diff tools.

- Uneven spacing in lists
- Mixed indentation
```

## Integration with VS Code

If you're using VS Code, you can install the Prettier extension and configure it
to format on save:

1. Install the "Prettier - Code formatter" extension
2. Add to your VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Pre-commit Hook (Optional)

Consider adding a pre-commit hook to automatically format files before commits:

```bash
npm install --save-dev husky lint-staged
```

Then add to `package.json`:

```json
{
  "lint-staged": {
    "*.md": "prettier --write"
  }
}
```

This ensures all markdown files are properly formatted before they're committed
to the repository.
