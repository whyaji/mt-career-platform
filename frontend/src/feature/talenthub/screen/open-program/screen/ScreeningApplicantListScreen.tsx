import { ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { DefaultTable, type TableColumn } from '@/components/DefaultTable';
import { ErrorScreenComponent } from '@/components/ErrorScreenComponent';
import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import { PendingScreenComponent } from '@/components/PendingScreenComponent';
import { useGetBatchByIdWithQuestionQuery } from '@/hooks/query/batch/useGetBatchByIdWithQuestionQuery';
import { useScreeningApplicantsByBatchQuery } from '@/hooks/query/screening-applicant/useScreeningApplicantsByBatchQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
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

  const { data: batchDetailData, isLoading: batchDetailLoading } =
    useGetBatchByIdWithQuestionQuery(batchId);

  const batch =
    batchDetailData?.success && 'data' in batchDetailData ? batchDetailData.data : undefined;

  const { tempSearch, setTempSearch, queryParams, handlePageChange, handleSortChange } =
    usePaginationConfig({ search, navigate });

  const {
    data: screeningApplicantsResponse,
    isLoading,
    error,
    refetch,
  } = useScreeningApplicantsByBatchQuery(
    batch?.id || '',
    queryParams,
    !(batch instanceof Error) && batch?.id !== undefined
  );

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
      return '-';
    }
    const percentage = ((score / maxScore) * 100).toFixed(1);
    return `${score}/${maxScore} (${percentage}%)`;
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
    {
      key: 'total_marking',
      title: 'Marking',
      dataIndex: 'total_marking',
      width: '100px',
      sortable: true,
      render: (value) => (value as number | null) || '-',
    },
    {
      key: 'total_ai_scoring',
      title: 'AI Score',
      dataIndex: 'total_ai_scoring',
      width: '100px',
      sortable: true,
      render: (value) => (value as number | null) || '-',
    },
    {
      key: 'ip_address',
      title: 'IP Address',
      dataIndex: 'ip_address',
      width: '120px',
      sortable: true,
      render: (value) => (value as string | null) || '-',
    },
    {
      key: 'created_at',
      title: 'Submitted',
      dataIndex: 'created_at',
      width: '140px',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DefaultTable
        backButton={
          <Link to="/talenthub/open-programs">
            <ActionIcon variant="subtle" size="lg">
              <IconArrowLeft size={48} />
            </ActionIcon>
          </Link>
        }
        title={`Screening Applicants - ${batch.number} (${batch.location})`}
        description={`Batch: ${batch.number_code} | Year: ${batch.year} | Location: ${batch.location}`}
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
        searchPlaceholder="Search by IP address or status..."
        emptyMessage="No screening applicants found for this batch"
        minTableWidth="800px"
      />
    </div>
  );
}
