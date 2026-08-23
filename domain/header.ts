export interface HeaderField {
  id: string;
  label: string;
}

export interface HeaderModel {
  id: string;
  name: string;
  fields: HeaderField[];
  updatedAt?: string;
}

export const HEADER_DEFAULT_FIELDS: HeaderField[] = [
  { id: 'unidade', label: 'Unidade' },
  { id: 'andar', label: 'Andar' },
  { id: 'coordenador', label: 'Coordenador' },
  { id: 'matriculaCoordenador', label: 'Matrícula do Coordenador' },
  { id: 'responsavel', label: 'Responsável pela Avaliação' },
  { id: 'matriculaResponsavel', label: 'Matrícula do Responsável' },
];
