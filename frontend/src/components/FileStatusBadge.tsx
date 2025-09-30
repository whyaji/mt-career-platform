import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';

interface FileStatusBadgeProps {
  isReady: boolean;
  fileSize?: number;
  ext?: string;
  compact?: boolean;
}

export function FileStatusBadge({ isReady, fileSize, ext, compact = false }: FileStatusBadgeProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (extension: string) => {
    switch (extension?.toLowerCase()) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'zip':
        return '📦';
      default:
        return '📄';
    }
  };

  if (compact) {
    return (
      <Badge
        variant={isReady ? 'light' : 'outline'}
        color={isReady ? 'green' : 'orange'}
        size="sm"
        leftSection={isReady ? <IconCheck size={12} /> : <IconClock size={12} />}>
        {isReady ? 'Ready' : 'Processing'}
      </Badge>
    );
  }

  return (
    <Group gap="xs" align="center">
      <Badge
        variant={isReady ? 'light' : 'outline'}
        color={isReady ? 'green' : 'orange'}
        size="sm"
        leftSection={isReady ? <IconCheck size={12} /> : <IconClock size={12} />}>
        {isReady ? 'Ready' : 'Processing'}
      </Badge>

      {ext && (
        <Tooltip label={`${ext.toUpperCase()} file`}>
          <Group gap={4} align="center">
            <Text size="xs" c="dimmed">
              {getFileIcon(ext)}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {ext.toUpperCase()}
            </Text>
          </Group>
        </Tooltip>
      )}

      {fileSize && isReady && (
        <Tooltip label="File size">
          <Text size="xs" c="dimmed">
            {formatFileSize(fileSize)}
          </Text>
        </Tooltip>
      )}
    </Group>
  );
}
