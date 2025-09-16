/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Center,
  Container,
  Divider,
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
import { useRef, useState } from 'react';

import { submitForm } from '@/lib/api/formApi';
import { Route } from '@/routes/$location/$batch';
import type { ApplicantDataPostType } from '@/types/applicantData.type';

import { AgreementForm } from '../../../components/AgreementForm';
import { FormHeader } from '../../../components/FormHeader';
import { FormPagination } from '../../../components/FormPagination';
import { PersonalInfoForm } from '../../../components/PersonalInfoForm';
import { SubmissionConfirmation } from '../../../components/SubmissionConfirmation';
import TurnstileWidget, { type TurnstileWidgetRef } from '../../../components/TurnstileWidget';
import { type AgreementData, agreementSchema } from '../../../schemas/agreementSchema';
import { type PersonalInfoData, personalInfoSchema } from '../../../schemas/personalInfoSchema';

export default function FormScreen() {
  const batch = Route.useLoaderData();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const [forceValidation, setForceValidation] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const totalSteps = 2; // Agreement, Personal Info
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const stepStatusRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const viewport = useRef<HTMLDivElement>(null);

  // create mutation form submission using tanstack query
  const { mutateAsync: submitFormMutation, isPending: isSubmitting } = useMutation({
    mutationFn: submitForm,
  });

  // Create safe validation functions that handle errors gracefully
  const safeValidateAgreement = (values: AgreementData) => {
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
  };

  const safeValidatePersonalInfo = (values: PersonalInfoData) => {
    try {
      const result = personalInfoSchema.safeParse(values);
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
  };

  // Separate forms for each step
  const agreementForm = useForm<AgreementData>({
    initialValues: {
      agreement1: '' as any, // Empty initial value

      agreement2: '' as any, // Empty initial value

      agreement3: '' as any, // Empty initial value
    },
    validate: safeValidateAgreement, // Always enable validation for submit
    validateInputOnChange: hasAttemptedNext || forceValidation > 0, // Enable when user has attempted submit or forced
    validateInputOnBlur: hasAttemptedNext || forceValidation > 0,
  });

  const personalInfoForm = useForm<PersonalInfoData>({
    initialValues: {
      nama_lengkap: '',
      nik: '',
      jenis_kelamin: '' as any, // Empty initial value
      tempat_lahir: '',

      tanggal_lahir: '', // Empty initial value
      usia: '' as any, // Empty initial value
      daerah_lahir: '',
      provinsi_lahir: '',
      tinggi_badan: '' as any, // Empty initial value
      berat_badan: '' as any, // Empty initial value
      daerah_domisili: '',
      provinsi_domisili: '',
      kota_domisili: '',
      alamat_domisili: '',
      program_terpilih: '' as any, // Empty initial value
      jurusan_pendidikan: '',
      jenjang_pendidikan: '' as any,
      instansi_pendidikan: '',
      nim: '',
      status_ijazah: '' as any,
      nomor_whatsapp: '',
      email: '',
      status_perkawinan: '' as any,
      melanjutkan_pendidikan: '' as any,
      ukuran_baju: '' as any,
      riwayat_penyakit: '',
    },
    validate: safeValidatePersonalInfo, // Always enable validation for submit
    validateInputOnChange: hasAttemptedNext || forceValidation > 0, // Enable when user has attempted submit or forced
    validateInputOnBlur: hasAttemptedNext || forceValidation > 0,
  });

  // Calculate completion percentage for current step
  const getCurrentStepCompletion = () => {
    if (activeStep === 0) {
      const values = agreementForm.values;
      const total = 3;
      const filled = [values.agreement1, values.agreement2, values.agreement3].filter(
        (val) => val === 'agree'
      ).length;
      return (filled / total) * 100;
    } else if (activeStep === 1) {
      const values = personalInfoForm.values;
      const requiredFields = [
        values.nama_lengkap &&
          typeof values.nama_lengkap === 'string' &&
          values.nama_lengkap.trim(),
        values.nik && typeof values.nik === 'string' && values.nik.trim(),
        values.jenis_kelamin &&
          typeof values.jenis_kelamin === 'string' &&
          values.jenis_kelamin.trim(),
        values.tempat_lahir &&
          typeof values.tempat_lahir === 'string' &&
          values.tempat_lahir.trim(),
        values.tanggal_lahir && values.tanggal_lahir === 'string',
        values.usia && typeof values.usia === 'number' && values.usia > 0,
        values.daerah_lahir &&
          typeof values.daerah_lahir === 'string' &&
          values.daerah_lahir.trim(),
        values.provinsi_lahir &&
          typeof values.provinsi_lahir === 'string' &&
          values.provinsi_lahir.trim(),
        values.tinggi_badan && typeof values.tinggi_badan === 'number' && values.tinggi_badan > 0,
        values.berat_badan && typeof values.berat_badan === 'number' && values.berat_badan > 0,
        values.daerah_domisili &&
          typeof values.daerah_domisili === 'string' &&
          values.daerah_domisili.trim(),
        values.provinsi_domisili &&
          typeof values.provinsi_domisili === 'string' &&
          values.provinsi_domisili.trim(),
        values.kota_domisili &&
          typeof values.kota_domisili === 'string' &&
          values.kota_domisili.trim(),
        values.alamat_domisili &&
          typeof values.alamat_domisili === 'string' &&
          values.alamat_domisili.trim(),
        values.program_terpilih &&
          typeof values.program_terpilih === 'string' &&
          values.program_terpilih.trim(),
        values.jurusan_pendidikan &&
          typeof values.jurusan_pendidikan === 'string' &&
          values.jurusan_pendidikan.trim(),
        values.jenjang_pendidikan &&
          typeof values.jenjang_pendidikan === 'string' &&
          values.jenjang_pendidikan.trim(),
        values.instansi_pendidikan &&
          typeof values.instansi_pendidikan === 'string' &&
          values.instansi_pendidikan.trim(),
        values.status_ijazah &&
          typeof values.status_ijazah === 'string' &&
          values.status_ijazah.trim(),
        values.nomor_whatsapp &&
          typeof values.nomor_whatsapp === 'string' &&
          values.nomor_whatsapp.trim(),
        values.email && typeof values.email === 'string' && values.email.trim(),
        values.status_perkawinan &&
          typeof values.status_perkawinan === 'string' &&
          values.status_perkawinan.trim(),
        values.melanjutkan_pendidikan &&
          typeof values.melanjutkan_pendidikan === 'string' &&
          values.melanjutkan_pendidikan.trim(),
        values.ukuran_baju && typeof values.ukuran_baju === 'string' && values.ukuran_baju.trim(),
        values.riwayat_penyakit &&
          typeof values.riwayat_penyakit === 'string' &&
          values.riwayat_penyakit.trim(),
      ];
      const filled = requiredFields.filter(Boolean).length;
      return (filled / requiredFields.length) * 100;
    }
    return 0;
  };

  const handleNext = () => {
    setHasAttemptedNext(true);
    setValidationErrors([]);
    setSubmitError(null);

    if (activeStep === 0) {
      // Convert and validate agreements using Zod directly
      const agreementData: AgreementData = {
        agreement1: agreementForm.values.agreement1 as 'agree' | 'disagree',
        agreement2: agreementForm.values.agreement2 as 'agree' | 'disagree',
        agreement3: agreementForm.values.agreement3 as 'agree' | 'disagree',
      };

      const agreementResult = agreementSchema.safeParse(agreementData);
      if (!agreementResult.success) {
        const errors = agreementResult.error.issues.map((issue) => issue.message);
        setValidationErrors(errors);

        notifications.show({
          title: 'Validasi Gagal',
          message: 'Mohon periksa dan lengkapi semua persetujuan yang diperlukan.',
          color: 'red',
          icon: <IconExclamationMark size={16} />,
        });
        return;
      }

      notifications.show({
        title: 'Langkah 1 Selesai',
        message: 'Persetujuan berhasil, lanjut ke informasi pribadi.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } else if (activeStep === 1) {
      // Convert and validate personal info using Zod directly
      const personalInfoData: PersonalInfoData = {
        nama_lengkap: personalInfoForm.values.nama_lengkap,
        nik: personalInfoForm.values.nik,
        jenis_kelamin: personalInfoForm.values.jenis_kelamin as 'L' | 'P',
        tempat_lahir: personalInfoForm.values.tempat_lahir,
        tanggal_lahir: personalInfoForm.values.tanggal_lahir,
        usia: personalInfoForm.values.usia || 0,
        daerah_lahir: personalInfoForm.values.daerah_lahir,
        provinsi_lahir: personalInfoForm.values.provinsi_lahir,
        tinggi_badan: personalInfoForm.values.tinggi_badan || 0,
        berat_badan: personalInfoForm.values.berat_badan || 0,
        daerah_domisili: personalInfoForm.values.daerah_domisili,
        provinsi_domisili: personalInfoForm.values.provinsi_domisili,
        kota_domisili: personalInfoForm.values.kota_domisili,
        alamat_domisili: personalInfoForm.values.alamat_domisili,
        program_terpilih: personalInfoForm.values.program_terpilih as
          | 'pkpp-estate'
          | 'pkpp-ktu'
          | 'pkpp-mill',
        jurusan_pendidikan: personalInfoForm.values.jurusan_pendidikan,
        jenjang_pendidikan: personalInfoForm.values.jenjang_pendidikan,
        instansi_pendidikan: personalInfoForm.values.instansi_pendidikan,
        nim: personalInfoForm.values.nim,
        status_ijazah: personalInfoForm.values.status_ijazah,
        nomor_whatsapp: personalInfoForm.values.nomor_whatsapp,
        email: personalInfoForm.values.email,
        status_perkawinan: personalInfoForm.values.status_perkawinan,
        melanjutkan_pendidikan: personalInfoForm.values.melanjutkan_pendidikan,
        ukuran_baju: personalInfoForm.values.ukuran_baju,
        riwayat_penyakit: personalInfoForm.values.riwayat_penyakit,
      };

      const personalInfoResult = personalInfoSchema.safeParse(personalInfoData);
      if (!personalInfoResult.success) {
        const errors = personalInfoResult.error.issues.map((issue) => issue.message);
        setValidationErrors(errors);

        notifications.show({
          title: 'Validasi Gagal',
          message: 'Mohon periksa dan perbaiki kesalahan pada formulir.',
          color: 'red',
          icon: <IconExclamationMark size={16} />,
        });
        return;
      }
    }

    // scroll to the status formulir
    // window.scrollTo({
    //   top: stepStatusRef.current?.offsetTop || 0,
    //   behavior: 'smooth',
    // });
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
    const agreementFields = ['agreement1', 'agreement2', 'agreement3'];
    const personalInfoFields = [
      'nama_lengkap',
      'nik',
      'jenis_kelamin',
      'tempat_lahir',
      'tanggal_lahir',
      'usia',
      'daerah_lahir',
      'provinsi_lahir',
      'tinggi_badan',
      'berat_badan',
      'daerah_domisili',
      'provinsi_domisili',
      'kota_domisili',
      'alamat_domisili',
      'program_terpilih',
      'jurusan_pendidikan',
      'jenjang_pendidikan',
      'instansi_pendidikan',
      'nim',
      'status_ijazah',
      'nomor_whatsapp',
      'email',
      'status_perkawinan',
    ];

    // Create touched states for all fields at once
    const allAgreementTouched = agreementFields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );

    const allPersonalInfoTouched = personalInfoFields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );

    // Force validation to be enabled for immediate error display
    setForceValidation((prev) => prev + 1);

    // Set all fields as touched in one operation
    agreementForm.setTouched(allAgreementTouched);
    personalInfoForm.setTouched(allPersonalInfoTouched);

    // Small delay to ensure validation state has updated
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Trigger validation immediately after setting touched state
    const agreementValidation = agreementForm.validate();
    const personalInfoValidation = personalInfoForm.validate();

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

    if (agreementValidation.hasErrors || personalInfoValidation.hasErrors) {
      // Collect all validation errors for display
      const allErrors = [
        ...Object.values(agreementValidation.errors).filter(Boolean).map(String),
        ...Object.values(personalInfoValidation.errors).filter(Boolean).map(String),
      ];
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
      // Combine data from both forms and convert to proper types
      const combinedData: ApplicantDataPostType = {
        // Agreement data
        agreement1: agreementForm.values.agreement1 as 'agree' | 'disagree',
        agreement2: agreementForm.values.agreement2 as 'agree' | 'disagree',
        agreement3: agreementForm.values.agreement3 as 'agree' | 'disagree',
        // Personal info data
        nama_lengkap: personalInfoForm.values.nama_lengkap,
        nik: personalInfoForm.values.nik,
        jenis_kelamin: personalInfoForm.values.jenis_kelamin as 'L' | 'P',
        tempat_lahir: personalInfoForm.values.tempat_lahir,
        tanggal_lahir: personalInfoForm.values.tanggal_lahir,
        usia: Number(personalInfoForm.values.usia || 0),
        daerah_lahir: personalInfoForm.values.daerah_lahir,
        provinsi_lahir: personalInfoForm.values.provinsi_lahir,
        tinggi_badan: Number(personalInfoForm.values.tinggi_badan || 0),
        berat_badan: Number(personalInfoForm.values.berat_badan || 0),
        daerah_domisili: personalInfoForm.values.daerah_domisili,
        provinsi_domisili: personalInfoForm.values.provinsi_domisili,
        kota_domisili: personalInfoForm.values.kota_domisili,
        alamat_domisili: personalInfoForm.values.alamat_domisili,
        program_terpilih: personalInfoForm.values.program_terpilih as
          | 'pkpp-estate'
          | 'pkpp-ktu'
          | 'pkpp-mill',
        jurusan_pendidikan: personalInfoForm.values.jurusan_pendidikan,
        jenjang_pendidikan: personalInfoForm.values.jenjang_pendidikan,
        instansi_pendidikan: personalInfoForm.values.instansi_pendidikan,
        nim: personalInfoForm.values.nim || null,
        status_ijazah: personalInfoForm.values.status_ijazah,
        nomor_whatsapp: personalInfoForm.values.nomor_whatsapp,
        email: personalInfoForm.values.email,
        status_perkawinan: personalInfoForm.values.status_perkawinan,
        melanjutkan_pendidikan: personalInfoForm.values.melanjutkan_pendidikan,
        ukuran_baju: personalInfoForm.values.ukuran_baju,
        riwayat_penyakit: personalInfoForm.values.riwayat_penyakit,
        batch_id: batch.id,
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
    agreementForm.reset();
    personalInfoForm.reset();
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
    if (activeStep === 0) {
      // Check agreements - all must be 'agree'
      return (
        agreementForm.values.agreement1 === 'agree' &&
        agreementForm.values.agreement2 === 'agree' &&
        agreementForm.values.agreement3 === 'agree'
      );
    } else if (activeStep === 1) {
      // Check personal info - basic required fields
      const values = personalInfoForm.values;
      return !!(
        values.nama_lengkap &&
        typeof values.nama_lengkap === 'string' &&
        values.nama_lengkap.trim() &&
        values.nik &&
        typeof values.nik === 'string' &&
        values.nik.trim() &&
        values.jenis_kelamin &&
        typeof values.jenis_kelamin === 'string' &&
        values.jenis_kelamin.trim() &&
        values.tempat_lahir &&
        typeof values.tempat_lahir === 'string' &&
        values.tempat_lahir.trim() &&
        values.tanggal_lahir &&
        values.tanggal_lahir === 'string' &&
        values.usia &&
        typeof values.usia === 'number' &&
        values.usia > 0 &&
        values.daerah_lahir &&
        typeof values.daerah_lahir === 'string' &&
        values.daerah_lahir.trim() &&
        values.provinsi_lahir &&
        typeof values.provinsi_lahir === 'string' &&
        values.provinsi_lahir.trim() &&
        values.tinggi_badan &&
        typeof values.tinggi_badan === 'number' &&
        values.tinggi_badan > 0 &&
        values.berat_badan &&
        typeof values.berat_badan === 'number' &&
        values.berat_badan > 0 &&
        values.daerah_domisili &&
        typeof values.daerah_domisili === 'string' &&
        values.daerah_domisili.trim() &&
        values.provinsi_domisili &&
        typeof values.provinsi_domisili === 'string' &&
        values.provinsi_domisili.trim() &&
        values.kota_domisili &&
        typeof values.kota_domisili === 'string' &&
        values.kota_domisili.trim() &&
        values.alamat_domisili &&
        typeof values.alamat_domisili === 'string' &&
        values.alamat_domisili.trim() &&
        values.program_terpilih &&
        typeof values.program_terpilih === 'string' &&
        values.program_terpilih.trim() &&
        values.jenjang_pendidikan &&
        typeof values.jenjang_pendidikan === 'string' &&
        values.jenjang_pendidikan.trim() &&
        values.instansi_pendidikan &&
        typeof values.instansi_pendidikan === 'string' &&
        values.instansi_pendidikan.trim() &&
        values.status_ijazah &&
        typeof values.status_ijazah === 'string' &&
        values.status_ijazah.trim() &&
        values.nomor_whatsapp &&
        typeof values.nomor_whatsapp === 'string' &&
        values.nomor_whatsapp.trim() &&
        values.email &&
        typeof values.email === 'string' &&
        values.email.trim() &&
        values.status_perkawinan &&
        typeof values.status_perkawinan === 'string' &&
        values.status_perkawinan.trim() &&
        values.melanjutkan_pendidikan &&
        typeof values.melanjutkan_pendidikan === 'string' &&
        values.melanjutkan_pendidikan.trim() &&
        values.ukuran_baju &&
        typeof values.ukuran_baju === 'string' &&
        values.ukuran_baju.trim() &&
        values.riwayat_penyakit &&
        typeof values.riwayat_penyakit === 'string' &&
        values.riwayat_penyakit.trim()
      );
    }
    return true;
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
    const completion = getCurrentStepCompletion();

    return (
      <Paper
        shadow="sm"
        p={0}
        radius="lg"
        withBorder
        bg="rgba(255, 255, 255, 0.9)"
        style={{ backdropFilter: 'blur(5px)' }}>
        <Stack gap="lg">
          {/* Step Progress Indicator */}
          <Box pt={isMobile ? 'sm' : 'xl'} px={isMobile ? 'sm' : 'xl'}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500} c="dimmed">
                Progres Langkah {activeStep + 1}
              </Text>
              <Badge
                color={completion === 100 ? 'green' : completion > 50 ? 'yellow' : 'gray'}
                variant="light">
                {Math.round(completion)}% selesai
              </Badge>
            </Group>
            <Progress
              value={completion}
              size="sm"
              radius="xl"
              color={completion === 100 ? 'green' : completion > 50 ? 'yellow' : 'blue'}
              striped={completion > 0 && completion < 100}
              animated={completion > 0 && completion < 100}
            />
          </Box>

          <Divider />

          {/* Form Content */}
          <Box p={isMobile ? undefined : 'lg'}>
            {activeStep === 0 && <AgreementForm form={agreementForm} isMobile={isMobile} />}
            {activeStep === 1 && <PersonalInfoForm form={personalInfoForm} isMobile={isMobile} />}
          </Box>

          {/* Validation Errors Display */}
          <Transition mounted={validationErrors.length > 0} transition="fade" duration={200}>
            {(styles) => (
              <div style={styles}>
                <Alert
                  m={isMobile ? 'sm' : 'xl'}
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
              </div>
            )}
          </Transition>

          {/* Submit Error Display */}
          <Transition mounted={!!submitError} transition="fade" duration={200}>
            {(styles) => (
              <div style={styles}>
                <Alert
                  m={isMobile ? 'sm' : 'xl'}
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
              </div>
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
                '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                  backgroundColor: 'var(--mantine-color-gray-8)',
                },
                '&[data-orientation="horizontal"] .mantine-ScrollArea-thumb': {
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
                    {[0, 1].map((step) => (
                      <Box key={step}>
                        <Tooltip label={step === 0 ? 'Persetujuan' : 'Informasi Pribadi'}>
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor:
                                getStepStatus(step) === 'completed'
                                  ? 'var(--mantine-color-green-6)'
                                  : getStepStatus(step) === 'active'
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
