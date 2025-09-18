import { Badge, Group, Modal, Stack, Text } from '@mantine/core';
import { IconCalendar, IconMapPin, IconNumber } from '@tabler/icons-react';

import type { BatchType } from '@/types/batch.type';

interface BatchDetailModalProps {
  opened: boolean;
  onClose: () => void;
  batch: BatchType | null;
  loading?: boolean;
}

export function BatchDetailModal({
  opened,
  onClose,
  batch,
  loading: _loading = false,
}: BatchDetailModalProps) {
  if (!batch) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Batch Details" size="md" radius="md" centered>
      <Stack gap="md">
        <Group gap="sm">
          <IconNumber size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Batch Number
            </Text>
            <Text fw={500}>{batch.number}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconNumber size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Batch Code
            </Text>
            <Text fw={500}>{batch.number_code}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconMapPin size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Location
            </Text>
            <Text fw={500}>{batch.location}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconMapPin size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Location Code
            </Text>
            <Text fw={500}>{batch.location_code}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconCalendar size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Year
            </Text>
            <Text fw={500}>{batch.year}</Text>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed" mb="xs">
            Status
          </Text>
          <Badge variant="light" size="sm" color={batch.status === 1 ? 'green' : 'red'}>
            {batch.status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {batch.institutes && batch.institutes.length > 0 && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              Institutes
            </Text>
            <Group gap="xs">
              {batch.institutes.map((institute, index) => (
                <Badge key={index} variant="light" size="sm">
                  {institute}
                </Badge>
              ))}
            </Group>
          </div>
        )}
      </Stack>
    </Modal>
  );
}
