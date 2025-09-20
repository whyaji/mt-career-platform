import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';

import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

interface EducationalInstitutionFormModalProps {
  opened: boolean;
  onClose: () => void;
  educationalInstitution?: EducationalInstitutionType | null;
  onSubmit: (
    data: Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => Promise<void>;
  loading?: boolean;
  title: string;
}

export function EducationalInstitutionFormModal({
  opened,
  onClose,
  educationalInstitution,
  onSubmit,
  loading = false,
  title,
}: EducationalInstitutionFormModalProps) {
  const form = useForm<
    Omit<
      EducationalInstitutionType,
      'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'
    > & { status: string }
  >({
    initialValues: {
      name: '',
      status: '1',
    },
    validate: {
      name: (value) => (!value ? 'Institution name is required' : null),
    },
  });

  useEffect(() => {
    if (educationalInstitution) {
      form.setValues({
        name: educationalInstitution.name,
        status: educationalInstitution.status.toString(),
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educationalInstitution, opened]);

  const handleSubmit = async (
    values: Omit<
      EducationalInstitutionType,
      'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'
    > & { status: string }
  ) => {
    try {
      const { status, ...rest } = values;
      if (isNaN(Number(status))) {
        notifications.show({
          title: 'Error',
          message: 'Status must be a number',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
        return;
      }
      await onSubmit({ ...rest, status: Number(status) });
      notifications.show({
        title: 'Success',
        message: educationalInstitution
          ? 'Educational institution updated successfully'
          : 'Educational institution created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: educationalInstitution
          ? 'Failed to update educational institution'
          : 'Failed to create educational institution',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md" radius="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Institution Name"
            placeholder="Enter institution name"
            required
            maxLength={128}
            {...form.getInputProps('name')}
          />

          <Select
            label="Status"
            placeholder="Select status"
            required
            data={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...form.getInputProps('status')}
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!form.isValid()}>
              {educationalInstitution ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
