---
description: 'Create a GitHub Pull Request from the current branch. Use when: opening a PR, creating a pull request, submitting code for review.'
argument-hint: 'Optionally specify a title, base branch, or draft'
---

Create a GitHub Pull Request for the current branch following these steps:

1. **Check current branch**: If on `main`, ask the user for a branch name and create it before proceeding (`git checkout -b <branch-name>`).

2. **Check for uncommitted changes**: If there are staged or unstaged changes, help the user commit them. Use the commit message pattern:
   - Bug fix: `fix(MODULE_NAME): DESCRIPTION`
   - New feature: `feat(MODULE_NAME): DESCRIPTION`
   - Chore (scripts, dependencies, tooling — no extension source changes): `chore(MODULE_NAME): DESCRIPTION`
     Ask the user what type of change it is, and what the module name and description are.

3. **Check for unpushed commits**: Push the branch to the remote if needed (`git push` or `git push --set-upstream origin <branch>`).

4. **Prepare PR details**:
   - **Title**: Derive from the branch name and recent commits if not provided.
   - **Body**: Write a structured description in two parts (no headers, plain prose):
     1. (1–2 sentences): Explain the motivation or problem that prompted this change. Use git history, recent session context, or file change context to infer it — look at related commits, issue references, or prior conversation context about the changed files.
     2. (2–3 sentences): Describe the changes applied — what was added, fixed, or refactored and how it addresses the need.

5. **Create the PR** using the `github-pull-request_create_pull_request` tool.

6. **Report the result**: Share the PR number and URL as a markdown link, and mention the base branch it targets.
