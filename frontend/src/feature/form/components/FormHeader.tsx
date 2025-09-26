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

const listColor = [
  'green',
  'blue',
  'orange',
  'red',
  'purple',
  'pink',
  'gray',
  'yellow',
  'cyan',
  'indigo',
  'violet',
  'grape',
  'teal',
  'lime',
  'amber',
  'coral',
  'gold',
  'maroon',
  'navy',
  'olive',
  'plum',
  'salmon',
  'sienna',
  'tan',
  'turquoise',
  'violet',
  'wheat',
  'yellow',
];

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
    <Container p={0} size="lg" w="100%">
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
              <Title order={1} ta="center" c="orange">
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
              <Paper p="md" bg="orange.0" radius="md">
                <Title order={3} mb="md" c="orange">
                  PT. Sawit Sumbermas Sarana, Tbk. / CBI GROUP
                </Title>
                <Text size="sm" mb="md">
                  PT. Sawit Sumbermas Sarana, Tbk. / Citra Borneo Indah Group saat ini membuka
                  kesempatan berkarir bagi rekan-rekan fresh graduate untuk mengikuti{' '}
                  {batch.program_category?.name} Angkatan {batch.number_code} dengan beberapa
                  program sebagai berikut:
                </Text>
              </Paper>

              {/* Programs */}
              <div>
                <Title order={3} mb="md" c="orange">
                  Program yang Tersedia
                </Title>
                <Stack gap="md">
                  {batch.program_category?.programs?.map((program, index) => (
                    <Paper p="md" withBorder key={program.id}>
                      <Group mb="xs">
                        <Badge color={listColor[index] ?? 'gray'} variant="light">
                          {program.name}
                        </Badge>
                      </Group>
                      <Text size="sm">
                        Pendidikan min. {program.min_education} {program.majors.join(', ')}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </div>

              {/* Requirements */}
              <div>
                <Title order={3} mb="md" c="orange">
                  Ketentuan Umum
                </Title>
                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon size="sm" color="orange" variant="light">
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
                <Title order={3} mb="md" c="orange">
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
