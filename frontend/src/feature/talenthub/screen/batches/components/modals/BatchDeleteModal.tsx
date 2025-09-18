import { Alert, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconTrash } from '@tabler/icons-react';

import type { BatchType } from '@/types/batch.type';

interface BatchDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  batch: BatchType | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function BatchDeleteModal({
  opened,
  onClose,
  batch,
  onConfirm,
  loading = false,
}: BatchDeleteModalProps) {
  if (!batch) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      await onConfirm();
      notifications.show({
        title: 'Success',
        message: 'Batch deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete batch',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Batch" size="md" radius="md" centered>
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="red" variant="light">
          This action cannot be undone. The batch will be permanently deleted from the system.
        </Alert>

        <div>
          <Title order={4} mb="xs">
            Batch Information
          </Title>
          <Text size="sm" c="dimmed">
            Batch Number: <strong>{batch.number}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Batch Code: <strong>{batch.number_code}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Location: <strong>{batch.location}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Year: <strong>{batch.year}</strong>
          </Text>
        </div>

        <Text size="sm" c="dimmed">
          Are you sure you want to delete this batch? This action will remove all associated data.
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
            Delete Batch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
