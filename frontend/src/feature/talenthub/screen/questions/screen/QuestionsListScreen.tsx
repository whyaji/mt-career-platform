import { ActionIcon, Badge, Button, Group, Tooltip } from '@mantine/core';
import { IconCopy, IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { DefaultTable, type FilterOption, type TableColumn } from '@/components/DefaultTable';
import { QuestionDeleteModal } from '@/feature/talenthub/screen/questions/components/modals/QuestionDeleteModal';
import { QuestionDetailModal } from '@/feature/talenthub/screen/questions/components/modals/QuestionDetailModal';
import { QuestionDuplicateModal } from '@/feature/talenthub/screen/questions/components/modals/QuestionDuplicateModal';
import { QuestionFormModal } from '@/feature/talenthub/screen/questions/components/modals/QuestionFormModal';
import { useCreateQuestionQuery } from '@/hooks/query/question/useCreateQuestionQuery';
import { useDeleteQuestionQuery } from '@/hooks/query/question/useDeleteQuestionQuery';
import { useDuplicateQuestionQuery } from '@/hooks/query/question/useDuplicateQuestionQuery';
import { useGetQuestionByIdQuery } from '@/hooks/query/question/useGetQuestionByIdQuery';
import { useIconsQuery } from '@/hooks/query/question/useQuestionMetadataQuery';
import { useQuestionsQuery } from '@/hooks/query/question/useQuestionsQuery';
import { useUpdateQuestionQuery } from '@/hooks/query/question/useUpdateQuestionQuery';
import { usePaginationConfig } from '@/hooks/usePaginationConfig.hook';
import { Route } from '@/routes/talenthub/_authenticated/questions/index';
import type { QuestionFormData, QuestionType } from '@/types/question.type';

export function QuestionsListScreen() {
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
  const [duplicateModalOpened, setDuplicateModalOpened] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(null);

  // Use TanStack Query for data fetching
  const { data: queryData, isLoading, error, isError, refetch } = useQuestionsQuery(queryParams);
  const { data: iconsData } = useIconsQuery();

  // Mutations
  const createQuestionMutation = useCreateQuestionQuery();
  const updateQuestionMutation = useUpdateQuestionQuery();
  const deleteQuestionMutation = useDeleteQuestionQuery();
  const duplicateQuestionMutation = useDuplicateQuestionQuery();

  // Get question details query (only when needed)
  const { data: questionDetailData, isLoading: questionDetailLoading } = useGetQuestionByIdQuery(
    selectedQuestion?.id || ''
  );

  // Extract data from query response
  const data = queryData?.data || [];
  const pagination = queryData?.pagination;
  const errorMessage = isError ? (error as Error)?.message || 'An error occurred' : null;

  const icons = iconsData?.success && 'data' in iconsData ? iconsData.data : {};

  // Handler functions
  const handleViewDetails = (question: QuestionType) => {
    setSelectedQuestion(question);
    setDetailModalOpened(true);
  };

  const handleEdit = (question: QuestionType) => {
    setSelectedQuestion(question);
    setFormModalOpened(true);
  };

  const handleDelete = (question: QuestionType) => {
    setSelectedQuestion(question);
    setDeleteModalOpened(true);
  };

  const handleDuplicate = (question: QuestionType) => {
    setSelectedQuestion(question);
    setDuplicateModalOpened(true);
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    if (selectedQuestion) {
      await updateQuestionMutation.mutateAsync({ id: selectedQuestion.id, data });
    } else {
      await createQuestionMutation.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedQuestion) {
      await deleteQuestionMutation.mutateAsync(selectedQuestion.id);
    }
  };

  const handleDuplicateConfirm = async (newCode: string) => {
    if (selectedQuestion) {
      await duplicateQuestionMutation.mutateAsync({ id: selectedQuestion.id, newCode });
    }
  };

  // Filter options for the table
  const filterOptions: FilterOption[] = [
    {
      column: 'type',
      label: 'Type',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'in', label: 'In list' },
        { value: 'not_in', label: 'Not in list' },
      ],
    },
    {
      column: 'group',
      label: 'Group',
      type: 'text',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'like', label: 'Contains' },
        { value: 'not_like', label: 'Does not contain' },
        { value: 'null', label: 'Is empty' },
        { value: 'not_null', label: 'Is not empty' },
      ],
    },
    {
      column: 'required',
      label: 'Required',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
    },
    {
      column: 'is_active',
      label: 'Active Status',
      type: 'select',
      conditions: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
      ],
    },
  ];

  // Table columns configuration
  const columns: TableColumn<QuestionType>[] = [
    {
      key: 'code',
      title: 'Code',
      dataIndex: 'code',
      sortable: true,
      width: '150px',
    },
    {
      key: 'label',
      title: 'Label',
      dataIndex: 'label',
      sortable: true,
      width: '200px',
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      sortable: true,
      width: '120px',
      render: (type: unknown) => {
        const getTypeColor = (type: string) => {
          const colors: Record<string, string> = {
            text: 'blue',
            textarea: 'cyan',
            number: 'green',
            email: 'orange',
            tel: 'red',
            url: 'purple',
            password: 'gray',
            select: 'indigo',
            multiselect: 'violet',
            radio: 'pink',
            checkbox: 'grape',
            date: 'teal',
            time: 'lime',
            datetime: 'yellow',
            file: 'amber',
            hidden: 'dark',
          };
          return colors[type] || 'blue';
        };

        return (
          <Badge variant="light" color={getTypeColor(type as string)}>
            {String(type)}
          </Badge>
        );
      },
    },
    {
      key: 'group',
      title: 'Group',
      dataIndex: 'group',
      sortable: true,
      width: '120px',
      render: (group: unknown) => {
        if (!group) {
          return (
            <Badge variant="outline" size="sm">
              No Group
            </Badge>
          );
        }
        return (
          <Badge variant="light" size="sm">
            {String(group)}
          </Badge>
        );
      },
    },
    {
      key: 'icon',
      title: 'Icon',
      dataIndex: 'icon',
      sortable: true,
      width: '120px',
      render: (icon: unknown, _record: QuestionType) => {
        if (!icon) {
          return (
            <Badge variant="outline" size="sm">
              No Icon
            </Badge>
          );
        }
        const iconLabel = icons?.[icon as string] || icon;
        return (
          <Tooltip label={`${icon} - ${iconLabel}`}>
            <Badge variant="light" size="sm" color="blue">
              {String(icon)}
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      key: 'options',
      title: 'Options',
      dataIndex: 'options',
      render: (options: unknown) => {
        if (!options || !Array.isArray(options)) {
          return '-';
        }

        if (options.length === 0) {
          return '-';
        }

        // Handle object options with label and value
        const optionsText = options
          .map((option) => {
            if (typeof option === 'object' && option !== null && 'label' in option) {
              return (option as { label: string }).label;
            }
            return String(option);
          })
          .join(', ');

        return (
          <Tooltip label={optionsText}>
            <Badge variant="outline" size="sm">
              {options.length} option{options.length !== 1 ? 's' : ''}
            </Badge>
          </Tooltip>
        );
      },
      width: '100px',
    },
    {
      key: 'display_order',
      title: 'Order',
      dataIndex: 'display_order',
      sortable: true,
      width: '80px',
      align: 'center',
    },
    {
      key: 'properties',
      title: 'Properties',
      dataIndex: 'id',
      render: (_id: unknown, record: QuestionType) => (
        <Group gap="xs">
          {record.required && (
            <Badge variant="light" color="green" size="xs">
              Required
            </Badge>
          )}
          {record.has_custom_other_input && (
            <Badge variant="light" color="purple" size="xs">
              Custom Input
            </Badge>
          )}
        </Group>
      ),
      width: '120px',
    },
    {
      key: 'is_active',
      title: 'Status',
      dataIndex: 'is_active',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (isActive: unknown) => {
        return (
          <Badge variant="light" size="sm" color={isActive ? 'green' : 'red'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      render: (_id: unknown, record: QuestionType) => (
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
          <Tooltip label="Duplicate">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="blue"
              onClick={() => handleDuplicate(record)}>
              <IconCopy size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red" onClick={() => handleDelete(record)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      width: '140px',
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
        searchPlaceholder="Search questions by code, label, type, or group..."
        emptyMessage="No questions found. Try adjusting your search or filters."
        title="Questions Management"
        description="Manage master questions for dynamic forms"
        showTotal
        pageSizeOptions={[5, 10, 15, 25, 50]}
        onPageSizeChange={handlePageSizeChange}
        minTableWidth="1520px"
        responsive
        headerActions={
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add New Question
          </Button>
        }
        rowActions={[
          {
            label: 'View Details',
            icon: <IconEye size={16} />,
            onClick: (question: QuestionType) => handleViewDetails(question),
          },
          {
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: (question: QuestionType) => handleEdit(question),
          },
          {
            label: 'Duplicate',
            icon: <IconCopy size={16} />,
            color: 'blue',
            onClick: (question: QuestionType) => handleDuplicate(question),
          },
          {
            label: 'Delete',
            icon: <IconTrash size={16} />,
            color: 'red',
            onClick: (question: QuestionType) => handleDelete(question),
          },
        ]}
      />

      {/* Modals */}
      <QuestionDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        question={
          questionDetailData?.success && 'data' in questionDetailData
            ? (questionDetailData.data ?? null)
            : selectedQuestion
        }
        loading={questionDetailLoading}
      />

      <QuestionFormModal
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        question={selectedQuestion}
        onSubmit={handleFormSubmit}
        loading={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        title={selectedQuestion ? 'Edit Question' : 'Create New Question'}
      />

      <QuestionDeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        question={selectedQuestion}
        onConfirm={handleDeleteConfirm}
        loading={deleteQuestionMutation.isPending}
      />

      <QuestionDuplicateModal
        opened={duplicateModalOpened}
        onClose={() => setDuplicateModalOpened(false)}
        question={selectedQuestion}
        onConfirm={handleDuplicateConfirm}
        loading={duplicateQuestionMutation.isPending}
      />
    </div>
  );
}
