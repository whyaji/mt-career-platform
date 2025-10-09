import { Button } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useState } from 'react';

import { ConfirmationDialog } from './ConfirmationDialog';

interface RescreenAllButtonProps {
  onRescreen: () => void;
  loading?: boolean;
  disabled?: boolean;
  batchNumber?: string;
  batchLocation?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
  color?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  inDrawer?: boolean;
}

export function RescreenAllButton({
  onRescreen,
  loading = false,
  disabled = false,
  batchNumber,
  batchLocation,
  size = 'sm',
  variant = 'light',
  color = 'orange',
  confirmTitle,
  confirmMessage,
  inDrawer = false,
}: RescreenAllButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = () => {
    onRescreen();
    // Note: Dialog will stay open during loading state
    // Parent component should handle closing on success/error if needed
  };

  // Generate default confirmation message based on batch info
  const defaultMessage =
    batchNumber && batchLocation
      ? `Are you sure you want to rescreen all applicants in batch ${batchNumber} (${batchLocation})? This action will trigger the screening process for all applicants in this batch and may take some time to complete.`
      : 'Are you sure you want to rescreen all applicants? This action will trigger the screening process for all applicants and may take some time to complete.';

  return (
    <>
      <Button
        variant={variant}
        color={color}
        leftSection={<IconReload size={16} />}
        onClick={() => setShowDialog(true)}
        loading={loading}
        disabled={disabled || loading}
        size={size}>
        Rescreen All
      </Button>

      <ConfirmationDialog
        opened={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
        title={confirmTitle || 'Rescreen All Applicants'}
        message={confirmMessage || defaultMessage}
        confirmLabel="Yes, Rescreen All"
        cancelLabel="Cancel"
        confirmColor={color}
        loading={loading}
        zIndex={inDrawer ? 2000 : 200}
      />
    </>
  );
}
