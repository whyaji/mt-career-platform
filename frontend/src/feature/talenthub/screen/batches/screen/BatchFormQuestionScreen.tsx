import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconEdit,
  IconMapPin,
  IconPlus,
  IconQuestionMark,
  IconRotateClockwise,
  IconSettings,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

import { useAvailableQuestionsQuery } from '@/hooks/query/batch-question/useAvailableQuestionsQuery';
import { useBatchQuestionsQuery } from '@/hooks/query/batch-question/useBatchQuestionsQuery';
import { useBulkBatchQuestionOperationsMutation } from '@/hooks/query/batch-question/useBulkBatchQuestionOperationsMutation';
import { type LocalBatchQuestion, useBatchQuestionStore } from '@/lib/store/batchQuestionStore';
import { Route } from '@/routes/talenthub/_authenticated/batches/$batchId/form-question';
import type { PaginationParams } from '@/types/pagination.type';
import type { BatchQuestionType } from '@/types/question.type';

export function BatchFormQuestionScreen() {
  const batch = Route.useLoaderData();

  // Zustand store
  const {
    isEditMode,
    localQuestions,
    selectedQuestions,
    editingQuestion,
    bulkModalOpened,
    setSelectedQuestions,
    setEditingQuestion,
    setBulkModalOpened,
    enterEditMode,
    exitEditMode,
    addLocalQuestion,
    updateLocalQuestion,
    removeLocalQuestion,
    hasChanges,
    getPendingOperations,
    cancelForm,
  } = useBatchQuestionStore();

  // Confirmation modal states
  const [resetConfirmOpened, setResetConfirmOpened] = useState(false);
  const [cancelConfirmOpened, setCancelConfirmOpened] = useState(false);
  const [deleteQuestionConfirm, setDeleteQuestionConfirm] = useState<{
    opened: boolean;
    question: LocalBatchQuestion | BatchQuestionType | null;
  }>({ opened: false, question: null });

  // Pagination state - using high limit to get all questions
  const [paginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 9999,
    sort_by: 'display_order',
    order: 'asc',
  });

  // Queries
  const { data: batchQuestionsResponse, isLoading: batchQuestionsLoading } = useBatchQuestionsQuery(
    batch.id,
    paginationParams
  );
  const { data: availableQuestions } = useAvailableQuestionsQuery(batch.id);

  const batchQuestions =
    batchQuestionsResponse?.success && 'data' in batchQuestionsResponse
      ? batchQuestionsResponse.data || []
      : [];

  const availableQuestionsData =
    availableQuestions?.success && 'data' in availableQuestions
      ? availableQuestions.data || []
      : [];

  // Mutations
  const bulkOperationsMutation = useBulkBatchQuestionOperationsMutation(batch.id);

  // Get current questions to display (local questions in edit mode, or server questions in view mode)
  const currentQuestions = isEditMode ? localQuestions : batchQuestions;

  // Edit mode handlers
  const handleEnterEditMode = () => {
    enterEditMode(batchQuestions);
  };

  // Removed handleExitEditMode as it's not used

  const handleSaveChanges = async () => {
    const operations = getPendingOperations();
    if (operations.length === 0) {
      notifications.show({
        title: 'No Changes',
        message: 'No changes to save',
        color: 'blue',
        icon: <IconCheck size={16} />,
      });
      return;
    }

    try {
      const response = await bulkOperationsMutation.mutateAsync(operations);
      if (response.success && 'data' in response && response.data) {
        const { data } = response;

        // Show success notification with details
        notifications.show({
          title: 'Bulk Operations Completed',
          message: `Successfully processed ${data.total_processed} operations: ${data.created_count} created, ${data.updated_count} updated, ${data.deleted_count} deleted`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Show error details if any
        if (data.error_count > 0) {
          notifications.show({
            title: 'Some Operations Failed',
            message: `${data.error_count} operations failed. Check the details for more information.`,
            color: 'orange',
            icon: <IconX size={16} />,
          });
        }
        // Invalidate and refetch batch questions
      } else {
        notifications.show({
          title: 'Bulk Operations Failed',
          message: response.message || 'Failed to process bulk operations',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
      exitEditMode();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save changes',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleResetChanges = () => {
    setResetConfirmOpened(true);
  };

  const handleConfirmReset = () => {
    enterEditMode(batchQuestions); // Reset to original state
    setResetConfirmOpened(false);
  };

  const handleCancelChanges = () => {
    if (hasChanges()) {
      setCancelConfirmOpened(true);
    } else {
      cancelForm();
    }
  };

  const handleConfirmCancel = () => {
    cancelForm();
    setCancelConfirmOpened(false);
  };

  // Local question handlers
  const handleLocalRemoveQuestion = (localId: string) => {
    removeLocalQuestion(localId);
  };

  const handleLocalUpdateQuestion = (localId: string, updates: Partial<LocalBatchQuestion>) => {
    updateLocalQuestion(localId, updates);
  };

  const handleAddQuestionToLocal = (questionId: string) => {
    const question = availableQuestionsData.find((q) => q.id === questionId);
    if (question) {
      const maxOrder = Math.max(...currentQuestions.map((q) => q.display_order || 0), 0);
      addLocalQuestion({
        batch_id: batch.id,
        question_id: questionId,
        display_order: maxOrder + 1,
        is_required: false,
        is_active: true,
        batch_specific_options: undefined,
        batch_specific_validation: undefined,
        batch_specific_scoring: undefined,
        question,
      });
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    const question = currentQuestions.find((q) => q.question_id === questionId);
    if (question) {
      setDeleteQuestionConfirm({ opened: true, question });
    }
  };

  const handleConfirmDeleteQuestion = () => {
    if (deleteQuestionConfirm.question) {
      const questionId = deleteQuestionConfirm.question.question_id;
      if (isEditMode) {
        // In edit mode, find the local question and remove it
        const localQuestion = localQuestions.find((q) => q.question_id === questionId);
        if (localQuestion) {
          handleLocalRemoveQuestion(localQuestion.localId);
        }
      } else {
        // In view mode, enter edit mode first, then remove
        enterEditMode(batchQuestions);
        const localQuestion = localQuestions.find((q) => q.question_id === questionId);
        if (localQuestion) {
          handleLocalRemoveQuestion(localQuestion.localId);
        }
      }
    }
    setDeleteQuestionConfirm({ opened: false, question: null });
  };

  const handleBulkAssign = () => {
    if (selectedQuestions.length === 0) {
      return;
    }

    if (isEditMode) {
      // In edit mode, add questions locally
      selectedQuestions.forEach((questionId) => {
        handleAddQuestionToLocal(questionId);
      });
      setSelectedQuestions([]);
      setBulkModalOpened(false);
      notifications.show({
        title: 'Questions Added',
        message: `${selectedQuestions.length} questions added to local setup`,
        color: 'blue',
        position: 'bottom-center',
        icon: <IconCheck size={16} />,
      });
    } else {
      // In view mode, enter edit mode first, then add questions
      enterEditMode(batchQuestions);
      selectedQuestions.forEach((questionId) => {
        handleAddQuestionToLocal(questionId);
      });
      setSelectedQuestions([]);
      setBulkModalOpened(false);
      notifications.show({
        title: 'Edit Mode Started',
        message: `${selectedQuestions.length} questions added to setup. Make your changes and save when ready.`,
        color: 'blue',
        icon: <IconCheck size={16} />,
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateQuestion = (questionId: string, updates: any) => {
    if (isEditMode) {
      // In edit mode, update locally
      const localQuestion = localQuestions.find((q) => q.question_id === questionId);
      if (localQuestion) {
        handleLocalUpdateQuestion(localQuestion.localId, updates);
      }
    } else {
      // In view mode, enter edit mode first, then update
      enterEditMode(batchQuestions);
      const localQuestion = localQuestions.find((q) => q.question_id === questionId);
      if (localQuestion) {
        handleLocalUpdateQuestion(localQuestion.localId, updates);
      }
    }
  };

  return (
    <Container
      size="xl"
      py="md"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Questions List */}
      <Card withBorder radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card.Section p="md" withBorder>
          <Group justify="space-between">
            <Group gap="xs">
              <IconQuestionMark size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="lg">
                {isEditMode ? 'Setup Questions' : 'Assigned Questions'}
              </Text>
              <Badge variant="light" color="blue">
                {currentQuestions.length}
              </Badge>
              {isEditMode && hasChanges() && (
                <Badge variant="light" color="orange">
                  {getPendingOperations().length} changes
                </Badge>
              )}
            </Group>

            {/* Edit Mode Controls */}
            {!isEditMode ? (
              <Button
                size="sm"
                variant="outline"
                leftSection={<IconEdit size={14} />}
                onClick={handleEnterEditMode}
                disabled={batchQuestions.length === 0}>
                Edit Setup
              </Button>
            ) : (
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="outline"
                  leftSection={<IconRotateClockwise size={14} />}
                  onClick={handleResetChanges}
                  disabled={!hasChanges()}>
                  Reset
                </Button>
                <Button size="sm" variant="outline" color="red" onClick={handleCancelChanges}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  leftSection={<IconCheck size={14} />}
                  onClick={handleSaveChanges}
                  disabled={!hasChanges()}
                  loading={bulkOperationsMutation.isPending}>
                  Save Changes
                </Button>
              </Group>
            )}
          </Group>
        </Card.Section>

        <Card.Section style={{ flex: 1, minHeight: 0 }}>
          {batchQuestionsLoading ? (
            <Group justify="center" py="xl" px="md">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading questions...
              </Text>
            </Group>
          ) : currentQuestions.length === 0 ? (
            <Box ta="center" py="xl" px="md">
              <IconQuestionMark size={48} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed" mt="md">
                {isEditMode
                  ? 'No questions in setup yet'
                  : 'No questions assigned to this batch yet'}
              </Text>
              <Text size="sm" c="dimmed">
                Use the "Add Questions" button to add questions to your setup. Make your changes and
                save when ready.
              </Text>
            </Box>
          ) : (
            <ScrollArea
              h="100%"
              styles={{
                scrollbar: {
                  '&[dataOrientation="vertical"] .mantineScrollAreaThumb': {
                    backgroundColor: 'var(--mantine-color-gray-8)',
                  },
                },
              }}>
              <Stack gap="sm" py="md">
                {currentQuestions
                  .filter(
                    (q) =>
                      !isEditMode ||
                      !('localId' in q) ||
                      (q as LocalBatchQuestion).operation !== 'delete'
                  ) // Hide deleted items in edit mode
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((batchQuestion) => {
                    const isLocalQuestion = 'localId' in batchQuestion;
                    const operation = isLocalQuestion
                      ? (batchQuestion as LocalBatchQuestion).operation
                      : 'none';

                    return (
                      <Paper
                        key={
                          isLocalQuestion
                            ? (batchQuestion as LocalBatchQuestion).localId
                            : batchQuestion.id
                        }
                        p="md"
                        mx="md"
                        radius="md"
                        withBorder
                        style={{
                          opacity: operation === 'delete' ? 0.5 : 1,
                          borderColor:
                            operation === 'create'
                              ? 'var(--mantine-color-green-4)'
                              : operation === 'update'
                                ? 'var(--mantine-color-blue-4)'
                                : operation === 'delete'
                                  ? 'var(--mantine-color-red-4)'
                                  : undefined,
                        }}>
                        <Stack justify="space-between">
                          <Group gap="sm">
                            <div style={{ flex: 1 }}>
                              <Group gap="xs" mb="xs">
                                <Text fw={500}>
                                  {batchQuestion.question?.label || 'Unknown Question'}
                                </Text>
                                {isEditMode && operation !== 'none' && (
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    color={
                                      operation === 'create'
                                        ? 'green'
                                        : operation === 'update'
                                          ? 'blue'
                                          : operation === 'delete'
                                            ? 'red'
                                            : 'gray'
                                    }>
                                    {operation}
                                  </Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {batchQuestion.question?.type} • {batchQuestion.question?.code}
                              </Text>
                              {batchQuestion.question?.description && (
                                <Text size="xs" c="dimmed" mt={2}>
                                  {batchQuestion.question.description}
                                </Text>
                              )}
                            </div>
                          </Group>
                          <Group gap="xs" justify="space-between">
                            <Group gap="xs">
                              <Badge
                                variant="light"
                                size="sm"
                                color={batchQuestion.is_required ? 'red' : 'gray'}>
                                {batchQuestion.is_required ? 'Required' : 'Optional'}
                              </Badge>
                              <Badge
                                variant="light"
                                size="sm"
                                color={batchQuestion.is_active ? 'green' : 'gray'}>
                                {batchQuestion.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </Group>
                            {isEditMode && (
                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  onClick={() =>
                                    setEditingQuestion({
                                      ...batchQuestion.question!,
                                      question_id: batchQuestion.question_id,
                                      required: batchQuestion.is_required,
                                      is_active: batchQuestion.is_active,
                                    })
                                  }>
                                  <IconSettings size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleRemoveQuestion(batchQuestion.question_id)}>
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            )}
                          </Group>
                        </Stack>
                      </Paper>
                    );
                  })}
              </Stack>
            </ScrollArea>
          )}
        </Card.Section>
      </Card>

      {/* Compact Footer */}
      <Paper p="md" mt="md" radius="md" withBorder>
        <Group justify="space-between" align="center">
          {/* Batch Info */}
          <Group gap="md">
            <Group gap="xs">
              <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
              <Text fw={500} size="sm">
                Batch {batch.number}
              </Text>
              <Badge variant="outline" size="xs">
                {batch.number_code}
              </Badge>
            </Group>
            <Group gap="xs">
              <IconMapPin size={14} color="var(--mantine-color-gray-6)" />
              <Text size="xs" c="dimmed">
                {batch.location}
              </Text>
            </Group>
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-green-6)" />
              <Text fw={500} size="sm">
                Year {batch.year}
              </Text>
            </Group>
            <Badge variant="light" color="blue" size="sm">
              {currentQuestions.length} Questions
            </Badge>
            {isEditMode && hasChanges() && (
              <Badge variant="light" color="orange" size="sm">
                {getPendingOperations().length} Pending
              </Badge>
            )}
          </Group>

          {/* Action Buttons */}
          <Group gap="sm">
            <Button
              size="sm"
              variant="outline"
              leftSection={<IconPlus size={14} />}
              onClick={() => setBulkModalOpened(true)}
              disabled={availableQuestionsData.length === 0}>
              Add Questions
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Bulk Assign Modal */}
      <Modal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
        title="Add Questions to Setup"
        size="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select multiple questions to add to your local setup. You can make changes and save them
            when ready.
          </Text>

          <ScrollArea h={300}>
            <Stack gap="xs">
              {availableQuestionsData.map((question) => (
                <Paper
                  key={question.id}
                  p="sm"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedQuestions.includes(question.id)
                      ? 'var(--mantine-color-blue-0)'
                      : 'var(--mantine-color-body)',
                  }}
                  onClick={() => {
                    if (selectedQuestions.includes(question.id)) {
                      setSelectedQuestions(selectedQuestions.filter((id) => id !== question.id));
                    } else {
                      setSelectedQuestions([...selectedQuestions, question.id]);
                    }
                  }}>
                  <Group justify="space-between">
                    <div style={{ flex: 1 }}>
                      <Text fw={500} size="sm">
                        {question.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {question.type} • {question.code}
                      </Text>
                    </div>
                    {selectedQuestions.includes(question.id) && (
                      <IconCheck size={16} color="var(--mantine-color-blue-6)" />
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {selectedQuestions.length} questions selected
            </Text>
            <Group>
              <Button variant="outline" onClick={() => setBulkModalOpened(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAssign} disabled={selectedQuestions.length === 0}>
                {isEditMode ? 'Add to Setup' : 'Add to Setup'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Reset Changes Confirmation Modal */}
      <Modal
        opened={resetConfirmOpened}
        onClose={() => setResetConfirmOpened(false)}
        title="Reset Changes"
        size="sm"
        centered>
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={20} color="orange" />
            <Text fw={500}>Reset all changes?</Text>
          </Group>

          <Text size="sm" c="dimmed">
            This will discard all your current changes and restore the original question setup. This
            action cannot be undone.
          </Text>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Warning"
            color="orange"
            variant="light">
            You have {getPendingOperations().length} pending changes that will be lost.
          </Alert>

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setResetConfirmOpened(false)}>
              Cancel
            </Button>
            <Button color="orange" onClick={handleConfirmReset}>
              Reset Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Cancel Changes Confirmation Modal */}
      <Modal
        opened={cancelConfirmOpened}
        onClose={() => setCancelConfirmOpened(false)}
        title="Cancel Changes"
        size="sm"
        centered>
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={20} color="red" />
            <Text fw={500}>Cancel all changes?</Text>
          </Group>

          <Text size="sm" c="dimmed">
            This will discard all your current changes and exit edit mode. This action cannot be
            undone.
          </Text>

          <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="red" variant="light">
            You have {getPendingOperations().length} pending changes that will be lost.
          </Alert>

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setCancelConfirmOpened(false)}>
              Keep Editing
            </Button>
            <Button color="red" onClick={handleConfirmCancel}>
              Cancel Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Question Confirmation Modal */}
      <Modal
        opened={deleteQuestionConfirm.opened}
        onClose={() => setDeleteQuestionConfirm({ opened: false, question: null })}
        title="Remove Question"
        size="md"
        centered>
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={20} color="red" />
            <Text fw={500}>Remove this question from the setup?</Text>
          </Group>

          {deleteQuestionConfirm.question && (
            <Paper p="md" bg="red.0" style={{ borderRadius: '8px' }}>
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  {deleteQuestionConfirm.question.question?.label || 'Unknown Question'}
                </Text>
                <Text size="xs" c="dimmed">
                  {deleteQuestionConfirm.question.question?.type} •{' '}
                  {deleteQuestionConfirm.question.question?.code}
                </Text>
                {deleteQuestionConfirm.question.question?.description && (
                  <Text size="xs" c="dimmed">
                    {deleteQuestionConfirm.question.question.description}
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          <Text size="sm" c="dimmed">
            This will remove the question from the batch setup.{' '}
            {isEditMode
              ? 'The change will be saved when you save your setup.'
              : 'You will enter edit mode to make this change.'}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setDeleteQuestionConfirm({ opened: false, question: null })}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDeleteQuestion}>
              Remove Question
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Question Settings Modal */}
      <Modal
        opened={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title="Question Settings"
        size="md">
        {editingQuestion && (
          <Stack gap="md">
            <Text fw={500}>{editingQuestion.label}</Text>
            <Text size="sm" c="dimmed">
              {editingQuestion.type} • {editingQuestion.code}
            </Text>

            <Divider />

            <Switch
              label="Required Question"
              description="User must answer this question to submit the form"
              defaultChecked={editingQuestion.required}
              onChange={(event) => {
                if (editingQuestion.question_id) {
                  handleUpdateQuestion(editingQuestion.question_id, {
                    is_required: event.currentTarget.checked,
                  });
                }
              }}
            />

            <Switch
              label="Active Question"
              description="Question is visible and can be answered"
              defaultChecked={editingQuestion.is_active}
              onChange={(event) => {
                if (editingQuestion.question_id) {
                  handleUpdateQuestion(editingQuestion.question_id, {
                    is_active: event.currentTarget.checked,
                  });
                }
              }}
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
