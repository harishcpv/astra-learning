# Astra — adaptive learning workspace

Astra is a local-first, multi-tenant coaching and assessment prototype. A learner or coach can enter **any topic**, choose the learner profile, and generate a structured learning experience with:

- A progressive study plan with markdown-formatted notes and takeaways.
- A mixed question bank with multiple choice, short answer, and scenario items.
- Immediate answer explanations and a visible evidence trail.
- Coach insights that flag potential bottlenecks after consecutive misses.
- A clean JSON view and downloadable payload matching the learning-engine contract.

The current slice is intentionally offline and deterministic. It does not call an external model or send learner data to a remote service. The rule-based engine in `gui/learning-engine.js` provides a realistic local prototype that can later be replaced behind the same interface.

## Requirements

- Node.js `24.19.0` (the version is pinned in `.nvmrc`)
- npm

## Install

From the project root:

```text
npm ci
```

## Run the GUI

```text
npm run gui
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The server only serves the known GUI and existing PDF paths and does not require network access.

## Test

```text
npm test
```

The smoke test checks the GUI assets, adaptive engine contract, static routes, and existing generated PDF outputs. It is intentionally dependency-free and works offline.

## Rebuild the existing PDF plans

```text
npm run build:pdfs
```

## Docker

Build and run the local GUI without installing Node globally:

```text
docker build -t orbit-youtube-workspace .
docker run --rm -p 3000:3000 orbit-youtube-workspace
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Product scope

Included in this slice:

- Multi-tenant workspace framing with an active learner profile
- Topic and learner-profile form for instant adaptive curriculum generation
- Four progressive modules from foundation through transfer
- Question bank generation with multiple choice, short answer, and scenario items
- Explanations, expected answers, and local progress tracking
- Coach review view with recommended focus areas, struggle points, and intervention triggers
- Clean JSON preview, clipboard copy, and `.json` download

Intentionally deferred:

- Remote LLM/model calls and persistent tenant storage
- Authentication, role-based access control, and production data isolation
- Automated grading beyond the local deterministic heuristics
- Calendar, assignment, or notification integrations

Any production model connector should preserve the JSON contract, keep tenant data isolated, avoid storing secrets in the browser, and retain a human approval step for intervention recommendations.
