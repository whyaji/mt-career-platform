import { Button, Group } from '@mantine/core';

export interface StatusFilterPill {
  value: number;
  label: string;
  count?: number;
  color: string;
}

export interface StatusFilterPillsProps {
  statuses: StatusFilterPill[];
  selectedStatus?: number;
  onStatusSelect: (status: number | undefined) => void;
  loading?: boolean;
}

export function StatusFilterPills({
  statuses,
  selectedStatus,
  onStatusSelect,
  loading = false,
}: StatusFilterPillsProps) {
  return (
    <Group gap="xs" wrap="wrap">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={selectedStatus === status.value ? 'filled' : 'light'}
          color={status.color}
          size="sm"
          radius="xl"
          onClick={() => onStatusSelect(selectedStatus === status.value ? undefined : status.value)}
          loading={loading}
          style={{
            fontWeight: 500,
            textTransform: 'capitalize',
          }}>
          {status.label}
          {status.count && ` (${status.count})`}
        </Button>
      ))}
    </Group>
  );
}
