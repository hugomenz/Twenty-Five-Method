# Releasing M25

M25 uses Release Please to manage versions, changelog updates, tags, release pull requests, and GitHub Releases.

## Normal Flow

1. Normal development changes are merged into `main`.
2. Release Please runs on pushes to `main` or by manual dispatch.
3. Release Please creates or updates a release pull request.
4. The release pull request contains the proposed version bump and `CHANGELOG.md` updates.
5. Additional eligible commits can keep accumulating in that release pull request until it is merged.
6. When you want to publish a version, merge the release pull request.
7. Release Please creates the Git tag and the GitHub Release automatically.
8. Versions must not be updated manually during normal development.

## Commit Prefixes And SemVer

- `feat:` creates a minor version bump.
- `fix:` creates a patch version bump.
- `feat!:`, `fix!:`, `refactor!:`, or any other Conventional Commit with `!` creates a major version bump.
- `refactor:` and `perf:` are shown in the changelog as `Improvements`.
- `docs:`, `test:`, `chore:`, `ci:`, and `build:` are hidden from normal product-facing changelog sections.

## Working Rules

- Do not edit `package.json` or `package-lock.json` just to bump versions.
- Do not edit published changelog entries manually.
- Do not create tags manually.
- Do not create GitHub Releases manually.
- If a one-off version override is ever required, use a dedicated `Release-As:` footer instead of editing version files directly.

## Repository Settings

Release Please uses `GITHUB_TOKEN` by default.

The repository may need this GitHub setting enabled so the workflow can open release pull requests:

- `Settings -> Actions -> General -> Allow GitHub Actions to create and approve pull requests`

No PAT is required for the base setup in this repository.

## Notes About GitHub Pages

- GitHub Pages continues to deploy from pushes to `main` using the existing Pages workflow.
- Releases do not replace the current deployment trigger.
- Using `GITHUB_TOKEN` avoids recursive workflow loops from release-generated tags and PR updates.
