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
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  useCommonValidationRulesQuery,
  useIconsQuery,
  useQuestionTypesQuery,
} from '@/hooks/query/question/useQuestionMetadataQuery';
import type {
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
  onClose,
  question,
  onSubmit,
  loading = false,
  title = 'Question Form',
}: QuestionFormModalProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [scoringConditions, setScoringConditions] = useState<ScoringCondition[]>([]);
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
      conditional_logic: undefined,
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

  useEffect(() => {
    if (question) {
      form.setValues({
        code: question.code,
        label: question.label,
        placeholder: question.placeholder || '',
        description: question.description || '',
        type: question.type,
        options: question.options || [],
        validation_rules: question.validation_rules || [],
        scoring_rules: question.scoring_rules || {
          enabled: false,
          points: 0,
          conditions: [],
          max_score: 0,
        },
        display_order: question.display_order,
        required: question.required,
        readonly: question.readonly,
        disabled: question.disabled,
        icon: question.icon || '',
        group: question.group || '',
        conditional_logic: question.conditional_logic,
        default_value: question.default_value || '',
        has_custom_other_input: question.has_custom_other_input,
        is_active: question.is_active,
      });
      setOptions(question.options || []);
      setValidationRules(question.validation_rules || []);
      setScoringConditions(question.scoring_rules?.conditions || []);
    } else {
      form.reset();
      setOptions([]);
      setValidationRules([]);
      setScoringConditions([]);
      setShowValidationRules(false);
      setShowScoringRules(false);
      setShowConditionalLogic(false);
    }
  }, [question, opened]);

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
      };
      await onSubmit(submitData);
      notifications.show({
        title: 'Success',
        message: question ? 'Question updated successfully' : 'Question created successfully',
        color: 'green',
      });
      form.reset();
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
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);
      form.setFieldValue('options', updatedOptions);
      setNewOption('');
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
            <div>
              <Text size="sm" fw={500} mb="xs">
                Options
              </Text>
              <Stack gap="xs">
                {options.map((option, index) => (
                  <Group key={index} gap="xs">
                    <Text size="sm" style={{ flex: 1 }}>
                      {option}
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => removeOption(index)}>
                      Remove
                    </Button>
                  </Group>
                ))}
                <Group gap="xs">
                  <TextInput
                    placeholder="Add new option"
                    value={newOption}
                    onChange={(event) => setNewOption(event.currentTarget.value)}
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addOption();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button size="sm" onClick={addOption}>
                    Add
                  </Button>
                </Group>
              </Stack>
            </div>
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
                <Group grow>
                  <TextInput
                    label="Field to Watch"
                    placeholder="e.g., age"
                    {...form.getInputProps('conditional_logic.field')}
                  />
                  <Select
                    label="Operator"
                    placeholder="Select operator"
                    {...form.getInputProps('conditional_logic.operator')}
                    data={[
                      { value: 'equals', label: 'Equals' },
                      { value: 'not_equals', label: 'Not Equals' },
                      { value: 'contains', label: 'Contains' },
                      { value: 'greater_than', label: 'Greater Than' },
                      { value: 'less_than', label: 'Less Than' },
                    ]}
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="Expected Value"
                    placeholder="e.g., 18"
                    {...form.getInputProps('conditional_logic.value')}
                  />
                  <Switch
                    label="Show when condition is met"
                    {...form.getInputProps('conditional_logic.show_when', { type: 'checkbox' })}
                  />
                </Group>
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
