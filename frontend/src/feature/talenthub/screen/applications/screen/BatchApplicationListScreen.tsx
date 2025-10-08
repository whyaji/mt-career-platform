import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { DefaultTable, type TableColumn } from '@/components/DefaultTable';
import { useOpenProgramsQuery } from '@/hooks/query/open-programs/useOpenProgramsQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/applications';
import type { BatchType } from '@/types/batch.type';

export function BatchApplicationListScreen() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [_refreshKey, setRefreshKey] = useState(0);

  const { tempSearch, setTempSearch, queryParams, handlePageChange, handleSortChange } =
    usePaginationConfig({ search, navigate });

  const {
    data: openProgramsResponse,
    isLoading,
    error,
    refetch,
  } = useOpenProgramsQuery(queryParams);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  const handleViewApplicants = (batch: BatchType) => {
    navigate({
      to: '/talenthub/applications/$batchId',
      params: { batchId: batch.id },
    });
  };

  const columns: TableColumn<BatchType>[] = [
    {
      key: 'program_category',
      title: 'Program Category',
      dataIndex: 'program_category.name', // Use this for sorting
      width: '200px',
      sortable: true,
      render: (_value, record) => {
        const programCategory = (record as BatchType).program_category;
        if (
          !programCategory ||
          typeof programCategory !== 'object' ||
          !('name' in programCategory) ||
          !('code' in programCategory)
        ) {
          return '-';
        }
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{String(programCategory.name)}</div>
            <div style={{ fontSize: '0.8em', color: '#666' }}>{String(programCategory.code)}</div>
          </div>
        );
      },
    },
    {
      key: 'program_category_code',
      title: 'Category Code',
      dataIndex: 'program_category.code', // Use this for sorting by code
      width: '120px',
      sortable: true,
      render: (_value, record) => {
        const programCategory = (record as BatchType).program_category;
        if (
          !programCategory ||
          typeof programCategory !== 'object' ||
          !('code' in programCategory)
        ) {
          return '-';
        }
        return <span style={{ fontWeight: 500 }}>{String(programCategory.code)}</span>;
      },
    },
    {
      key: 'number',
      title: 'Batch Number',
      dataIndex: 'number',
      sortable: true,
      width: '120px',
      render: (value) => <strong>{String(value)}</strong>,
    },
    {
      key: 'number_code',
      title: 'Code',
      dataIndex: 'number_code',
      sortable: true,
      width: '100px',
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
    },
    {
      key: 'year',
      title: 'Year',
      dataIndex: 'year',
      sortable: true,
      width: '80px',
    },
    {
      key: 'institutes',
      title: 'Institutes',
      dataIndex: 'institutes',
      width: '200px',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return '-';
        }
        return (
          <div>
            {value.slice(0, 2).map((institute: string, index: number) => (
              <div key={index} style={{ fontSize: '0.9em' }}>
                {institute}
              </div>
            ))}
            {value.length > 2 && (
              <div style={{ fontSize: '0.8em', color: '#666' }}>+{value.length - 2} more</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: '100px',
      render: (value) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8em',
            fontWeight: 500,
            backgroundColor: value === 1 ? '#e7f5e7' : '#f5f5f5',
            color: value === 1 ? '#2d5a2d' : '#666',
          }}>
          {value === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_id: unknown, record: BatchType) => (
        <Group gap="xs">
          <Tooltip label="View Applicant">
            <Link to={`/talenthub/applications/${record.id}` as never}>
              <ActionIcon variant="subtle" size="sm">
                <IconEye size={16} />
              </ActionIcon>
            </Link>
          </Tooltip>
        </Group>
      ),
      width: '60px',
      align: 'center',
    },
  ];

  const rowActions = [
    {
      icon: <IconEye size={16} />,
      label: 'View Applicants',
      onClick: handleViewApplicants,
      color: 'blue',
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DefaultTable
        title="Batch Applications"
        description="Manage and view batch applications"
        columns={columns}
        data={openProgramsResponse?.data || []}
        loading={isLoading}
        error={error?.message}
        pagination={openProgramsResponse?.pagination}
        searchValue={tempSearch}
        onSearchChange={setTempSearch}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        sortBy={queryParams.sort_by || 'id'}
        sortOrder={queryParams.order || 'asc'}
        onRefresh={handleRefresh}
        rowActions={rowActions}
        searchPlaceholder="Search by batch number, location, year, or program category..."
        emptyMessage="No batch applications found"
        minTableWidth="1000px"
      />
    </div>
  );
}
