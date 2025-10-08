import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  em,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconChartBar,
  IconCheck,
  IconClock,
  IconDownload,
  IconFileText,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { DefaultTable, type TableColumn } from '@/components/DefaultTable';
import { FileStatusBadge } from '@/components/FileStatusBadge';
import {
  type GeneratedFilesListParams,
  type GlobalGeneratedFile,
  useGlobalGeneratedFilesDeleteMutation,
  useGlobalGeneratedFilesDownloadMutation,
  useGlobalGeneratedFilesQuery,
  useGlobalGeneratedFilesStatsQuery,
} from '@/hooks/query/generated-files/useGlobalGeneratedFilesQuery';
import { formatDefaultDate } from '@/utils/dateTimeFormatter';

interface GlobalGeneratedFilesModalProps {
  opened: boolean;
  onClose: () => void;
  batchId?: string;
  title?: string;
  defaultFilters?: GeneratedFilesListParams['filters'];
  defaultSearch?: string;
}

export function GlobalGeneratedFilesModal({
  opened,
  onClose,
  batchId,
  title = 'Generated Files Manager',
  defaultFilters = {},
  defaultSearch = '',
}: GlobalGeneratedFilesModalProps) {
  const isFullWidthModal = useMediaQuery(`(max-width: ${em(1800)})`);
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filters, setFilters] = useState<GeneratedFilesListParams['filters']>({});
  const [pagination, setPagination] = useState({ page: 1, per_page: 5 });
  const [sort] = useState({ field: 'created_at', direction: 'desc' as const });
  const [showStats, setShowStats] = useState(false);

  // Initialize filters with defaultFilters
  useEffect(() => {
    if (defaultFilters && Object.keys(defaultFilters).length > 0) {
      setFilters(defaultFilters);
    } else if (batchId) {
      setFilters((prev) => ({ ...prev, model_id: batchId }));
    }
  }, [batchId, defaultFilters]);

  // Queries and mutations
  const {
    data: filesData,
    refetch,
    isLoading,
  } = useGlobalGeneratedFilesQuery(
    {
      filters: {
        ...filters,
        ...(searchQuery && { search: searchQuery }),
      },
      pagination,
      sort,
    },
    opened
  );

  const { data: statsData, refetch: refetchStats } = useGlobalGeneratedFilesStatsQuery(
    filters,
    opened
  );

  // Auto-refresh when modal opens or filters change
  useEffect(() => {
    if (opened) {
      refetch();
      refetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const downloadMutation = useGlobalGeneratedFilesDownloadMutation();
  const deleteMutation = useGlobalGeneratedFilesDeleteMutation();

  // Handle file selection
  const handleFileSelect = (fileId: string, checked: boolean) => {
    setSelectedFiles((prev) => (checked ? [...prev, fileId] : prev.filter((id) => id !== fileId)));
  };

  // Remove unused handleSelectAll function

  // Handle download
  const handleDownload = async (fileIds: string[]) => {
    try {
      await downloadMutation.mutateAsync(fileIds);
      notifications.show({
        title: 'Download Started',
        message:
          fileIds.length === 1 ? 'File download started' : 'Files are being packaged for download',
        color: 'blue',
        icon: <IconDownload size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Download Failed',
        message: 'Failed to download files. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  // Handle delete
  const handleDelete = async (fileIds: string[]) => {
    try {
      const result = await deleteMutation.mutateAsync(fileIds);
      notifications.show({
        title: 'Files Deleted',
        message: `Successfully deleted ${result.data.deleted_count} files`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setSelectedFiles([]);
      refetch();
      refetchStats();
    } catch (error) {
      notifications.show({
        title: 'Delete Failed',
        message: 'Failed to delete files. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery(defaultSearch);
  };

  // Table columns
  const columns: TableColumn<GlobalGeneratedFile>[] = [
    {
      key: 'select',
      title: '',
      dataIndex: 'id',
      width: '40px',
      render: (_, record) => (
        <Checkbox
          checked={selectedFiles.includes(record.id)}
          onChange={(e) => handleFileSelect(record.id, e.currentTarget.checked)}
        />
      ),
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      width: '200px',
      render: (value) => (
        <Badge variant="light" color="blue" size="sm">
          {String(value)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: 'ext',
      title: 'Extension',
      dataIndex: 'ext',
      width: '100px',
      render: (value) => (
        <Badge variant="light" color="blue" size="sm">
          {String(value).toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'is_ready',
      width: '120px',
      render: (isReady, record) => (
        <FileStatusBadge
          isReady={isReady as boolean}
          fileSize={record.file_size}
          ext={record.ext}
          compact
        />
      ),
    },
    {
      key: 'model_info',
      title: 'Model',
      dataIndex: 'model_type',
      width: '150px',
      render: (_, record) => (
        <Stack gap={2}>
          <Badge variant="outline" size="xs">
            {record.model_type}
          </Badge>
          <Text size="xs" c="dimmed" truncate>
            {record.model_id?.slice(-8)}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'created_at',
      title: 'Created',
      dataIndex: 'created_at',
      width: '140px',
      render: (value) => <Text size="sm">{formatDefaultDate(value as string)}</Text>,
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <Group gap="xs" justify="center">
          <Tooltip label="Download">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="blue"
              onClick={() => handleDownload([record.id])}
              disabled={!record.is_ready || downloadMutation.isPending}>
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="red"
              onClick={() => handleDelete([record.id])}
              disabled={deleteMutation.isPending}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  // Statistics card
  const StatsCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Paper p="md" radius="md" withBorder>
      <Group gap="md">
        <ActionIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ActionIcon>
        <Box>
          <Text size="xs" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="lg" fw={700} c={color}>
            {value}
          </Text>
        </Box>
      </Group>
    </Paper>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="md">
          <IconFileText size={24} />
          <Box>
            <Title order={4}>{title}</Title>
            {batchId && (
              <Text size="sm" c="dimmed">
                Batch: {batchId}
              </Text>
            )}
          </Box>
        </Group>
      }
      radius="md"
      centered
      size={isFullWidthModal ? '100%' : '80%'}
      styles={{
        header: { paddingBottom: '1rem' },
        body: { paddingTop: 0 },
      }}>
      <Stack gap="md">
        {/* Statistics Toggle */}
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconChartBar size={16} />}
            onClick={() => setShowStats(!showStats)}
            size="sm">
            {showStats ? 'Hide' : 'Show'} Statistics
          </Button>

          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                refetch();
                refetchStats();
              }}
              loading={isLoading}
              size="sm">
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Statistics Panel */}
        {showStats && statsData && (
          <Paper p="md" radius="md" withBorder bg="gray.0">
            <Stack gap="md">
              <Text fw={600} size="sm">
                File Statistics
              </Text>
              <Grid>
                <Grid.Col span={3}>
                  <StatsCard
                    title="Total Files"
                    value={statsData.data.total_files}
                    icon={<IconFileText size={20} />}
                    color="blue"
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <StatsCard
                    title="Ready Files"
                    value={statsData.data.ready_files}
                    icon={<IconCheck size={20} />}
                    color="green"
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <StatsCard
                    title="Processing"
                    value={statsData.data.pending_files}
                    icon={<IconClock size={20} />}
                    color="orange"
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <StatsCard
                    title="Total Size"
                    value={statsData.data.total_size_formatted}
                    icon={<IconDownload size={20} />}
                    color="violet"
                  />
                </Grid.Col>
              </Grid>

              {/* Recent Activity */}
              <Divider />
              <Grid>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    Created Today
                  </Text>
                  <Text fw={600}>{statsData.data.created_today}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    This Week
                  </Text>
                  <Text fw={600}>{statsData.data.created_this_week}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Text size="xs" c="dimmed">
                    This Month
                  </Text>
                  <Text fw={600}>{statsData.data.created_this_month}</Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        )}

        {/* Search and Filters */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="md" align="flex-end">
              <TextInput
                placeholder="Search by type (e.g., screening-applicants-by-batch) or batch ID..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
                size="sm"
              />

              <Select
                placeholder="File Type"
                data={[
                  { value: 'screening-applicants-by-batch', label: 'Screening Applicants' },
                  { value: 'applications', label: 'Applications' },
                  { value: 'applications-by-batch', label: 'Applications by Batch' },
                ]}
                value={filters?.type || ''}
                onChange={(value) => setFilters((prev) => ({ ...prev, type: value || undefined }))}
                clearable
                size="sm"
                style={{ width: 200 }}
              />

              <Select
                placeholder="Extension"
                data={[
                  { value: 'xlsx', label: 'Excel (.xlsx)' },
                  { value: 'pdf', label: 'PDF (.pdf)' },
                  { value: 'csv', label: 'CSV (.csv)' },
                ]}
                value={filters?.ext || ''}
                onChange={(value) => setFilters((prev) => ({ ...prev, ext: value || undefined }))}
                clearable
                size="sm"
                style={{ width: 150 }}
              />

              <Select
                placeholder="Status"
                data={[
                  { value: 'true', label: 'Ready' },
                  { value: 'false', label: 'Processing' },
                ]}
                value={filters?.is_ready?.toString() || ''}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_ready: value ? value === 'true' : undefined,
                  }))
                }
                clearable
                size="sm"
                style={{ width: 120 }}
              />
            </Group>

            <Group gap="md" align="flex-end">
              <DatePickerInput
                placeholder="From Date"
                value={filters?.date_from ? new Date(filters.date_from) : null}
                onChange={(date: string | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_from: date || undefined,
                  }))
                }
                clearable
                size="sm"
                style={{ width: 150 }}
              />

              <DatePickerInput
                placeholder="To Date"
                value={filters?.date_to ? new Date(filters.date_to) : null}
                onChange={(date: string | null) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_to: date || undefined,
                  }))
                }
                clearable
                size="sm"
                style={{ width: 150 }}
              />

              <Button
                variant="subtle"
                color="red"
                leftSection={<IconX size={16} />}
                onClick={clearFilters}
                size="sm">
                Reset Filters
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <Paper p="md" radius="md" withBorder bg="blue.0">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </Text>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleDownload(selectedFiles)}
                  disabled={downloadMutation.isPending}
                  size="sm">
                  Download Selected
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => handleDelete(selectedFiles)}
                  disabled={deleteMutation.isPending}
                  size="sm">
                  Delete Selected
                </Button>
              </Group>
            </Group>
          </Paper>
        )}

        {/* Loading States */}
        {(downloadMutation.isPending || deleteMutation.isPending) && (
          <Alert icon={<Loader size={16} />} color="blue" variant="light">
            {downloadMutation.isPending && 'Downloading files...'}
            {deleteMutation.isPending && 'Deleting files...'}
          </Alert>
        )}

        {/* Files Table */}
        <Paper radius="md" withBorder style={{ minHeight: 500 }}>
          <Flex justify="center" align="center" h={500}>
            {isLoading ? (
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Loading generated files...</Text>
              </Stack>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <DefaultTable
                  withoutFilterHeader
                  columns={columns}
                  data={filesData?.data || []}
                  pagination={
                    filesData?.pagination
                      ? {
                          current_page: filesData.pagination.current_page,
                          per_page: filesData.pagination.per_page,
                          total: filesData.pagination.total,
                          total_pages: filesData.pagination.last_page,
                          has_next_page: filesData.pagination.has_more_pages,
                          has_prev_page: filesData.pagination.current_page > 1,
                          next_page: filesData.pagination.has_more_pages
                            ? filesData.pagination.current_page + 1
                            : null,
                          prev_page:
                            filesData.pagination.current_page > 1
                              ? filesData.pagination.current_page - 1
                              : null,
                        }
                      : undefined
                  }
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  onPageSizeChange={(size) =>
                    setPagination((prev) => ({ ...prev, per_page: size, page: 1 }))
                  }
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  emptyMessage="No generated files found"
                  showTotal
                  minTableWidth="800px"
                />
              </div>
            )}
          </Flex>
        </Paper>
      </Stack>
    </Modal>
  );
}
