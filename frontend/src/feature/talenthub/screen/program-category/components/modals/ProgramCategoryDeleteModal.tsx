import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import type { ProgramCategoryType } from '@/types/programCategory.type';

interface ProgramCategoryDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  programCategory: ProgramCategoryType | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function ProgramCategoryDeleteModal({
  opened,
  onClose,
  programCategory,
  onConfirm,
  loading = false,
}: ProgramCategoryDeleteModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Program Category" size="sm" centered>
      <Stack gap="md">
        <Group>
          <IconAlertTriangle size={24} color="red" />
          <Text fw={500}>Are you sure you want to delete this program category?</Text>
        </Group>

        {programCategory && (
          <Stack gap="xs" p="md" bg="red.0" style={{ borderRadius: '8px' }}>
            <Text size="sm" fw={500}>
              {programCategory.name}
            </Text>
            <Text size="xs" c="dimmed">
              Code: {programCategory.code}
            </Text>
          </Stack>
        )}

        <Text size="sm" c="dimmed">
          This action cannot be undone. This will permanently delete the program category and remove
          it from our servers.
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirm} loading={loading}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
