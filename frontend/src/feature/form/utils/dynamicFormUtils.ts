import { z } from 'zod';

import type { ConditionalLogic, QuestionType, ValidationRule } from '@/types/question.type';

export interface DynamicFormData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: QuestionType[];
  order: number;
}

/**
 * Convert validation rules to Zod schema
 */
export function createZodSchemaFromValidationRules(
  fieldName: string,
  fieldType: string,
  validationRules: ValidationRule[] = []
): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // Base schema based on field type
  switch (fieldType) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'tel':
    case 'url':
    case 'password':
      schema = z.string();
      break;
    case 'number':
      schema = z.union([z.number(), z.string().transform((val) => parseFloat(val) || 0)]);
      break;
    case 'date':
      schema = z.string();
      break;
    case 'select':
    case 'radio':
      schema = z.string();
      break;
    case 'checkbox':
    case 'multiselect':
      schema = z.array(z.string());
      break;
    default:
      schema = z.string();
  }

  // Apply validation rules using refine for safety
  validationRules.forEach((rule) => {
    try {
      switch (rule.rule) {
        case 'required':
          if (fieldType === 'checkbox' || fieldType === 'multiselect') {
            schema = schema.refine(
              (val) => Array.isArray(val) && val.length > 0,
              rule.message || `${fieldName} is required`
            );
          } else {
            schema = schema.refine(
              (val) => val !== null && val !== undefined && String(val).trim() !== '',
              rule.message || `${fieldName} is required`
            );
          }
          break;
        case 'min_length':
          if (rule.value && !isNaN(Number(rule.value))) {
            schema = schema.refine(
              (val) => String(val).length >= Number(rule.value),
              rule.message || `Minimum length is ${rule.value}`
            );
          }
          break;
        case 'max_length':
          if (rule.value && !isNaN(Number(rule.value))) {
            schema = schema.refine(
              (val) => String(val).length <= Number(rule.value),
              rule.message || `Maximum length is ${rule.value}`
            );
          }
          break;
        case 'min_value':
          if (rule.value && !isNaN(Number(rule.value))) {
            schema = schema.refine(
              (val) => Number(val) >= parseFloat(rule.value || '0'),
              rule.message || `Minimum value is ${rule.value}`
            );
          }
          break;
        case 'max_value':
          if (rule.value && !isNaN(Number(rule.value))) {
            schema = schema.refine(
              (val) => Number(val) <= parseFloat(rule.value || '0'),
              rule.message || `Maximum value is ${rule.value}`
            );
          }
          break;
        case 'email':
          schema = schema.refine((val) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(String(val));
          }, rule.message || 'Invalid email format');
          break;
        case 'regex':
          if (rule.value) {
            try {
              const regex = new RegExp(rule.value.replace(/^\/|\/$/g, ''));
              schema = schema.refine(
                (val) => regex.test(String(val)),
                rule.message || 'Invalid format'
              );
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn('Invalid regex pattern:', rule.value);
            }
          }
          break;
        case 'size':
          if (rule.value && !isNaN(Number(rule.value))) {
            schema = schema.refine(
              (val) => String(val).length === Number(rule.value),
              rule.message || `Must be exactly ${rule.value} characters`
            );
          }
          break;
        case 'in':
          if (rule.value) {
            const allowedValues = rule.value.split(',');
            schema = schema.refine(
              (val) => allowedValues.includes(String(val)),
              rule.message || `Must be one of: ${allowedValues.join(', ')}`
            );
          }
          break;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to apply validation rule ${rule.rule} to field ${fieldName}:`, error);
    }
  });

  return schema;
}

/**
 * Generate dynamic Zod schema from questions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateDynamicSchema(questions: QuestionType[]): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  questions.forEach((question) => {
    if (question.is_active) {
      const fieldSchema = createZodSchemaFromValidationRules(
        question.code,
        question.type,
        question.validation_rules
      );

      // Make optional if not required
      if (!question.required) {
        schemaFields[question.code] = fieldSchema.optional();
      } else {
        schemaFields[question.code] = fieldSchema;
      }
    }
  });

  return z.object(schemaFields);
}

/**
 * Generate dynamic Zod schema from questions with conditional logic support
 */
export function generateDynamicSchemaWithConditionalLogic(
  questions: QuestionType[],
  formValues: DynamicFormData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  // Filter questions based on conditional logic first
  const visibleQuestions = filterQuestionsByConditionalLogic(questions, formValues);

  visibleQuestions.forEach((question) => {
    if (question.is_active) {
      const fieldSchema = createZodSchemaFromValidationRules(
        question.code,
        question.type,
        question.validation_rules
      );

      // Make optional if not required
      if (!question.required) {
        schemaFields[question.code] = fieldSchema.optional();
      } else {
        schemaFields[question.code] = fieldSchema;
      }
    }
  });

  return z.object(schemaFields);
}

/**
 * Generate answers array for form submission from visible questions only
 */
export function generateAnswersFromFormValues(
  questions: QuestionType[],
  formValues: DynamicFormData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { question_id: string; question_code: string; answer: any }[] {
  const visibleQuestions = filterQuestionsByConditionalLogic(questions, formValues);

  return visibleQuestions
    .filter((question) => question.is_active)
    .map((question) => ({
      question_id: question.question_id || question.id,
      question_code: question.code,
      answer: formValues[question.code] || null,
    }))
    .filter((answer) => answer.answer !== null && answer.answer !== undefined);
}

/**
 * Group questions by their group property
 */
export function groupQuestionsByStep(questions: QuestionType[]): FormStep[] {
  const groups = new Map<string, QuestionType[]>();

  questions
    .filter((q) => q.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .forEach((question) => {
      const groupName = question.group || 'default';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(question);
    });

  // Convert to FormStep array
  const steps: FormStep[] = [];
  let stepOrder = 0;

  // Handle agreement step (if exists)
  if (groups.has('agreement')) {
    steps.push({
      id: 'agreement',
      title: 'Persetujuan',
      description: 'Mohon baca dan setujui persyaratan berikut',
      questions: groups.get('agreement')!,
      order: stepOrder++,
    });
  }

  // Handle personal info step
  if (groups.has('personal_info')) {
    steps.push({
      id: 'personal_info',
      title: 'Informasi Pribadi',
      description: 'Lengkapi informasi pribadi Anda',
      questions: groups.get('personal_info')!,
      order: stepOrder++,
    });
  }

  // Handle education info step
  if (groups.has('education_info')) {
    steps.push({
      id: 'education_info',
      title: 'Informasi Pendidikan',
      description: 'Lengkapi informasi pendidikan Anda',
      questions: groups.get('education_info')!,
      order: stepOrder++,
    });
  }

  // Handle contact info step
  if (groups.has('contact_info')) {
    steps.push({
      id: 'contact_info',
      title: 'Informasi Kontak',
      description: 'Lengkapi informasi kontak Anda',
      questions: groups.get('contact_info')!,
      order: stepOrder++,
    });
  }

  // Handle additional info step
  if (groups.has('additional_info')) {
    steps.push({
      id: 'additional_info',
      title: 'Informasi Tambahan',
      description: 'Lengkapi informasi tambahan',
      questions: groups.get('additional_info')!,
      order: stepOrder++,
    });
  }

  // Handle any remaining groups
  groups.forEach((questions, groupName) => {
    if (
      !['agreement', 'personal_info', 'education_info', 'contact_info', 'additional_info'].includes(
        groupName
      )
    ) {
      steps.push({
        id: groupName,
        title: groupName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: `Lengkapi informasi ${groupName.replace(/_/g, ' ')}`,
        questions,
        order: stepOrder++,
      });
    }
  });

  return steps.sort((a, b) => a.order - b.order);
}

/**
 * Generate initial form values from questions
 */
export function generateInitialFormValues(questions: QuestionType[]): DynamicFormData {
  const initialValues: DynamicFormData = {};

  questions
    .filter((q) => q.is_active)
    .forEach((question) => {
      if (question.default_value !== null && question.default_value !== undefined) {
        initialValues[question.code] = question.default_value;
      } else {
        // Set default values based on field type
        switch (question.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'tel':
          case 'url':
          case 'password':
          case 'select':
          case 'radio':
          case 'date':
            initialValues[question.code] = '';
            break;
          case 'number':
            initialValues[question.code] = '';
            break;
          case 'checkbox':
          case 'multiselect':
            initialValues[question.code] = [];
            break;
          default:
            initialValues[question.code] = '';
        }
      }
    });

  return initialValues;
}

/**
 * Check if conditional logic conditions are met
 */
export function evaluateConditionalLogic(
  conditionalLogic: ConditionalLogic,
  formValues: DynamicFormData
): boolean {
  if (!conditionalLogic.enabled) {
    return true;
  }

  const results = conditionalLogic.conditions.map((condition) => {
    const fieldValue = formValues[condition.field];

    switch (condition.operator) {
      case 'equals':
        return condition.values.includes(String(fieldValue));
      case 'not_equals':
        return !condition.values.includes(String(fieldValue));
      case 'in':
        return condition.values.includes(String(fieldValue));
      case 'not_in':
        return !condition.values.includes(String(fieldValue));
      case 'contains':
        return String(fieldValue).includes(condition.values[0] || '');
      case 'not_contains':
        return !String(fieldValue).includes(condition.values[0] || '');
      case 'empty':
        return !fieldValue || String(fieldValue).trim() === '';
      case 'not_empty':
        return fieldValue && String(fieldValue).trim() !== '';
      case 'greater_than':
        return parseFloat(String(fieldValue)) > parseFloat(condition.values[0] || '0');
      case 'less_than':
        return parseFloat(String(fieldValue)) < parseFloat(condition.values[0] || '0');
      default:
        return true;
    }
  });

  return conditionalLogic.operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

/**
 * Filter questions based on conditional logic
 */
export function filterQuestionsByConditionalLogic(
  questions: QuestionType[],
  formValues: DynamicFormData
): QuestionType[] {
  return questions.filter((question) => {
    if (!question.conditional_logic) {
      return true;
    }
    return evaluateConditionalLogic(question.conditional_logic, formValues);
  });
}

/**
 * Calculate completion percentage for a step
 */
export function calculateStepCompletion(
  questions: QuestionType[],
  formValues: DynamicFormData
): number {
  const visibleQuestions = filterQuestionsByConditionalLogic(questions, formValues);
  const requiredQuestions = visibleQuestions.filter((q) => q.required);

  if (requiredQuestions.length === 0) {
    return 100;
  }

  const completedQuestions = requiredQuestions.filter((question) => {
    const value = formValues[question.code];

    if (question.type === 'checkbox' || question.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== null && value !== undefined && String(value).trim() !== '';
  });

  return (completedQuestions.length / requiredQuestions.length) * 100;
}

/**
 * Check if step can proceed (all required fields filled)
 */
export function canProceedToNextStep(
  questions: QuestionType[],
  formValues: DynamicFormData
): boolean {
  const visibleQuestions = filterQuestionsByConditionalLogic(questions, formValues);
  const requiredQuestions = visibleQuestions.filter((q) => q.required);

  return requiredQuestions.every((question) => {
    const value = formValues[question.code];

    if (question.type === 'checkbox' || question.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== null && value !== undefined && String(value).trim() !== '';
  });
}
