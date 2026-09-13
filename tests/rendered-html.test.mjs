import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { CIPA_SEED } from "../db/seed.js";
import { ChecklistRunner } from "../components/runner/ChecklistRunner.tsx";
import { ReportReview } from "../components/report/ReportReview.tsx";
import { ResponseHistory } from "../components/history/ResponseHistory.tsx";
import { Dashboard } from "../components/dashboard/Dashboard.tsx";
import { TemplateEditor } from "../components/templates/TemplateEditor.tsx";
import { SettingsView } from "../components/settings/SettingsView.tsx";
import { HeadersView } from "../components/headers/HeadersView.tsx";

describe("Renderização de telas (SSR)", () => {
  it("ChecklistRunner renderiza a primeira etapa sem erro", () => {
    const html = renderToString(
      createElement(ChecklistRunner, {
        template: CIPA_SEED,
        initialAnswers: {},
        initialMetadata: {},
        initialObservations: "",
        initialPhotos: {},
        onFinish: () => {},
        onBack: () => {},
        onRestart: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Etapa 1 de 16"), "deve exibir etapa inicial");
    assert.ok(
      text.includes("CIPA - Áreas Administrativas"),
      "deve exibir o título do modelo no header",
    );
  });

  it("ChecklistRunner com header exibe identificação como primeira etapa", () => {
    const html = renderToString(
      createElement(ChecklistRunner, {
        template: CIPA_SEED,
        header: {
          id: "h1",
          name: "Header Teste",
          fields: [
            { id: "unidade", label: "Unidade" },
            { id: "responsavel", label: "Responsável pela Avaliação" },
          ],
        },
        initialAnswers: {},
        initialMetadata: {},
        initialObservations: "",
        initialPhotos: {},
        onFinish: () => {},
        onBack: () => {},
        onRestart: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(
      text.includes("Identificação"),
      "deve exibir a etapa de identificação",
    );
    assert.ok(
      text.includes("Responsável pela Avaliação"),
      "deve listar os campos do header",
    );
    assert.ok(text.includes("Iniciar perguntas"));
    assert.ok(
      !text.includes("Etapa 1 de 16"),
      "perguntas só aparecem após a identificação",
    );
  });

  it("ChecklistRunner conta pergunta extra na contagem de etapas", () => {
    const html = renderToString(
      createElement(ChecklistRunner, {
        template: CIPA_SEED,
        initialAnswers: {},
        initialMetadata: {},
        initialObservations: "",
        initialPhotos: {},
        initialExtraItems: [
          {
            id: "extra-x1",
            title: "Houve intercorrência na vistoria?",
            required: false,
            options: ["Sim", "Não", "Outros"],
            answerType: "choice",
            selection: "single",
          },
        ],
        onFinish: () => {},
        onBack: () => {},
        onRestart: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Etapa 1 de 17"), "extras entram na contagem");
    assert.ok(
      text.includes("Houve intercorrência na vistoria?"),
      "extra aparece na lista de perguntas extras",
    );
  });

  it("ReportReview em modo edição exibe extras e textos de edição", () => {
    const html = renderToString(
      createElement(ReportReview, {
        template: CIPA_SEED,
        answers: { "cipa-1": ["Sim"] },
        metadata: { setor: "Administração" },
        observations: "",
        photos: {},
        signature: "",
        confirmedAt: "",
        extraItems: [
          {
            id: "extra-x1",
            title: "Houve intercorrência na vistoria?",
            required: false,
            options: ["Sim", "Não", "Outros"],
            answerType: "choice",
            selection: "single",
          },
        ],
        editMode: true,
        responseId: "r1",
        onBack: () => {},
        onSaved: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Revisar e salvar alterações"));
    assert.ok(text.includes("Houve intercorrência na vistoria?"));
    assert.ok(text.includes("extra"), "deve marcar a pergunta como extra");
  });

  it("ReportReview somente leitura renderiza respostas", () => {
    const html = renderToString(
      createElement(ReportReview, {
        template: CIPA_SEED,
        answers: { "cipa-1": ["Sim"] },
        metadata: { setor: "Administração" },
        observations: "",
        photos: {},
        signature: "",
        confirmedAt: "",
        onBack: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Revisar e assinar"));
    assert.ok(text.includes("Resposta: Sim"));
    assert.ok(
      text.includes("CIPA - Áreas Administrativas"),
      "deve exibir o título do modelo no header",
    );
  });

  it("ResponseHistory renderiza hero e estado de carregamento", () => {
    const html = renderToString(
      createElement(ResponseHistory, { templates: [] }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Histórico"));
    assert.ok(text.includes("Carregando histórico..."));
  });

  it("Dashboard (página inicial) renderiza hero e grid", () => {
    const html = renderToString(
      createElement(Dashboard, {
        templates: [CIPA_SEED],
        onRun: () => {},
        onEdit: () => {},
        onDelete: () => {},
        onNew: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Gerador de Checklists"));
    assert.ok(text.includes("Crie, execute e gerencie seus checklists."));
    assert.ok(text.includes("CIPA - Áreas Administrativas"));
  });

  it("TemplateEditor renderiza hero contextual", () => {
    const html = renderToString(
      createElement(TemplateEditor, { onSave: () => {}, onCancel: () => {} }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Novo modelo"));
    assert.ok(
      text.includes("Defina nome, categoria e perguntas do checklist."),
    );
  });

  it("SettingsView renderiza seção de logo", () => {
    const html = renderToString(createElement(SettingsView));
    assert.ok(html.includes("Configurações"));
    assert.ok(html.includes("Logo"));
  });

  it("HeadersView renderiza header com data, hora e campos dinâmicos", () => {
    const html = renderToString(
      createElement(HeadersView, {
        headers: [
          {
            id: "h1",
            name: "Inspeção Administrativa",
            fields: [
              { id: "Unidade", label: "Unidade" },
              { id: "Andar", label: "Andar" },

              { id: "Coordenador", label: "Coordenador" },
              { id: "Matricula", label: "Matrícula do Coordenador" },

              { id: "Responsavel", label: "Responsável pela Avaliação" },
              { id: "Matricula", label: "Matrícula do Responsável" },
            ],
          },
        ],
        onHeadersChanged: () => {},
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    assert.ok(text.includes("Inspeção Administrativa"));
    assert.ok(text.includes("Data · Hora + 6 campos"));
    assert.ok(text.includes("Responsável pela Avaliação"));
  });
});
