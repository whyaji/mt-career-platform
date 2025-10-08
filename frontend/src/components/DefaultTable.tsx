import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  em,
  Flex,
  Group,
  Loader,
  Menu,
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
import { useMediaQuery } from '@mantine/hooks';
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

export interface RowAction<T = Record<string, unknown>> {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: (record: T) => void;
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
  subActions?: RowAction<T>[];
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
  responsive?: boolean;
  headerActions?: React.ReactNode;
  rowActions?: RowAction<T>[];
  rowActionsTitle?: string;
  backButton?: React.ReactNode;
  withoutFilterHeader?: boolean;
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
  responsive = true,
  headerActions,
  rowActions = [],
  rowActionsTitle = 'none',
  backButton,
  withoutFilterHeader = false,
}: DefaultTableProps<T>) {
  const addPadding = useMediaQuery(`(max-width: ${em(480)})`);
  const [filterModalOpened, setFilterModalOpened] = React.useState(false);
  const [newFilter, setNewFilter] = React.useState<Partial<AppliedFilter>>({
    column: '',
    value: '',
    condition: 'eq',
  });
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);
  const [contextMenuOpened, setContextMenuOpened] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedRecord, setSelectedRecord] = React.useState<T | null>(null);
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

  const handleRowContextMenu = (event: React.MouseEvent, record: T) => {
    if (rowActions.length === 0) {
      return;
    }

    event.preventDefault();
    setSelectedRecord(record);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuOpened(true);
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
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
      className={className}>
      {/* Fixed Header Section */}
      {!withoutFilterHeader && (
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'white',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            padding: '1rem',
          }}>
          <Group justify="flex-start" align="center">
            {backButton && <Box>{backButton}</Box>}
            {(title || description || headerActions) && (
              <Box mb="md" style={{ flex: 1 }}>
                <Group justify="space-between" align="center" style={{ flex: 1 }}>
                  <Box style={{ flex: 1 }}>
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
                  {headerActions && <Box>{headerActions}</Box>}
                </Group>
              </Box>
            )}
          </Group>

          {/* Search and Filter Bar */}
          <Paper p="md" withBorder radius="md" bg="gray.0">
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
                    <Button
                      variant="subtle"
                      size="xs"
                      radius="md"
                      onClick={onFilterClear}
                      color="red">
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
        </Box>
      )}

      {/* Scrollable Table Container */}
      <Box
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // Important for flex child to shrink
          paddingRight: addPadding ? '1rem' : '0',
          paddingLeft: addPadding ? '1rem' : '0',
        }}>
        <Box
          ref={scrollContainerRef}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            flex: 1,
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--mantine-color-gray-4) var(--mantine-color-gray-1)',
            minHeight: 0, // Important for flex child to shrink
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
                      position: 'sticky',
                      top: 0,
                      backgroundColor: 'var(--mantine-color-white)',
                      zIndex: 10,
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
                        {column.title.toUpperCase()}
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
                  <Table.Tr
                    key={index}
                    onContextMenu={(e) => handleRowContextMenu(e, record)}
                    style={{ cursor: rowActions.length > 0 ? 'context-menu' : 'default' }}>
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
      </Box>

      {/* Fixed Bottom Pagination */}
      {pagination && (
        <Box
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'white',
            borderTop: '1px solid var(--mantine-color-gray-3)',
            padding: '1rem',
          }}>
          <Paper withBorder radius="md">
            <Group justify="space-between" wrap="wrap" p="md">
              <Group gap="md">
                {showTotal && (
                  <Text size="sm" c="dimmed">
                    {getPaginationInfo()}
                  </Text>
                )}
                {onPageSizeChange && pageSizeOptions.length > 0 && (
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      Show:
                    </Text>
                    <Select
                      size="xs"
                      value={pagination.per_page.toString()}
                      onChange={(value) => {
                        if (value) {
                          onPageSizeChange(Number(value));
                        }
                      }}
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
        </Box>
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

      {/* Context Menu */}
      {rowActions.length > 0 && (
        <Menu
          opened={contextMenuOpened}
          onClose={() => setContextMenuOpened(false)}
          position="bottom-start"
          shadow="md"
          width={240}
          withinPortal
          zIndex={1000}>
          <Menu.Target>
            <div
              style={{
                position: 'fixed',
                left: contextMenuPosition.x,
                top: contextMenuPosition.y,
                width: 1,
                height: 1,
                pointerEvents: 'none',
                opacity: 0,
              }}
            />
          </Menu.Target>
          <Menu.Dropdown>
            {/* Title Row with Applicant Name */}
            {selectedRecord && rowActionsTitle !== 'none' && (
              <Box
                style={{
                  backgroundColor: 'var(--mantine-color-blue-8)',
                  color: 'white',
                  margin: '-4px -4px 8px -4px',
                  padding: '4px 8px',
                  borderRadius: '6px 6px 0 0',
                  fontWeight: 600,
                  fontSize: '12px',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid var(--mantine-color-blue-7)',
                }}>
                {String((selectedRecord as Record<string, unknown>)[rowActionsTitle])}
              </Box>
            )}

            {selectedRecord &&
              rowActions.map((action, index) => {
                const isHidden = action.hidden?.(selectedRecord) ?? false;
                const isDisabled = action.disabled?.(selectedRecord) ?? false;

                if (isHidden) {
                  return null;
                }

                // Check if action has subActions
                const hasSubActions = action.subActions && action.subActions.length > 0;

                if (hasSubActions) {
                  return (
                    <Menu
                      key={index}
                      position="right-start"
                      shadow="md"
                      width={180}
                      withinPortal
                      zIndex={1001}
                      trigger="hover"
                      openDelay={100}
                      closeDelay={300}
                      closeOnItemClick={false}>
                      <Menu.Target>
                        <Menu.Item
                          leftSection={action.icon}
                          rightSection={<IconChevronRight size={14} />}
                          color={action.color}
                          disabled={isDisabled}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}>
                          {action.label}
                        </Menu.Item>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Box
                          style={{
                            backgroundColor: 'var(--mantine-color-blue-8)',
                            color: 'white',
                            margin: '-4px -4px 8px -4px',
                            padding: '4px 8px',
                            borderRadius: '6px 6px 0 0',
                            fontWeight: 600,
                            fontSize: '12px',
                            textAlign: 'left',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '1px solid var(--mantine-color-blue-7)',
                          }}>
                          {action.label}
                        </Box>
                        {action.subActions?.map((subAction, subIndex) => {
                          const isSubHidden = subAction.hidden?.(selectedRecord) ?? false;
                          const isSubDisabled = subAction.disabled?.(selectedRecord) ?? false;

                          if (isSubHidden) {
                            return null;
                          }

                          return (
                            <Menu.Item
                              key={subIndex}
                              leftSection={subAction.icon}
                              color={subAction.color}
                              disabled={isSubDisabled}
                              onClick={() => {
                                if (subAction.onClick !== undefined) {
                                  subAction.onClick(selectedRecord);
                                  setContextMenuOpened(false);
                                }
                              }}>
                              {subAction.label}
                            </Menu.Item>
                          );
                        })}
                      </Menu.Dropdown>
                    </Menu>
                  );
                }

                return (
                  <Menu.Item
                    key={index}
                    leftSection={action.icon}
                    color={action.color}
                    disabled={isDisabled}
                    onClick={() => {
                      if (action.onClick !== undefined) {
                        action.onClick(selectedRecord);
                        setContextMenuOpened(false);
                      }
                    }}>
                    {action.label}
                  </Menu.Item>
                );
              })}
          </Menu.Dropdown>
        </Menu>
      )}
    </Box>
  );
}
