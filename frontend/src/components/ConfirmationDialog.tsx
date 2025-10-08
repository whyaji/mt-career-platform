import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ConfirmationDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  opened,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  loading = false,
  icon,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      radius="md"
      onClose={onClose}
      title={title}
      centered
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}>
      <Stack gap="md">
        {/* Icon and Message */}
        <Group gap="md" align="flex-start">
          {icon || (
            <IconAlertTriangle
              size={24}
              color="var(--mantine-color-yellow-6)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
          )}
          <Text size="sm" style={{ flex: 1 }}>
            {message}
          </Text>
        </Group>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
