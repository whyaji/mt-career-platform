import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconFileText, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { GlobalGeneratedFilesModal } from '@/feature/talenthub/components/modals/GlobalGeneratedFilesModal';
import { ApplicationDeleteModal } from '@/feature/talenthub/screen/applications/components/modals/ApplicationDeleteModal';
import { ApplicationDetailModal } from '@/feature/talenthub/screen/applications/components/modals/ApplicationDetailModal';
import { ApplicationFormModal } from '@/feature/talenthub/screen/applications/components/modals/ApplicationFormModal';
import { useApplicationsQuery } from '@/hooks/query/applicant/useApplicationsQuery';
import { useDeleteApplicationQuery } from '@/hooks/query/applicant/useDeleteApplicationQuery';
import { useGenerateApplicationsExcelMutation } from '@/hooks/query/applicant/useGenerateApplicationsExcelMutation';
import { useGetApplicationByIdQuery } from '@/hooks/query/applicant/useGetApplicationByIdQuery';
import { useUpdateApplicationQuery } from '@/hooks/query/applicant/useUpdateApplicationQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/applications/index';
import type { ApplicantDataType } from '@/types/applicant.type';

export function ApplicationsListScreen() {
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
  const [selectedApplication, setSelectedApplication] = useState<ApplicantDataType | null>(null);

  // Global generated files modal state
  const [globalFilesModal, setGlobalFilesModal] = useState({
    opened: false,
  });

  // Use TanStack Query for data fetching
  const { data: queryData, isLoading, error, isError, refetch } = useApplicationsQuery(queryParams);

  // Mutations
  const updateApplicationMutation = useUpdateApplicationQuery();
  const deleteApplicationMutation = useDeleteApplicationQuery();
  const generateExcelMutation = useGenerateApplicationsExcelMutation();

  // Get application details query (only when needed)
  const { data: applicationDetailData, isLoading: applicationDetailLoading } =
    useGetApplicationByIdQuery(selectedApplication?.id || '');

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Handler functions
  const handleViewDetails = (application: ApplicantDataType) => {
    setSelectedApplication(application);
    setDetailModalOpened(true);
  };

  const handleEdit = (application: ApplicantDataType) => {
    setSelectedApplication(application);
    setFormModalOpened(true);
  };

  const handleDelete = (application: ApplicantDataType) => {
    setSelectedApplication(application);
    setDeleteModalOpened(true);
  };

  const handleFormSubmit = async (data: Partial<ApplicantDataType>) => {
    if (selectedApplication) {
      await updateApplicationMutation.mutateAsync({ id: selectedApplication.id, data });
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedApplication) {
      await deleteApplicationMutation.mutateAsync(selectedApplication.id);
    }
  };

  // Header actions for generated files
  const headerActions = (
    <Group gap="sm">
      {/* Generate Excel Button */}
      <Button
        variant="light"
        color="green"
        leftSection={<IconFileText size={16} />}
        onClick={() => generateExcelMutation.mutate()}
        loading={generateExcelMutation.isPending}
        disabled={generateExcelMutation.isPending}
        size="sm">
        Generate Excel
      </Button>

      {/* Generated Files Manager Button */}
      <Button
        variant="light"
        color="blue"
        leftSection={<IconFileText size={16} />}
        onClick={() => setGlobalFilesModal({ opened: true })}
        size="sm">
        Files Manager
      </Button>
    </Group>
  );

  // Filter options for the table
  const filterOptions: FilterOption[] = [
    {
      column: 'nama_lengkap',
      label: 'Full Name',
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
      column: 'email',
      label: 'Email',
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
      column: 'program_terpilih',
      label: 'Program',
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
      column: 'instansi_pendidikan',
      label: 'Institution',
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
      column: 'jenjang_pendidikan',
      label: 'Education Level',
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
  ];

  // Table columns configuration
  const columns: TableColumn<ApplicantDataType>[] = [
    {
      key: 'nama_lengkap',
      title: 'Full Name',
      dataIndex: 'nama_lengkap',
      sortable: true,
      width: '200px',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
      width: '200px',
    },
    {
      key: 'nomor_whatsapp',
      title: 'WhatsApp',
      dataIndex: 'nomor_whatsapp',
      sortable: true,
      width: '150px',
    },
    {
      key: 'program_terpilih',
      title: 'Program',
      dataIndex: 'program_terpilih',
      sortable: true,
      width: '200px',
    },
    {
      key: 'instansi_pendidikan',
      title: 'Institution',
      dataIndex: 'instansi_pendidikan',
      sortable: true,
      width: '200px',
    },
    {
      key: 'jenjang_pendidikan',
      title: 'Education Level',
      dataIndex: 'jenjang_pendidikan',
      sortable: true,
      width: '150px',
    },
    {
      key: 'batch',
      title: 'Batch',
      dataIndex: 'batch',
      render: (batch: unknown) => {
        const batchData = batch as ApplicantDataType['batch'];
        if (!batchData) {
          return 'N/A';
        }
        return `${batchData.number} - ${batchData.location} (${batchData.year})`;
      },
      width: '200px',
    },
    {
      key: 'jenis_kelamin',
      title: 'Gender',
      dataIndex: 'jenis_kelamin',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (gender: unknown) => {
        return (
          <Badge variant="light" size="sm" color={gender === 'L' ? 'blue' : 'pink'}>
            {gender === 'L' ? 'Male' : 'Female'}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Applied Date',
      dataIndex: 'created_at',
      sortable: true,
      width: '150px',
      render: (date: unknown) => {
        return new Date(date as string).toLocaleDateString();
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_id: unknown, record: ApplicantDataType) => (
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
        searchPlaceholder="Search applications by name, email, or program..."
        emptyMessage="No applications found. Try adjusting your search or filters."
        title="Applications Management"
        description="Manage and view all applications in the system"
        headerActions={(pagination?.total || 0) > 0 ? headerActions : undefined}
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="1200px"
        responsive
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (application: ApplicantDataType) => handleViewDetails(application),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (application: ApplicantDataType) => handleEdit(application),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (application: ApplicantDataType) => handleDelete(application),
          },
        ]}
      />

      {/* Modals */}
      <ApplicationDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        application={
          applicationDetailData?.success && 'data' in applicationDetailData
            ? (applicationDetailData.data ?? null)
            : selectedApplication
        }
        loading={applicationDetailLoading}
      />

      <ApplicationFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        application={selectedApplication}
        onSubmit={handleFormSubmit}
        loading={updateApplicationMutation.isPending}
        title="Edit Application"
      />

      <ApplicationDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        application={selectedApplication}
        onConfirm={handleDeleteConfirm}
        loading={deleteApplicationMutation.isPending}
      />

      {/* Global Generated Files Modal */}
      <GlobalGeneratedFilesModal
        opened={globalFilesModal.opened}
        onClose={() => setGlobalFilesModal({ opened: false })}
        title="Generated Files - Applications"
        defaultFilters={{
          type: 'applications',
        }}
        defaultSearch=""
      />
    </div>
  );
}
