import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { ProgramCategoryDeleteModal } from '@/feature/talenthub/screen/program-category/components/modals/ProgramCategoryDeleteModal';
import { ProgramCategoryDetailModal } from '@/feature/talenthub/screen/program-category/components/modals/ProgramCategoryDetailModal';
import { ProgramCategoryFormModal } from '@/feature/talenthub/screen/program-category/components/modals/ProgramCategoryFormModal';
import { useCreateProgramCategoryQuery } from '@/hooks/query/program-category/useCreateProgramCategoryQuery';
import { useDeleteProgramCategoryQuery } from '@/hooks/query/program-category/useDeleteProgramCategoryQuery';
import { useGetProgramCategoryByIdQuery } from '@/hooks/query/program-category/useGetProgramCategoryByIdQuery';
import { useProgramCategoriesQuery } from '@/hooks/query/program-category/useProgramCategoriesQuery';
import { useUpdateProgramCategoryQuery } from '@/hooks/query/program-category/useUpdateProgramCategoryQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/program-category/index';
import type { ProgramCategoryType } from '@/types/programCategory.type';

export function ProgramCategoryListScreen() {
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
  } = usePaginationConfig({
    search: {
      ...search,
      page: search.page || 1,
      limit: search.limit || 15,
      sort_by: search.sort_by || 'id',
      order: search.order || 'asc',
    },
    navigate,
  });

  // Modal states
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedProgramCategory, setSelectedProgramCategory] =
    useState<ProgramCategoryType | null>(null);

  // Use TanStack Query for data fetching
  const {
    data: queryData,
    isLoading,
    error,
    isError,
    refetch,
  } = useProgramCategoriesQuery(queryParams);

  // Mutations
  const createProgramCategoryMutation = useCreateProgramCategoryQuery();
  const updateProgramCategoryMutation = useUpdateProgramCategoryQuery();
  const deleteProgramCategoryMutation = useDeleteProgramCategoryQuery();

  // Get program category details query (only when needed)
  const { data: programCategoryDetailData, isLoading: programCategoryDetailLoading } =
    useGetProgramCategoryByIdQuery(selectedProgramCategory?.id || '');

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Handler functions
  const handleViewDetails = (programCategory: ProgramCategoryType) => {
    setSelectedProgramCategory(programCategory);
    setDetailModalOpened(true);
  };

  const handleEdit = (programCategory: ProgramCategoryType) => {
    setSelectedProgramCategory(programCategory);
    setFormModalOpened(true);
  };

  const handleDelete = (programCategory: ProgramCategoryType) => {
    setSelectedProgramCategory(programCategory);
    setDeleteModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedProgramCategory(null);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (
    data: Omit<ProgramCategoryType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => {
    if (selectedProgramCategory) {
      await updateProgramCategoryMutation.mutateAsync({ id: selectedProgramCategory.id, data });
    } else {
      await createProgramCategoryMutation.mutateAsync(data);
    }
    // Reset selected program category and close modal after successful submission
    setSelectedProgramCategory(null);
    setFormModalOpened(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProgramCategory) {
      await deleteProgramCategoryMutation.mutateAsync(selectedProgramCategory.id);
    }
  };

  // Filter options for the table
  const filterOptions: FilterOption[] = [
    {
      column: 'name',
      label: 'Name',
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
      column: 'code',
      label: 'Code',
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
      column: 'status',
      label: 'Status',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
      options: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
      ],
    },
  ];

  // Table columns configuration
  const columns: TableColumn<ProgramCategoryType>[] = [
    {
      key: 'code',
      title: 'Code',
      dataIndex: 'code',
      sortable: true,
      width: '120px',
      align: 'center',
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
      width: '200px',
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      sortable: false,
      width: '300px',
      render: (description: unknown) => {
        const desc = description as string;
        return desc ? (desc.length > 100 ? `${desc.substring(0, 100)}...` : desc) : '-';
      },
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
      key: 'created_at',
      title: 'Created',
      dataIndex: 'created_at',
      sortable: true,
      width: '150px',
      align: 'center',
      render: (created_at: unknown) => {
        if (!created_at) {
          return '-';
        }
        return new Date(created_at as string).toLocaleDateString();
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_id: unknown, record: ProgramCategoryType) => (
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
        searchPlaceholder="Search program categories by name or code..."
        emptyMessage="No program categories found. Try adjusting your search or filters."
        title="Program Categories Management"
        description="Manage and view all program categories in the system"
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="1000px"
        responsive
        headerActions={
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add New Category
          </Button>
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (programCategory: ProgramCategoryType) => handleViewDetails(programCategory),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (programCategory: ProgramCategoryType) => handleEdit(programCategory),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (programCategory: ProgramCategoryType) => handleDelete(programCategory),
          },
        ]}
      />

      {/* Modals */}
      <ProgramCategoryDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        programCategory={
          programCategoryDetailData?.success && 'data' in programCategoryDetailData
            ? (programCategoryDetailData.data ?? null)
            : selectedProgramCategory
        }
        loading={programCategoryDetailLoading}
      />

      <ProgramCategoryFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        programCategory={selectedProgramCategory}
        onSubmit={handleFormSubmit}
        loading={createProgramCategoryMutation.isPending || updateProgramCategoryMutation.isPending}
        title={selectedProgramCategory ? 'Edit Program Category' : 'Create New Program Category'}
      />

      <ProgramCategoryDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        programCategory={selectedProgramCategory}
        onConfirm={handleDeleteConfirm}
        loading={deleteProgramCategoryMutation.isPending}
      />
    </div>
  );
}
