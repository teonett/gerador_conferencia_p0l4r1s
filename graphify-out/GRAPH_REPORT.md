# Graph Report - .  (2026-08-26)

## Corpus Check
- Corpus is ~18,270 words - fits in a single context window. You may not need a graph.

## Summary
- 285 nodes · 563 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.7)
- Token cost: 3,200 input · 1,500 output

## Community Hubs (Navigation)
- Headers API Layer
- UI Components
- Checklists API Layer
- Dev Toolchain
- Metrics & Progress UI
- Runtime Dependencies
- TypeScript Type System
- Seed Data & Constants
- Documentation & Assets
- App Shell & Navigation
- Database Schema
- Service Worker

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
- `TemplateEditorProps` --references--> `Template`  [EXTRACTED]
  components/templates/TemplateEditor.tsx → domain/checklist.ts
- `index.html Entry Point` --conceptually_related_to--> `Gerador de Conferência Polaris - Documentation`  [INFERRED]
  index.html → README.md
- `index.html Entry Point` --references--> `CF Favicon`  [EXTRACTED]
  index.html → public/favicon.svg
- `DashboardProps` --references--> `Template`  [EXTRACTED]
  components/dashboard/Dashboard.tsx → domain/checklist.ts
- `HeadersViewProps` --references--> `HeaderModel`  [EXTRACTED]
  components/headers/HeadersView.tsx → domain/header.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Metrics Computation Chain** — readme_classifyanswer_function, readme_computeanswermetrics_function, readme_item_interface, readme_answers_type [EXTRACTED 1.00]
- **Domain Type System** — readme_item_interface, readme_template_interface, readme_answers_type, readme_metadata_type, readme_headerfield_interface, readme_headermodel_interface [EXTRACTED 1.00]
- **Checklist Lifecycle** — readme_template_interface, readme_cipa_seed, readme_share_token, readme_item_interface [EXTRACTED 1.00]

## Communities (16 total, 1 thin omitted)

### Community 0 - "Headers API Layer"
Cohesion: 0.11
Nodes (28): DELETE(), parseFields(), PUT(), App(), Dashboard(), Draft, HeadersView(), slugify() (+20 more)

### Community 1 - "UI Components"
Cohesion: 0.13
Nodes (27): CameraCapture(), CameraCaptureProps, DashboardProps, HeadersViewProps, ResponseHistoryProps, PageHero(), PageHeroProps, formatDate() (+19 more)

### Community 2 - "Checklists API Layer"
Cohesion: 0.11
Nodes (22): POST(), DELETE(), PUT(), GET(), POST(), GET(), GET(), parseFields() (+14 more)

### Community 3 - "Dev Toolchain"
Cohesion: 0.06
Nodes (31): @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, @eslint/js, devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types (+23 more)

### Community 4 - "Metrics & Progress UI"
Cohesion: 0.12
Nodes (22): AnswerMetricsBar(), AnswerMetricsBarProps, CLASS_DOT, BulkDefaultControl(), BulkDefaultControlProps, ChecklistRunner(), FIELD_LABEL, Answers (+14 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): drizzle-orm, hono, jspdf, dependencies, drizzle-orm, hono, jspdf, react (+17 more)

### Community 6 - "TypeScript Type System"
Cohesion: 0.08
Nodes (25): @cloudflare/workers-types, dist, DOM, DOM.Iterable, ES2022, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 7 - "Seed Data & Constants"
Cohesion: 0.12
Nodes (17): CIPA_SEED, cipaQuestions, BREAKPOINTS, CIPA_SEED_ID, CIPA_SHARE_TOKEN, COLORS, FILES, METRIC_COLORS (+9 more)

### Community 8 - "Documentation & Assets"
Cohesion: 0.24
Nodes (16): index.html Entry Point, CF Favicon, Answers, applyDefaultAnswer, buildInitialAnswers, CIPA Seed Data, classifyAnswer, collectChoiceOptions (+8 more)

### Community 9 - "App Shell & Navigation"
Cohesion: 0.36
Nodes (7): AppShell(), AppShellProps, getInitialTheme(), navClass(), Theme, View, SIDEBAR_WIDTH

### Community 10 - "Database Schema"
Cohesion: 0.25
Nodes (5): DB, checklists, headers, responses, settings

## Knowledge Gaps
- **83 isolated node(s):** `PhotoMap`, `ResponseHistoryItem`, `SettingsRow`, `CameraCaptureProps`, `Draft` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Template` connect `UI Components` to `Headers API Layer`, `Checklists API Layer`, `Metrics & Progress UI`, `Seed Data & Constants`, `App Shell & Navigation`, `API Client Layer`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Toolchain` to `Runtime Dependencies`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `PhotoMap`, `ResponseHistoryItem`, `SettingsRow` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Headers API Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.11336032388663968 - nodes in this community are weakly interconnected._
- **Should `UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.12834224598930483 - nodes in this community are weakly interconnected._
- **Should `Checklists API Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.1053763440860215 - nodes in this community are weakly interconnected._
- **Should `Dev Toolchain` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._