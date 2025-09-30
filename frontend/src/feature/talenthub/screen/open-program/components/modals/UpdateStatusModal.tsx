import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

import { useUpdateScreeningApplicantStatusMutation } from '@/hooks/query/screening-applicant/useScreeningApplicantMutations';
import {
  SCREENING_APPLICANT_STATUS,
  SCREENING_APPLICANT_STATUS_LABELS,
  type ScreeningApplicantType,
} from '@/types/screening-applicant.type';

interface UpdateStatusModalProps {
  opened: boolean;
  onClose: () => void;
  applicant: ScreeningApplicantType | null;
  onSuccess?: (updatedApplicant?: ScreeningApplicantType) => void;
}

export function UpdateStatusModal({
  opened,
  onClose,
  applicant,
  onSuccess,
}: UpdateStatusModalProps) {
  const updateStatusMutation = useUpdateScreeningApplicantStatusMutation();

  const form = useForm({
    initialValues: {
      status: String(applicant?.status ?? SCREENING_APPLICANT_STATUS.PENDING),
    },
    validate: {
      status: (value) => (value === null || value === undefined ? 'Status is required' : null),
    },
  });

  // Update form values when applicant changes
  useEffect(() => {
    if (applicant && opened) {
      form.setValues({
        status: String(applicant.status),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant, opened]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleSubmit = (values: { status: string }) => {
    if (!applicant) {
      return;
    }

    if (isNaN(Number(values.status))) {
      notifications.show({
        title: 'Error',
        message: 'Status must be a number',
        color: 'red',
      });
      return;
    }

    updateStatusMutation.mutate(
      { id: applicant.id, status: Number(values.status) },
      {
        onSuccess: (data) => {
          notifications.show({
            title: 'Success',
            message: 'Status updated successfully',
            color: 'green',
          });
          // Pass the updated applicant data to the success callback
          if (data?.success && 'data' in data) {
            onSuccess?.(data.data);
          } else {
            onSuccess?.();
          }
          onClose();
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to update status',
            color: 'red',
          });
        },
      }
    );
  };

  const statusOptions = Object.entries(SCREENING_APPLICANT_STATUS_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Update Status"
      size="sm"
      centered
      zIndex={10050}
      styles={{
        content: {
          position: 'relative',
          zIndex: 10050,
        },
      }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {applicant && (
            <Text size="sm" c="dimmed">
              Updating status for applicant ID: {applicant.id.slice(-8)}
            </Text>
          )}

          <Select
            label="Status"
            placeholder="Select status"
            data={statusOptions}
            {...form.getInputProps('status')}
            disabled={updateStatusMutation.isPending}
            comboboxProps={{
              zIndex: 10060,
              withinPortal: true,
            }}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose} disabled={updateStatusMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateStatusMutation.isPending}
              disabled={updateStatusMutation.isPending}>
              Update Status
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
