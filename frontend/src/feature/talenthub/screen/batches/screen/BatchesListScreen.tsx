import { ActionIcon, Badge, Button, Container, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { useBatchesQuery } from '@/hooks/useBatchesQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/batches/index';
import type { BatchType } from '@/types/batch.type';

export function BatchesListScreen() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const {
    tempSearch,
    setTempSearch,
    appliedFilters,
    queryParams,
    handlePageChange,
    handleSortChange,
    handleFilterAdd,
    handleFilterRemove,
    handleFilterClear,
  } = usePaginationConfig({ search, navigate });

  // Use TanStack Query for data fetching
  const { data: queryData, isLoading, error, isError, refetch } = useBatchesQuery(queryParams);

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Filter options for the table
  const filterOptions: FilterOption[] = [
    {
      column: 'year',
      label: 'Year',
      type: 'number',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' },
        { value: 'between', label: 'Between' },
        { value: 'not_between', label: 'Not between' },
      ],
    },
    {
      column: 'location',
      label: 'Location',
      type: 'text',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'like', label: 'Contains' },
        { value: 'not_like', label: 'Does not contain' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
    },
    {
      column: 'location_code',
      label: 'Location Code',
      type: 'text',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'like', label: 'Contains' },
        { value: 'not_like', label: 'Does not contain' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
    },
    {
      column: 'number',
      label: 'Batch Number',
      type: 'number',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' },
        { value: 'between', label: 'Between' },
        { value: 'not_between', label: 'Not between' },
      ],
    },
  ];

  // Table columns configuration
  const columns: TableColumn<BatchType>[] = [
    {
      key: 'number',
      title: 'Batch Number',
      dataIndex: 'number',
      sortable: true,
      width: '120px',
      align: 'center',
    },
    {
      key: 'number_code',
      title: 'Code',
      dataIndex: 'number_code',
      sortable: true,
      width: '100px',
      align: 'center',
    },
    {
      key: 'location',
      title: 'Location',
      dataIndex: 'location',
      sortable: true,
      width: '150px',
    },
    {
      key: 'location_code',
      title: 'Location Code',
      dataIndex: 'location_code',
      sortable: true,
      width: '120px',
      align: 'center',
    },
    {
      key: 'year',
      title: 'Year',
      dataIndex: 'year',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      key: 'institutes',
      title: 'Institutes',
      dataIndex: 'institutes',
      render: (institutes: unknown) => {
        const institutesArray = (institutes as string[]) || [];
        return (
          <Group gap="xs">
            {institutesArray.slice(0, 2).map((institute, index) => (
              <Badge key={index} variant="light" size="sm">
                {institute}
              </Badge>
            ))}
            {institutesArray.length > 2 && (
              <Tooltip label={institutesArray.slice(2).join(', ')}>
                <Badge variant="outline" size="sm">
                  +{institutesArray.length - 2}
                </Badge>
              </Tooltip>
            )}
          </Group>
        );
      },
      width: '200px',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (status: unknown) => {
        return (
          <Badge variant="light" size="sm" color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_id: unknown, _record: BatchType) => (
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" size="sm">
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="sm">
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red">
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      width: '120px',
      align: 'center',
    },
  ];

  return (
    <Container size="2xl" py="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Batches Management</Title>
          <Text c="dimmed" size="sm">
            Manage and view all batches in the system
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Add New Batch</Button>
      </Group>

      <DefaultTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={errorMessage || undefined}
        pagination={pagination || undefined}
        searchValue={tempSearch}
        onSearchChange={setTempSearch}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        sortBy={search.sort_by || 'id'}
        sortOrder={search.order || 'asc'}
        filterOptions={filterOptions}
        appliedFilters={appliedFilters}
        onFilterAdd={handleFilterAdd}
        onFilterRemove={handleFilterRemove}
        onFilterClear={handleFilterClear}
        onRefresh={() => refetch()}
        searchPlaceholder="Search batches by number, location, or year..."
        emptyMessage="No batches found. Try adjusting your search or filters."
        title="Batches List"
        description="View and manage all batches in the system"
        showTotal
        pageSizeOptions={[10, 15, 25, 50]}
        minTableWidth="1000px"
        stickyHeader
        responsive
      />
    </Container>
  );
}
