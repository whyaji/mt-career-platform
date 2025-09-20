import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { EducationalInstitutionDeleteModal } from '@/feature/talenthub/screen/educational-institutions/components/modals/EducationalInstitutionDeleteModal';
import { EducationalInstitutionDetailModal } from '@/feature/talenthub/screen/educational-institutions/components/modals/EducationalInstitutionDetailModal';
import { EducationalInstitutionFormModal } from '@/feature/talenthub/screen/educational-institutions/components/modals/EducationalInstitutionFormModal';
import { useCreateEducationalInstitutionQuery } from '@/hooks/query/educational-institution/useCreateEducationalInstitutionQuery';
import { useDeleteEducationalInstitutionQuery } from '@/hooks/query/educational-institution/useDeleteEducationalInstitutionQuery';
import { useEducationalInstitutionsQuery } from '@/hooks/query/educational-institution/useEducationalInstitutionsQuery';
import { useGetEducationalInstitutionByIdQuery } from '@/hooks/query/educational-institution/useGetEducationalInstitutionByIdQuery';
import { useUpdateEducationalInstitutionQuery } from '@/hooks/query/educational-institution/useUpdateEducationalInstitutionQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/educational-institution';
import type { EducationalInstitutionType } from '@/types/educationalInstitution.type';

export function EducationalInstitutionsListScreen() {
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
  const [selectedEducationalInstitution, setSelectedEducationalInstitution] =
    useState<EducationalInstitutionType | null>(null);

  // Use TanStack Query for data fetching
  const {
    data: queryData,
    isLoading,
    error,
    isError,
    refetch,
  } = useEducationalInstitutionsQuery(queryParams);

  // Mutations
  const createEducationalInstitutionMutation = useCreateEducationalInstitutionQuery();
  const updateEducationalInstitutionMutation = useUpdateEducationalInstitutionQuery();
  const deleteEducationalInstitutionMutation = useDeleteEducationalInstitutionQuery();

  // Get educational institution details query (only when needed)
  const { data: educationalInstitutionDetailData, isLoading: educationalInstitutionDetailLoading } =
    useGetEducationalInstitutionByIdQuery(selectedEducationalInstitution?.id || '');

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Handler functions
  const handleViewDetails = (educationalInstitution: EducationalInstitutionType) => {
    setSelectedEducationalInstitution(educationalInstitution);
    setDetailModalOpened(true);
  };

  const handleEdit = (educationalInstitution: EducationalInstitutionType) => {
    setSelectedEducationalInstitution(educationalInstitution);
    setFormModalOpened(true);
  };

  const handleDelete = (educationalInstitution: EducationalInstitutionType) => {
    setSelectedEducationalInstitution(educationalInstitution);
    setDeleteModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedEducationalInstitution(null);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (
    data: Omit<EducationalInstitutionType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => {
    if (selectedEducationalInstitution) {
      await updateEducationalInstitutionMutation.mutateAsync({
        id: selectedEducationalInstitution.id,
        data,
      });
    } else {
      await createEducationalInstitutionMutation.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEducationalInstitution) {
      await deleteEducationalInstitutionMutation.mutateAsync(selectedEducationalInstitution.id);
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
  const columns: TableColumn<EducationalInstitutionType>[] = [
    {
      key: 'name',
      title: 'Institution Name',
      dataIndex: 'name',
      sortable: true,
      width: '300px',
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
      render: (_id: unknown, record: EducationalInstitutionType) => (
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
        searchPlaceholder="Search educational institutions by name..."
        emptyMessage="No educational institutions found. Try adjusting your search or filters."
        title="Educational Institutions Management"
        description="Manage and view all educational institutions in the system"
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="800px"
        responsive
        headerActions={
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add New Institution
          </Button>
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (educationalInstitution: EducationalInstitutionType) =>
              handleViewDetails(educationalInstitution),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (educationalInstitution: EducationalInstitutionType) =>
              handleEdit(educationalInstitution),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (educationalInstitution: EducationalInstitutionType) =>
              handleDelete(educationalInstitution),
          },
        ]}
      />

      {/* Modals */}
      <EducationalInstitutionDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        educationalInstitution={
          educationalInstitutionDetailData?.success && 'data' in educationalInstitutionDetailData
            ? (educationalInstitutionDetailData.data ?? null)
            : selectedEducationalInstitution
        }
        loading={educationalInstitutionDetailLoading}
      />

      <EducationalInstitutionFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        educationalInstitution={selectedEducationalInstitution}
        onSubmit={handleFormSubmit}
        loading={
          createEducationalInstitutionMutation.isPending ||
          updateEducationalInstitutionMutation.isPending
        }
        title={
          selectedEducationalInstitution
            ? 'Edit Educational Institution'
            : 'Create New Educational Institution'
        }
      />

      <EducationalInstitutionDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        educationalInstitution={selectedEducationalInstitution}
        onConfirm={handleDeleteConfirm}
        loading={deleteEducationalInstitutionMutation.isPending}
      />
    </div>
  );
}
