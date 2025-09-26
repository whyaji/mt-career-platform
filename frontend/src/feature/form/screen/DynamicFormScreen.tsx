import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Center,
  Container,
  em,
  Flex,
  Group,
  Loader,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconExclamationMark,
  IconInfoCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';

import { submitFormForApplicant } from '@/lib/api/formApi';
import { Route } from '@/routes/form/$programCode/$batchLocationCode/$batchNumberCode/';
import type { ApplicantDataSubmitType } from '@/types/applicantData.type';
import type { BatchType } from '@/types/batch.type';

import TurnstileWidget, { type TurnstileWidgetRef } from '../../../components/TurnstileWidget';
import { AgreementForm } from '../components/AgreementForm';
import { DynamicFormStep } from '../components/DynamicFormStep';
import { FormHeader } from '../components/FormHeader';
import { FormPagination } from '../components/FormPagination';
import { SubmissionConfirmation } from '../components/SubmissionConfirmation';
import { type AgreementData, agreementSchema } from '../schemas/agreementSchema';
import {
  canProceedToNextStep,
  type DynamicFormData,
  evaluateConditionalLogic,
  type FormStep,
  generateAnswersFromFormValues,
  generateDynamicSchemaWithConditionalLogic,
  generateInitialFormValues,
} from '../utils/dynamicFormUtils';

// Combined form data type that includes both agreement and dynamic fields
type CombinedFormData = AgreementData & DynamicFormData;

export default function DynamicFormScreen() {
  const batch: BatchType = Route.useLoaderData();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const [forceValidation, setForceValidation] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const stepStatusRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const viewport = useRef<HTMLDivElement>(null);

  // Generate form steps - always include agreement as step 1 and dynamic fields as step 2
  const formSteps: FormStep[] = useMemo(() => {
    const steps: FormStep[] = [];

    // Always add agreement as first step
    steps.push({
      id: 'agreement',
      title: 'Persetujuan',
      description: 'Mohon baca dan setujui persyaratan berikut',
      questions: [], // Agreement form doesn't use questions from database
      order: 0,
    });

    // Add all dynamic questions as second step (if any exist)
    if (batch.questions && batch.questions.length > 0) {
      steps.push({
        id: 'dynamic_fields',
        title: 'Informasi Formulir',
        description: 'Lengkapi informasi yang diperlukan',
        questions: batch.questions,
        order: 1,
      });
    }

    return steps;
  }, [batch.questions]);

  const totalSteps = formSteps.length;

  // create mutation form submission using tanstack query
  const { mutateAsync: submitFormMutation, isPending: isSubmitting } = useMutation({
    mutationFn: submitFormForApplicant,
  });

  // Generate initial form values - include agreement fields and dynamic fields
  const initialFormValues: CombinedFormData = useMemo(() => {
    const dynamicValues =
      batch.questions && batch.questions.length > 0
        ? generateInitialFormValues(batch.questions)
        : {};

    return {
      // Agreement fields with default values
      agreement1: '',
      agreement2: '',
      agreement3: '',
      // Dynamic form values
      ...dynamicValues,
    };
  }, [batch.questions]);

  // Combined form for all steps
  const form = useForm<CombinedFormData>({
    initialValues: initialFormValues,
    validate: (values) => {
      // Generate dynamic schema with current form values
      if (batch.questions && batch.questions.length > 0) {
        const dynamicSchema = generateDynamicSchemaWithConditionalLogic(batch.questions, values);
        const combinedSchema = agreementSchema.merge(dynamicSchema);

        try {
          const result = combinedSchema.safeParse(values);
          if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
              if (issue.path.length > 0) {
                errors[issue.path[0] as string] = issue.message;
              }
            });
            return errors;
          }
          return {};
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Validation error caught:', error);
          return {};
        }
      }

      // Fallback to agreement schema only
      try {
        const result = agreementSchema.safeParse(values);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            if (issue.path.length > 0) {
              errors[issue.path[0] as string] = issue.message;
            }
          });
          return errors;
        }
        return {};
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Validation error caught:', error);
        return {};
      }
    },
    validateInputOnChange: hasAttemptedNext || forceValidation > 0,
    validateInputOnBlur: hasAttemptedNext || forceValidation > 0,
  });

  const handleNext = () => {
    setHasAttemptedNext(true);
    setValidationErrors([]);
    setSubmitError(null);

    if (formSteps.length === 0 || activeStep >= formSteps.length) {
      return;
    }

    const currentStep = formSteps[activeStep];

    // For agreement step, check if all agreements are agreed
    if (currentStep.id === 'agreement') {
      if (
        form.values.agreement1 !== 'agree' ||
        form.values.agreement2 !== 'agree' ||
        form.values.agreement3 !== 'agree'
      ) {
        setValidationErrors(['Semua persetujuan harus disetujui untuk melanjutkan']);
        notifications.show({
          title: 'Persetujuan Diperlukan',
          message: 'Mohon setujui semua persyaratan untuk melanjutkan.',
          color: 'red',
          icon: <IconExclamationMark size={16} />,
        });
        return;
      }
    } else if (!canProceedToNextStep(currentStep.questions, form.values)) {
      // For dynamic fields step, use existing validation logic
      const validation = form.validate();
      if (validation.hasErrors) {
        const errors = Object.values(validation.errors).filter(Boolean).map(String);
        setValidationErrors(errors);

        notifications.show({
          title: 'Validasi Gagal',
          message: 'Mohon periksa dan lengkapi semua field yang wajib diisi.',
          color: 'red',
          icon: <IconExclamationMark size={16} />,
        });
        return;
      }
    }

    // Clear values for questions that are no longer visible due to conditional logic
    if (batch.questions && batch.questions.length > 0) {
      const visibleQuestions = batch.questions.filter((question) => {
        if (!question.conditional_logic) {
          return true;
        }
        return evaluateConditionalLogic(question.conditional_logic, form.values);
      });

      const visibleQuestionCodes = new Set(visibleQuestions.map((q) => q.code));

      // Clear values for questions that are no longer visible
      batch.questions.forEach((question) => {
        if (!visibleQuestionCodes.has(question.code) && form.values[question.code] !== undefined) {
          form.setFieldValue(
            question.code,
            question.type === 'checkbox' || question.type === 'multiselect' ? [] : ''
          );
        }
      });
    }

    notifications.show({
      title: `Langkah ${activeStep + 1} Selesai`,
      message: `${currentStep.title} berhasil, lanjut ke langkah berikutnya.`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });

    // Scroll to the status formulir
    viewport.current?.scrollTo({
      top: stepStatusRef.current?.offsetTop || 0,
      behavior: 'smooth',
    });

    setActiveStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const handlePrevious = () => {
    if (activeStep === totalSteps - 1) {
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
    setValidationErrors([]);
    setSubmitError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleStepClick = (step: number) => {
    // Only allow going to previous completed steps
    if (step <= activeStep) {
      setActiveStep(step);
      setValidationErrors([]);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    // Enable validation for all future interactions - this will trigger real-time validation
    setHasAttemptedNext(true);
    setSubmitError(null);
    setValidationErrors([]);

    // Force all fields to be touched and trigger validation errors immediately
    const allFields = ['agreement1', 'agreement2', 'agreement3'];
    if (batch.questions) {
      batch.questions.forEach((q) => allFields.push(q.code));
    }

    const allTouched = allFields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );

    // Force validation to be enabled for immediate error display
    setForceValidation((prev) => prev + 1);

    // Set all fields as touched in one operation
    form.setTouched(allTouched);

    // Small delay to ensure validation state has updated
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Trigger validation immediately after setting touched state
    const validation = form.validate();

    // Check for Turnstile token
    if (!turnstileToken) {
      setValidationErrors(['Verifikasi keamanan harus diselesaikan']);
      notifications.show({
        title: 'Verifikasi Diperlukan',
        message: 'Mohon selesaikan verifikasi keamanan terlebih dahulu.',
        color: 'red',
        icon: <IconExclamationMark size={16} />,
      });
      return;
    }

    if (validation.hasErrors) {
      // Collect all validation errors for display
      const allErrors = Object.values(validation.errors).filter(Boolean).map(String);
      setValidationErrors(allErrors);

      notifications.show({
        title: 'Validasi Gagal',
        message:
          'Terdapat kesalahan pada formulir. Mohon periksa kembali field yang ditandai merah.',
        color: 'red',
        icon: <IconExclamationMark size={16} />,
      });
      return;
    }

    try {
      // Generate answers from visible questions only
      const answers =
        batch.questions && batch.questions.length > 0
          ? generateAnswersFromFormValues(batch.questions, form.values)
          : [];

      // Convert form data to submission format
      const combinedData: ApplicantDataSubmitType = {
        // Extract agreement data
        agreement1: form.values.agreement1,
        agreement2: form.values.agreement2,
        agreement3: form.values.agreement3,
        answers, // Populated with answers from visible questions only

        // Turnstile token
        turnstileToken,
      };

      const response = await submitFormMutation(combinedData);
      if (response.success) {
        // Log form data for debugging in development
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Form data submitted:', combinedData);
        }

        notifications.show({
          title: 'Berhasil!',
          message: 'Formulir Anda telah berhasil dikirim.',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setIsSubmitted(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal mengirim formulir. Silakan coba lagi.';
      setSubmitError(errorMessage);

      notifications.show({
        title: 'Gagal Mengirim',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleReset = () => {
    form.reset();
    setActiveStep(0);
    setIsSubmitted(false);
    setSubmitError(null);
    setValidationErrors([]);
    setHasAttemptedNext(false);
    setTurnstileToken(null);
    turnstileRef.current?.reset();

    notifications.show({
      title: 'Reset Berhasil',
      message: 'Formulir telah direset ke kondisi awal.',
      color: 'blue',
      icon: <IconRefresh size={16} />,
    });
  };

  const canGoNext = () => {
    if (formSteps.length === 0 || activeStep >= formSteps.length) {
      return false;
    }

    const currentStep = formSteps[activeStep];

    // For agreement step
    if (currentStep.id === 'agreement') {
      return (
        form.values.agreement1 === 'agree' &&
        form.values.agreement2 === 'agree' &&
        form.values.agreement3 === 'agree'
      );
    }

    // For dynamic fields step
    return canProceedToNextStep(currentStep.questions, form.values);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < activeStep) {
      return 'completed';
    }
    if (stepIndex === activeStep) {
      return 'active';
    }
    return 'inactive';
  };

  const renderStepContent = () => {
    if (formSteps.length === 0 || activeStep >= formSteps.length) {
      return (
        <Paper
          shadow="sm"
          p="xl"
          radius="lg"
          withBorder
          bg="rgba(255, 255, 255, 0.9)"
          style={{ backdropFilter: 'blur(5px)' }}>
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Tidak Ada Formulir"
            color="red"
            variant="light">
            Tidak ada pertanyaan yang tersedia untuk batch ini.
          </Alert>
        </Paper>
      );
    }

    const currentStep = formSteps[activeStep];

    return (
      <Paper
        shadow="sm"
        p={0}
        radius="lg"
        withBorder
        bg="rgba(255, 255, 255, 0.9)"
        style={{ backdropFilter: 'blur(5px)', overflow: 'hidden' }}>
        <Stack gap="lg">
          <Box p={isMobile ? undefined : 'lg'}>
            {/* Render Agreement Form for first step */}
            {currentStep.id === 'agreement' ? (
              <AgreementForm form={form} isMobile={isMobile} batch={batch} />
            ) : (
              /* Render Dynamic Form Step for other steps */
              <DynamicFormStep
                stepId={currentStep.id}
                title={currentStep.title}
                description={currentStep.description}
                questions={currentStep.questions}
                formValues={form.values}
                form={form}
                isMobile={isMobile}
                showProgress
              />
            )}
          </Box>

          {/* Validation Errors Display */}
          <Transition mounted={validationErrors.length > 0} transition="fade" duration={200}>
            {(styles) => (
              <Paper
                shadow="sm"
                p={0}
                radius="lg"
                withBorder
                bg="rgba(255, 255, 255, 0.9)"
                style={{ ...styles, backdropFilter: 'blur(5px)' }}>
                <Alert
                  radius="lg"
                  icon={<IconAlertCircle size={16} />}
                  title="Kesalahan Validasi"
                  color="red"
                  variant="light"
                  withCloseButton
                  onClose={() => setValidationErrors([])}>
                  <Stack gap="xs">
                    <Text size="sm">Mohon perbaiki kesalahan berikut:</Text>
                    <Box
                      component="ul"
                      style={{
                        margin: 0,
                        paddingLeft: '1.2rem',
                      }}>
                      {validationErrors.map((error, index) => (
                        <li key={index}>
                          <Text size="sm">{error}</Text>
                        </li>
                      ))}
                    </Box>
                  </Stack>
                </Alert>
              </Paper>
            )}
          </Transition>

          {/* Submit Error Display */}
          <Transition mounted={!!submitError} transition="fade" duration={200}>
            {(styles) => (
              <Paper
                shadow="sm"
                p={0}
                radius="lg"
                withBorder
                bg="rgba(255, 255, 255, 0.9)"
                style={{ ...styles, backdropFilter: 'blur(5px)' }}>
                <Alert
                  radius="lg"
                  icon={<IconAlertCircle size={16} />}
                  title="Gagal Mengirim"
                  color="red"
                  withCloseButton
                  onClose={() => setSubmitError(null)}>
                  <Group justify="space-between" align="flex-start">
                    <Text size="sm">{submitError}</Text>
                    <Tooltip label="Coba Lagi">
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={handleSubmit}
                        loading={isSubmitting}>
                        <IconRefresh size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Alert>
              </Paper>
            )}
          </Transition>
        </Stack>
      </Paper>
    );
  };

  if (isSubmitted) {
    return <SubmissionConfirmation onReset={handleReset} batch={batch} />;
  }

  // Main form state
  return (
    <>
      <Container
        p={0}
        size="lg"
        bg="rgba(0, 0, 0, 0.3)"
        style={{
          backdropFilter: 'blur(5px)',
        }}
        h="100vh">
        <Stack gap="xl" h="100%">
          <ScrollArea
            viewportRef={viewport}
            styles={{
              scrollbar: {
                '&[dataOrientation="vertical"] .mantineScrollAreaThumb': {
                  backgroundColor: 'var(--mantine-color-gray-8)',
                },
                '&[dataOrientation="horizontal"] .mantineScrollAreaThumb': {
                  backgroundColor: 'var(--mantine-color-gray-8)',
                },
              },
              thumb: {
                backgroundColor: 'var(--mantine-color-gray-8)',
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-gray-4)',
                },
              },
            }}>
            <Stack gap="xl" p={isMobile ? 'sm' : 'xl'}>
              <FormHeader isMobile={isMobile} batch={batch} />

              {/* Step Status Overview */}
              <Paper
                ref={stepStatusRef}
                p="md"
                radius="md"
                withBorder
                bg="rgba(255, 255, 255, 0.9)"
                style={{ backdropFilter: 'blur(5px)' }}>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      Status Formulir:
                    </Text>
                    <Badge
                      color={
                        getStepStatus(0) === 'completed' && getStepStatus(1) === 'completed'
                          ? 'green'
                          : 'orange'
                      }
                      variant="light">
                      {activeStep + 1} dari {totalSteps} langkah
                    </Badge>
                  </Group>

                  <Group gap="xs">
                    {formSteps.map((step, index) => (
                      <Box key={step.id}>
                        <Tooltip label={step.title}>
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor:
                                getStepStatus(index) === 'completed'
                                  ? 'var(--mantine-color-green-6)'
                                  : getStepStatus(index) === 'active'
                                    ? 'var(--mantine-color-orange-6)'
                                    : 'var(--mantine-color-gray-4)',
                            }}
                          />
                        </Tooltip>
                      </Box>
                    ))}
                  </Group>
                </Group>
              </Paper>

              {renderStepContent()}

              {/* Turnstile Widget - only show on last step */}
              {activeStep === totalSteps - 1 && (
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  bg="rgba(255, 255, 255, 0.9)"
                  style={{ backdropFilter: 'blur(5px)' }}>
                  <Stack gap="sm">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        Verifikasi Keamanan
                      </Text>
                      {turnstileToken && (
                        <Badge color="green" variant="light" size="sm">
                          ✓ Terverifikasi
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      Mohon selesaikan verifikasi keamanan di bawah ini sebelum mengirim formulir
                    </Text>
                    <Center>
                      <TurnstileWidget
                        ref={turnstileRef}
                        onSuccess={setTurnstileToken}
                        onError={() => {
                          setTurnstileToken(null);
                          notifications.show({
                            title: 'Verifikasi Gagal',
                            message:
                              'Terjadi kesalahan pada verifikasi keamanan. Silakan coba lagi.',
                            color: 'red',
                          });
                        }}
                        onExpire={() => {
                          setTurnstileToken(null);
                          notifications.show({
                            title: 'Verifikasi Kedaluwarsa',
                            message:
                              'Verifikasi keamanan telah kedaluwarsa. Silakan verifikasi ulang.',
                            color: 'orange',
                          });
                        }}
                      />
                    </Center>
                  </Stack>
                </Paper>
              )}

              <FormPagination
                isMobile={isMobile}
                activeStep={activeStep}
                totalSteps={totalSteps}
                onNext={activeStep === totalSteps - 1 ? handleSubmit : handleNext}
                onPrevious={handlePrevious}
                onStepClick={handleStepClick}
                canGoNext={canGoNext()}
                canGoPrevious={activeStep > 0}
                isLastStep={activeStep === totalSteps - 1}
                isSubmitting={isSubmitting}
              />
            </Stack>
          </ScrollArea>
        </Stack>
      </Container>
      {isSubmitting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <Flex justify="center" align="center" h="100%">
            <Paper shadow="lg" p="xl" radius="lg" withBorder>
              <Center h="30vh">
                <Stack align="center" gap="xl">
                  <Loader size="xl" color="blue" />
                  <Stack align="center" gap="sm">
                    <Text size="lg" fw={600}>
                      Mengirimkan Formulir
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Sedang memproses data Anda, mohon tunggu sebentar...
                    </Text>
                    <Progress value={65} size="sm" w={200} striped animated />
                  </Stack>
                  <Alert
                    color="blue"
                    variant="light"
                    icon={<IconInfoCircle size={16} />}
                    style={{ maxWidth: 400 }}>
                    <Text size="sm" ta="center">
                      Jangan tutup halaman ini sampai proses selesai
                    </Text>
                  </Alert>
                </Stack>
              </Center>
            </Paper>
          </Flex>
        </div>
      )}
    </>
  );
}
