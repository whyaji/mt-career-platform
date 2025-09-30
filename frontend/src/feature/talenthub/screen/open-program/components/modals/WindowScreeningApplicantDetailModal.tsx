import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconHistory,
  IconRotateClockwise,
  IconTrendingUp,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

import { DraggableWindow } from '@/components/DraggableWindow';
import { UpdateStatusModal } from '@/feature/talenthub/screen/open-program/components/modals/UpdateStatusModal';
import { useScreeningApplicantByIdQuery } from '@/hooks/query/screening-applicant/useScreeningApplicantByIdQuery';
import { useMarkingScreeningApplicantMutation } from '@/hooks/query/screening-applicant/useScreeningApplicantMutations';
import { getQuestionScoreColor, getScoreColorFromValues } from '@/lib/scoreColorUtils';
import {
  type MarkingScreeningApplicantPayloadType,
  SCREENING_APPLICANT_STATUS_LABELS,
  type ScreeningApplicantType,
} from '@/types/screening-applicant.type';

interface WindowScreeningApplicantDetailModalProps {
  opened: boolean;
  onClose: () => void;
  applicantId: string | null;
  batchQuestions?: Array<{
    id: string;
    question_id: string;
    code: string;
    label: string;
  }>;
  windowId?: string;
  defaultPosition?: { x: number; y: number };
  zIndex?: number;
  onStatusUpdate?: (updatedApplicant?: ScreeningApplicantType) => void;
  onFocus?: () => void;
}

export function WindowScreeningApplicantDetailModal({
  opened,
  onClose,
  applicantId,
  batchQuestions = [],
  windowId,
  defaultPosition = { x: 100, y: 100 },
  zIndex = 99,
  onStatusUpdate,
  onFocus,
}: WindowScreeningApplicantDetailModalProps) {
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modifiedScores, setModifiedScores] = useState<Set<string>>(new Set());
  const [showMarkingHistory, setShowMarkingHistory] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    opened: boolean;
    type: 'save' | 'reset' | 'cancel';
    title: string;
    message: string;
  }>({
    opened: false,
    type: 'save',
    title: '',
    message: '',
  });

  const markingMutation = useMarkingScreeningApplicantMutation();

  // Fetch applicant data by ID
  const {
    data: applicantResponse,
    isLoading: isLoadingApplicant,
    error: applicantError,
  } = useScreeningApplicantByIdQuery(applicantId || '', opened && !!applicantId);

  // Extract applicant data from response
  const applicant =
    applicantResponse?.success && 'data' in applicantResponse ? applicantResponse.data : null;

  const form = useForm({
    initialValues: {
      scores: {} as Record<string, number>,
    },
  });

  useEffect(() => {
    if (applicant && isEditMode) {
      form.setValues({
        scores: applicant.scoring?.reduce(
          (acc, score) => ({ ...acc, [score.question_id]: score.score }),
          {}
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant, isEditMode]);

  // Track original scores for comparison
  const originalScores = useMemo(() => {
    const scores: Record<string, number> = {};
    batchQuestions.forEach((question) => {
      const currentScore =
        applicant?.scoring?.find((score) => score.question_id === question.question_id)?.score || 0;
      scores[question.question_id] = currentScore;
    });
    return scores;
  }, [applicant, batchQuestions]);

  const handleOpenStatusUpdate = () => {
    setStatusUpdateModal(true);
  };

  const handleCloseStatusUpdate = () => {
    setStatusUpdateModal(false);
  };

  const handleStatusUpdateSuccess = (updatedApplicant?: ScreeningApplicantType) => {
    onStatusUpdate?.(updatedApplicant);
    setStatusUpdateModal(false);
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setModifiedScores(new Set());
  };

  const handleScoreChange = (questionId: string, newValue: number) => {
    const originalValue = originalScores[questionId] || 0;
    const isModified = newValue !== originalValue;

    setModifiedScores((prev) => {
      const newSet = new Set(prev);
      if (isModified) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });

    form.setFieldValue(`scores.${questionId}`, newValue);
  };

  const getModifiedScores = () => {
    const modified: Record<string, number> = {};
    modifiedScores.forEach((questionId) => {
      modified[questionId] = form.values.scores[questionId] || 0;
    });
    return modified;
  };

  const handleCancelEdit = () => {
    if (modifiedScores.size > 0) {
      setConfirmModal({
        opened: true,
        type: 'cancel',
        title: 'Discard Changes',
        message: `You have ${modifiedScores.size} unsaved changes. Are you sure you want to discard them?`,
      });
    } else {
      setIsEditMode(false);
      form.reset();
      setModifiedScores(new Set());
    }
  };

  const handleResetScores = () => {
    setConfirmModal({
      opened: true,
      type: 'reset',
      title: 'Reset Scores',
      message: `Are you sure you want to reset all ${modifiedScores.size} modified scores to their original values?`,
    });
  };

  const handleSaveScores = () => {
    setConfirmModal({
      opened: true,
      type: 'save',
      title: 'Save Scores',
      message: `Are you sure you want to save ${modifiedScores.size} modified scores?`,
    });
  };

  const confirmAction = () => {
    if (!applicant) {
      return;
    }

    switch (confirmModal.type) {
      case 'save': {
        const modifiedScores = getModifiedScores();
        const markingData: MarkingScreeningApplicantPayloadType = {
          marking: Object.entries(modifiedScores).map(([questionId, score]) => ({
            question_id: questionId,
            marking_score: score,
          })),
        };
        markingMutation.mutate(
          { id: applicant.id, data: markingData },
          {
            onError: (error) => {
              notifications.show({
                title: 'Error',
                message: error.message || 'Failed to save scores',
                color: 'red',
              });
            },
            onSuccess: (response) => {
              if (response.success) {
                if ('data' in response && response.data) {
                  onStatusUpdate?.(response.data);
                }
                setIsEditMode(false);
                form.reset();
                setModifiedScores(new Set());
                notifications.show({
                  title: 'Success',
                  message: 'Scores saved successfully',
                  color: 'green',
                });
              } else {
                notifications.show({
                  title: 'Error',
                  message: response.message || 'Failed to save scores',
                  color: 'red',
                });
              }
            },
          }
        );
        break;
      }
      case 'reset':
        form.reset();
        setModifiedScores(new Set());
        break;
      case 'cancel':
        setIsEditMode(false);
        form.reset();
        setModifiedScores(new Set());
        break;
    }
    setConfirmModal({ opened: false, type: 'save', title: '', message: '' });
  };

  const cancelAction = () => {
    setConfirmModal({ opened: false, type: 'save', title: '', message: '' });
  };

  // Handle loading and error states
  if (isLoadingApplicant) {
    return (
      <DraggableWindow
        opened={opened}
        onClose={onClose}
        windowId={windowId}
        title="Loading Applicant Details..."
        defaultPosition={defaultPosition}
        zIndex={zIndex}
        width={1000}
        height={700}
        resizable
        onFocus={onFocus}>
        <Box
          style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <Text>Loading applicant details...</Text>
        </Box>
      </DraggableWindow>
    );
  }

  if (applicantError || !applicant) {
    return (
      <DraggableWindow
        opened={opened}
        onClose={onClose}
        windowId={windowId}
        title="Error Loading Applicant Details"
        defaultPosition={defaultPosition}
        zIndex={zIndex}
        width={1000}
        height={700}
        resizable
        onFocus={onFocus}>
        <Box style={{ padding: '16px' }}>
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {applicantError
              ? 'Failed to load applicant details. Please try again.'
              : 'Applicant not found.'}
          </Alert>
        </Box>
      </DraggableWindow>
    );
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // PENDING
        return 'yellow';
      case 1: // SCORED
        return 'blue';
      case 2: // APPROVED
        return 'green';
      case 3: // REJECTED
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMarkingHistory = () => {
    if (!applicant?.marking || !Array.isArray(applicant.marking)) {
      return [];
    }

    return applicant.marking.map((markingEntry, index) => ({
      id: index,
      markedBy: markingEntry.marking_by_name || 'Unknown User',
      markedAt: markingEntry.marking_at,
      changes: markingEntry.marking || [],
    }));
  };

  const formatAnswer = (answer: unknown) => {
    if (answer === null || answer === undefined) {
      return '-';
    }

    if (typeof answer === 'string') {
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

  const getAnswerForQuestion = (questionId: string) => {
    const answerObj = applicant.answers.find((answer) => answer.question_id === questionId);
    return answerObj?.answer || null;
  };

  const getScoreForQuestion = (questionId: string) => {
    const scoreObj = applicant.scoring?.find((score) => score.question_id === questionId);
    return { score: scoreObj?.score || 0, max_score: scoreObj?.max_score || 0 };
  };

  const questionRows = batchQuestions.map((question) => {
    const answer = getAnswerForQuestion(question.question_id);
    const { score, max_score } = getScoreForQuestion(question.question_id);

    return {
      question: question.label,
      answer: formatAnswer(answer),
      score,
      max_score,
      question_id: question.question_id,
    };
  });

  const editModeController = () => (
    <Card withBorder p="md" mb="md" style={{ backgroundColor: '#f0f8ff', borderColor: '#1c7ed6' }}>
      <Stack gap="sm">
        <Group gap="xs" align="center">
          <ActionIcon size="sm" color="blue" variant="light">
            <IconEdit size={16} />
          </ActionIcon>
          <Text size="sm" fw={500} c="blue">
            Edit Mode - Modify individual question scores below
          </Text>
          {modifiedScores.size > 0 && (
            <Badge color="orange" variant="light" size="sm">
              {modifiedScores.size} modified
            </Badge>
          )}
        </Group>
        <Group gap="sm">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconRotateClockwise size={14} />}
            onClick={handleResetScores}
            disabled={markingMutation.isPending}
            color="orange">
            Reset
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconCheck size={14} />}
            onClick={handleSaveScores}
            loading={markingMutation.isPending}
            disabled={modifiedScores.size === 0}
            color="green">
            Save {modifiedScores.size > 0 ? `${modifiedScores.size} Changes` : 'Changes'}
          </Button>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconX size={14} />}
            onClick={handleCancelEdit}
            disabled={markingMutation.isPending}
            color="red">
            Cancel
          </Button>
        </Group>
        {markingMutation.error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Failed to save scores. Please try again.
          </Alert>
        )}
      </Stack>
    </Card>
  );

  return (
    <DraggableWindow
      opened={opened}
      onClose={onClose}
      windowId={windowId}
      title={`Screening Applicant Details - ${applicant.id.slice(-8)}`}
      defaultPosition={defaultPosition}
      zIndex={zIndex}
      width={1000}
      height={700}
      resizable
      onFocus={onFocus}>
      <ScrollArea style={{ height: '100%' }}>
        <Box style={{ padding: '16px' }}>
          <Stack gap="md">
            {/* Basic Information */}
            <div>
              <Text size="lg" fw={600} mb="md" c="blue">
                Applicant Information
              </Text>

              <Group gap="lg" mb="md">
                <Group gap="sm">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Applicant ID
                    </Text>
                    <Text fw={500} style={{ fontFamily: 'monospace' }}>
                      {applicant.id.slice(-8)}
                    </Text>
                  </div>
                </Group>

                <Group gap="sm">
                  <IconTrendingUp size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Status
                    </Text>
                    <Group gap="xs" align="center">
                      <Badge variant="light" size="sm" color={getStatusColor(applicant.status)}>
                        {
                          SCREENING_APPLICANT_STATUS_LABELS[
                            applicant.status as keyof typeof SCREENING_APPLICANT_STATUS_LABELS
                          ]
                        }
                      </Badge>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftSection={<IconEdit size={12} />}
                        onClick={handleOpenStatusUpdate}>
                        Update
                      </Button>
                    </Group>
                  </div>
                </Group>

                <Group gap="sm">
                  <IconCalendar size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Submitted
                    </Text>
                    <Text fw={500} size="sm">
                      {formatDate(applicant.created_at)}
                    </Text>
                  </div>
                </Group>
              </Group>
            </div>

            <Divider />

            {/* Scoring Summary */}
            <div>
              <Flex justify="space-between" align="center" mb="md">
                <Text size="lg" fw={600} c="blue">
                  Scoring Summary
                </Text>
                {!isEditMode && (
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconEdit size={16} />}
                    onClick={handleEditMode}
                    disabled={markingMutation.isPending}>
                    Edit Scores
                  </Button>
                )}
              </Flex>

              <Group gap="lg" mb={isEditMode ? 'md' : 0}>
                {applicant.total_score !== null && applicant.max_score !== null && (
                  <Badge
                    variant="light"
                    size="lg"
                    color={getScoreColorFromValues(applicant.total_score, applicant.max_score)}>
                    Score: {applicant.total_score}/{applicant.max_score}(
                    {applicant.max_score
                      ? ((applicant.total_score / applicant.max_score) * 100).toFixed(1)
                      : 0}
                    %)
                  </Badge>
                )}

                {applicant.total_marking !== null && (
                  <Badge variant="light" size="lg" color="green">
                    Marking: {applicant.total_marking}
                  </Badge>
                )}

                {applicant.total_ai_scoring !== null && (
                  <Badge variant="light" size="lg" color="purple">
                    AI Score: {applicant.total_ai_scoring}
                  </Badge>
                )}

                {applicant.marking && applicant.marking.length > 0 && (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconHistory size={14} />}
                    rightSection={
                      showMarkingHistory ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )
                    }
                    onClick={() => setShowMarkingHistory(!showMarkingHistory)}
                    color="gray">
                    Marking History ({applicant.marking.length})
                  </Button>
                )}
              </Group>

              {isEditMode && editModeController()}

              {/* Marking History */}
              {applicant.marking && applicant.marking.length > 0 && (
                <Collapse in={showMarkingHistory}>
                  <Card withBorder p="md" mt="md" style={{ backgroundColor: '#f8f9fa' }}>
                    <Stack gap="md">
                      <Group gap="xs" align="center">
                        <IconHistory size={16} color="gray" />
                        <Text size="sm" fw={500} c="gray">
                          Marking History
                        </Text>
                        <Badge size="xs" color="gray" variant="light">
                          {applicant.marking.length} entries
                        </Badge>
                      </Group>

                      <Stack gap="sm">
                        {formatMarkingHistory().map((entry) => (
                          <Card
                            key={entry.id}
                            withBorder
                            p="sm"
                            style={{ backgroundColor: 'white' }}>
                            <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                <Group gap="xs" align="center">
                                  <IconUser size={14} color="gray" />
                                  <Text size="xs" fw={500}>
                                    {entry.markedBy}
                                  </Text>
                                </Group>
                                <Group gap="xs" align="center">
                                  <IconCalendar size={14} color="gray" />
                                  <Text size="xs" c="dimmed">
                                    {formatDate(entry.markedAt)}
                                  </Text>
                                </Group>
                              </Group>

                              {entry.changes.length > 0 && (
                                <Table withTableBorder>
                                  <Table.Thead>
                                    <Table.Tr>
                                      <Table.Th>Question</Table.Th>
                                      <Table.Th>From</Table.Th>
                                      <Table.Th>To</Table.Th>
                                      <Table.Th>Change</Table.Th>
                                    </Table.Tr>
                                  </Table.Thead>
                                  <Table.Tbody>
                                    {entry.changes.map((change, changeIndex) => {
                                      const question = batchQuestions.find(
                                        (q) => q.question_id === change.question_id
                                      );
                                      const fromScore = change.from_score || 0;
                                      // find max score for the question from batch questions
                                      const max_score = getScoreForQuestion(
                                        change.question_id
                                      ).max_score;
                                      const toScore = change.marking_score || 0;
                                      const difference = toScore - fromScore;

                                      return (
                                        <Table.Tr key={changeIndex}>
                                          <Table.Td>
                                            <Text size="xs">
                                              {question?.label || change.question_id}
                                            </Text>
                                          </Table.Td>
                                          <Table.Td>
                                            <Badge
                                              size="xs"
                                              variant="light"
                                              color={getQuestionScoreColor(fromScore, max_score)}>
                                              {fromScore}
                                            </Badge>
                                          </Table.Td>
                                          <Table.Td>
                                            <Badge
                                              size="xs"
                                              variant="light"
                                              color={getQuestionScoreColor(toScore, max_score)}>
                                              {toScore}
                                            </Badge>
                                          </Table.Td>
                                          <Table.Td>
                                            <Badge
                                              size="xs"
                                              variant="light"
                                              color={
                                                difference > 0
                                                  ? 'green'
                                                  : difference < 0
                                                    ? 'red'
                                                    : 'gray'
                                              }>
                                              {difference > 0 ? '+' : ''}
                                              {difference}
                                            </Badge>
                                          </Table.Td>
                                        </Table.Tr>
                                      );
                                    })}
                                  </Table.Tbody>
                                </Table>
                              )}
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                </Collapse>
              )}
            </div>

            <Divider />

            {/* Questions and Answers */}
            <div>
              <Text size="lg" fw={600} mb="md" c="blue">
                Questions & Answers
              </Text>

              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Question</Table.Th>
                    <Table.Th>Answer</Table.Th>
                    <Table.Th>
                      <Group gap="xs" align="center">
                        <Text size="sm" fw={500}>
                          Score
                        </Text>
                        {isEditMode && (
                          <Tooltip label="Edit mode - click to modify scores">
                            <ActionIcon size="xs" color="blue" variant="light">
                              <IconEdit size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {questionRows.map((row, index) => {
                    const isModified = modifiedScores.has(row.question_id);
                    const originalValue = originalScores[row.question_id] || 0;
                    const currentValue = form.values.scores[row.question_id] || 0;

                    return (
                      <Table.Tr
                        key={index}
                        style={{
                          backgroundColor: isModified ? '#fff3cd' : undefined,
                          borderLeft: isModified ? '3px solid #ffc107' : undefined,
                        }}>
                        <Table.Td>
                          <Group gap="xs" align="center">
                            <Text size="sm" fw={500}>
                              {row.question}
                            </Text>
                            {isModified && (
                              <Badge size="xs" color="orange" variant="light">
                                Modified
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" style={{ wordBreak: 'break-word' }}>
                            {row.answer}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {isEditMode ? (
                            <Group gap="xs" align="center">
                              <NumberInput
                                size="xs"
                                min={0}
                                max={100}
                                value={currentValue}
                                onChange={(value) => {
                                  const numValue = Number(value) || 0;
                                  if (numValue >= 0) {
                                    handleScoreChange(row.question_id, numValue);
                                  }
                                }}
                                style={{ width: 80 }}
                                placeholder="0"
                              />
                              {isModified && (
                                <Text size="xs" c="dimmed">
                                  ({originalValue} → {currentValue})
                                </Text>
                              )}
                            </Group>
                          ) : (
                            <Badge
                              variant="light"
                              size="sm"
                              color={getQuestionScoreColor(row.score, row.max_score)}>
                              {row.score}
                            </Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </div>

            {isEditMode && editModeController()}

            {/* User Agent Information */}
            {applicant.user_agent && (
              <>
                <Divider />
                <div>
                  <Text size="lg" fw={600} mb="md" c="blue">
                    Technical Information
                  </Text>

                  <Stack gap="md">
                    <Box>
                      <Text size="sm" c="dimmed" mb="xs">
                        User Agent
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          backgroundColor: '#f8f9fa',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #e9ecef',
                        }}>
                        {applicant.user_agent}
                      </Text>
                    </Box>
                    <Box>
                      <Text size="sm" c="dimmed" mb="xs">
                        IP Address
                      </Text>
                      <Text size="xs" fw={500} style={{ fontFamily: 'monospace' }}>
                        {applicant.ip_address || 'N/A'}
                      </Text>
                    </Box>
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        </Box>
      </ScrollArea>

      {/* Status Update Modal */}
      <UpdateStatusModal
        opened={statusUpdateModal}
        onClose={handleCloseStatusUpdate}
        applicant={applicant}
        onSuccess={handleStatusUpdateSuccess}
      />

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModal.opened}
        onClose={cancelAction}
        title={confirmModal.title}
        zIndex={10050}
        centered
        size="sm">
        <Stack gap="md">
          <Text size="sm">{confirmModal.message}</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={cancelAction} disabled={markingMutation.isPending}>
              Cancel
            </Button>
            <Button
              color={
                confirmModal.type === 'save'
                  ? 'blue'
                  : confirmModal.type === 'reset'
                    ? 'orange'
                    : 'red'
              }
              onClick={confirmAction}
              loading={markingMutation.isPending && confirmModal.type === 'save'}>
              {confirmModal.type === 'save'
                ? 'Save'
                : confirmModal.type === 'reset'
                  ? 'Reset'
                  : 'Discard'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </DraggableWindow>
  );
}
