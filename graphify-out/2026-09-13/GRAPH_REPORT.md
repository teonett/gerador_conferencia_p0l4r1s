# Graph Report - gerador_conferencia_polaris  (2026-08-28)

## Corpus Check
- 57 files · ~19,517 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 292 nodes · 575 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2009f88b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- ReportReview.tsx
- worker/index.ts
- devDependencies
- ChecklistRunner.tsx
- scripts
- compilerOptions
- constants.ts
- Gerador de Conferência Polaris - Documentation
- schema.ts
- TemplateEditor.tsx
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Template` - 20 edges
2. `compilerOptions` - 15 edges
3. `Gerador de Conferência Polaris - Documentation` - 14 edges
4. `HeaderModel` - 12 edges
5. `BTN_PRIMARY` - 11 edges
6. `scripts` - 10 edges
7. `generatePdf()` - 9 edges
8. `BTN_SECONDARY` - 8 edges
9. `INPUT` - 8 edges
10. `Item` - 8 edges

## Surprising Connections (you probably didn't know these)
- `index.html Entry Point` --references--> `CF Favicon`  [EXTRACTED]
  index.html → public/favicon.svg
- `index.html Entry Point` --conceptually_related_to--> `Gerador de Conferência Polaris - Documentation`  [INFERRED]
  index.html → README.md
- `DashboardProps` --references--> `Template`  [EXTRACTED]
  components/dashboard/Dashboard.tsx → domain/checklist.ts
- `HeadersViewProps` --references--> `HeaderModel`  [EXTRACTED]
  components/headers/HeadersView.tsx → domain/header.ts
- `summarize()` --calls--> `classifyAnswer()`  [EXTRACTED]
  components/history/ResponseHistory.tsx → domain/metrics.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Checklist Lifecycle** — readme_template_interface, readme_cipa_seed, readme_share_token, readme_item_interface [EXTRACTED 1.00]
- **Domain Type System** — readme_item_interface, readme_template_interface, readme_answers_type, readme_metadata_type, readme_headerfield_interface, readme_headermodel_interface [EXTRACTED 1.00]
- **Metrics Computation Chain** — readme_classifyanswer_function, readme_computeanswermetrics_function, readme_item_interface, readme_answers_type [EXTRACTED 1.00]

## Communities (15 total, 1 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.13
Nodes (27): App(), applyPrimaryColor(), CameraCaptureProps, Dashboard(), Draft, HeadersView(), slugify(), toDrafts() (+19 more)

### Community 1 - "ReportReview.tsx"
Cohesion: 0.16
Nodes (12): PageHero(), PageHeroProps, formatDate(), ReportReview(), SaveState, HEADER_DATETIME, HEADER_GRID, zebraRow() (+4 more)

### Community 2 - "worker/index.ts"
Cohesion: 0.08
Nodes (28): POST(), DELETE(), PUT(), GET(), POST(), GET(), DELETE(), parseFields() (+20 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (31): @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, @eslint/js, devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types (+23 more)

### Community 4 - "ChecklistRunner.tsx"
Cohesion: 0.11
Nodes (26): CameraCapture(), AnswerMetricsBar(), AnswerMetricsBarProps, CLASS_DOT, BulkDefaultControl(), BulkDefaultControlProps, ChecklistRunner(), FIELD_LABEL (+18 more)

### Community 5 - "scripts"
Cohesion: 0.08
Nodes (25): drizzle-orm, hono, jspdf, dependencies, drizzle-orm, hono, jspdf, react (+17 more)

### Community 6 - "compilerOptions"
Cohesion: 0.08
Nodes (25): @cloudflare/workers-types, dist, DOM, DOM.Iterable, ES2022, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 7 - "constants.ts"
Cohesion: 0.10
Nodes (22): AppShell(), AppShellProps, getInitialTheme(), NAV_ITEMS, navClass(), Theme, VIEW_LABELS, View (+14 more)

### Community 8 - "Gerador de Conferência Polaris - Documentation"
Cohesion: 0.24
Nodes (16): index.html Entry Point, CF Favicon, Answers, applyDefaultAnswer, buildInitialAnswers, CIPA Seed Data, classifyAnswer, collectChoiceOptions (+8 more)

### Community 10 - "schema.ts"
Cohesion: 0.25
Nodes (5): DB, checklists, headers, responses, settings

### Community 11 - "TemplateEditor.tsx"
Cohesion: 0.13
Nodes (15): DashboardProps, HeadersViewProps, ResponseHistoryProps, ReportReviewProps, ChecklistRunnerProps, TemplateCardProps, ensureOutros(), makeBlankItem() (+7 more)

## Knowledge Gaps
- **85 isolated node(s):** `PhotoMap`, `ResponseHistoryItem`, `SettingsRow`, `CameraCaptureProps`, `Draft` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Template` connect `TemplateEditor.tsx` to `App.tsx`, `ReportReview.tsx`, `worker/index.ts`, `ChecklistRunner.tsx`, `constants.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `PhotoMap`, `ResponseHistoryItem`, `SettingsRow` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1251778093883357 - nodes in this community are weakly interconnected._
- **Should `worker/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08232118758434548 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `ChecklistRunner.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._