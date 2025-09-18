import './DefaultTable.css';

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  Transition,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTableOff,
  IconX,
} from '@tabler/icons-react';
import React from 'react';

import type { AppliedFilter, PaginationMeta } from '@/types/pagination.type';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  column: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'multiselect';
  options?: { value: string; label: string }[];
  conditions?: { value: string; label: string }[];
}

export interface DefaultTableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  pagination?: PaginationMeta;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (column: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterOptions?: FilterOption[];
  appliedFilters?: AppliedFilter[];
  onFilterAdd?: (filter: AppliedFilter) => void;
  onFilterRemove?: (index: number) => void;
  onFilterClear?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  title?: string;
  description?: string;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  minTableWidth?: string;
  stickyHeader?: boolean;
  responsive?: boolean;
}

export function DefaultTable<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  error,
  pagination,
  searchValue = '',
  onSearchChange,
  onPageChange,
  onSortChange,
  sortBy,
  sortOrder = 'asc',
  filterOptions = [],
  appliedFilters = [],
  onFilterAdd,
  onFilterRemove,
  onFilterClear,
  onRefresh,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found',
  className,
  title,
  description,
  showTotal = true,
  pageSizeOptions = [10, 15, 25, 50, 100],
  onPageSizeChange,
  minTableWidth = '800px',
  stickyHeader = true,
  responsive = true,
}: DefaultTableProps<T>) {
  const [filterModalOpened, setFilterModalOpened] = React.useState(false);
  const [newFilter, setNewFilter] = React.useState<Partial<AppliedFilter>>({
    column: '',
    value: '',
    condition: 'eq',
  });
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setTimeout(() => {
      setShowScrollIndicator(false);
    }, 4000);
  }, [showScrollIndicator]);

  const handleSort = (column: string) => {
    if (!onSortChange) {
      return;
    }
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newOrder);
  };

  const handleFilterAdd = () => {
    if (newFilter.column && newFilter.value && newFilter.condition && onFilterAdd) {
      onFilterAdd(newFilter as AppliedFilter);
      setNewFilter({ column: '', value: '', condition: 'eq' });
      setFilterModalOpened(false);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <IconSortAscending size={14} opacity={0.3} />;
    }
    return sortOrder === 'asc' ? (
      <IconSortAscending size={14} color="var(--mantine-color-blue-6)" />
    ) : (
      <IconSortDescending size={14} color="var(--mantine-color-blue-6)" />
    );
  };

  const getPaginationInfo = () => {
    if (!pagination) {
      return null;
    }

    const start = (pagination.current_page - 1) * pagination.per_page + 1;
    const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

    return `Showing ${start}-${end} of ${pagination.total} entries`;
  };

  // Check if table content overflows horizontally
  React.useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [data, columns]);

  const getConditionOptions = (column: string) => {
    const option = filterOptions.find((opt) => opt.column === column);
    return (
      option?.conditions || [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'like', label: 'Contains' },
        { value: 'not_like', label: 'Does not contain' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
        { value: 'null', label: 'Is null' },
        { value: 'not_null', label: 'Is not null' },
        { value: 'between', label: 'Between' },
        { value: 'not_between', label: 'Not between' },
      ]
    );
  };

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Alert
          color="red"
          title="Error Loading Data"
          icon={<IconTableOff size={20} />}
          variant="light">
          {error}
        </Alert>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={className}>
      {/* Header Section */}
      {(title || description) && (
        <Box mb="md">
          {title && (
            <Text size="xl" fw={600} mb={description ? 4 : 0}>
              {title}
            </Text>
          )}
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
      )}
      {/* Search and Filter Bar */}
      <Paper p="md" withBorder radius="md" mb="md" bg="gray.0">
        <Group justify="space-between" wrap="wrap">
          <Group wrap="wrap">
            {onSearchChange && (
              <TextInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ minWidth: 300 }}
                size="sm"
                radius="md"
              />
            )}
            {filterOptions.length > 0 && onFilterAdd && (
              <Button
                leftSection={<IconFilter size={16} />}
                variant="light"
                size="sm"
                radius="md"
                onClick={() => setFilterModalOpened(true)}>
                Add Filter
              </Button>
            )}
            {onRefresh && (
              <Tooltip label="Refresh data">
                <ActionIcon
                  variant="light"
                  size="sm"
                  radius="md"
                  onClick={onRefresh}
                  loading={loading}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          {appliedFilters.length > 0 && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {appliedFilters.length} filter{appliedFilters.length !== 1 ? 's' : ''} applied
              </Text>
              {onFilterClear && (
                <Button variant="subtle" size="xs" radius="md" onClick={onFilterClear} color="red">
                  Clear All
                </Button>
              )}
            </Group>
          )}
        </Group>

        {/* Applied Filters */}
        <Transition mounted={appliedFilters.length > 0} transition="slide-down" duration={200}>
          {(styles) => (
            <Group mt="md" gap="xs" style={styles}>
              {appliedFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="light"
                  color="blue"
                  rightSection={
                    onFilterRemove ? (
                      <ActionIcon
                        size="xs"
                        variant="transparent"
                        color="blue"
                        onClick={() => onFilterRemove(index)}>
                        <IconX size={10} />
                      </ActionIcon>
                    ) : null
                  }
                  radius="md">
                  {filter.column}: {filter.value} ({filter.condition})
                </Badge>
              ))}
            </Group>
          )}
        </Transition>
      </Paper>

      {/* Table Container */}
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Box
          ref={scrollContainerRef}
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--mantine-color-gray-4) var(--mantine-color-gray-1)',
          }}
          className={responsive ? 'responsive-table-container' : ''}>
          {/* Scroll Indicator for Mobile */}
          {responsive && showScrollIndicator && (
            <Box
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '12px',
                background: 'var(--mantine-color-blue-6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 500,
                pointerEvents: 'none',
                opacity: 0.9,
                zIndex: 20,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}>
              ← Scroll to see more →
            </Box>
          )}
          <Table
            striped
            highlightOnHover
            style={{
              minWidth: minTableWidth,
              width: '100%',
              tableLayout: 'fixed',
            }}>
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    style={{
                      width: column.width,
                      minWidth: column.width,
                      cursor: column.sortable ? 'pointer' : 'default',
                      textAlign: column.align || 'left',
                      position: stickyHeader ? 'sticky' : 'relative',
                      top: stickyHeader ? 0 : 'auto',
                      backgroundColor: stickyHeader ? 'var(--mantine-color-white)' : 'transparent',
                      zIndex: stickyHeader ? 10 : 'auto',
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onClick={() => column.sortable && handleSort(column.dataIndex)}>
                    <Group
                      gap="xs"
                      justify={
                        column.align === 'center'
                          ? 'center'
                          : column.align === 'right'
                            ? 'flex-end'
                            : 'flex-start'
                      }
                      style={{ minWidth: 0 }}>
                      <Text
                        fw={600}
                        size="sm"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                        {column.title}
                      </Text>
                      {column.sortable && (
                        <Box style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          {getSortIcon(column.dataIndex)}
                        </Box>
                      )}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={columns.length}
                    style={{ textAlign: 'center', padding: '3rem' }}>
                    <Flex justify="center" align="center" gap="md" direction="column">
                      <Loader size="md" />
                      <Text c="dimmed" size="sm">
                        Loading data...
                      </Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : data.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={columns.length}
                    style={{ textAlign: 'center', padding: '3rem' }}>
                    <Flex justify="center" align="center" gap="md" direction="column">
                      <IconTableOff size={48} opacity={0.3} />
                      <Text c="dimmed" size="sm">
                        {emptyMessage}
                      </Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : (
                data.map((record, index) => (
                  <Table.Tr key={index}>
                    {columns.map((column) => (
                      <Table.Td
                        key={column.key}
                        style={{
                          textAlign: column.align || 'left',
                          width: column.width,
                          minWidth: column.width,
                          maxWidth: column.width,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          padding: '0.75rem 0.5rem',
                        }}>
                        <Box
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {column.render
                            ? column.render(
                                (record as Record<string, unknown>)[column.dataIndex],
                                record,
                                index
                              )
                            : String((record as Record<string, unknown>)[column.dataIndex] || '')}
                        </Box>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Enhanced Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Paper p="md" withBorder radius="md" mt="md">
          <Group justify="space-between" wrap="wrap">
            <Group gap="md">
              {showTotal && (
                <Text size="sm" c="dimmed">
                  {getPaginationInfo()}
                </Text>
              )}
              {onPageSizeChange && (
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Show:
                  </Text>
                  <Select
                    size="xs"
                    value={pagination.per_page.toString()}
                    onChange={(value) => onPageSizeChange(Number(value))}
                    data={pageSizeOptions.map((size) => ({
                      value: size.toString(),
                      label: `${size} per page`,
                    }))}
                    style={{ width: 120 }}
                  />
                </Group>
              )}
            </Group>

            <Group gap="xs">
              <Pagination
                value={pagination.current_page}
                onChange={onPageChange}
                total={pagination.total_pages}
                size="sm"
                radius="md"
                withEdges
                siblings={1}
                boundaries={1}
                nextIcon={IconChevronRight}
                previousIcon={IconChevronLeft}
                firstIcon={IconChevronsLeft}
                lastIcon={IconChevronsRight}
              />
            </Group>
          </Group>
        </Paper>
      )}

      {/* Enhanced Filter Modal */}
      <Modal
        opened={filterModalOpened}
        onClose={() => setFilterModalOpened(false)}
        title="Add Filter"
        size="md"
        radius="md"
        centered>
        <Stack gap="md">
          <Select
            label="Column"
            placeholder="Select column to filter"
            data={filterOptions.map((opt) => ({ value: opt.column, label: opt.label }))}
            value={newFilter.column}
            onChange={(value) => setNewFilter((prev) => ({ ...prev, column: value || '' }))}
            required
            radius="md"
            size="sm"
          />

          <Select
            label="Condition"
            placeholder="Select condition"
            data={getConditionOptions(newFilter.column || '')}
            value={newFilter.condition}
            onChange={(value) => setNewFilter((prev) => ({ ...prev, condition: value || 'eq' }))}
            required
            disabled={!newFilter.column}
            radius="md"
            size="sm"
          />

          <TextInput
            label="Value"
            placeholder="Enter filter value"
            value={newFilter.value}
            onChange={(e) => setNewFilter((prev) => ({ ...prev, value: e.target.value }))}
            required
            disabled={!newFilter.column || ['null', 'not_null'].includes(newFilter.condition || '')}
            radius="md"
            size="sm"
          />

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setFilterModalOpened(false)}
              radius="md"
              size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleFilterAdd}
              disabled={!newFilter.column || !newFilter.value || !newFilter.condition}
              radius="md"
              size="sm">
              Add Filter
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
