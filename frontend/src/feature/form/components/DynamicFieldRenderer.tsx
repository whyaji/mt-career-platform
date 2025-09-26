/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { type UseFormReturnType } from '@mantine/form';
import { type FC } from 'react';

import { RadioGroupField } from '@/components/FormField';
import type { QuestionType } from '@/types/question.type';

import { filterQuestionsByConditionalLogic } from '../utils/dynamicFormUtils';

interface DynamicFieldRendererProps {
  question: QuestionType;
  formValues: Record<string, any>;
  form: UseFormReturnType<any>;
  isMobile?: boolean;
  number?: number;
}

export const DynamicFieldRenderer: FC<DynamicFieldRendererProps> = ({
  question: questionProp,
  formValues,
  form,
  isMobile = false,
  number,
}) => {
  const question = { ...questionProp, ...(number ? { number } : {}) };
  // Check if this field should be visible based on conditional logic
  const visibleQuestions = filterQuestionsByConditionalLogic([question], formValues);
  const isVisible = visibleQuestions.includes(question);

  if (!isVisible) {
    return null;
  }

  const fieldProps = {
    label: question.label,
    placeholder: question.placeholder,
    description: question.description,
    required: question.required,
    disabled: question.disabled || question.readonly,
    error: form.errors[question.code],
    size: (isMobile ? 'sm' : 'md') as 'sm' | 'md',
  };

  const handleChange = (value: any) => {
    form.setFieldValue(question.code, value);
    form.validateField(question.code);
  };

  switch (question.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'password':
      return (
        <TextInput
          key={question.code}
          {...fieldProps}
          type={question.type}
          value={form.values[question.code] || ''}
          onChange={(event) => handleChange(event.currentTarget.value)}
        />
      );

    case 'textarea':
      return (
        <Textarea
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || ''}
          onChange={(event) => handleChange(event.currentTarget.value)}
          minRows={3}
          maxRows={6}
        />
      );

    case 'number':
      return (
        <NumberInput
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || ''}
          onChange={handleChange}
          min={0}
          step={1}
        />
      );

    case 'date':
      return (
        <DatePickerInput
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || null}
          onChange={handleChange}
          valueFormat="DD MMMM YYYY"
          locale="id"
        />
      );

    case 'select':
      return (
        <Select
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || ''}
          onChange={handleChange}
          data={question.options || []}
          searchable
          clearable={!question.required}
        />
      );

    case 'radio':
      return (
        <RadioGroupField
          key={question.code}
          {...fieldProps}
          data={question.options || []}
          withOther={question.has_custom_other_input}
          value={form.values[question.code] || ''}
          onChange={handleChange}
        />
      );

    case 'checkbox':
      return (
        <Checkbox.Group
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || []}
          onChange={handleChange}>
          <Stack gap="sm">
            {question.options?.map((option) => (
              <Checkbox
                key={option.value}
                value={option.value}
                label={option.label}
                color="#F03800"
                disabled={question.disabled || question.readonly}
              />
            ))}
          </Stack>
        </Checkbox.Group>
      );

    case 'multiselect':
      return (
        <Select
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || []}
          onChange={handleChange}
          data={question.options || []}
          multiple
          searchable
          clearable={!question.required}
        />
      );

    default:
      return (
        <TextInput
          key={question.code}
          {...fieldProps}
          value={form.values[question.code] || ''}
          onChange={(event) => handleChange(event.currentTarget.value)}
        />
      );
  }
};
