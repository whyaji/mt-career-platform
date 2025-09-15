import {
  Alert,
  Badge,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconSchool, IconUser } from '@tabler/icons-react';

interface FormSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any;
}

export function FormSummary({ formData }: FormSummaryProps) {
  const getProgramLabel = (program: string) => {
    const programs = {
      'pkpp-estate': 'PKPP Estate',
      'pkpp-ktu': 'PKPP KTU',
      'pkpp-mill': 'PKPP Mill',
    };
    return programs[program as keyof typeof programs] || program;
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'pkpp-estate': 'green',
      'pkpp-ktu': 'blue',
      'pkpp-mill': 'orange',
    };
    return colors[program as keyof typeof colors] || 'gray';
  };

  const formatDate = (date: Date | string) => {
    if (!date) {
      return '-';
    }
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" c="blue.8">
            Ringkasan Formulir
          </Title>
          <Text size="sm" c="dimmed">
            Silakan periksa kembali informasi yang telah Anda isi sebelum mengirimkan formulir
          </Text>
        </div>

        {/* Personal Information */}
        <div>
          <Title order={3} mb="md" c="blue.8">
            <Group gap="sm">
              <IconUser size={20} />
              Informasi Pribadi
            </Group>
          </Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Nama Lengkap
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.fullName || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  NIK
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.nik || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Email
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.email || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  No. Telepon
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.phone || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Tanggal Lahir
                </Text>
                <Text size="sm" c="dimmed">
                  {formatDate(formData.birthDate)}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Jenis Kelamin
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.gender === 'male'
                    ? 'Laki-laki'
                    : formData.gender === 'female'
                      ? 'Perempuan'
                      : '-'}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>

          <Stack gap="xs" mt="md">
            <Text size="sm" fw={500}>
              Alamat
            </Text>
            <Text size="sm" c="dimmed">
              {formData.address || '-'}
            </Text>
            <Text size="sm" c="dimmed">
              {formData.city || '-'}, {formData.postalCode || '-'}
            </Text>
          </Stack>
        </div>

        <Divider />

        {/* Education Information */}
        <div>
          <Title order={3} mb="md" c="blue.8">
            <Group gap="sm">
              <IconSchool size={20} />
              Informasi Pendidikan
            </Group>
          </Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Program yang Dipilih
                </Text>
                <Badge color={getProgramColor(formData.selectedProgram)} variant="light" size="lg">
                  {getProgramLabel(formData.selectedProgram)}
                </Badge>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Jenjang Pendidikan
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.educationLevel === 'd3'
                    ? 'D3'
                    : formData.educationLevel === 's1'
                      ? 'S1'
                      : '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Universitas
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.university || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Jurusan
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.major || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  IPK
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.gpa || '-'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Tahun Lulus
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.graduationYear || '-'}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>

          <Stack gap="xs" mt="md">
            <Text size="sm" fw={500}>
              Status Perkawinan
            </Text>
            <Text size="sm" c="dimmed">
              {formData.maritalStatus === 'single'
                ? 'Belum Menikah'
                : formData.maritalStatus === 'married'
                  ? 'Sudah Menikah'
                  : '-'}
            </Text>
          </Stack>
        </div>

        <Divider />

        {/* Agreements */}
        <div>
          <Title order={3} mb="md" c="blue.8">
            Persetujuan
          </Title>

          <Stack gap="md">
            <Group>
              <ThemeIcon
                color={formData.agreement1 === 'agree' ? 'green' : 'red'}
                variant="light"
                size="sm">
                {formData.agreement1 === 'agree' ? (
                  <IconCheck size={12} />
                ) : (
                  <IconAlertCircle size={12} />
                )}
              </ThemeIcon>
              <Text size="sm">
                <strong>Training & OJT:</strong>{' '}
                {formData.agreement1 === 'agree' ? 'Sepakat' : 'Tidak Sepakat'}
              </Text>
            </Group>

            <Group>
              <ThemeIcon
                color={formData.agreement2 === 'agree' ? 'green' : 'red'}
                variant="light"
                size="sm">
                {formData.agreement2 === 'agree' ? (
                  <IconCheck size={12} />
                ) : (
                  <IconAlertCircle size={12} />
                )}
              </ThemeIcon>
              <Text size="sm">
                <strong>Karyawan & Ikatan Dinas:</strong>{' '}
                {formData.agreement2 === 'agree' ? 'Sepakat' : 'Tidak Sepakat'}
              </Text>
            </Group>

            <Group>
              <ThemeIcon
                color={formData.agreement3 === 'agree' ? 'green' : 'red'}
                variant="light"
                size="sm">
                {formData.agreement3 === 'agree' ? (
                  <IconCheck size={12} />
                ) : (
                  <IconAlertCircle size={12} />
                )}
              </ThemeIcon>
              <Text size="sm">
                <strong>Penyimpanan Ijazah:</strong>{' '}
                {formData.agreement3 === 'agree' ? 'Sepakat' : 'Tidak Sepakat'}
              </Text>
            </Group>
          </Stack>
        </div>

        <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
          <Text size="sm">
            <strong>Konfirmasi:</strong> Dengan mengirimkan formulir ini, Anda menyatakan bahwa
            semua informasi yang diberikan adalah benar dan Anda telah membaca serta menyetujui
            semua ketentuan yang berlaku.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
}
