import { Badge, Group, Text } from '@mantine/core';
import {
  IconEdit,
  IconEye,
  IconGenderMale,
  IconRefresh,
  IconReload,
  IconRobot,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { CheckboxFilter } from '@/components/CheckboxFilter';
import { type ColumnOption, ColumnVisibilityControl } from '@/components/ColumnVisibilityControl';
import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { ErrorScreenComponent } from '@/components/ErrorScreenComponent';
import { ExcelExportMenu } from '@/components/ExcelExportMenu';
import { FilesManagerButton } from '@/components/FilesManagerButton';
import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import { PendingScreenComponent } from '@/components/PendingScreenComponent';
import { RescreenAllButton } from '@/components/RescreenAllButton';
import { StatusFilterPills } from '@/components/StatusFilterPills';
import {
  APPLICANT_DATA_REVIEW_STATUS,
  APPLICANT_DATA_REVIEW_STATUS_LABELS,
  APPLICANT_DATA_REVIEW_STATUS_LIST,
  APPLICANT_DATA_SCREENING_STATUS,
  APPLICANT_DATA_SCREENING_STATUS_LABELS,
  getApplicantDataStatusColor,
} from '@/constants/applicantDataStatus.enum';
import { WindowApplicationDetailModal } from '@/feature/talenthub/screen/applications/components/modals/WindowApplicationDetailModal';
import { useApplicationsByBatchQuery } from '@/hooks/query/applicant/useApplicationsByBatchQuery';
import { useGenerateApplicationsExcelByBatchMutation } from '@/hooks/query/applicant/useGenerateApplicationsExcelByBatchMutation';
import { useGenerateApplicationsExcelMutation } from '@/hooks/query/applicant/useGenerateApplicationsExcelMutation';
import { useRescreenAllByBatchMutation } from '@/hooks/query/applicant/useRescreenAllByBatchMutation';
import { useTriggerScreeningMutation } from '@/hooks/query/applicant/useTriggerScreeningMutation';
import { useUpdateApplicationReviewStatusMutation } from '@/hooks/query/applicant/useUpdateApplicationReviewStatusMutation';
import { useGetBatchByIdQuery } from '@/hooks/query/batch/useGetBatchByIdQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { useUserStore } from '@/lib/store/userStore';
import { Route } from '@/routes/talenthub/_authenticated/applications/$batchId/index';
import type { ApplicantDataType as BaseApplicantDataType } from '@/types/applicantData.type';
import { formatDefaultDate } from '@/utils/dateTimeFormatter';

// Extended type to include status fields from API
type ApplicantDataType = BaseApplicantDataType & {
  screening_status?: number;
  screening_remark?: string | null;
  review_status?: number;
  review_remark?: string | null;
};

export function ApplicationsListScreen() {
  const navigate = Route.useNavigate();
  const { batchId } = Route.useParams();
  const search = Route.useSearch();
  const user = useUserStore((state) => state.user);

  const { data: batchDetailData, isLoading: batchDetailLoading } = useGetBatchByIdQuery(batchId);

  const batch =
    batchDetailData?.success && 'data' in batchDetailData ? batchDetailData.data : undefined;

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
    handleFilterChange,
    handlePageSizeChange,
  } = usePaginationConfig({ search, navigate });

  // Window states - support multiple windows
  const [openWindows, setOpenWindows] = useState<Map<string, string>>(new Map());
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

  const defaultVisibleColumns = {
    // Basic info - always visible
    nama_lengkap: true,
    email: true,
    nomor_whatsapp: true,
    jenis_kelamin: true,
    nik: true,
    // Program info
    program_terpilih: true,
    instansi_pendidikan: true,
    jenjang_pendidikan: true,
    jurusan_pendidikan: true,
    nim: false,
    status_ijazah: true,
    batch: true,
    // Status info
    screening_status: true,
    review_status: true,
    screening_remark: false,
    review_remark: false,
    // Personal info - birth details
    tempat_lahir: false,
    tanggal_lahir: false,
    usia: false,
    daerah_lahir: false,
    provinsi_lahir: false,
    // Physical info
    tinggi_badan: false,
    berat_badan: false,
    // Domicile info
    daerah_domisili: false,
    provinsi_domisili: false,
    kota_domisili: false,
    alamat_domisili: false,
    // Additional info
    status_perkawinan: false,
    melanjutkan_pendidikan: false,
    ukuran_baju: false,
    riwayat_penyakit: false,
    // System info
    created_at: true,
    updated_at: false,
  };

  // Column visibility state - all available fields from API
  const [visibleColumns, setVisibleColumns] =
    useState<Record<string, boolean>>(defaultVisibleColumns);

  // Column options for the visibility control
  const columnOptions: ColumnOption[] = [
    // Basic Information
    { key: 'nama_lengkap', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'nomor_whatsapp', label: 'WhatsApp' },
    { key: 'jenis_kelamin', label: 'Gender' },
    { key: 'nik', label: 'NIK' },
    // Program Information
    { key: 'program_terpilih', label: 'Program' },
    { key: 'instansi_pendidikan', label: 'Institution' },
    { key: 'jenjang_pendidikan', label: 'Education Level' },
    { key: 'jurusan_pendidikan', label: 'Major' },
    { key: 'nim', label: 'Student ID' },
    { key: 'status_ijazah', label: 'Diploma Status' },
    { key: 'batch', label: 'Batch' },
    // Status Information
    { key: 'screening_status', label: 'Screening Status' },
    { key: 'review_status', label: 'Review Status' },
    { key: 'screening_remark', label: 'Screening Remark' },
    { key: 'review_remark', label: 'Review Remark' },
    // Birth Information
    { key: 'tempat_lahir', label: 'Birth Place' },
    { key: 'tanggal_lahir', label: 'Birth Date' },
    { key: 'usia', label: 'Age' },
    { key: 'daerah_lahir', label: 'Birth Region' },
    { key: 'provinsi_lahir', label: 'Birth Province' },
    // Physical Information
    { key: 'tinggi_badan', label: 'Height (cm)' },
    { key: 'berat_badan', label: 'Weight (kg)' },
    { key: 'ukuran_baju', label: 'Shirt Size' },
    // Domicile Information
    { key: 'daerah_domisili', label: 'Domicile Region' },
    { key: 'provinsi_domisili', label: 'Domicile Province' },
    { key: 'kota_domisili', label: 'Domicile City' },
    { key: 'alamat_domisili', label: 'Domicile Address' },
    // Additional Information
    { key: 'status_perkawinan', label: 'Marital Status' },
    { key: 'melanjutkan_pendidikan', label: 'Continue Education' },
    { key: 'riwayat_penyakit', label: 'Medical History' },
    // System Information
    { key: 'created_at', label: 'Applied Date' },
    { key: 'updated_at', label: 'Last Updated' },
  ];

  // Use TanStack Query for data fetching
  const {
    data: queryData,
    isLoading,
    error,
    isError,
    refetch,
  } = useApplicationsByBatchQuery(
    batchId,
    queryParams,
    !(batch instanceof Error) && batch?.id !== undefined
  );

  // Extract data from query response
  const data = useMemo(() => queryData?.data || [], [queryData?.data]);
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  // Derive filter states from appliedFilters
  const selectedReviewStatus = useMemo(() => {
    const reviewStatusFilter = appliedFilters.find((filter) => filter.column === 'review_status');
    return reviewStatusFilter ? Number(reviewStatusFilter.value) : undefined;
  }, [appliedFilters]);

  const selectedGenders = useMemo(() => {
    const genderFilter = appliedFilters.find((filter) => filter.column === 'jenis_kelamin');
    return genderFilter ? genderFilter.value.split(',') : [];
  }, [appliedFilters]);

  const selectedScreeningStatuses = useMemo(() => {
    const screeningStatusFilter = appliedFilters.find(
      (filter) => filter.column === 'screening_status'
    );
    return screeningStatusFilter ? screeningStatusFilter.value.split(',') : [];
  }, [appliedFilters]);

  // Mutations
  // const updateApplicationMutation = useUpdateApplicationQuery();
  // const deleteApplicationMutation = useDeleteApplicationQuery();
  const generateExcelMutation = useGenerateApplicationsExcelMutation();
  const generateExcelByBatchMutation = useGenerateApplicationsExcelByBatchMutation();
  const updateReviewStatusMutation = useUpdateApplicationReviewStatusMutation();
  const triggerScreeningMutation = useTriggerScreeningMutation();
  const rescreenAllByBatchMutation = useRescreenAllByBatchMutation();

  // Handle error case from loader
  if (batch instanceof Error) {
    return <ErrorScreenComponent />;
  }

  if (batchDetailLoading) {
    return <PendingScreenComponent />;
  }

  if (!batch) {
    return <NotFoundScreenComponent />;
  }

  // Gender filter options
  const genderOptions = [
    { value: 'L', label: 'Laki-laki' },
    { value: 'P', label: 'Perempuan' },
  ];

  // Screening status filter options
  const screeningStatusOptions = Object.entries(APPLICANT_DATA_SCREENING_STATUS_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  // Handler functions
  const handleViewDetailsInWindow = (application: ApplicantDataType) => {
    const windowId = `modal-${application.id}`;
    setOpenWindows((prev) => new Map(prev.set(windowId, application.id)));
  };

  const handleCloseWindow = (windowId: string) => {
    setOpenWindows((prev) => {
      const newMap = new Map(prev);
      newMap.delete(windowId);
      return newMap;
    });
  };

  const handleWindowFocus = (windowId: string) => {
    setFocusedWindowId(windowId);
  };

  // Handler for updating review status
  const handleUpdateReviewStatus = (applicationId: string, reviewStatus: number) => {
    const statusLabels = APPLICANT_DATA_REVIEW_STATUS_LABELS;
    const statusLabel = statusLabels[reviewStatus as keyof typeof statusLabels];
    const reviewRemark = `Status updated to "${statusLabel}" by ${user?.name || 'User'}`;

    updateReviewStatusMutation.mutate({
      id: applicationId,
      review_status: reviewStatus,
      review_remark: reviewRemark,
    });
  };

  // Handler for triggering screening
  const handleTriggerScreening = (applicationId: string) => {
    triggerScreeningMutation.mutate(applicationId);
  };

  // Handler for rescreening all by batch
  const handleRescreenAllByBatch = () => {
    if (batchId) {
      rescreenAllByBatchMutation.mutate({ batchId });
    }
  };

  // Column visibility handlers
  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleShowAllColumns = () => {
    const allVisible = Object.keys(visibleColumns).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setVisibleColumns(allVisible);
  };

  const handleHideAllColumns = () => {
    const allHidden = Object.keys(visibleColumns).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setVisibleColumns(allHidden);
  };

  const handleDefaultColumns = () => {
    setVisibleColumns(defaultVisibleColumns);
  };

  // Custom filter handlers
  const handleReviewStatusSelect = (status: number | undefined) => {
    // Apply filter to the table
    handleFilterChange('review_status', status?.toString(), 'eq');
  };

  const handleGenderSelectionChange = (values: string[]) => {
    // Apply filter to the table
    handleFilterChange('jenis_kelamin', values.length > 0 ? values.join(',') : undefined, 'in');
  };

  const handleScreeningStatusSelectionChange = (values: string[]) => {
    // Apply filter to the table
    handleFilterChange('screening_status', values.length > 0 ? values.join(',') : undefined, 'in');
  };

  // Status badge component
  const StatusBadge = ({ status, type }: { status: number; type: 'screening' | 'review' }) => {
    const labels =
      type === 'screening'
        ? APPLICANT_DATA_SCREENING_STATUS_LABELS
        : APPLICANT_DATA_REVIEW_STATUS_LABELS;

    return (
      <Badge
        variant="light"
        size="sm"
        color={getApplicantDataStatusColor(status, type)}
        style={{ textTransform: 'capitalize' }}>
        {labels[status as keyof typeof labels] || 'Unknown'}
      </Badge>
    );
  };

  // Handler for Excel export options
  const handleExportAll = () => {
    if (batchId) {
      generateExcelByBatchMutation.mutate({ batchId, filters: undefined });
    } else {
      generateExcelMutation.mutate(undefined);
    }
  };

  const handleExportFiltered = () => {
    if (batchId) {
      generateExcelByBatchMutation.mutate({ batchId, filters: queryParams });
    } else {
      generateExcelMutation.mutate(queryParams);
    }
  };

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    queryParams.search || queryParams.filter || appliedFilters.length > 0
  );

  // Header actions for generated files and column controls
  const headerActions = (
    <Group gap="sm">
      {/* Column Visibility Control */}
      <ColumnVisibilityControl
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onShowAll={handleShowAllColumns}
        onHideAll={handleHideAllColumns}
        onDefault={handleDefaultColumns}
        triggerLabel="Columns"
        maxHeight={400}
      />

      {/* Rescreen All Button */}
      <RescreenAllButton
        onRescreen={handleRescreenAllByBatch}
        loading={rescreenAllByBatchMutation.isPending}
        batchNumber={batch?.number?.toString()}
        batchLocation={batch?.location}
      />

      {/* Excel Export Menu */}
      <ExcelExportMenu
        onExportAll={handleExportAll}
        onExportFiltered={handleExportFiltered}
        hasActiveFilters={hasActiveFilters}
        loading={generateExcelMutation.isPending || generateExcelByBatchMutation.isPending}
      />

      {/* Generated Files Manager Button */}
      <FilesManagerButton
        title={`Generated Files - Applications ${batch?.number} (${batch?.location})`}
        defaultFilters={{
          type: 'applications-by-batch',
          model_id: batchId,
        }}
        defaultSearch={batchId || ''}
      />
    </Group>
  );

  // Filter options for the table - all searchable fields
  const filterOptions: FilterOption[] = [
    // Basic Information
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
      column: 'nomor_whatsapp',
      label: 'WhatsApp',
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
      column: 'nik',
      label: 'NIK',
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
    // Program Information
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
    {
      column: 'jurusan_pendidikan',
      label: 'Major',
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
      column: 'nim',
      label: 'Student ID',
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
      column: 'status_ijazah',
      label: 'Diploma Status',
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
    // Birth Information
    {
      column: 'tempat_lahir',
      label: 'Birth Place',
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
      column: 'daerah_lahir',
      label: 'Birth Region',
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
      column: 'provinsi_lahir',
      label: 'Birth Province',
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
    // Domicile Information
    {
      column: 'daerah_domisili',
      label: 'Domicile Region',
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
      column: 'provinsi_domisili',
      label: 'Domicile Province',
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
      column: 'kota_domisili',
      label: 'Domicile City',
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
    // Additional Information
    {
      column: 'status_perkawinan',
      label: 'Marital Status',
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
      column: 'ukuran_baju',
      label: 'Shirt Size',
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
      column: 'riwayat_penyakit',
      label: 'Medical History',
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
    // Status Information
    {
      column: 'screening_status',
      label: 'Screening Status',
      type: 'select',
      options: Object.entries(APPLICANT_DATA_SCREENING_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
    },
    {
      column: 'review_status',
      label: 'Review Status',
      type: 'select',
      options: Object.entries(APPLICANT_DATA_REVIEW_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
    },
  ];

  // Table columns configuration - all available fields from API
  const allColumns: TableColumn<ApplicantDataType>[] = [
    // Basic Information
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
      key: 'jenis_kelamin',
      title: 'Gender',
      dataIndex: 'jenis_kelamin',
      sortable: true,
      width: '110px',
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
      key: 'nik',
      title: 'NIK',
      dataIndex: 'nik',
      sortable: true,
      width: '150px',
    },
    // Program Information
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
      width: '300px',
    },
    {
      key: 'jenjang_pendidikan',
      title: 'Education Level',
      dataIndex: 'jenjang_pendidikan',
      sortable: true,
      width: '180px',
    },
    {
      key: 'jurusan_pendidikan',
      title: 'Major',
      dataIndex: 'jurusan_pendidikan',
      sortable: true,
      width: '200px',
    },
    {
      key: 'nim',
      title: 'Student ID',
      dataIndex: 'nim',
      sortable: true,
      width: '180px',
    },
    {
      key: 'status_ijazah',
      title: 'Diploma Status',
      dataIndex: 'status_ijazah',
      sortable: true,
      width: '190px',
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
    // Status Information
    {
      key: 'screening_status',
      title: 'Screening Status',
      dataIndex: 'screening_status',
      sortable: true,
      width: '200px',
      align: 'center',
      render: (status: unknown) => {
        return <StatusBadge status={status as number} type="screening" />;
      },
    },
    {
      key: 'review_status',
      title: 'Review Status',
      dataIndex: 'review_status',
      sortable: true,
      width: '180px',
      align: 'center',
      render: (status: unknown) => {
        return <StatusBadge status={status as number} type="review" />;
      },
    },
    {
      key: 'screening_remark',
      title: 'Screening Remark',
      dataIndex: 'screening_remark',
      sortable: false,
      width: '200px',
      render: (remark: unknown) => {
        return remark ? (
          <Text
            size="sm"
            c="dimmed"
            style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {remark as string}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        );
      },
    },
    {
      key: 'review_remark',
      title: 'Review Remark',
      dataIndex: 'review_remark',
      sortable: false,
      width: '200px',
      render: (remark: unknown) => {
        return remark ? (
          <Text
            size="sm"
            c="dimmed"
            style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {remark as string}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        );
      },
    },
    // Birth Information
    {
      key: 'tempat_lahir',
      title: 'Birth Place',
      dataIndex: 'tempat_lahir',
      sortable: true,
      width: '180px',
    },
    {
      key: 'tanggal_lahir',
      title: 'Birth Date',
      dataIndex: 'tanggal_lahir',
      sortable: true,
      width: '190px',
      render: (date: unknown) => {
        return date ? formatDefaultDate(date as string) : '-';
      },
    },
    {
      key: 'usia',
      title: 'Age',
      dataIndex: 'usia',
      sortable: true,
      width: '90px',
      align: 'center',
    },
    {
      key: 'daerah_lahir',
      title: 'Birth Region',
      dataIndex: 'daerah_lahir',
      sortable: true,
      width: '180px',
    },
    {
      key: 'provinsi_lahir',
      title: 'Birth Province',
      dataIndex: 'provinsi_lahir',
      sortable: true,
      width: '180px',
    },
    // Physical Information
    {
      key: 'tinggi_badan',
      title: 'Height (cm)',
      dataIndex: 'tinggi_badan',
      sortable: true,
      width: '160px',
      align: 'center',
    },
    {
      key: 'berat_badan',
      title: 'Weight (kg)',
      dataIndex: 'berat_badan',
      sortable: true,
      width: '160px',
      align: 'center',
    },
    {
      key: 'ukuran_baju',
      title: 'Shirt Size',
      dataIndex: 'ukuran_baju',
      sortable: true,
      width: '140px',
      align: 'center',
    },
    // Domicile Information
    {
      key: 'daerah_domisili',
      title: 'Domicile Region',
      dataIndex: 'daerah_domisili',
      sortable: true,
      width: '180px',
    },
    {
      key: 'provinsi_domisili',
      title: 'Domicile Province',
      dataIndex: 'provinsi_domisili',
      sortable: true,
      width: '190px',
    },
    {
      key: 'kota_domisili',
      title: 'Domicile City',
      dataIndex: 'kota_domisili',
      sortable: true,
      width: '180px',
    },
    {
      key: 'alamat_domisili',
      title: 'Domicile Address',
      dataIndex: 'alamat_domisili',
      sortable: false,
      width: '220px',
      render: (address: unknown) => {
        return address ? (
          <Text
            size="sm"
            c="dimmed"
            style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {address as string}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        );
      },
    },
    // Additional Information
    {
      key: 'status_perkawinan',
      title: 'Marital Status',
      dataIndex: 'status_perkawinan',
      sortable: true,
      width: '180px',
    },
    {
      key: 'melanjutkan_pendidikan',
      title: 'Continue Education',
      dataIndex: 'melanjutkan_pendidikan',
      sortable: true,
      width: '210px',
      align: 'center',
      render: (value: unknown) => {
        const val = value as string;
        return (
          <Badge variant="light" size="sm" color={val === 'Ya' ? 'green' : 'red'}>
            {val === 'Ya' ? 'Yes' : 'No'}
          </Badge>
        );
      },
    },
    {
      key: 'riwayat_penyakit',
      title: 'Medical History',
      dataIndex: 'riwayat_penyakit',
      sortable: false,
      width: '180px',
      render: (history: unknown) => {
        return history ? (
          <Text
            size="sm"
            c="dimmed"
            style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {history as string}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        );
      },
    },
    // System Information
    {
      key: 'created_at',
      title: 'Applied Date',
      dataIndex: 'created_at',
      sortable: true,
      width: '150px',
      render: (date: unknown) => {
        return formatDefaultDate(date as string);
      },
    },
    {
      key: 'updated_at',
      title: 'Last Updated',
      dataIndex: 'updated_at',
      sortable: true,
      width: '150px',
      render: (date: unknown) => {
        return formatDefaultDate(date as string);
      },
    },
  ];

  // Filter columns based on visibility
  const columns = allColumns.filter((column) => visibleColumns[column.key]);

  // Custom filter header component
  const customFilterHeader = (
    <Group justify="space-between" wrap="wrap" gap="md">
      {/* Status Filter Pills */}
      <StatusFilterPills
        statuses={APPLICANT_DATA_REVIEW_STATUS_LIST}
        selectedStatus={selectedReviewStatus}
        onStatusSelect={handleReviewStatusSelect}
        loading={isLoading}
      />

      {/* Checkbox Filters */}
      <Group gap="sm" wrap="wrap">
        <CheckboxFilter
          label="Jenis Kelamin"
          icon={<IconGenderMale size={16} />}
          options={genderOptions}
          selectedValues={selectedGenders}
          onSelectionChange={handleGenderSelectionChange}
          onClear={() => handleGenderSelectionChange([])}
          placeholder="Select gender"
        />

        <CheckboxFilter
          label="Status Screening"
          icon={<IconRobot size={16} />}
          options={screeningStatusOptions}
          selectedValues={selectedScreeningStatuses}
          onSelectionChange={handleScreeningStatusSelectionChange}
          onClear={() => handleScreeningStatusSelectionChange([])}
          placeholder="Select screening status"
        />
      </Group>
    </Group>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DefaultTable
        rowActionsTitle="nama_lengkap"
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
        searchPlaceholder="Search applications by name, email, program, institution, birth place, domicile, or any other field..."
        emptyMessage="No applications found. Try adjusting your search or filters."
        title={`Applications Management - ${batch?.number} (${batch?.location})`}
        description={`Batch: ${batch?.number_code} | Year: ${batch?.year} | Location: ${batch?.location}`}
        headerActions={(pagination?.total || 0) > 0 ? headerActions : undefined}
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="2000px"
        responsive
        customFilterHeader={customFilterHeader}
        rowDoubleClickAction={(application: ApplicantDataType) =>
          handleViewDetailsInWindow(application)
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (application: ApplicantDataType) => handleViewDetailsInWindow(application),
          },
          {
            label: 'Screening',
            icon: <IconRefresh size={16} />,
            subActions: [
              {
                label: 'Run Screening',
                icon: <IconRefresh size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.screening_status !== APPLICANT_DATA_SCREENING_STATUS.PENDING &&
                  application.screening_status !== APPLICANT_DATA_SCREENING_STATUS.NOT_YET,
                onClick: (application: ApplicantDataType) => handleTriggerScreening(application.id),
              },
              {
                label: 'Run Re-screening',
                icon: <IconReload size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.screening_status === APPLICANT_DATA_SCREENING_STATUS.PENDING ||
                  application.screening_status === APPLICANT_DATA_SCREENING_STATUS.NOT_YET,
                onClick: (application: ApplicantDataType) => handleTriggerScreening(application.id),
              },
            ],
          },
          {
            label: 'Update Review Status',
            icon: <IconEdit size={16} />,
            subActions: [
              {
                label: 'Mark as Pending',
                icon: <IconEdit size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.review_status === APPLICANT_DATA_REVIEW_STATUS.PENDING,
                onClick: (application: ApplicantDataType) =>
                  handleUpdateReviewStatus(application.id, APPLICANT_DATA_REVIEW_STATUS.PENDING),
              },
              {
                label: 'Mark as Stopped',
                icon: <IconEdit size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.review_status === APPLICANT_DATA_REVIEW_STATUS.STOP,
                onClick: (application: ApplicantDataType) =>
                  handleUpdateReviewStatus(application.id, APPLICANT_DATA_REVIEW_STATUS.STOP),
              },
              {
                label: 'Mark as Unreviewed',
                icon: <IconEdit size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.review_status === APPLICANT_DATA_REVIEW_STATUS.UNREVIEWED,
                onClick: (application: ApplicantDataType) =>
                  handleUpdateReviewStatus(application.id, APPLICANT_DATA_REVIEW_STATUS.UNREVIEWED),
              },
              {
                label: 'Mark as Accepted',
                icon: <IconEdit size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.review_status === APPLICANT_DATA_REVIEW_STATUS.ACCEPTED,
                onClick: (application: ApplicantDataType) =>
                  handleUpdateReviewStatus(application.id, APPLICANT_DATA_REVIEW_STATUS.ACCEPTED),
              },
              {
                label: 'Mark as Rejected',
                icon: <IconEdit size={16} />,
                disabled: (application: ApplicantDataType) =>
                  application.review_status === APPLICANT_DATA_REVIEW_STATUS.REJECTED,
                onClick: (application: ApplicantDataType) =>
                  handleUpdateReviewStatus(application.id, APPLICANT_DATA_REVIEW_STATUS.REJECTED),
              },
            ],
          },
        ]}
      />

      {/* Multiple Desktop Windows */}
      {Array.from(openWindows.entries()).map(([windowId, applicationId], index) => {
        // Calculate z-index: focused window gets highest, others get base + index
        const isFocused = focusedWindowId === windowId;
        const baseZIndex = 1000;
        const zIndex = isFocused ? baseZIndex + 1000 + index : baseZIndex + index;

        return (
          <WindowApplicationDetailModal
            key={windowId}
            opened
            onClose={() => handleCloseWindow(windowId)}
            applicationId={applicationId}
            windowId={windowId}
            defaultPosition={{
              x: 100 + index * 50, // Offset each window slightly
              y: 100 + index * 50,
            }}
            zIndex={zIndex}
            onFocus={() => handleWindowFocus(windowId)}
          />
        );
      })}
    </div>
  );
}
