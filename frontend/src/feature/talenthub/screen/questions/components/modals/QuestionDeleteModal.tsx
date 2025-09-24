import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';

import type { QuestionType } from '@/types/question.type';

interface QuestionDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  question: QuestionType | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function QuestionDeleteModal({
  opened,
  onClose,
  question,
  onConfirm,
  loading = false,
}: QuestionDeleteModalProps) {
  if (!question) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Question" centered>
      <Stack gap="md">
        <Group gap="xs">
          <IconAlertTriangle size={20} color="red" />
          <Text size="sm">
            Are you sure you want to delete this question? This action cannot be undone.
          </Text>
        </Group>

        <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <Text size="sm" fw={500}>
            Question Details:
          </Text>
          <Text size="sm">
            Code: <strong>{question.code}</strong>
          </Text>
          <Text size="sm">
            Label: <strong>{question.label}</strong>
          </Text>
          <Text size="sm">
            Type: <strong>{question.type}</strong>
          </Text>
        </div>

        <Text size="xs" c="dimmed">
          Note: If this question is being used in any batches, you will not be able to delete it.
        </Text>

        <Group justify="flex-end" gap="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              try {
                await onConfirm();
                notifications.show({
                  title: 'Success',
                  message: 'Question deleted successfully',
                  color: 'green',
                });
                onClose();
              } catch (error) {
                notifications.show({
                  title: 'Error',
                  message: 'Failed to delete question',
                  color: 'red',
                });
              }
            }}
            loading={loading}>
            Delete Question
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
