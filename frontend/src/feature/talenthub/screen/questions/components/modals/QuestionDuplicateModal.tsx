import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import type { QuestionType } from '@/types/question.type';

interface QuestionDuplicateModalProps {
  opened: boolean;
  onClose: () => void;
  question: QuestionType | null;
  onConfirm: (newCode: string) => Promise<void>;
  loading?: boolean;
}

export function QuestionDuplicateModal({
  opened,
  onClose,
  question,
  onConfirm,
  loading = false,
}: QuestionDuplicateModalProps) {
  const form = useForm({
    initialValues: {
      newCode: '',
    },
    validate: {
      newCode: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Code is required';
        }
        if (value === question?.code) {
          return 'New code must be different from original';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onConfirm(values.newCode);
      notifications.show({
        title: 'Success',
        message: 'Question duplicated successfully',
        color: 'green',
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate question',
        color: 'red',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Duplicate Question" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm">
            Create a copy of this question with a new code. All settings and configurations will be
            copied.
          </Text>

          <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Text size="sm" fw={500}>
              Original Question:
            </Text>
            <Text size="sm">
              Code: <strong>{question?.code}</strong>
            </Text>
            <Text size="sm">
              Label: <strong>{question?.label}</strong>
            </Text>
            <Text size="sm">
              Type: <strong>{question?.type}</strong>
            </Text>
          </div>

          <TextInput
            label="New Code"
            placeholder="Enter new code for the duplicated question"
            description="This will be the unique identifier for the new question"
            required
            {...form.getInputProps('newCode')}
          />

          <Text size="xs" c="dimmed">
            The duplicated question will be created as inactive by default. You can activate it
            after reviewing the settings.
          </Text>

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Duplicate Question
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
