import {
  Badge,
  Container,
  Group,
  Image,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';

import type { BatchType } from '@/types/batch.type';

export function FormHeader({
  isMobile = false,
  batch,
  withDetail = true,
}: {
  isMobile?: boolean;
  batch: BatchType;
  withDetail?: boolean;
}) {
  return (
    <Container p={0} size="lg" py="xl" w="100%">
      <Paper
        shadow="sm"
        p={isMobile ? 'sm' : 'xl'}
        radius="md"
        bg="rgba(255, 255, 255, 0.9)"
        style={{ backdropFilter: 'blur(5px)' }}>
        <Stack gap="lg">
          {/* Company Header */}
          <Group justify="center" mb="md">
            <Image src="/images/ssms-badge-icon.png" alt="SSMS Badge" w={150} fit="contain" />
            <div>
              <Title order={1} ta="center" c="blue">
                FORMULIR CAMPUS HIRING
              </Title>
              <Text size="lg" fw={600} ta="center" c="dimmed">
                {batch.location} {batch.number_code}
              </Text>
            </div>
          </Group>

          {withDetail && (
            <>
              {/* Company Info */}
              <Paper p="md" bg="blue.0" radius="md">
                <Title order={3} mb="md" c="blue.8">
                  PT. Sawit Sumbermas Sarana, Tbk. / CBI GROUP
                </Title>
                <Text size="sm" mb="md">
                  PT. Sawit Sumbermas Sarana, Tbk. / Citra Borneo Indah Group saat ini membuka
                  kesempatan berkarir bagi rekan-rekan fresh graduate untuk mengikuti Program
                  Kepemimpinan Perkebunan Pratama (PKPP) Angkatan {batch.number_code} dengan
                  beberapa program sebagai berikut:
                </Text>
              </Paper>

              {/* Programs */}
              <div>
                <Title order={3} mb="md" c="blue.8">
                  Program yang Tersedia
                </Title>
                <Stack gap="md">
                  <Paper p="md" withBorder>
                    <Group mb="xs">
                      <Badge color="green" variant="light">
                        PKPP Estate
                      </Badge>
                    </Group>
                    <Text size="sm">
                      Pendidikan min. D3 jurusan Perkebunan, Pertanian dan turunannya
                    </Text>
                  </Paper>

                  <Paper p="md" withBorder>
                    <Group mb="xs">
                      <Badge color="blue" variant="light">
                        PKPP KTU
                      </Badge>
                    </Group>
                    <Text size="sm">Pendidikan min. D3/S1 jurusan Akuntansi & Perpajakan</Text>
                  </Paper>

                  <Paper p="md" withBorder>
                    <Group mb="xs">
                      <Badge color="orange" variant="light">
                        PKPP Mill
                      </Badge>
                    </Group>
                    <Text size="sm">
                      Pendidikan min. S1 jurusan Teknik Mesin, Teknik Industri, Teknik Elektro,
                      Teknik Kimia
                    </Text>
                  </Paper>
                </Stack>
              </div>

              {/* Requirements */}
              <div>
                <Title order={3} mb="md" c="blue.8">
                  Ketentuan Umum
                </Title>
                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon size="sm" color="blue" variant="light">
                      <IconSchool size={12} />
                    </ThemeIcon>
                  }>
                  <List.Item>
                    Fresh graduate D3-S1 jurusan sesuai ketentuan masing-masing program dengan IPK
                    min. 2,75
                  </List.Item>
                  <List.Item>Belum menikah</List.Item>
                  <List.Item>
                    Bersedia penempatan di site operasional sekitar Kalimantan Tengah
                  </List.Item>
                </List>
              </div>

              {/* Program Description */}
              <Paper p="md" bg="gray.0" radius="md">
                <Title order={3} mb="md" c="blue.8">
                  Tentang Program
                </Title>
                <Text size="sm">
                  Program ini merupakan program khusus fresh graduate yang ditujukan bagi
                  insan-insan muda fresh graduate yang berdomisili di {batch.location} dan
                  sekitarnya dengan jenjang pendidikan min. D3 yang berbakat dan penuh semangat.
                  Program ini diawali dengan Training selama 3 Bulan, lanjut OJT (On The Job
                  Training) selama 6 Bulan dan dilanjutkan dengan masa Ikatan Dinas.
                </Text>
              </Paper>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
