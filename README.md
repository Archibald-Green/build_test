# OpenTest

OpenTest is a backend-free platform for publishing and taking browser-based
practice tests. The public application is plain HTML, CSS, JavaScript modules,
JSON, images, and audio, so the complete site can be hosted from `/docs` with
GitHub Pages.

## Project structure

```text
docs/
  index.html
  assets/
    css/styles.css
    js/
      core/       Shared validation, flow, storage, and scoring modules
      public/     Catalog, runner, and results views
  content/tests/
    index.json
    sample-test/
      test.json
      media/
tests/
  core.test.mjs
package.json
README.md
```

## Run locally

The application fetches JSON files, so serve the repository over HTTP instead
of opening `index.html` through `file://`.

```powershell
cd D:\edu
python -m http.server 8000
```

The Windows Python launcher also works:

```powershell
py -m http.server 8000
```

Open:

- Catalog: `http://localhost:8000/docs/`
- Sample test: `http://localhost:8000/docs/?test=sample-test`

Run the dependency-free core tests with:

```powershell
npm test
```

## Add a test manually

1. Create `docs/content/tests/<test-id>/test.json`.
2. Give the test a lowercase hyphenated `id` and a positive integer `version`.
3. Add any number of sections to `sections`; add questions to each section.
4. For every single-choice question, provide at least two options and exactly
   one ID in `correctOptionIds`.
5. Add an entry to `docs/content/tests/index.json`. Its `file` path is relative
   to that catalog file, for example `sample-test/test.json`.
6. Increase the test `version` whenever changes should invalidate previously
   saved attempts.

Section names, counts, question counts, and transitions are always generated
from the selected `test.json`; none are hardcoded in JavaScript.

## Add images and audio

Place media beside the test, normally in:

```text
docs/content/tests/<test-id>/media/
```

Reference it from `test.json` relative to that test file:

```json
{
  "media": {
    "image": {
      "src": "media/example.png",
      "alt": "A meaningful description of the image"
    },
    "audio": {
      "src": "media/example.mp3",
      "caption": "Listening prompt"
    }
  }
}
```

Media paths must be relative, cannot start with `/`, cannot contain a protocol,
and cannot traverse through `..`. Broken media displays a non-blocking message
and retry control while the question remains usable.

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Open **Settings > Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the publishing branch, usually `main`, and choose `/docs`.
5. Save and wait for the Pages deployment to finish.

All application, catalog, test, and media references are relative. The same
files therefore work at both:

- `https://username.github.io/`
- `https://username.github.io/repository-name/`

Do not change content references to root-absolute paths such as
`/content/tests/index.json`.

## Attempts and resets

Active and submitted attempts are stored in browser `localStorage` with:

```text
test-platform:attempt:<test-id>:v<test-version>
```

Answers and navigation are saved immediately. Refreshing restores the exact
question and compatible answers. Submitted attempts restore their saved result
snapshot and remain immutable.

- **Reset current section** clears only answers in the active section.
- **Reset entire test** removes the current attempt and starts again.
- After submission, only **Reset entire test** is available.
- Attempts from older test versions are never merged. The app asks the user to
  discard incompatible saved attempts.
- If browser storage is blocked or later becomes unavailable, the runner stays
  usable in memory and warns that refresh recovery is unavailable.

## Current MVP

- Static catalog and `?test=<test-id>` loading
- Dynamic sections and questions
- One-question-at-a-time runner
- Previous, Next, and direct question navigation
- Single-choice answers
- Optional relative image and audio media
- Versioned browser persistence and reset controls
- Submission warning for unanswered questions
- Weighted total and section scoring
- Correct, incorrect, and unanswered counts
- Detailed answer review with explanations
- Responsive keyboard-accessible interface
- User-facing loading, validation, file, media, and storage errors

JSON content is inserted through `textContent`; test content is not rendered as
raw HTML.

## Manual QA checklist

- [ ] Open `/docs/` and confirm the catalog loads.
- [ ] Open `/docs/?test=sample-test` and confirm the sample test loads.
- [ ] Answer questions with the radio controls and navigate by keyboard.
- [ ] Refresh and confirm answers and the current question are restored.
- [ ] Reset the current section and confirm other sections keep their answers.
- [ ] Reset the entire test and confirm all progress is removed.
- [ ] Submit with unanswered questions, cancel, and continue answering.
- [ ] Submit again and review totals, section scores, counts, and explanations.
- [ ] Refresh submitted results and confirm the saved result returns unchanged.
- [ ] Check the catalog, runner, and review at widths from 360px to 430px.
- [ ] Temporarily use a missing image or audio filename and confirm the
      non-blocking media error appears.
- [ ] Deploy from `/docs` and verify catalog, test, and media URLs under the
      GitHub Pages project path.

## Future Stage 6

The local builder remains intentionally unimplemented. Stage 6 can reuse the
existing schema validation, dynamic flow, scoring, and safe media conventions
to provide local draft storage, preview, and JSON export without adding a
backend.
