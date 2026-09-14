# Graph Report - gerador_conferencia_p0l4r1s  (2026-09-13)

## Corpus Check
- 62 files · ~21,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 320 nodes · 658 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a164fb73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ChecklistRunner.tsx
- ResponseHistory.tsx
- worker/index.ts
- devDependencies
- checklist.ts
- scripts
- compilerOptions
- constants.ts
- Gerador de Conferência Polaris - Documentation
- App.tsx
- schema.ts
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Item` - 20 edges
2. `Template` - 20 edges
3. `compilerOptions` - 15 edges
4. `Gerador de Conferência Polaris - Documentation` - 14 edges
5. `HeaderModel` - 12 edges
6. `BTN_PRIMARY` - 11 edges
7. `scripts` - 10 edges
8. `BTN_SECONDARY` - 9 edges
9. `generatePdf()` - 9 edges
10. `INPUT` - 8 edges

## Surprising Connections (you probably didn't know these)
- `index.html Entry Point` --references--> `CF Favicon`  [EXTRACTED]
  index.html → public/favicon.svg
- `index.html Entry Point` --conceptually_related_to--> `Gerador de Conferência Polaris - Documentation`  [INFERRED]
  index.html → README.md
- `ResponseHistoryItem` --references--> `Answers`  [EXTRACTED]
  app/api/responses/route.ts → domain/schema.ts
- `ResponseHistoryItem` --references--> `Item`  [EXTRACTED]
  app/api/responses/route.ts → domain/schema.ts
- `DashboardProps` --references--> `Template`  [EXTRACTED]
  components/dashboard/Dashboard.tsx → domain/schema.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Checklist Lifecycle** — readme_template_interface, readme_cipa_seed, readme_share_token, readme_item_interface [EXTRACTED 1.00]
- **Domain Type System** — readme_item_interface, readme_template_interface, readme_answers_type, readme_metadata_type, readme_headerfield_interface, readme_headermodel_interface [EXTRACTED 1.00]
- **Metrics Computation Chain** — readme_classifyanswer_function, readme_computeanswermetrics_function, readme_item_interface, readme_answers_type [EXTRACTED 1.00]

## Communities (15 total, 1 thin omitted)

### Community 0 - "ChecklistRunner.tsx"
Cohesion: 0.10
Nodes (36): CameraCapture(), CameraCaptureProps, Dashboard(), Draft, HeadersView(), slugify(), toDrafts(), PageHero() (+28 more)

### Community 1 - "ResponseHistory.tsx"
Cohesion: 0.16
Nodes (18): ResponseHistory(), summarize(), AnswerMetricsBar(), AnswerMetricsBarProps, CLASS_DOT, METRIC_BG, METRIC_COLORS, AnswerClass (+10 more)

### Community 2 - "worker/index.ts"
Cohesion: 0.07
Nodes (39): parseJson(), POST(), DELETE(), PUT(), GET(), POST(), DELETE(), parseFields() (+31 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (33): @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, @eslint/js, devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types (+25 more)

### Community 4 - "checklist.ts"
Cohesion: 0.23
Nodes (9): countPhotos(), GET(), parseJson(), ResponseHistoryItem, AnswerType, buildInitialAnswers(), SelectionType, Field (+1 more)

### Community 5 - "scripts"
Cohesion: 0.06
Nodes (30): drizzle-orm, hono, jspdf, dependencies, drizzle-orm, hono, jspdf, react (+22 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (27): @cloudflare/workers-types, dist, DOM, DOM.Iterable, ES2022, node, node_modules, **/*.ts (+19 more)

### Community 7 - "constants.ts"
Cohesion: 0.08
Nodes (24): GET(), AppShell(), AppShellProps, getInitialTheme(), NAV_ITEMS, navClass(), Theme, VIEW_LABELS (+16 more)

### Community 8 - "Gerador de Conferência Polaris - Documentation"
Cohesion: 0.24
Nodes (16): index.html Entry Point, CF Favicon, Answers, applyDefaultAnswer, buildInitialAnswers, CIPA Seed Data, classifyAnswer, collectChoiceOptions (+8 more)

### Community 9 - "App.tsx"
Cohesion: 0.14
Nodes (25): App(), applyPrimaryColor(), PhotoFile, DashboardProps, HeadersViewProps, HistoryItem, ResponseHistoryProps, BulkDefaultControlProps (+17 more)

### Community 10 - "schema.ts"
Cohesion: 0.25
Nodes (5): DB, checklists, headers, responses, settings

## Knowledge Gaps
- **95 isolated node(s):** `PhotoFile`, `PhotoMap`, `SettingsRow`, `CameraCaptureProps`, `Draft` (+90 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Item` connect `App.tsx` to `ChecklistRunner.tsx`, `ResponseHistory.tsx`, `worker/index.ts`, `checklist.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Template` connect `App.tsx` to `ChecklistRunner.tsx`, `ResponseHistory.tsx`, `worker/index.ts`, `checklist.ts`, `constants.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `PhotoFile`, `PhotoMap`, `SettingsRow` to the rest of the system?**
  _95 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ChecklistRunner.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10204081632653061 - nodes in this community are weakly interconnected._
- **Should `worker/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06857142857142857 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._