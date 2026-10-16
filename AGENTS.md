<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git Branch & Commit Message Conventions

### 1. Default Primary Branch
- The primary branch for this repository is `main`.
- All feature/fix branches should branch off and merge into `main`.

### 2. Conventional Commits in English
All Git commit messages MUST follow the [Conventional Commits specification](https://www.conventionalcommits.org/) and be written in **English**.

Format:
```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

#### Allowed Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect code logic (formatting, missing semi-colons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes affecting build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Maintenance tasks, repo configs, tooling setup
- `revert`: Reverting a previous commit

#### Rules:
- The description must be in English.
- Use imperative, present tense: "add" not "added", "fix" not "fixed".
- Do not capitalize the first letter of the subject.
- No trailing period (`.`) at the end of the subject.
