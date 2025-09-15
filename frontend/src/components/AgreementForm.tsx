import { Alert, Divider, Group, Paper, Radio, Stack, Text, Title } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

import type { AgreementData } from '../schemas/agreementSchema';

interface AgreementFormProps {
  form: UseFormReturnType<AgreementData>;
  isMobile?: boolean;
}

export function AgreementForm({ form, isMobile = false }: AgreementFormProps) {
  return (
    <Paper
      p={isMobile ? 'sm' : 'xl'}
      radius="lg"
      withBorder={!isMobile}
      shadow={isMobile ? 'none' : undefined}>
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" c="blue.8">
            PROGRAM KEPEMIMPINAN PERKEBUNAN PRATAMA (PKPP) ANGKATAN XXV
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Trainer Program oleh PT. Sawit Sumberma Sarana, Tbk. / Citra Borneo Indah Group ini
            diawali dengan Training selama 3 bulan, On The Job Training (OJT) selama 6 bulan jika
            dinyatakan lolos akan diangkat sebagai karyawan tetap dan melaksanakan masa bakti Ikatan
            Dinas.
          </Text>
        </div>

        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            <strong>
              Sebagai bukti komitmen peserta fresh graduate untuk mengikuti Trainer Program ini,
            </strong>
            selama OJT hingga berakhir masa Ikatan Dinas status Ijazah Asli dari Pendidikan Terakhir
            peserta akan disimpan perusahaan.
          </Text>
        </Alert>

        <Divider />

        <Stack gap="xl">
          {/* Agreement 1 */}
          <Paper p="md" withBorder radius="md">
            <Stack gap="md">
              <Text fw={600} size="md">
                1. Jika dinyatakan lolos seleksi, saya bersedia untuk mengikuti Training selama 3
                bulan dan On The Job Training selama 6 bulan
              </Text>
              <Text size="sm" c="dimmed">
                Selama masa OJT sudah mendapatkan uang saku sesuai dengan ketentuan perusahaan
              </Text>
              <Radio.Group {...form.getInputProps('agreement1')}>
                <Group mt="xs">
                  <Radio value="agree" label="Sepakat" color="green" icon={IconCheck} />
                  <Radio value="disagree" label="Tidak Sepakat" color="red" icon={IconX} />
                </Group>
              </Radio.Group>
            </Stack>
          </Paper>

          {/* Agreement 2 */}
          <Paper p="md" withBorder radius="md">
            <Stack gap="md">
              <Text fw={600} size="md">
                2. Jika dinyatakan lolos seleksi & lolos Training hingga OJT, saya bersedia untuk
                diangkat sebagai karyawan dan menyelesaikan masa bakti Ikatan Dinas
              </Text>
              <Radio.Group {...form.getInputProps('agreement2')}>
                <Group mt="xs">
                  <Radio value="agree" label="Sepakat" color="green" icon={IconCheck} />
                  <Radio value="disagree" label="Tidak Sepakat" color="red" icon={IconX} />
                </Group>
              </Radio.Group>
            </Stack>
          </Paper>

          {/* Agreement 3 */}
          <Paper p="md" withBorder radius="md">
            <Stack gap="md">
              <Text fw={600} size="md">
                3. Bersedia menyimpan Ijazah Pendidikan Terakhir saya kepada perusahaan selama masa
                Training, OJT hingga akhir Ikatan Dinas
              </Text>
              <Text size="sm" c="dimmed">
                Ijazah akan disimpan perusahaan di lokasi yang aman dan dapat ditanyakan kapanpun
                dibutuhkan
              </Text>
              <Radio.Group {...form.getInputProps('agreement3')}>
                <Group mt="xs">
                  <Radio value="agree" label="Sepakat" color="green" icon={IconCheck} />
                  <Radio value="disagree" label="Tidak Sepakat" color="red" icon={IconX} />
                </Group>
              </Radio.Group>
            </Stack>
          </Paper>
        </Stack>

        <Divider />

        <Alert color="yellow" variant="light" radius="lg">
          <Text size="sm">
            <strong>Penting:</strong> Pastikan Anda telah membaca dan memahami semua ketentuan di
            atas sebelum melanjutkan. Dengan melanjutkan, Anda menyatakan bahwa Anda telah membaca,
            memahami, dan menyetujui semua ketentuan yang berlaku.
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
}
