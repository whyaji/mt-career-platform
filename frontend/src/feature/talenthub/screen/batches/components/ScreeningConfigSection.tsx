import {
  Accordion,
  Checkbox,
  Chip,
  Group,
  MultiSelect,
  NumberInput,
  Stack,
  Text,
} from '@mantine/core';

import type { ScreeningConfigType } from '@/types/batch.type';

interface ScreeningConfigSectionProps {
  value: ScreeningConfigType | null | undefined;
  onChange: (value: ScreeningConfigType) => void;
}

export function ScreeningConfigSection({ value, onChange }: ScreeningConfigSectionProps) {
  const config = value || {};

  const updateConfig = (
    section: keyof ScreeningConfigType,
    newValues: Partial<
      | ScreeningConfigType['age']
      | ScreeningConfigType['physical']
      | ScreeningConfigType['program']
      | ScreeningConfigType['education']
      | ScreeningConfigType['university']
      | ScreeningConfigType['marital']
      | ScreeningConfigType['continue_education']
    >
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        ...newValues,
      },
    });
  };

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Screening Configuration
      </Text>
      <Text size="xs" c="dimmed">
        Configure the screening requirements for applicants in this batch. Each section can be
        enabled/disabled and customized.
      </Text>

      <Accordion variant="separated">
        {/* Age Check */}
        <Accordion.Item value="age">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Age Requirements</Text>
              <Chip
                checked={config.age?.enabled ?? true}
                onChange={(checked) => updateConfig('age', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.age?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <NumberInput
                label="Minimum Age"
                placeholder="18"
                min={0}
                max={100}
                value={config.age?.min_age ?? 18}
                onChange={(val) => updateConfig('age', { min_age: Number(val) || 18 })}
              />
              <NumberInput
                label="Maximum Age"
                placeholder="30"
                min={0}
                max={100}
                value={config.age?.max_age ?? 30}
                onChange={(val) => updateConfig('age', { max_age: Number(val) || 30 })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Physical Attributes */}
        <Accordion.Item value="physical">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Physical Attributes</Text>
              <Chip
                checked={config.physical?.enabled ?? true}
                onChange={(checked) => updateConfig('physical', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.physical?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <NumberInput
                label="Minimum Height (cm)"
                placeholder="150"
                min={0}
                max={250}
                value={config.physical?.min_height ?? 150}
                onChange={(val) => updateConfig('physical', { min_height: Number(val) || 150 })}
              />
              <NumberInput
                label="Minimum Weight (kg)"
                placeholder="40"
                min={0}
                max={200}
                value={config.physical?.min_weight ?? 40}
                onChange={(val) => updateConfig('physical', { min_weight: Number(val) || 40 })}
              />
              <NumberInput
                label="Maximum Weight (kg)"
                placeholder="100"
                min={0}
                max={200}
                value={config.physical?.max_weight ?? 100}
                onChange={(val) => updateConfig('physical', { max_weight: Number(val) || 100 })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Program Requirements */}
        <Accordion.Item value="program">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Program Requirements</Text>
              <Chip
                checked={config.program?.enabled ?? true}
                onChange={(checked) => updateConfig('program', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.program?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <MultiSelect
                label="Allowed Education Levels"
                placeholder="Select allowed education levels"
                data={[
                  { value: 'D3', label: 'D3 (Diploma 3)' },
                  { value: 'D4', label: 'D4 (Diploma 4)' },
                  { value: 'S1', label: 'S1 (Bachelor)' },
                  { value: 'S2', label: 'S2 (Master)' },
                ]}
                value={config.program?.allowed_education_levels ?? []}
                onChange={(val) => updateConfig('program', { allowed_education_levels: val })}
                description="Leave empty to use default program-specific requirements"
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Education Requirements */}
        <Accordion.Item value="education">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Education Requirements</Text>
              <Chip
                checked={config.education?.enabled ?? true}
                onChange={(checked) => updateConfig('education', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.education?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <MultiSelect
                label="Valid Education Levels"
                placeholder="Select valid education levels"
                data={[
                  { value: 'D3', label: 'D3 (Diploma 3)' },
                  { value: 'D4', label: 'D4 (Diploma 4)' },
                  { value: 'S1', label: 'S1 (Bachelor)' },
                  { value: 'S2', label: 'S2 (Master)' },
                ]}
                value={config.education?.valid_levels ?? ['D3', 'D4', 'S1', 'S2']}
                onChange={(val) => updateConfig('education', { valid_levels: val })}
              />
              <Checkbox
                label="Require Diploma"
                checked={config.education?.require_diploma ?? true}
                onChange={(e) =>
                  updateConfig('education', { require_diploma: e.currentTarget.checked })
                }
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* University & Certificate */}
        <Accordion.Item value="university">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">University & Certificate Verification</Text>
              <Chip
                checked={config.university?.enabled ?? true}
                onChange={(checked) => updateConfig('university', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.university?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" c="dimmed">
              This check verifies university credentials through PDDIKTI service.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Marital Status */}
        <Accordion.Item value="marital">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Marital Status</Text>
              <Chip
                checked={config.marital?.enabled ?? true}
                onChange={(checked) => updateConfig('marital', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.marital?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <MultiSelect
                label="Valid Marital Statuses"
                placeholder="Select valid statuses"
                data={[
                  { value: 'Lajang', label: 'Lajang (Single)' },
                  { value: 'Menikah', label: 'Menikah (Married)' },
                  { value: 'Cerai', label: 'Cerai (Divorced)' },
                ]}
                value={config.marital?.valid_statuses ?? ['Lajang']}
                onChange={(val) => updateConfig('marital', { valid_statuses: val })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Continue Education */}
        <Accordion.Item value="continue_education">
          <Accordion.Control>
            <Group justify="space-between">
              <Text size="sm">Continue Education</Text>
              <Chip
                checked={config.continue_education?.enabled ?? true}
                onChange={(checked) => updateConfig('continue_education', { enabled: checked })}
                size="xs"
                onClick={(e) => e.stopPropagation()}>
                {(config.continue_education?.enabled ?? true) ? 'Enabled' : 'Disabled'}
              </Chip>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <MultiSelect
                label="Valid Options"
                placeholder="Select valid options"
                data={[
                  { value: 'Ya', label: 'Ya (Yes)' },
                  { value: 'Tidak', label: 'Tidak (No)' },
                ]}
                value={config.continue_education?.valid_options ?? ['Tidak']}
                onChange={(val) => updateConfig('continue_education', { valid_options: val })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
