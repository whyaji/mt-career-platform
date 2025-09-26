import { Alert, Badge, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { IconAlertCircle, IconInfoCircle, IconUser } from '@tabler/icons-react';
import { type FC, useEffect } from 'react';

import type { QuestionType } from '@/types/question.type';

import {
  calculateStepCompletion,
  type DynamicFormData,
  filterQuestionsByConditionalLogic,
} from '../utils/dynamicFormUtils';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface DynamicFormStepProps {
  stepId: string;
  title: string;
  description?: string;
  questions: QuestionType[];
  formValues: DynamicFormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>;
  isMobile?: boolean;
  showProgress?: boolean;
}

export const DynamicFormStep: FC<DynamicFormStepProps> = ({
  stepId: _stepId,
  title,
  description,
  questions,
  formValues,
  form,
  isMobile = false,
  showProgress = true,
}) => {
  // Filter questions based on conditional logic
  const visibleQuestions = filterQuestionsByConditionalLogic(questions, formValues);

  // Calculate completion percentage
  const completion = calculateStepCompletion(questions, formValues);

  // Sort questions by display order
  const sortedQuestions = visibleQuestions.sort((a, b) => a.display_order - b.display_order);

  // Check if in question has usia and tanggal_lahir
  const hasUsiaAndTanggalLahir =
    visibleQuestions.some((question) => question.code === 'usia') &&
    visibleQuestions.some((question) => question.code === 'tanggal_lahir');

  const birthDateString = hasUsiaAndTanggalLahir ? formValues.tanggal_lahir : '';

  useEffect(() => {
    if (birthDateString) {
      const birthDate = new Date(birthDateString);
      if (birthDate) {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          form.setFieldValue('usia', age - 1);
        } else {
          form.setFieldValue('usia', age);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthDateString]);

  return (
    <Stack gap="lg">
      {/* Step Header */}
      <Paper
        p={isMobile ? 'sm' : 'xl'}
        style={{
          borderRadius: isMobile ? '0px' : '16px',
        }}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              {title}
            </Text>
            {showProgress && (
              <Badge
                color={completion === 100 ? 'green' : completion > 50 ? 'yellow' : 'gray'}
                variant="light">
                {Math.round(completion)}% selesai
              </Badge>
            )}
          </Group>

          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}

          {showProgress && (
            <Progress
              value={completion}
              size="sm"
              radius="xl"
              color={completion === 100 ? 'green' : completion > 50 ? 'yellow' : 'blue'}
              striped={completion > 0 && completion < 100}
              animated={completion > 0 && completion < 100}
            />
          )}
        </Stack>
      </Paper>

      {/* Form Content */}
      <Paper
        p={isMobile ? 'sm' : 'xl'}
        pb={isMobile ? 'xl' : undefined}
        style={{
          borderRadius: '16px',
          borderTopLeftRadius: isMobile ? '0px' : '16px',
          borderTopRightRadius: isMobile ? '0px' : '16px',
        }}
        shadow={isMobile ? 'none' : undefined}>
        <Stack gap="md">
          <Title order={2} mb="xs" c="orange">
            <Group gap="sm">
              <IconUser size={24} />
              DATA PELAMAR
            </Group>
          </Title>
          <Text size="sm" c="dimmed" mb="xs">
            <Text component="span" c="red" fw={500}>
              * Required
            </Text>
          </Text>
          <Text size="sm" c="dimmed">
            Mohon untuk mengisi biodata sesuai dengan diri anda dan wajib mengisi semua pertanyaan
            isian menggunakan{' '}
            <Text component="span" fw={700} c="dark">
              HURUF KAPITAL
            </Text>
            .
          </Text>
          <Stack gap="xl">
            {sortedQuestions.length === 0 ? (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Tidak ada pertanyaan"
                color="blue"
                variant="light">
                Tidak ada pertanyaan yang perlu diisi pada langkah ini.
              </Alert>
            ) : (
              sortedQuestions.map((question, _index) => (
                <DynamicFieldRenderer
                  key={question.id}
                  question={question}
                  formValues={formValues}
                  form={form}
                  isMobile={isMobile}
                />
              ))
            )}
          </Stack>
        </Stack>
      </Paper>
      {/* Validation Summary */}
      {visibleQuestions.some((q) => q.required) && completion < 100 && (
        <Alert
          style={{
            borderRadius: isMobile ? '0px' : '16px',
          }}
          icon={<IconAlertCircle size={16} />}
          title="Perhatian"
          color="orange"
          variant="light">
          <Text size="sm">
            Mohon lengkapi semua field yang wajib diisi sebelum melanjutkan ke langkah berikutnya.
          </Text>
        </Alert>
      )}
    </Stack>
  );
};
