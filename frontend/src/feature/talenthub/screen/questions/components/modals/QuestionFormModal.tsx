import {
  ActionIcon,
  Button,
  Card,
  Collapse,
  Divider,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  useCommonValidationRulesQuery,
  useIconsQuery,
  useQuestionTypesQuery,
} from '@/hooks/query/question/useQuestionMetadataQuery';
import type {
  ConditionalCondition,
  QuestionFormData,
  QuestionType,
  ScoringCondition,
  ValidationRule,
} from '@/types/question.type';

interface QuestionFormModalProps {
  opened: boolean;
  onClose: () => void;
  question?: QuestionType | null;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export function QuestionFormModal({
  opened,
  onClose: onCloseProp,
  question,
  onSubmit,
  loading = false,
  title = 'Question Form',
}: QuestionFormModalProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [scoringConditions, setScoringConditions] = useState<ScoringCondition[]>([]);
  const [conditionalConditions, setConditionalConditions] = useState<ConditionalCondition[]>([]);
  const [newConditionValue, setNewConditionValue] = useState('');
  const [showValidationRules, setShowValidationRules] = useState(false);
  const [showScoringRules, setShowScoringRules] = useState(false);
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);

  const { data: questionTypesData } = useQuestionTypesQuery();
  const { data: commonValidationRulesData } = useCommonValidationRulesQuery();
  const { data: iconsData } = useIconsQuery();

  const questionTypes =
    questionTypesData?.success && 'data' in questionTypesData ? questionTypesData.data : {};

  const commonValidationRules =
    commonValidationRulesData?.success && 'data' in commonValidationRulesData
      ? commonValidationRulesData.data
      : [];

  const icons = iconsData?.success && 'data' in iconsData ? iconsData.data : {};

  const form = useForm<QuestionFormData>({
    initialValues: {
      code: '',
      label: '',
      placeholder: '',
      description: '',
      type: 'text',
      options: [],
      validation_rules: [],
      scoring_rules: {
        enabled: false,
        points: 0,
        conditions: [],
        max_score: 0,
      },
      display_order: 0,
      required: false,
      readonly: false,
      disabled: false,
      icon: '',
      group: '',
      conditional_logic: {
        enabled: false,
        operator: 'AND' as const,
        conditions: [],
      },
      default_value: '',
      has_custom_other_input: false,
      is_active: true,
    },
    validate: {
      code: (value) => (value.length < 1 ? 'Code is required' : null),
      label: (value) => (value.length < 1 ? 'Label is required' : null),
      type: (value) => (value.length < 1 ? 'Type is required' : null),
    },
  });

  const setFormValues = (question: QuestionType) => {
    // Handle object options with label and value
    const optionsArray = (question.options || []).map((option) => {
      if (typeof option === 'object' && option !== null && 'label' in option && 'value' in option) {
        return option as { label: string; value: string };
      }
      // Fallback for legacy string options - convert to object format
      const stringValue = typeof option === 'string' ? option : String(option);
      return { label: stringValue, value: stringValue };
    });

    form.setValues({
      code: question.code || '',
      label: question.label || '',
      placeholder: question.placeholder || '',
      description: question.description || '',
      type: question.type || 'text',
      options: optionsArray,
      validation_rules: question.validation_rules || [],
      scoring_rules: question.scoring_rules || {
        enabled: false,
        points: 0,
        conditions: [],
        max_score: 0,
      },
      display_order: question.display_order || 0,
      required: question.required || false,
      readonly: question.readonly || false,
      disabled: question.disabled || false,
      icon: question.icon || '',
      group: question.group || '',
      conditional_logic: question.conditional_logic || {
        enabled: false,
        operator: 'AND' as const,
        conditions: [],
      },
      default_value: question.default_value || '',
      has_custom_other_input: question.has_custom_other_input || false,
      is_active: question.is_active !== undefined ? question.is_active : true,
    });
    setOptions(optionsArray);
    setValidationRules(question.validation_rules || []);
    setScoringConditions(question.scoring_rules?.conditions || []);
    setConditionalConditions(question.conditional_logic?.conditions || []);
  };

  const resetForm = () => {
    form.reset();
    setOptions([]);
    setNewOptionLabel('');
    setNewOptionValue('');
    setValidationRules([]);
    setScoringConditions([]);
    setConditionalConditions([]);
    setNewConditionValue('');
    setShowValidationRules(false);
    setShowScoringRules(false);
    setShowConditionalLogic(false);
  };

  useEffect(() => {
    if (question) {
      setFormValues(question);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, opened]);

  const onClose = () => {
    resetForm();
    onCloseProp();
  };

  const handleSubmit = async (values: QuestionFormData) => {
    try {
      const submitData = {
        ...values,
        options: options.length > 0 ? options : undefined,
        validation_rules: validationRules.length > 0 ? validationRules : undefined,
        scoring_rules: form.values.scoring_rules?.enabled
          ? {
              ...form.values.scoring_rules,
              conditions: scoringConditions,
            }
          : undefined,
        conditional_logic: form.values.conditional_logic?.enabled
          ? {
              ...form.values.conditional_logic,
              conditions: conditionalConditions,
            }
          : undefined,
      };
      await onSubmit(submitData);
      notifications.show({
        title: 'Success',
        message: question ? 'Question updated successfully' : 'Question created successfully',
        color: 'green',
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: question ? 'Failed to update question' : 'Failed to create question',
        color: 'red',
      });
    }
  };

  const addOption = () => {
    if (newOptionLabel.trim()) {
      // Auto-generate value from label if not provided
      const value = newOptionValue.trim() || newOptionLabel.trim();
      const newOption = { label: newOptionLabel.trim(), value };
      const isDuplicate = options.some((opt) => opt.value === newOption.value);

      if (!isDuplicate) {
        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);
        form.setFieldValue('options', updatedOptions);
        setNewOptionLabel('');
        setNewOptionValue('');
      }
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    form.setFieldValue('options', updatedOptions);
  };

  const requiresOptions = ['select', 'multiselect', 'radio', 'checkbox'].includes(form.values.type);

  // Use API data for validation rule templates
  const validationRuleTemplates = commonValidationRules || [];

  // Validation Rules helpers
  const addValidationRule = () => {
    setValidationRules([...validationRules, { rule: '', value: undefined, message: '' }]);
  };

  const addValidationRuleFromTemplate = (
    template: NonNullable<typeof commonValidationRules>[0]
  ) => {
    setValidationRules([
      ...validationRules,
      {
        rule: template.rule,
        value: template.value || undefined,
        message: template.message,
      },
    ]);
  };

  const updateValidationRule = (index: number, field: keyof ValidationRule, value: unknown) => {
    const updated = [...validationRules];
    updated[index] = { ...updated[index], [field]: value };
    setValidationRules(updated);
  };

  const removeValidationRule = (index: number) => {
    setValidationRules(validationRules.filter((_, i) => i !== index));
  };

  // Scoring Conditions helpers
  const addScoringCondition = () => {
    setScoringConditions([...scoringConditions, { operator: 'equals', value: '', points: 0 }]);
  };

  const updateScoringCondition = (index: number, field: keyof ScoringCondition, value: unknown) => {
    const updated = [...scoringConditions];
    updated[index] = { ...updated[index], [field]: value };
    setScoringConditions(updated);
  };

  const removeScoringCondition = (index: number) => {
    setScoringConditions(scoringConditions.filter((_, i) => i !== index));
  };

  // Conditional Logic helpers
  const addConditionalCondition = () => {
    setConditionalConditions([...conditionalConditions, { field: '', operator: 'in', values: [] }]);
  };

  const updateConditionalCondition = (
    index: number,
    field: keyof ConditionalCondition,
    value: unknown
  ) => {
    const updated = [...conditionalConditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditionalConditions(updated);
  };

  const removeConditionalCondition = (index: number) => {
    setConditionalConditions(conditionalConditions.filter((_, i) => i !== index));
  };

  const addValueToCondition = (conditionIndex: number, value: string) => {
    if (value.trim()) {
      const updated = [...conditionalConditions];
      const currentValues = updated[conditionIndex].values || [];
      if (!currentValues.includes(value.trim())) {
        updated[conditionIndex] = {
          ...updated[conditionIndex],
          values: [...currentValues, value.trim()],
        };
        setConditionalConditions(updated);
      }
    }
  };

  const removeValueFromCondition = (conditionIndex: number, valueIndex: number) => {
    const updated = [...conditionalConditions];
    const currentValues = updated[conditionIndex].values || [];
    updated[conditionIndex] = {
      ...updated[conditionIndex],
      values: currentValues.filter((_, i) => i !== valueIndex),
    };
    setConditionalConditions(updated);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Code"
              placeholder="e.g., nama_lengkap"
              required
              {...form.getInputProps('code')}
            />
            <TextInput
              label="Label"
              placeholder="e.g., NAMA LENGKAP"
              required
              {...form.getInputProps('label')}
            />
          </Group>

          <TextInput
            label="Placeholder"
            placeholder="Enter placeholder text"
            {...form.getInputProps('placeholder')}
          />

          <Textarea
            label="Description"
            placeholder="Enter description/help text"
            rows={3}
            {...form.getInputProps('description')}
          />

          <Group grow>
            <Select
              label="Type"
              placeholder="Select question type"
              required
              data={Object.entries(questionTypes || {}).map(([value, label]) => ({
                value,
                label: label as string,
              }))}
              {...form.getInputProps('type')}
            />
            <TextInput
              label="Group"
              placeholder="e.g., personal_info"
              {...form.getInputProps('group')}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Display Order"
              placeholder="0"
              min={0}
              {...form.getInputProps('display_order')}
            />
            <Select
              label="Icon"
              placeholder="Select an icon"
              data={Object.entries(icons || {}).map(([value, label]) => ({
                value,
                label: `${value} - ${label}`,
              }))}
              searchable
              clearable
              {...form.getInputProps('icon')}
            />
          </Group>

          {requiresOptions && (
            <Card withBorder>
              <Group justify="space-between" mb="sm">
                <Text fw={500}>Options</Text>
              </Group>
              <Stack gap="sm">
                <Text size="xs" c="dimmed" mb="xs">
                  Enter option label and value. If value is empty, it will be auto-generated from
                  the label.
                </Text>

                {/* Existing Options */}
                {options.map((option, index) => (
                  <Card key={index} withBorder p="sm">
                    <Group gap="sm">
                      <TextInput
                        placeholder="Option Label"
                        value={option.label}
                        onChange={(event) => {
                          const updatedOptions = [...options];
                          updatedOptions[index] = {
                            ...updatedOptions[index],
                            label: event.currentTarget.value,
                          };
                          setOptions(updatedOptions);
                          form.setFieldValue('options', updatedOptions);
                        }}
                        style={{ flex: 1 }}
                      />
                      <TextInput
                        placeholder="Option Value"
                        value={option.value}
                        onChange={(event) => {
                          const updatedOptions = [...options];
                          updatedOptions[index] = {
                            ...updatedOptions[index],
                            value: event.currentTarget.value,
                          };
                          setOptions(updatedOptions);
                          form.setFieldValue('options', updatedOptions);
                        }}
                        style={{ flex: 1 }}
                      />
                      <ActionIcon color="red" variant="subtle" onClick={() => removeOption(index)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}

                {/* Add New Option */}
                <Card withBorder p="sm" bg="gray.0">
                  <Group gap="sm">
                    <TextInput
                      placeholder="Option Label"
                      value={newOptionLabel}
                      onChange={(event) => setNewOptionLabel(event.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      placeholder="Option Value"
                      value={newOptionValue}
                      onChange={(event) => setNewOptionValue(event.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      leftSection={<IconPlus size={14} />}
                      variant="light"
                      size="sm"
                      onClick={addOption}
                      disabled={!newOptionLabel.trim()}>
                      Add Option
                    </Button>
                  </Group>
                </Card>
              </Stack>
            </Card>
          )}

          <Group>
            <Switch label="Required" {...form.getInputProps('required', { type: 'checkbox' })} />
            <Switch label="Read Only" {...form.getInputProps('readonly', { type: 'checkbox' })} />
            <Switch label="Disabled" {...form.getInputProps('disabled', { type: 'checkbox' })} />
          </Group>

          <Group>
            <Switch
              label="Allow Custom Other Input"
              {...form.getInputProps('has_custom_other_input', { type: 'checkbox' })}
            />
            <Switch label="Active" {...form.getInputProps('is_active', { type: 'checkbox' })} />
          </Group>

          <TextInput
            label="Default Value"
            placeholder="Enter default value"
            {...form.getInputProps('default_value')}
          />

          {/* Validation Rules Section */}
          <Card withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Validation Rules</Text>
              <ActionIcon
                variant="subtle"
                onClick={() => setShowValidationRules(!showValidationRules)}>
                {showValidationRules ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={showValidationRules}>
              <Stack gap="sm">
                {/* Quick Add Templates */}
                <Card withBorder p="sm" bg="gray.0">
                  <Text size="sm" fw={500} mb="xs">
                    Quick Add Common Rules:
                  </Text>
                  <Group gap="xs">
                    {validationRuleTemplates.slice(0, 6).map((template, index) => (
                      <Button
                        key={index}
                        size="xs"
                        variant="light"
                        onClick={() => addValidationRuleFromTemplate(template)}
                        title={template.description}>
                        {template.rule.replace('_', ' ')}
                      </Button>
                    ))}
                  </Group>
                  <Group gap="xs" mt="xs">
                    {validationRuleTemplates.slice(6).map((template, index) => (
                      <Button
                        key={index + 6}
                        size="xs"
                        variant="light"
                        onClick={() => addValidationRuleFromTemplate(template)}
                        title={template.description}>
                        {template.rule.replace('_', ' ')}
                      </Button>
                    ))}
                  </Group>
                </Card>

                {/* Existing Rules */}
                {validationRules.map((rule, index) => (
                  <Card key={index} withBorder p="sm">
                    <Group gap="sm">
                      <TextInput
                        placeholder="Rule name (e.g., min_length)"
                        value={rule.rule}
                        onChange={(e) => updateValidationRule(index, 'rule', e.currentTarget.value)}
                        style={{ flex: 1 }}
                      />
                      <TextInput
                        placeholder="Value (e.g., 3)"
                        value={String(rule.value || '')}
                        onChange={(e) =>
                          updateValidationRule(index, 'value', e.currentTarget.value)
                        }
                        style={{ flex: 1 }}
                      />
                      <TextInput
                        placeholder="Error message"
                        value={rule.message || ''}
                        onChange={(e) =>
                          updateValidationRule(index, 'message', e.currentTarget.value)
                        }
                        style={{ flex: 2 }}
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeValidationRule(index)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}

                {/* Add Custom Rule */}
                <Button
                  leftSection={<IconPlus size={14} />}
                  variant="light"
                  size="sm"
                  onClick={addValidationRule}>
                  Add Custom Validation Rule
                </Button>
              </Stack>
            </Collapse>
          </Card>

          {/* Scoring Rules Section */}
          <Card withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Scoring Rules</Text>
              <ActionIcon variant="subtle" onClick={() => setShowScoringRules(!showScoringRules)}>
                {showScoringRules ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={showScoringRules}>
              <Stack gap="sm">
                <Switch
                  label="Enable Scoring"
                  {...form.getInputProps('scoring_rules.enabled', { type: 'checkbox' })}
                />
                {form.values.scoring_rules?.enabled && (
                  <>
                    <Group grow>
                      <NumberInput
                        label="Default Points"
                        placeholder="0"
                        min={0}
                        {...form.getInputProps('scoring_rules.points')}
                      />
                      <NumberInput
                        label="Max Score"
                        placeholder="100"
                        min={0}
                        {...form.getInputProps('scoring_rules.max_score')}
                      />
                    </Group>
                    <Divider label="Scoring Conditions" />
                    {scoringConditions.map((condition, index) => (
                      <Card key={index} withBorder p="sm">
                        <Group gap="sm">
                          <Select
                            placeholder="Operator"
                            value={condition.operator}
                            onChange={(value) => updateScoringCondition(index, 'operator', value)}
                            data={[
                              { value: 'equals', label: 'Equals' },
                              { value: 'not_equals', label: 'Not Equals' },
                              { value: 'contains', label: 'Contains' },
                              { value: 'greater_than', label: 'Greater Than' },
                              { value: 'less_than', label: 'Less Than' },
                              { value: 'greater_equal', label: 'Greater or Equal' },
                              { value: 'less_equal', label: 'Less or Equal' },
                              { value: 'in', label: 'In List' },
                              { value: 'not_in', label: 'Not In List' },
                            ]}
                            style={{ flex: 1 }}
                          />
                          <TextInput
                            placeholder="Value to compare"
                            value={String(condition.value || '')}
                            onChange={(e) =>
                              updateScoringCondition(index, 'value', e.currentTarget.value)
                            }
                            style={{ flex: 1 }}
                          />
                          <NumberInput
                            placeholder="Points"
                            value={condition.points}
                            onChange={(value) => updateScoringCondition(index, 'points', value)}
                            min={0}
                            style={{ width: 100 }}
                          />
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeScoringCondition(index)}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Card>
                    ))}
                    <Button
                      leftSection={<IconPlus size={14} />}
                      variant="light"
                      size="sm"
                      onClick={addScoringCondition}>
                      Add Scoring Condition
                    </Button>
                  </>
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Conditional Logic Section */}
          <Card withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Conditional Logic</Text>
              <ActionIcon
                variant="subtle"
                onClick={() => setShowConditionalLogic(!showConditionalLogic)}>
                {showConditionalLogic ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={showConditionalLogic}>
              <Stack gap="sm">
                <Switch
                  label="Enable Conditional Logic"
                  {...form.getInputProps('conditional_logic.enabled', { type: 'checkbox' })}
                />
                {form.values.conditional_logic?.enabled && (
                  <>
                    <Group grow>
                      <Select
                        label="Logic Operator"
                        placeholder="Select how to combine conditions"
                        value={form.values.conditional_logic?.operator || 'AND'}
                        onChange={(value) =>
                          form.setFieldValue(
                            'conditional_logic.operator',
                            (value as 'AND' | 'OR') || 'AND'
                          )
                        }
                        data={[
                          { value: 'AND', label: 'AND (All conditions must be true)' },
                          { value: 'OR', label: 'OR (Any condition can be true)' },
                        ]}
                      />
                    </Group>
                    <Divider label="Conditions" />
                    {conditionalConditions.map((condition, index) => (
                      <Card key={index} withBorder p="sm">
                        <Stack gap="sm">
                          <Group gap="sm">
                            <TextInput
                              placeholder="Field to watch (e.g., country)"
                              value={condition.field}
                              onChange={(e) =>
                                updateConditionalCondition(index, 'field', e.currentTarget.value)
                              }
                              style={{ flex: 1 }}
                            />
                            <Select
                              placeholder="Operator"
                              value={condition.operator}
                              onChange={(value) =>
                                updateConditionalCondition(index, 'operator', value)
                              }
                              data={[
                                { value: 'in', label: 'Is one of' },
                                { value: 'not_in', label: 'Is not one of' },
                                { value: 'equals', label: 'Equals' },
                                { value: 'not_equals', label: 'Does not equal' },
                                { value: 'contains', label: 'Contains' },
                                { value: 'not_contains', label: 'Does not contain' },
                                { value: 'empty', label: 'Is empty' },
                                { value: 'not_empty', label: 'Is not empty' },
                                { value: 'greater_than', label: 'Greater than' },
                                { value: 'less_than', label: 'Less than' },
                              ]}
                              style={{ flex: 1 }}
                            />
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeConditionalCondition(index)}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                          <Text size="sm" fw={500}>
                            Expected Values:
                          </Text>
                          <Group gap="xs" wrap="wrap">
                            {condition.values?.map((value, valueIndex) => (
                              <Card key={valueIndex} withBorder p="xs" bg="blue.0">
                                <Group gap="xs">
                                  <Text size="sm">{value}</Text>
                                  <ActionIcon
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => removeValueFromCondition(index, valueIndex)}>
                                    <IconX size={10} />
                                  </ActionIcon>
                                </Group>
                              </Card>
                            ))}
                          </Group>
                          <Group gap="sm">
                            <TextInput
                              placeholder="Add expected value"
                              value={newConditionValue}
                              onChange={(e) => setNewConditionValue(e.currentTarget.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addValueToCondition(index, newConditionValue);
                                  setNewConditionValue('');
                                }
                              }}
                              style={{ flex: 1 }}
                            />
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => {
                                addValueToCondition(index, newConditionValue);
                                setNewConditionValue('');
                              }}
                              disabled={!newConditionValue.trim()}>
                              Add Value
                            </Button>
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                    <Button
                      leftSection={<IconPlus size={14} />}
                      variant="light"
                      size="sm"
                      onClick={addConditionalCondition}>
                      Add Condition
                    </Button>
                  </>
                )}
              </Stack>
            </Collapse>
          </Card>

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {question ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
