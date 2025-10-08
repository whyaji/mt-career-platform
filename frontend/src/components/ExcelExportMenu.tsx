import { Button, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconFileText } from '@tabler/icons-react';

export interface ExcelExportMenuProps {
  onExportAll: () => void;
  onExportFiltered: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default' | 'gradient';
  color?: string;
}

export function ExcelExportMenu({
  onExportAll,
  onExportFiltered,
  hasActiveFilters,
  loading = false,
  size = 'sm',
  variant = 'light',
  color = 'green',
}: ExcelExportMenuProps) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button
          variant={variant}
          color={color}
          leftSection={<IconFileText size={16} />}
          rightSection={<IconChevronDown size={12} />}
          loading={loading}
          disabled={loading}
          size={size}>
          Export Excel
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={600}>
            Export Options
          </Text>
        </Menu.Label>
        <Menu.Divider />

        <Menu.Item
          leftSection={<IconFileText size={16} />}
          onClick={onExportAll}
          disabled={loading}>
          <Group gap="xs">
            <Text size="sm">Export All</Text>
            <Text size="xs" c="dimmed">
              All applications
            </Text>
          </Group>
        </Menu.Item>

        <Menu.Item
          leftSection={<IconFileText size={16} />}
          onClick={onExportFiltered}
          disabled={loading || !hasActiveFilters}
          color={!hasActiveFilters ? 'dimmed' : undefined}>
          <Group gap="xs">
            <Text size="sm">Export Filtered</Text>
            <Text size="xs" c="dimmed">
              {hasActiveFilters ? 'Current filters' : 'No filters applied'}
            </Text>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
