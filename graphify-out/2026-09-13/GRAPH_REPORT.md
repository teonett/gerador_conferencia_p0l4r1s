# Graph Report - gerador_conferencia_p0l4r1s  (2026-09-13)

## Corpus Check
- 57 files · ~19,717 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 296 nodes · 588 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e6a3183`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- api/responses/route.ts
- worker/index.ts
- devDependencies
- ChecklistRunner.tsx
- scripts
- compilerOptions
- constants.ts
- Gerador de Conferência Polaris - Documentation
- schema.ts
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Template` - 21 edges
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
- `ResponseHistoryItem` --references--> `Answers`  [EXTRACTED]
  app/api/responses/route.ts → domain/checklist.ts
- `DashboardProps` --references--> `Template`  [EXTRACTED]
  components/dashboard/Dashboard.tsx → domain/checklist.ts
- `HeadersViewProps` --references--> `HeaderModel`  [EXTRACTED]
  components/headers/HeadersView.tsx → domain/header.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Checklist Lifecycle** — readme_template_interface, readme_cipa_seed, readme_share_token, readme_item_interface [EXTRACTED 1.00]
- **Domain Type System** — readme_item_interface, readme_template_interface, readme_answers_type, readme_metadata_type, readme_headerfield_interface, readme_headermodel_interface [EXTRACTED 1.00]
- **Metrics Computation Chain** — readme_classifyanswer_function, readme_computeanswermetrics_function, readme_item_interface, readme_answers_type [EXTRACTED 1.00]

## Communities (15 total, 1 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.08
Nodes (51): App(), applyPrimaryColor(), CameraCapture(), CameraCaptureProps, Dashboard(), DashboardProps, Draft, HeadersView() (+43 more)

### Community 1 - "api/responses/route.ts"
Cohesion: 0.60
Nodes (5): countPhotos(), GET(), parseJson(), ResponseHistoryItem, Metadata

### Community 2 - "worker/index.ts"
Cohesion: 0.10
Nodes (24): POST(), DELETE(), PUT(), GET(), POST(), GET(), DELETE(), parseFields() (+16 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (33): @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, @eslint/js, devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types (+25 more)

### Community 4 - "ChecklistRunner.tsx"
Cohesion: 0.13
Nodes (23): AnswerMetricsBar(), AnswerMetricsBarProps, CLASS_DOT, BulkDefaultControl(), BulkDefaultControlProps, ChecklistRunner(), FIELD_LABEL, HEADER_DATE_INPUT (+15 more)

### Community 5 - "scripts"
Cohesion: 0.08
Nodes (25): drizzle-orm, hono, jspdf, dependencies, drizzle-orm, hono, jspdf, react (+17 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (27): @cloudflare/workers-types, dist, DOM, DOM.Iterable, ES2022, node, node_modules, **/*.ts (+19 more)

### Community 7 - "constants.ts"
Cohesion: 0.08
Nodes (27): AppShell(), AppShellProps, getInitialTheme(), NAV_ITEMS, navClass(), Theme, VIEW_LABELS, CIPA_SEED (+19 more)

### Community 8 - "Gerador de Conferência Polaris - Documentation"
Cohesion: 0.24
Nodes (16): index.html Entry Point, CF Favicon, Answers, applyDefaultAnswer, buildInitialAnswers, CIPA Seed Data, classifyAnswer, collectChoiceOptions (+8 more)

### Community 10 - "schema.ts"
Cohesion: 0.25
Nodes (5): DB, checklists, headers, responses, settings

## Knowledge Gaps
- **86 isolated node(s):** `PhotoMap`, `SettingsRow`, `CameraCaptureProps`, `Draft`, `HistoryItem` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Template` connect `App.tsx` to `worker/index.ts`, `api.ts`, `ChecklistRunner.tsx`, `constants.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `PhotoMap`, `SettingsRow`, `CameraCaptureProps` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08018648018648018 - nodes in this community are weakly interconnected._
- **Should `worker/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0962566844919786 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `ChecklistRunner.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13068181818181818 - nodes in this community are weakly interconnected._