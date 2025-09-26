import { Button, Flex, Group, Paper, Progress, Stack, Stepper, Text } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface FormPaginationProps {
  activeStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepClick: (step: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  isMobile?: boolean;
}

export function FormPagination({
  activeStep,
  totalSteps,
  onNext,
  onPrevious,
  onStepClick,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isSubmitting = false,
  isMobile = false,
}: FormPaginationProps) {
  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <Paper p={isMobile ? 'sm' : 'md'} radius={isMobile ? 'sm' : 'md'} withBorder>
      <Stack gap={isMobile ? 'sm' : 'md'}>
        {/* Progress Bar */}
        <div>
          <Flex justify="center" mb="xs">
            <Text size={isMobile ? 'xs' : 'sm'} fw={500} flex={1}>
              Langkah {activeStep + 1} dari {totalSteps}
            </Text>
            {isMobile && (
              <>
                <Group justify="center" gap="xs">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          index <= activeStep
                            ? 'var(--mantine-primary-color-filled)'
                            : 'var(--mantine-color-gray-4)',
                        transition: 'background-color 0.2s ease',
                      }}
                    />
                  ))}
                </Group>
                <Text size="xs" ta="end" c="dimmed" flex={1}>
                  {activeStep === 0 ? 'Persetujuan' : 'Informasi Pribadi'}
                </Text>
              </>
            )}
          </Flex>
          <Progress value={progress} size={isMobile ? 'xs' : 'sm'} radius="xl" />
        </div>

        {/* Stepper - Hide on mobile to save space */}
        {!isMobile && (
          <Stepper
            active={activeStep}
            onStepClick={onStepClick}
            size="sm"
            allowNextStepsSelect={false}>
            <Stepper.Step
              label="Persetujuan"
              description="Ketentuan dan perjanjian"
              icon={<IconCheck size={16} />}
            />
            <Stepper.Step
              label="Informasi Pribadi"
              description="Data diri dan pendidikan"
              icon={<IconCheck size={16} />}
            />
          </Stepper>
        )}

        {/* Navigation Buttons */}
        <Group
          justify={isMobile ? 'center' : 'space-between'}
          mt={isMobile ? 'xs' : 'md'}
          gap={isMobile ? 'xs' : 'md'}>
          {/* Previous Button */}
          {activeStep > 0 ? (
            <Button
              variant="outline"
              leftSection={!isMobile ? <IconChevronLeft size={16} /> : undefined}
              onClick={onPrevious}
              disabled={!canGoPrevious}
              size={isMobile ? 'sm' : 'md'}
              style={isMobile ? { flex: 1, maxWidth: '120px' } : undefined}>
              {isMobile ? 'Kembali' : 'Sebelumnya'}
            </Button>
          ) : (
            !isMobile && <div />
          )}

          {/* Next/Submit Button */}
          {isLastStep ? (
            <Button
              onClick={onNext}
              loading={isSubmitting}
              rightSection={!isMobile ? <IconCheck size={16} /> : undefined}
              size={isMobile ? 'sm' : 'md'}
              color="green"
              style={isMobile ? { flex: 1, maxWidth: '140px' } : undefined}>
              {isSubmitting ? 'Mengirim...' : isMobile ? 'Kirim' : 'Kirim Formulir'}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              rightSection={!isMobile ? <IconChevronRight size={16} /> : undefined}
              size={isMobile ? 'sm' : 'md'}
              style={isMobile ? { flex: 1, maxWidth: '120px' } : undefined}>
              {isMobile ? 'Lanjut' : 'Selanjutnya'}
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
