import { Badge, Group, Modal, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconCode, IconHash, IconInfoCircle, IconSettings, IconTag } from '@tabler/icons-react';

import type { QuestionType } from '@/types/question.type';

interface QuestionDetailModalProps {
  opened: boolean;
  onClose: () => void;
  question: QuestionType | null;
  loading?: boolean;
}

export function QuestionDetailModal({
  opened,
  onClose,
  question,
  loading: _loading = false,
}: QuestionDetailModalProps) {
  if (!question) {
    return null;
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'blue',
      textarea: 'cyan',
      number: 'green',
      email: 'orange',
      tel: 'red',
      url: 'purple',
      password: 'gray',
      select: 'indigo',
      multiselect: 'violet',
      radio: 'pink',
      checkbox: 'grape',
      date: 'teal',
      time: 'lime',
      datetime: 'yellow',
      file: 'amber',
      hidden: 'dark',
    };
    return colors[type] || 'blue';
  };

  const formatValidationRules = (rules: unknown): string => {
    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return 'None';
    }
    return rules
      .map((rule) => {
        if (typeof rule === 'string') {
          return rule;
        }
        if (typeof rule === 'object' && rule !== null) {
          const ruleObj = rule as { rule?: string; value?: unknown };
          return `${ruleObj.rule || 'rule'}${ruleObj.value ? `: ${ruleObj.value}` : ''}`;
        }
        return String(rule);
      })
      .join(', ');
  };

  const formatScoringRules = (rules: unknown): string => {
    if (!rules || typeof rules !== 'object' || rules === null) {
      return 'Disabled';
    }
    const rulesObj = rules as { enabled?: boolean; max_score?: number; points?: number };
    if (!rulesObj.enabled) {
      return 'Disabled';
    }
    return `Enabled (Max: ${rulesObj.max_score || 0}, Points: ${rulesObj.points || 0})`;
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Question Details" size="lg" centered>
      <ScrollArea h={500}>
        <Stack gap="lg">
          {/* Basic Information */}
          <div>
            <Group gap="xs" mb="sm">
              <IconInfoCircle size={16} />
              <Title order={4}>Basic Information</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Code:
                </Text>
                <Badge variant="light" color="blue">
                  {question.code}
                </Badge>
              </Group>
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Label:
                </Text>
                <Text size="sm">{question.label}</Text>
              </Group>
              {question.placeholder && (
                <Group>
                  <Text size="sm" fw={500} w={120}>
                    Placeholder:
                  </Text>
                  <Text size="sm">{question.placeholder}</Text>
                </Group>
              )}
              {question.description && (
                <Group>
                  <Text size="sm" fw={500} w={120}>
                    Description:
                  </Text>
                  <Text size="sm">{question.description}</Text>
                </Group>
              )}
            </Stack>
          </div>

          {/* Type and Configuration */}
          <div>
            <Group gap="xs" mb="sm">
              <IconSettings size={16} />
              <Title order={4}>Configuration</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Type:
                </Text>
                <Badge variant="light" color={getTypeColor(question.type)}>
                  {question.type}
                </Badge>
              </Group>
              {question.group && (
                <Group>
                  <Text size="sm" fw={500} w={120}>
                    Group:
                  </Text>
                  <Badge variant="outline">{question.group}</Badge>
                </Group>
              )}
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Display Order:
                </Text>
                <Badge variant="outline" color="gray">
                  {question.display_order}
                </Badge>
              </Group>
              {question.icon && (
                <Group>
                  <Text size="sm" fw={500} w={120}>
                    Icon:
                  </Text>
                  <Text size="sm">{question.icon}</Text>
                </Group>
              )}
            </Stack>
          </div>

          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div>
              <Group gap="xs" mb="sm">
                <IconTag size={16} />
                <Title order={4}>Options</Title>
              </Group>
              <Group gap="xs">
                {question.options.map((option, index) => (
                  <Badge key={index} variant="light" color="blue">
                    {option.label}
                  </Badge>
                ))}
              </Group>
            </div>
          )}

          {/* Properties */}
          <div>
            <Group gap="xs" mb="sm">
              <IconHash size={16} />
              <Title order={4}>Properties</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Badge color={question.required ? 'green' : 'gray'} variant="light">
                  {question.required ? 'Required' : 'Optional'}
                </Badge>
                <Badge color={question.readonly ? 'orange' : 'gray'} variant="light">
                  {question.readonly ? 'Read Only' : 'Editable'}
                </Badge>
                <Badge color={question.disabled ? 'red' : 'gray'} variant="light">
                  {question.disabled ? 'Disabled' : 'Enabled'}
                </Badge>
                <Badge color={question.has_custom_other_input ? 'purple' : 'gray'} variant="light">
                  {question.has_custom_other_input ? 'Custom Input' : 'No Custom Input'}
                </Badge>
                <Badge color={question.is_active ? 'green' : 'red'} variant="light">
                  {question.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
            </Stack>
          </div>

          {/* Validation Rules */}
          <div>
            <Group gap="xs" mb="sm">
              <IconCode size={16} />
              <Title order={4}>Validation Rules</Title>
            </Group>
            <Text size="sm">{formatValidationRules(question.validation_rules)}</Text>
          </div>

          {/* Scoring Rules */}
          {question.scoring_rules && (
            <div>
              <Group gap="xs" mb="sm">
                <IconSettings size={16} />
                <Title order={4}>Scoring Rules</Title>
              </Group>
              <Text size="sm">{formatScoringRules(question.scoring_rules)}</Text>
            </div>
          )}

          {/* Default Value */}
          {question.default_value !== undefined && (
            <div>
              <Group gap="xs" mb="sm">
                <IconInfoCircle size={16} />
                <Title order={4}>Default Value</Title>
              </Group>
              <Text size="sm">{String(question.default_value ?? '')}</Text>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <Group gap="xs" mb="sm">
              <IconInfoCircle size={16} />
              <Title order={4}>Timestamps</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Created:
                </Text>
                <Text size="sm">{new Date(question.created_at).toLocaleString()}</Text>
              </Group>
              <Group>
                <Text size="sm" fw={500} w={120}>
                  Updated:
                </Text>
                <Text size="sm">{new Date(question.updated_at).toLocaleString()}</Text>
              </Group>
            </Stack>
          </div>
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
