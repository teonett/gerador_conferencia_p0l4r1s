import { z } from 'zod';
import { OPTION } from './constants';

export const optionListSchema = z
  .array(z.string().trim().min(1))
  .superRefine((options, ctx) => {
    if (options.length < OPTION.min || options.length > OPTION.max) {
      ctx.addIssue({
        code: 'custom',
        message: `Uma pergunta deve ter entre ${OPTION.min} e ${OPTION.max} opções.`,
      });
    }
    if (options.length > 0 && options[options.length - 1] !== OPTION.outrosLabel) {
      ctx.addIssue({
        code: 'custom',
        message: `A última opção deve ser "${OPTION.outrosLabel}".`,
      });
    }
  });

export const itemSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    required: z.boolean().default(false),
    options: z.array(z.string()).default([]),
    answerType: z.enum(['text', 'choice']).default('choice'),
    selection: z.enum(['single', 'multiple']).default('single'),
    defaultOption: z.string().optional(),
    hint: z.string().optional(),
  })
  .superRefine((item, ctx) => {
    if (item.answerType === 'choice') {
      const options = optionListSchema.safeParse(item.options);
      if (!options.success) {
        for (const issue of options.error.issues) {
          ctx.addIssue({ code: 'custom', message: issue.message });
        }
      }
    } else if (item.options.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Perguntas de texto livre não devem ter opções.',
      });
    }
    if (item.defaultOption !== undefined) {
      if (item.answerType !== 'choice' || item.options.indexOf(item.defaultOption) === -1) {
        ctx.addIssue({
          code: 'custom',
          message: 'A resposta padrão deve pertencer às opções da pergunta.',
        });
      }
    }
  });

export const fieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'date']).default('text'),
  required: z.boolean().optional(),
});

export const templateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  category: z.string().default('Geral'),
  items: z.array(itemSchema).min(1, 'O template deve ter pelo menos uma pergunta.'),
  fields: z.array(fieldSchema).optional(),
  headerId: z.string().optional(),
  observations: z.boolean().optional(),
  source: z.string().optional(),
  shareToken: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const headerFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const headerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fields: z.array(headerFieldSchema).default([]),
  updatedAt: z.string().optional(),
});

export const answersSchema = z.record(z.string(), z.array(z.string()));
export const metadataSchema = z.record(z.string(), z.string());

export const responsePayloadSchema = z.object({
  answers: answersSchema,
  metadata: metadataSchema.default({}),
  itemObservations: z.record(z.string(), z.string()).default({}),
  extraItems: z.array(itemSchema).default([]),
});

export type Item = z.infer<typeof itemSchema>;
export type Template = z.infer<typeof templateSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type Answers = z.infer<typeof answersSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type ResponsePayload = z.infer<typeof responsePayloadSchema>;