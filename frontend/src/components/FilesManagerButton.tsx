import { Button } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { useState } from 'react';

import { GlobalGeneratedFilesModal } from '@/feature/talenthub/components/modals/GlobalGeneratedFilesModal';

interface FilesManagerButtonProps {
  title?: string;
  defaultFilters?: {
    type?: string;
    model_id?: string;
  };
  defaultSearch?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
  color?: string;
  label?: string;
  inDrawer?: boolean;
}

export function FilesManagerButton({
  title = 'Generated Files',
  defaultFilters,
  defaultSearch = '',
  size = 'sm',
  variant = 'light',
  color = 'blue',
  label = 'Files Manager',
  inDrawer = false,
}: FilesManagerButtonProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        color={color}
        leftSection={<IconFileText size={16} />}
        onClick={() => setOpened(true)}
        size={size}>
        {label}
      </Button>

      <GlobalGeneratedFilesModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={title}
        defaultFilters={defaultFilters}
        defaultSearch={defaultSearch}
        zIndex={inDrawer ? 2000 : 200}
      />
    </>
  );
}
