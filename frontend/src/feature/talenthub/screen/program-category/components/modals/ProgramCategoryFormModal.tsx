import { Button, Group, Modal, Stack, Switch, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

import type { ProgramCategoryType } from '@/types/programCategory.type';

interface ProgramCategoryFormModalProps {
  opened: boolean;
  onClose: () => void;
  programCategory: ProgramCategoryType | null;
  onSubmit: (
    data: Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export function ProgramCategoryFormModal({
  opened,
  onClose,
  programCategory,
  onSubmit,
  loading = false,
  title = 'Program Category',
}: ProgramCategoryFormModalProps) {
  const form = useForm({
    initialValues: {
      code: '',
      name: '',
      description: '',
      status: 1,
    },
    validate: {
      code: (value) => (!value ? 'Code is required' : null),
      name: (value) => (!value ? 'Name is required' : null),
    },
  });

  useEffect(() => {
    if (programCategory) {
      form.setValues({
        code: programCategory.code,
        name: programCategory.name,
        description: programCategory.description || '',
        status: programCategory.status,
      });
    } else {
      form.reset();
    }
  }, [programCategory, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
      notifications.show({
        title: 'Success',
        message: `Program category ${programCategory ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save program category',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Code"
            placeholder="Enter program category code"
            required
            {...form.getInputProps('code')}
          />

          <TextInput
            label="Name"
            placeholder="Enter program category name"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Enter program category description"
            minRows={3}
            {...form.getInputProps('description')}
          />

          <Switch
            label="Active"
            description="Enable or disable this program category"
            checked={form.values.status === 1}
            onChange={(event) => form.setFieldValue('status', event.currentTarget.checked ? 1 : 0)}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {programCategory ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
