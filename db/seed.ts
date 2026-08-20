import type { Template } from '../domain/checklist';
import { CIPA_SEED_ID, CIPA_SHARE_TOKEN } from '../domain/constants';

const cipaQuestions = [
  'O sistema elétrico está em conformidade com a NR 10 do Ministério do Trabalho?',
  'Possui kit de primeiros socorros?',
  'Os trabalhadores possuem treinamento para utilização do kit de primeiros socorros?',
  'Possui extintores adequados, próximos, válidos e em condições de uso?',
  'Os trabalhadores possuem treinamento para utilização dos extintores?',
  'Possui avisos de segurança, inclusive com telefones de emergência?',
  'Existe botijão de GLP armazenado em local confinado?',
  'Possui escada para acesso aos armários superiores?',
  'Ocorre a manutenção periódica do ar-condicionado e esta é registrada?',
  'Existe sinalização de emergência?',
  'A iluminação é suficiente e está de acordo com as normas legais?',
  'Os mobiliários são adequados aos tipos de atividade?',
  'Os níveis de ruído encontram-se dentro dos parâmetros exigidos?',
  'O prédio possui AVCB?',
  'Os ambientes encontram-se organizados?',
  'Existe procedimento para evacuação de emergência?',
];

export const CIPA_SEED: Template = {
  id: CIPA_SEED_ID,
  title: 'CIPA - Áreas Administrativas',
  description: 'Inspeção de segurança para ambientes e setores administrativos.',
  category: 'CIPA · Segurança do Trabalho',
  shareToken: CIPA_SHARE_TOKEN,
  observations: true,
  fields: [
    { id: 'data', label: 'Data da inspeção', type: 'date', required: true },
    { id: 'setor', label: 'Setor', type: 'text', required: true },
    { id: 'ramal', label: 'Ramal', type: 'text' },
    { id: 'coordenador', label: 'Coordenador', type: 'text' },
    { id: 'matriculaCoordenador', label: 'Matrícula do coordenador', type: 'text' },
    { id: 'responsavel', label: 'Responsável pela avaliação', type: 'text', required: true },
    { id: 'matriculaResponsavel', label: 'Matrícula do responsável', type: 'text' },
  ],
  items: cipaQuestions.map((title, index) => ({
    id: `cipa-${index + 1}`,
    title,
    required: true,
    answerType: 'choice' as const,
    selection: 'single' as const,
    options: ['Sim', 'Não', 'Não aplicável', 'Em partes'],
  })),
  source: 'Baseado no checklist de áreas administrativas da UFV',
  updatedAt: new Date().toISOString(),
};
