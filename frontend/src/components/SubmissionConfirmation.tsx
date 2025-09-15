import { Alert, Button, Container, Flex, Paper, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconHome } from '@tabler/icons-react';

import type { BatchType } from '@/types/batch.type';

interface SubmissionConfirmationProps {
  onReset: () => void;
  batch: BatchType;
}

export function SubmissionConfirmation({ onReset, batch }: SubmissionConfirmationProps) {
  return (
    <Container
      size="lg"
      py="xl"
      bg="rgba(0, 0, 0, 0.3)"
      style={{ backdropFilter: 'blur(5px)' }}
      h="100vh">
      <Flex justify="center" align="center" h="100%">
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg" align="center">
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: '#51cf66',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                <IconCheck size={40} color="white" />
              </div>

              <Title order={2} mb="md" c="green.8">
                Formulir Berhasil Dikirim!
              </Title>

              <Text size="lg" c="dimmed" mb="lg">
                Terima kasih telah mendaftar Program Kepemimpinan Perkebunan Pratama (PKPP) Angkatan
                {batch.number_code} {batch.location}. Data Anda telah berhasil disimpan.
              </Text>
            </div>

            <Alert color="blue" variant="light" style={{ width: '100%' }}>
              <Text size="sm">
                <strong>Langkah Selanjutnya:</strong>
                <br />
                • Tim HR akan meninjau aplikasi Anda
                <br />
                • Jika lolos seleksi administrasi, Anda akan dihubungi untuk tahap selanjutnya
                <br />
              </Text>
            </Alert>

            <Alert color="yellow" variant="light" style={{ width: '100%' }}>
              <Text size="sm">
                <strong>Informasi Penting:</strong>
                <br />
                • Program ini hanya untuk fresh graduate yang belum menikah
                <br />
                • Penempatan kerja di site operasional sekitar Kalimantan Tengah
                <br />
                • Training 3 bulan + OJT 6 bulan + Ikatan Dinas
                <br />• Ijazah asli akan disimpan perusahaan selama program berlangsung
              </Text>
            </Alert>

            <Button
              size="lg"
              leftSection={<IconHome size={20} />}
              onClick={onReset}
              color="blue"
              variant="filled">
              Daftar Lagi
            </Button>
          </Stack>
        </Paper>
      </Flex>
    </Container>
  );
}
