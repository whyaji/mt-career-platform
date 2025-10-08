import { Button, Checkbox, Divider, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import React, { useState } from 'react';

export interface CheckboxOption {
  value: string;
  label: string;
}

export interface CheckboxFilterProps {
  label: string;
  icon?: React.ReactNode;
  options: CheckboxOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  onClear: () => void;
  placeholder?: string;
}

export function CheckboxFilter({
  label,
  icon,
  options,
  selectedValues,
  onSelectionChange,
  onClear,
  placeholder = 'Select options',
}: CheckboxFilterProps) {
  const [opened, setOpened] = useState(false);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <Menu
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom-start"
      shadow="md"
      width={280}
      withinPortal>
      <Menu.Target>
        <Button
          variant="light"
          color="gray"
          size="sm"
          radius="md"
          rightSection={<IconChevronDown size={14} />}
          onClick={() => setOpened(!opened)}
          style={{
            fontWeight: 500,
            border: '1px solid var(--mantine-color-gray-3)',
          }}>
          <Group gap="xs">
            {icon}
            <Text size="sm">{label}</Text>
            {selectedValues.length > 0 && (
              <>
                <Divider orientation="vertical" size="sm" />
                <Text size="sm" c="dimmed">
                  {getDisplayText()}
                </Text>
              </>
            )}
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Paper p="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>
              {label}
            </Text>
            {selectedValues.length > 0 && (
              <Button
                variant="subtle"
                size="xs"
                color="red"
                onClick={() => {
                  onClear();
                  setOpened(false);
                }}>
                Clear filter
              </Button>
            )}
          </Group>

          <Stack gap="xs">
            {options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={selectedValues.includes(option.value)}
                onChange={(event) =>
                  handleCheckboxChange(option.value, event.currentTarget.checked)
                }
                size="sm"
              />
            ))}
          </Stack>
        </Paper>
      </Menu.Dropdown>
    </Menu>
  );
}
