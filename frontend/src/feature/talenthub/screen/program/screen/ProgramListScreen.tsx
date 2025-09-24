import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { ProgramDeleteModal } from '@/feature/talenthub/screen/program/components/modals/ProgramDeleteModal';
import { ProgramDetailModal } from '@/feature/talenthub/screen/program/components/modals/ProgramDetailModal';
import { ProgramFormModal } from '@/feature/talenthub/screen/program/components/modals/ProgramFormModal';
import { useCreateProgramQuery } from '@/hooks/query/program/useCreateProgramQuery';
import { useDeleteProgramQuery } from '@/hooks/query/program/useDeleteProgramQuery';
import { useGetProgramByIdQuery } from '@/hooks/query/program/useGetProgramByIdQuery';
import { useProgramsQuery } from '@/hooks/query/program/useProgramsQuery';
import { useUpdateProgramQuery } from '@/hooks/query/program/useUpdateProgramQuery';
import { useProgramCategoriesQuery } from '@/hooks/query/program-category/useProgramCategoriesQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/program/index';
import type { ProgramType } from '@/types/program.type';

export function ProgramListScreen() {
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
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);

  // Use TanStack Query for data fetching
  const { data: queryData, isLoading, error, isError, refetch } = useProgramsQuery(queryParams);

  // Get all program categories for form and display
  const { data: programCategoriesData } = useProgramCategoriesQuery({ limit: 1000 });
  const programCategories = programCategoriesData?.data || [];

  // Mutations
  const createProgramMutation = useCreateProgramQuery();
  const updateProgramMutation = useUpdateProgramQuery();
  const deleteProgramMutation = useDeleteProgramQuery();

  // Get program details query (only when needed)
  const { data: programDetailData, isLoading: programDetailLoading } = useGetProgramByIdQuery(
    selectedProgram?.id || ''
  );

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Handler functions
  const handleViewDetails = (program: ProgramType) => {
    setSelectedProgram(program);
    setDetailModalOpened(true);
  };

  const handleEdit = (program: ProgramType) => {
    setSelectedProgram(program);
    setFormModalOpened(true);
  };

  const handleDelete = (program: ProgramType) => {
    setSelectedProgram(program);
    setDeleteModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedProgram(null);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (
    data: Omit<ProgramType, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'program_category'>
  ) => {
    if (selectedProgram) {
      await updateProgramMutation.mutateAsync({ id: selectedProgram.id, data });
    } else {
      await createProgramMutation.mutateAsync(data);
    }
    // Reset selected program and close modal after successful submission
    setSelectedProgram(null);
    setFormModalOpened(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProgram) {
      await deleteProgramMutation.mutateAsync(selectedProgram.id);
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
      column: 'program_category_id',
      label: 'Category',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
      options: programCategories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    },
    {
      column: 'min_education',
      label: 'Min Education',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
      options: [
        { value: 'D3', label: 'D3' },
        { value: 'S1', label: 'S1' },
        { value: 'S2', label: 'S2' },
      ],
    },
    {
      column: 'marital_status',
      label: 'Marital Status',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
      options: [
        { value: 'single', label: 'Single' },
        { value: 'any', label: 'Any' },
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
  const columns: TableColumn<ProgramType>[] = [
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
      key: 'program_category',
      title: 'Category',
      dataIndex: 'program_category',
      sortable: false,
      width: '150px',
      render: (program_category: unknown, record: ProgramType) => {
        // Try to get category from relationship first, then fallback to lookup
        const category = program_category as { name: string } | undefined;
        if (category?.name) {
          return (
            <Badge variant="light" size="sm">
              {category.name}
            </Badge>
          );
        }

        // Fallback: lookup category by ID from the loaded categories
        const categoryId = record.program_category_id;
        const foundCategory = programCategories.find((cat) => cat.id === categoryId);

        return foundCategory ? (
          <Badge variant="light" size="sm">
            {foundCategory.name}
          </Badge>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'min_education',
      title: 'Min Education',
      dataIndex: 'min_education',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (min_education: unknown) => {
        return (
          <Badge variant="outline" size="sm">
            {min_education as string}
          </Badge>
        );
      },
    },
    {
      key: 'majors',
      title: 'Majors',
      dataIndex: 'majors',
      sortable: false,
      width: '200px',
      render: (majors: unknown) => {
        const majorsArray = (majors as string[]) || [];
        return (
          <Group gap="xs">
            {majorsArray.slice(0, 2).map((major, index) => (
              <Badge key={index} variant="outline" size="xs">
                {major}
              </Badge>
            ))}
            {majorsArray.length > 2 && (
              <Tooltip label={majorsArray.slice(2).join(', ')}>
                <Badge variant="outline" size="xs">
                  +{majorsArray.length - 2}
                </Badge>
              </Tooltip>
            )}
          </Group>
        );
      },
    },
    {
      key: 'placement',
      title: 'Placement',
      dataIndex: 'placement',
      sortable: true,
      width: '150px',
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
      render: (_id: unknown, record: ProgramType) => (
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
        searchPlaceholder="Search programs by name, code, or category..."
        emptyMessage="No programs found. Try adjusting your search or filters."
        title="Programs Management"
        description="Manage and view all programs in the system"
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="1200px"
        responsive
        headerActions={
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add New Program
          </Button>
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (program: ProgramType) => handleViewDetails(program),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (program: ProgramType) => handleEdit(program),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (program: ProgramType) => handleDelete(program),
          },
        ]}
      />

      {/* Modals */}
      <ProgramDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        program={
          programDetailData?.success && 'data' in programDetailData
            ? (programDetailData.data ?? null)
            : selectedProgram
        }
        loading={programDetailLoading}
      />

      <ProgramFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        program={selectedProgram}
        programCategories={programCategories}
        onSubmit={handleFormSubmit}
        loading={createProgramMutation.isPending || updateProgramMutation.isPending}
        title={selectedProgram ? 'Edit Program' : 'Create New Program'}
      />

      <ProgramDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        program={selectedProgram}
        onConfirm={handleDeleteConfirm}
        loading={deleteProgramMutation.isPending}
      />
    </div>
  );
}
