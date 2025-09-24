import { Badge, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconCode, IconInfoCircle } from '@tabler/icons-react';

import type { ProgramCategoryType } from '@/types/programCategory.type';

interface ProgramCategoryDetailModalProps {
  opened: boolean;
  onClose: () => void;
  programCategory: ProgramCategoryType | null;
  loading?: boolean;
}

export function ProgramCategoryDetailModal({
  opened,
  onClose,
  programCategory,
  loading: _loading = false,
}: ProgramCategoryDetailModalProps) {
  if (!programCategory) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Program Category Details" size="md" centered>
      <Stack gap="md">
        <Group>
          <IconCode size={20} />
          <Title order={4}>{programCategory.name}</Title>
        </Group>

        <Stack gap="sm">
          <Group>
            <Text fw={500} size="sm">
              Code:
            </Text>
            <Badge variant="light">{programCategory.code}</Badge>
          </Group>

          <Group>
            <Text fw={500} size="sm">
              Status:
            </Text>
            <Badge color={programCategory.status === 1 ? 'green' : 'red'}>
              {programCategory.status === 1 ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          {programCategory.description && (
            <Stack gap="xs">
              <Group>
                <IconInfoCircle size={16} />
                <Text fw={500} size="sm">
                  Description:
                </Text>
              </Group>
              <Text size="sm" c="dimmed" pl="lg">
                {programCategory.description}
              </Text>
            </Stack>
          )}

          <Group>
            <IconCalendar size={16} />
            <Text fw={500} size="sm">
              Created:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(programCategory.created_at).toLocaleDateString()}
            </Text>
          </Group>

          <Group>
            <IconCalendar size={16} />
            <Text fw={500} size="sm">
              Updated:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(programCategory.updated_at).toLocaleDateString()}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
