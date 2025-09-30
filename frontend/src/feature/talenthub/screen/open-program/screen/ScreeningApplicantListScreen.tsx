import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconEye, IconFileText } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { ErrorScreenComponent } from '@/components/ErrorScreenComponent';
import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import { PendingScreenComponent } from '@/components/PendingScreenComponent';
import { GlobalGeneratedFilesModal } from '@/feature/talenthub/components/modals/GlobalGeneratedFilesModal';
import { UpdateStatusModal } from '@/feature/talenthub/screen/open-program/components/modals/UpdateStatusModal';
import { WindowScreeningApplicantDetailModal } from '@/feature/talenthub/screen/open-program/components/modals/WindowScreeningApplicantDetailModal';
import { useGetBatchByIdWithQuestionQuery } from '@/hooks/query/batch/useGetBatchByIdWithQuestionQuery';
import { useGenerateScreeningApplicantsExcelMutation } from '@/hooks/query/screening-applicant/useGenerateScreeningApplicantsExcelMutation';
import { useScreeningApplicantsByBatchQuery } from '@/hooks/query/screening-applicant/useScreeningApplicantsByBatchQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { getScoreColorFromValues } from '@/lib/scoreColorUtils';
import { Route } from '@/routes/talenthub/_authenticated/open-programs/$batchId';
import {
  SCREENING_APPLICANT_STATUS,
  SCREENING_APPLICANT_STATUS_LABELS,
  type ScreeningApplicantType,
} from '@/types/screening-applicant.type';

export function ScreeningApplicantListScreen() {
  const navigate = useNavigate();
  const { batchId } = Route.useParams();
  const search = Route.useSearch();
  const [_refreshKey, setRefreshKey] = useState(0);

  // Modal states - support multiple modals
  const [openModals, setOpenModals] = useState<Map<string, ScreeningApplicantType>>(new Map());
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

  // Status update modal state
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    opened: boolean;
    applicant: ScreeningApplicantType | null;
  }>({
    opened: false,
    applicant: null,
  });

  // Global generated files modal state
  const [globalFilesModal, setGlobalFilesModal] = useState({
    opened: false,
  });

  const { data: batchDetailData, isLoading: batchDetailLoading } =
    useGetBatchByIdWithQuestionQuery(batchId);

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
    handlePageSizeChange,
  } = usePaginationConfig({ search, navigate });

  // Separate regular filters from JSON filters
  const regularFilters = appliedFilters.filter((filter) => !filter.column.startsWith('answers.'));
  const jsonFilters = appliedFilters.filter((filter) => filter.column.startsWith('answers.'));

  // Build query params
  const regularQueryParams = {
    ...queryParams,
    filter:
      regularFilters.length > 0
        ? regularFilters
            .map((filter) => `${filter.column}:${filter.value}:${filter.condition}`)
            .join(';')
        : undefined,
    json_filters:
      jsonFilters.length > 0
        ? jsonFilters
            .map((filter) => `${filter.column}:${filter.value}:${filter.condition}`)
            .join(';')
        : undefined,
  };

  const {
    data: screeningApplicantsResponse,
    isLoading,
    error,
    refetch,
  } = useScreeningApplicantsByBatchQuery(
    batch?.id || '',
    regularQueryParams,
    !(batch instanceof Error) && batch?.id !== undefined
  );

  // Excel generation mutation
  const generateExcelMutation = useGenerateScreeningApplicantsExcelMutation();

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  // Header actions for generated files
  const headerActions = (
    <Group gap="sm">
      {/* Generate Excel Button */}
      <Button
        variant="light"
        color="green"
        leftSection={<IconFileText size={16} />}
        onClick={() => batch?.id && generateExcelMutation.mutate(batch.id)}
        loading={generateExcelMutation.isPending}
        disabled={!batch?.id || generateExcelMutation.isPending}
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

  const handleViewDetails = (applicant: ScreeningApplicantType) => {
    const modalId = `modal-${applicant.id}`;
    // console.log('Opening modal for applicant:', applicant.id, modalId);
    setOpenModals((prev) => new Map(prev.set(modalId, applicant)));
  };

  const handleCloseModal = (modalId: string) => {
    setOpenModals((prev) => {
      const newMap = new Map(prev);
      newMap.delete(modalId);
      return newMap;
    });
  };

  const handleOpenStatusUpdate = (applicant: ScreeningApplicantType) => {
    setStatusUpdateModal({
      opened: true,
      applicant,
    });
  };

  const handleCloseStatusUpdate = () => {
    setStatusUpdateModal({
      opened: false,
      applicant: null,
    });
  };

  const handleStatusUpdateSuccess = (updatedApplicant?: ScreeningApplicantType) => {
    refetch();

    // Update the applicant data in open modals if provided
    if (updatedApplicant) {
      setOpenModals((prev) => {
        const newMap = new Map(prev);
        // Find and update the modal with the matching applicant ID
        for (const [modalId, applicant] of newMap.entries()) {
          if (applicant.id === updatedApplicant.id) {
            newMap.set(modalId, updatedApplicant);
            break;
          }
        }
        return newMap;
      });
    }
  };

  const handleWindowFocus = (modalId: string) => {
    setFocusedWindowId(modalId);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case SCREENING_APPLICANT_STATUS.PENDING:
        return { bg: '#fff3cd', color: '#856404' };
      case SCREENING_APPLICANT_STATUS.SCORED:
        return { bg: '#d1ecf1', color: '#0c5460' };
      case SCREENING_APPLICANT_STATUS.APPROVED:
        return { bg: '#d4edda', color: '#155724' };
      case SCREENING_APPLICANT_STATUS.REJECTED:
        return { bg: '#f8d7da', color: '#721c24' };
      default:
        return { bg: '#f8f9fa', color: '#6c757d' };
    }
  };

  const formatScore = (score: number | null, maxScore: number | null) => {
    if (score === null || maxScore === null || maxScore === 0) {
      return (
        <Badge variant="light" color="gray">
          -
        </Badge>
      );
    }
    const percentage = ((score / maxScore) * 100).toFixed(1);
    const color = getScoreColorFromValues(score, maxScore);
    return (
      <Badge variant="light" color={color} size="sm">
        {score}/{maxScore} ({percentage}%)
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to get answer for a specific question
  const getAnswerForQuestion = (applicant: ScreeningApplicantType, questionCode: string) => {
    const answerObj = applicant.answers.find((answer) => answer.question_code === questionCode);
    return answerObj?.answer || '-';
  };

  // Helper function to format answer display
  const formatAnswer = (answer: unknown) => {
    if (answer === null || answer === undefined) {
      return '-';
    }

    if (typeof answer === 'string') {
      // Truncate long text answers
      if (answer.length > 50) {
        return `${answer.substring(0, 50)}...`;
      }
      return answer;
    }

    if (typeof answer === 'number') {
      return answer.toString();
    }

    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }

    return String(answer);
  };

  const columns: TableColumn<ScreeningApplicantType>[] = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '80px',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>
          {String(value).slice(-8)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: '100px',
      sortable: true,
      render: (value) => {
        const colors = getStatusColor(value as number);
        return (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8em',
              fontWeight: 500,
              backgroundColor: colors.bg,
              color: colors.color,
            }}>
            {
              SCREENING_APPLICANT_STATUS_LABELS[
                value as keyof typeof SCREENING_APPLICANT_STATUS_LABELS
              ]
            }
          </span>
        );
      },
    },
    {
      key: 'total_score',
      title: 'Score',
      dataIndex: 'total_score',
      width: '120px',
      sortable: true,
      render: (value, record) => formatScore(value as number | null, record.max_score),
    },
    // {
    //   key: 'total_marking',
    //   title: 'Marking',
    //   dataIndex: 'total_marking',
    //   width: '100px',
    //   sortable: true,
    //   render: (value) => (value as number | null) || '-',
    // },
    // {
    //   key: 'total_ai_scoring',
    //   title: 'AI Score',
    //   dataIndex: 'total_ai_scoring',
    //   width: '100px',
    //   sortable: true,
    //   render: (value) => (value as number | null) || '-',
    // },
    {
      key: 'created_at',
      title: 'Submitted',
      dataIndex: 'created_at',
      width: '140px',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    // Dynamic question columns
    ...(batch?.questions?.map((question) => ({
      key: `question_${question.code}`,
      title: question.label,
      dataIndex: `answers.${question.code}`,
      width: '150px',
      sortable: false, // Re-enabled with safer JSON validation approach
      render: (_value: unknown, record: ScreeningApplicantType) => {
        const answer = getAnswerForQuestion(record, question.code);
        return <span style={{ fontSize: '0.85em' }}>{formatAnswer(answer)}</span>;
      },
    })) || []),
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      width: '120px',
      sortable: false,
      align: 'center',
      render: (_id: unknown, record: ScreeningApplicantType) => (
        <Group gap="xs" justify="center">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" size="sm" onClick={() => handleViewDetails(record)}>
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Update Status">
            <ActionIcon variant="subtle" size="sm" onClick={() => handleOpenStatusUpdate(record)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  const rowActions = [
    {
      label: 'View Details',
      icon: <IconEye size={16} />,
      onClick: handleViewDetails,
      color: 'blue',
    },
    {
      label: 'Update Status',
      icon: <IconEdit size={16} />,
      onClick: handleOpenStatusUpdate,
      color: 'orange',
    },
  ];

  // Filter options for the table
  const filterOptions: FilterOption[] = [
    {
      column: 'status',
      label: 'Status',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
      options: [
        { value: '0', label: 'Pending' },
        { value: '1', label: 'Scored' },
        { value: '2', label: 'Approved' },
        { value: '3', label: 'Rejected' },
      ],
    },
    {
      column: 'total_score',
      label: 'Total Score',
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
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
      ],
    },
    {
      column: 'total_marking',
      label: 'Total Marking',
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
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
      ],
    },
    {
      column: 'total_ai_scoring',
      label: 'AI Scoring',
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
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
      ],
    },
    {
      column: 'ip_address',
      label: 'IP Address',
      type: 'text',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'like', label: 'Contains' },
        { value: 'not_like', label: 'Does not contain' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
      ],
    },
    {
      column: 'created_at',
      label: 'Submitted Date',
      type: 'date',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'gt', label: 'After' },
        { value: 'gte', label: 'On or after' },
        { value: 'lt', label: 'Before' },
        { value: 'lte', label: 'On or before' },
        { value: 'between', label: 'Between' },
        { value: 'not_between', label: 'Not between' },
      ],
    },
    // Dynamic answer filters based on batch questions
    ...(batch?.questions?.map((question) => {
      const getFilterType = (
        questionType: string
      ): 'text' | 'select' | 'number' | 'date' | 'multiselect' => {
        switch (questionType) {
          case 'number':
            return 'number';
          case 'date':
            return 'date';
          case 'radio':
          case 'select':
            return 'select';
          case 'checkbox':
            return 'multiselect';
          default:
            return 'text';
        }
      };

      return {
        column: `answers.${question.code}`,
        label: question.label,
        type: getFilterType(question.type),
        conditions:
          question.type === 'number'
            ? [
                { value: 'eq', label: 'Equals' },
                { value: 'neq', label: 'Not equals' },
                { value: 'gt', label: 'Greater than' },
                { value: 'gte', label: 'Greater than or equal' },
                { value: 'lt', label: 'Less than' },
                { value: 'lte', label: 'Less than or equal' },
                { value: 'between', label: 'Between' },
                { value: 'not_between', label: 'Not between' },
                { value: 'null', label: 'Is empty' },
                { value: 'not_null', label: 'Is not empty' },
              ]
            : question.type === 'date'
              ? [
                  { value: 'eq', label: 'Equals' },
                  { value: 'neq', label: 'Not equals' },
                  { value: 'gt', label: 'After' },
                  { value: 'gte', label: 'On or after' },
                  { value: 'lt', label: 'Before' },
                  { value: 'lte', label: 'On or before' },
                  { value: 'between', label: 'Between' },
                  { value: 'not_between', label: 'Not between' },
                ]
              : [
                  { value: 'eq', label: 'Equals' },
                  { value: 'neq', label: 'Not equals' },
                  { value: 'like', label: 'Contains' },
                  { value: 'not_like', label: 'Does not contain' },
                  { value: 'in', label: 'In list' },
                  { value: 'not_in', label: 'Not in list' },
                  { value: 'null', label: 'Is empty' },
                  { value: 'not_null', label: 'Is not empty' },
                ],
        options: question.options?.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      };
    }) || []),
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DefaultTable
        rowActions={rowActions}
        backButton={
          <Link to="/talenthub/open-programs">
            <ActionIcon variant="subtle" size="lg">
              <IconArrowLeft size={48} />
            </ActionIcon>
          </Link>
        }
        title={`Screening Applicants - ${batch.number} (${batch.location})`}
        description={`Batch: ${batch.number_code} | Year: ${batch.year} | Location: ${batch.location}`}
        headerActions={
          (screeningApplicantsResponse?.pagination?.total || 0) > 0 ? headerActions : undefined
        }
        columns={columns}
        data={screeningApplicantsResponse?.data || []}
        loading={isLoading}
        error={error?.message}
        pagination={screeningApplicantsResponse?.pagination}
        searchValue={tempSearch}
        onSearchChange={setTempSearch}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        sortBy={queryParams.sort_by || 'id'}
        sortOrder={queryParams.order || 'asc'}
        onRefresh={handleRefresh}
        searchPlaceholder="Search by IP address, status, or any answer..."
        emptyMessage="No screening applicants found for this batch"
        minTableWidth="1200px"
        filterOptions={filterOptions}
        appliedFilters={appliedFilters}
        onFilterAdd={handleFilterAdd}
        onFilterRemove={handleFilterRemove}
        onFilterClear={handleFilterClear}
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        responsive
      />

      {/* Multiple Desktop Windows */}
      {Array.from(openModals.entries()).map(([modalId, applicant], index) => {
        // Calculate z-index: focused window gets highest, others get base + index
        const isFocused = focusedWindowId === modalId;
        const baseZIndex = 1000;
        const zIndex = isFocused ? baseZIndex + 1000 + index : baseZIndex + index;

        return (
          <WindowScreeningApplicantDetailModal
            key={modalId}
            opened
            onClose={() => handleCloseModal(modalId)}
            applicantId={applicant.id}
            batchQuestions={batch?.questions?.map((q) => ({
              id: q.id,
              question_id: q.question_id || q.id,
              code: q.code,
              label: q.label,
            }))}
            windowId={modalId}
            defaultPosition={{
              x: 100 + index * 50, // Offset each window slightly
              y: 100 + index * 50,
            }}
            zIndex={zIndex}
            onStatusUpdate={handleStatusUpdateSuccess}
            onFocus={() => handleWindowFocus(modalId)}
          />
        );
      })}

      {/* Status Update Modal */}
      <UpdateStatusModal
        opened={statusUpdateModal.opened}
        onClose={handleCloseStatusUpdate}
        applicant={statusUpdateModal.applicant}
        onSuccess={handleStatusUpdateSuccess}
      />

      {/* Global Generated Files Modal */}
      <GlobalGeneratedFilesModal
        opened={globalFilesModal.opened}
        onClose={() => setGlobalFilesModal({ opened: false })}
        batchId={batch?.id}
        title={`Generated Files - ${batch.number} (${batch.location})`}
        defaultFilters={{
          type: 'screening-applicants-by-batch',
          model_id: batch?.id,
        }}
        defaultSearch={batch?.id || ''}
      />
    </div>
  );
}
