import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { BatchDeleteModal } from '@/feature/talenthub/screen/batches/components/modals/BatchDeleteModal';
import { BatchDetailModal } from '@/feature/talenthub/screen/batches/components/modals/BatchDetailModal';
import { BatchFormModal } from '@/feature/talenthub/screen/batches/components/modals/BatchFormModal';
import { useBatchesQuery } from '@/hooks/query/batch/useBatchesQuery';
import { useCreateBatchQuery } from '@/hooks/query/batch/useCreateBatchQuery';
import { useDeleteBatchQuery } from '@/hooks/query/batch/useDeleteBatchQuery';
import { useGetBatchByIdQuery } from '@/hooks/query/batch/useGetBatchByIdQuery';
import { useUpdateBatchQuery } from '@/hooks/query/batch/useUpdateBatchQuery';
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
    handlePageSizeChange,
  } = usePaginationConfig({ search, navigate });

  // Modal states
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null);

  // Use TanStack Query for data fetching
  const { data: queryData, isLoading, error, isError, refetch } = useBatchesQuery(queryParams);

  // Mutations
  const createBatchMutation = useCreateBatchQuery();
  const updateBatchMutation = useUpdateBatchQuery();
  const deleteBatchMutation = useDeleteBatchQuery();

  // Get batch details query (only when needed)
  const { data: batchDetailData, isLoading: batchDetailLoading } = useGetBatchByIdQuery(
    selectedBatch?.id || ''
  );

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Handler functions
  const handleViewDetails = (batch: BatchType) => {
    setSelectedBatch(batch);
    setDetailModalOpened(true);
  };

  const handleEdit = (batch: BatchType) => {
    setSelectedBatch(batch);
    setFormModalOpened(true);
  };

  const handleDelete = (batch: BatchType) => {
    setSelectedBatch(batch);
    setDeleteModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedBatch(null);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (data: Omit<BatchType, 'id'>) => {
    if (selectedBatch) {
      await updateBatchMutation.mutateAsync({ id: selectedBatch.id, data });
    } else {
      await createBatchMutation.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedBatch) {
      await deleteBatchMutation.mutateAsync(selectedBatch.id);
    }
  };

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
    {
      column: 'program_category_id',
      label: 'Program Category',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
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
      key: 'program_category',
      title: 'Program Category',
      dataIndex: 'program_category',
      render: (programCategory: unknown) => {
        const category = programCategory as { code: string; name: string } | null;
        if (!category) {
          return (
            <Badge variant="outline" size="sm">
              No Category
            </Badge>
          );
        }
        return (
          <Badge variant="light" size="sm">
            {category.code} - {category.name}
          </Badge>
        );
      },
      width: '200px',
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
      render: (_id: unknown, record: BatchType) => (
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" size="sm" onClick={() => handleViewDetails(record)}>
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="sm" onClick={() => handleEdit(record)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red" onClick={() => handleDelete(record)}>
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        searchPlaceholder="Search batches by number, location, year, or program category..."
        emptyMessage="No batches found. Try adjusting your search or filters."
        title="Batches Management"
        description="Manage and view all batches in the system"
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="1200px"
        responsive
        headerActions={
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add New Batch
          </Button>
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (batch: BatchType) => handleViewDetails(batch),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (batch: BatchType) => handleEdit(batch),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (batch: BatchType) => handleDelete(batch),
          },
        ]}
      />

      {/* Modals */}
      <BatchDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        batch={
          batchDetailData?.success && 'data' in batchDetailData
            ? (batchDetailData.data ?? null)
            : selectedBatch
        }
        loading={batchDetailLoading}
      />

      <BatchFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        batch={selectedBatch}
        onSubmit={handleFormSubmit}
        loading={createBatchMutation.isPending || updateBatchMutation.isPending}
        title={selectedBatch ? 'Edit Batch' : 'Create New Batch'}
      />

      <BatchDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        batch={selectedBatch}
        onConfirm={handleDeleteConfirm}
        loading={deleteBatchMutation.isPending}
      />
    </div>
  );
}
