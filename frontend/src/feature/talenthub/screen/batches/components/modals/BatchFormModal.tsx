import {
  Button,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';

import type { BatchType } from '@/types/batch.type';

interface BatchFormModalProps {
  opened: boolean;
  onClose: () => void;
  batch?: BatchType | null;
  onSubmit: (data: Omit<BatchType, 'id'>) => Promise<void>;
  loading?: boolean;
  title: string;
}

export function BatchFormModal({
  opened,
  onClose,
  batch,
  onSubmit,
  loading = false,
  title,
}: BatchFormModalProps) {
  const form = useForm<Omit<BatchType, 'id' | 'status'> & { status: string }>({
    initialValues: {
      number: 0,
      number_code: '',
      location: '',
      location_code: '',
      year: new Date().getFullYear(),
      status: '1',
      institutes: [],
    },
    validate: {
      number: (value) => (value <= 0 ? 'Batch number must be greater than 0' : null),
      number_code: (value) => (!value ? 'Batch code is required' : null),
      location: (value) => (!value ? 'Location is required' : null),
      location_code: (value) => (!value ? 'Location code is required' : null),
      year: (value) => {
        const currentYear = new Date().getFullYear();
        if (value < 2000 || value > currentYear + 10) {
          return `Year must be between 2000 and ${currentYear + 10}`;
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (batch) {
      form.setValues({
        number: batch.number,
        number_code: batch.number_code,
        location: batch.location,
        location_code: batch.location_code,
        year: batch.year,
        status: batch.status.toString(),
        institutes: batch.institutes || [],
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch, opened]);

  const handleSubmit = async (values: Omit<BatchType, 'id' | 'status'> & { status: string }) => {
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
        message: batch ? 'Batch updated successfully' : 'Batch created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: batch ? 'Failed to update batch' : 'Failed to create batch',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md" radius="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label="Batch Number"
            placeholder="Enter batch number"
            required
            min={1}
            {...form.getInputProps('number')}
          />

          <TextInput
            label="Batch Code"
            placeholder="Enter batch code"
            required
            maxLength={10}
            {...form.getInputProps('number_code')}
          />

          <TextInput
            label="Location"
            placeholder="Enter location"
            required
            {...form.getInputProps('location')}
          />

          <TextInput
            label="Location Code"
            placeholder="Enter location code"
            required
            maxLength={10}
            {...form.getInputProps('location_code')}
          />

          <NumberInput
            label="Year"
            placeholder="Enter year"
            required
            min={2000}
            max={new Date().getFullYear() + 10}
            {...form.getInputProps('year')}
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

          <MultiSelect
            label="Institutes"
            placeholder="Select institutes"
            data={['MTI', 'SSMS', 'MTSS', 'MTCC', 'MTCS', 'MTBS', 'MTCB', 'MTIS']}
            searchable
            clearable
            {...form.getInputProps('institutes')}
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!form.isValid()}>
              {batch ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
