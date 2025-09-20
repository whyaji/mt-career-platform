import { Badge, Group, Modal, Stack, Text } from '@mantine/core';
import { IconBuilding, IconCalendar, IconCircle } from '@tabler/icons-react';

import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

interface EducationalInstitutionDetailModalProps {
  opened: boolean;
  onClose: () => void;
  educationalInstitution: EducationalInstitutionType | null;
  loading?: boolean;
}

export function EducationalInstitutionDetailModal({
  opened,
  onClose,
  educationalInstitution,
  loading: _loading = false,
}: EducationalInstitutionDetailModalProps) {
  if (!educationalInstitution) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Educational Institution Details"
      size="md"
      radius="md"
      centered>
      <Stack gap="md">
        <Group gap="sm">
          <IconBuilding size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Institution Name
            </Text>
            <Text fw={500}>{educationalInstitution.name}</Text>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed" mb="xs">
            Status
          </Text>
          <Badge
            variant="light"
            size="sm"
            color={educationalInstitution.status === 1 ? 'green' : 'red'}>
            {educationalInstitution.status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {educationalInstitution.created_at && (
          <Group gap="sm">
            <IconCalendar size={16} />
            <div>
              <Text size="sm" c="dimmed">
                Created At
              </Text>
              <Text fw={500}>
                {new Date(educationalInstitution.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          </Group>
        )}

        {educationalInstitution.updated_at && (
          <Group gap="sm">
            <IconCalendar size={16} />
            <div>
              <Text size="sm" c="dimmed">
                Updated At
              </Text>
              <Text fw={500}>
                {new Date(educationalInstitution.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          </Group>
        )}

        <Group gap="sm">
          <IconCircle size={16} />
          <div>
            <Text size="sm" c="dimmed">
              ID
            </Text>
            <Text fw={500} size="sm" style={{ fontFamily: 'monospace' }}>
              {educationalInstitution.id}
            </Text>
          </div>
        </Group>
      </Stack>
    </Modal>
  );
}
