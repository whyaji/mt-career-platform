import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconColumns } from '@tabler/icons-react';
import { useMemo } from 'react';

export interface ColumnOption {
  key: string;
  label: string;
  category?: string;
}

export interface ColumnVisibilityControlProps {
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onColumnToggle: (columnKey: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onDefault: () => void;
  triggerLabel?: string;
  maxHeight?: number;
  inDrawer?: boolean;
}

export function ColumnVisibilityControl({
  columns,
  visibleColumns,
  onColumnToggle,
  onShowAll,
  onHideAll,
  onDefault,
  triggerLabel = 'Columns',
  maxHeight = 400,
  inDrawer = false,
}: ColumnVisibilityControlProps) {
  const visibleCount = useMemo(() => {
    return Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  const totalCount = columns.length;

  // If in drawer, show expanded view
  if (inDrawer) {
    return (
      <Paper p="md" withBorder radius="md" bg="white">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconColumns size={16} />
            <Text size="sm" fw={600}>
              Column Visibility
            </Text>
            <Badge size="sm" variant="light" color="blue">
              {visibleCount}/{totalCount}
            </Badge>
          </Group>
        </Group>

        <Group gap="xs" mb="sm">
          <Button size="xs" variant="light" onClick={onShowAll} fullWidth>
            Show All
          </Button>
          <Button size="xs" variant="light" onClick={onHideAll} fullWidth>
            Hide All
          </Button>
          <Button size="xs" variant="light" onClick={onDefault} fullWidth>
            Default
          </Button>
        </Group>

        <Divider mb="sm" />

        <ScrollArea.Autosize mah={maxHeight} type="scroll">
          <Stack gap="xs">
            {columns.map((column) => (
              <Checkbox
                key={column.key}
                label={column.label}
                checked={visibleColumns[column.key] || false}
                onChange={() => onColumnToggle(column.key)}
                size="sm"
              />
            ))}
          </Stack>
        </ScrollArea.Autosize>
      </Paper>
    );
  }

  // Default menu view
  return (
    <Menu shadow="md" width={300} position="bottom-end" withinPortal zIndex={2000}>
      <Menu.Target>
        <Button
          variant="light"
          color="gray"
          leftSection={<IconColumns size={16} />}
          rightSection={
            <Badge size="sm" variant="light" color="blue">
              {visibleCount}/{totalCount}
            </Badge>
          }
          size="sm">
          {triggerLabel}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Column Visibility
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="subtle" onClick={onShowAll}>
                Show All
              </Button>
              <Button size="xs" variant="subtle" onClick={onHideAll}>
                Hide All
              </Button>
              <Button size="xs" variant="subtle" onClick={onDefault}>
                Default
              </Button>
            </Group>
          </Group>
        </Menu.Label>
        <Menu.Divider />

        <ScrollArea.Autosize mah={maxHeight} type="scroll">
          <Stack gap="xs" p="xs">
            {columns.map((column) => (
              <Checkbox
                key={column.key}
                label={column.label}
                checked={visibleColumns[column.key] || false}
                onChange={() => onColumnToggle(column.key)}
                size="sm"
              />
            ))}
          </Stack>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
