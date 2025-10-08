import { Alert, Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconTrash } from '@tabler/icons-react';

import type { ApplicantDataType } from '@/types/applicantData.type';

interface ApplicationDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  application: ApplicantDataType | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function ApplicationDeleteModal({
  opened,
  onClose,
  application,
  onConfirm,
  loading = false,
}: ApplicationDeleteModalProps) {
  if (!application) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      await onConfirm();
      notifications.show({
        title: 'Success',
        message: 'Application deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete application',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Application"
      size="md"
      radius="md"
      centered>
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="red" variant="light">
          This action cannot be undone. The application will be permanently deleted from the system.
        </Alert>

        <div>
          <Title order={4} mb="xs">
            Application Information
          </Title>
          <Text size="sm" c="dimmed">
            Name: <strong>{application.nama_lengkap}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Email: <strong>{application.email}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            NIK: <strong>{application.nik}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Program: <strong>{application.program_terpilih}</strong>
          </Text>
          {application.batch && (
            <Text size="sm" c="dimmed">
              Batch:{' '}
              <strong>
                {application.batch.number} - {application.batch.location} ({application.batch.year})
              </strong>
            </Text>
          )}
        </div>

        <Text size="sm" c="dimmed">
          Are you sure you want to delete this application? This action will remove all associated
          data.
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
            Delete Application
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
