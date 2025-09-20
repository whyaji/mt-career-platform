import { Alert, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconTrash } from '@tabler/icons-react';

import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

interface EducationalInstitutionDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  educationalInstitution: EducationalInstitutionType | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function EducationalInstitutionDeleteModal({
  opened,
  onClose,
  educationalInstitution,
  onConfirm,
  loading = false,
}: EducationalInstitutionDeleteModalProps) {
  if (!educationalInstitution) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      await onConfirm();
      notifications.show({
        title: 'Success',
        message: 'Educational institution deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete educational institution',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Educational Institution"
      size="md"
      radius="md"
      centered>
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="red" variant="light">
          This action cannot be undone. The educational institution will be permanently deleted from
          the system.
        </Alert>

        <div>
          <Title order={4} mb="xs">
            Institution Information
          </Title>
          <Text size="sm" c="dimmed">
            Name: <strong>{educationalInstitution.name}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Status: <strong>{educationalInstitution.status === 1 ? 'Active' : 'Inactive'}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            ID: <strong style={{ fontFamily: 'monospace' }}>{educationalInstitution.id}</strong>
          </Text>
        </div>

        <Text size="sm" c="dimmed">
          Are you sure you want to delete this educational institution? This action will remove all
          associated data.
        </Text>

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleConfirm}
            loading={loading}>
            Delete Institution
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
