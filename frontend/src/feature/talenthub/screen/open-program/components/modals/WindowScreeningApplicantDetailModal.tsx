import { Badge, Box, Divider, Group, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { IconCalendar, IconTrendingUp, IconUser } from '@tabler/icons-react';

import { DraggableWindow } from '@/components/DraggableWindow';
import {
  SCREENING_APPLICANT_STATUS_LABELS,
  type ScreeningApplicantType,
} from '@/types/screening-applicant.type';

interface WindowScreeningApplicantDetailModalProps {
  opened: boolean;
  onClose: () => void;
  applicant: ScreeningApplicantType | null;
  batchQuestions?: Array<{
    code: string;
    label: string;
    type: string;
  }>;
  loading?: boolean;
  windowId?: string;
  defaultPosition?: { x: number; y: number };
  zIndex?: number;
}

export function WindowScreeningApplicantDetailModal({
  opened,
  onClose,
  applicant,
  batchQuestions = [],
  loading: _loading = false,
  windowId,
  defaultPosition = { x: 100, y: 100 },
  zIndex = 1000,
}: WindowScreeningApplicantDetailModalProps) {
  if (!applicant) {
    return null;
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

  const getAnswerForQuestion = (questionCode: string) => {
    const answerObj = applicant.answers.find((answer) => answer.question_code === questionCode);
    return answerObj?.answer || null;
  };

  const getScoreForQuestion = (questionCode: string) => {
    const scoreObj = applicant.scoring?.find((score) => score.question_code === questionCode);
    return scoreObj?.score || 0;
  };

  // Create question rows for the table
  const questionRows = batchQuestions.map((question) => {
    const answer = getAnswerForQuestion(question.code);
    const score = getScoreForQuestion(question.code);

    return {
      question: question.label,
      answer: formatAnswer(answer),
      score,
    };
  });

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
      resizable>
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
                    <Badge variant="light" size="sm" color={getStatusColor(applicant.status)}>
                      {
                        SCREENING_APPLICANT_STATUS_LABELS[
                          applicant.status as keyof typeof SCREENING_APPLICANT_STATUS_LABELS
                        ]
                      }
                    </Badge>
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

              <Group gap="lg">
                {applicant.total_score !== null && (
                  <Group gap="sm">
                    <IconTrendingUp size={16} />
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Score
                      </Text>
                      <Text fw={500}>
                        {applicant.total_score}/{applicant.max_score}(
                        {applicant.max_score
                          ? ((applicant.total_score / applicant.max_score) * 100).toFixed(1)
                          : 0}
                        %)
                      </Text>
                    </div>
                  </Group>
                )}
              </Group>
            </div>

            <Divider />

            {/* Scoring Summary */}
            <div>
              <Text size="lg" fw={600} mb="md" c="blue">
                Scoring Summary
              </Text>

              <Group gap="lg">
                <Badge variant="light" size="lg" color="blue">
                  Score: {applicant.total_score || 0}/{applicant.max_score || 0}
                </Badge>

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
              </Group>
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
                    <Table.Th>Score</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {questionRows.map((row, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {row.question}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" style={{ wordBreak: 'break-word' }}>
                          {row.answer}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" size="sm" color={row.score > 0 ? 'green' : 'gray'}>
                          {row.score}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>

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
    </DraggableWindow>
  );
}
