import { Badge, Divider, Group, Modal, Stack, Text } from '@mantine/core';
import {
  IconCalendar,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRuler,
  IconSchool,
  IconUser,
} from '@tabler/icons-react';

import type { ApplicantDataType } from '@/types/applicant.type';

interface ApplicationDetailModalProps {
  opened: boolean;
  onClose: () => void;
  application: ApplicantDataType | null;
  loading?: boolean;
}

export function ApplicationDetailModal({
  opened,
  onClose,
  application,
  loading: _loading = false,
}: ApplicationDetailModalProps) {
  if (!application) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Application Details"
      size="lg"
      radius="md"
      centered>
      <Stack gap="md">
        {/* Personal Information */}
        <div>
          <Text size="lg" fw={600} mb="sm" c="blue">
            Personal Information
          </Text>
          <Stack gap="xs">
            <Group gap="sm">
              <IconUser size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Full Name
                </Text>
                <Text fw={500}>{application.nama_lengkap}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconId size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  NIK
                </Text>
                <Text fw={500}>{application.nik}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconCalendar size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Date of Birth
                </Text>
                <Text fw={500}>
                  {application.tempat_lahir},{' '}
                  {new Date(application.tanggal_lahir).toLocaleDateString()}
                </Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconRuler size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Height & Weight
                </Text>
                <Text fw={500}>
                  {application.tinggi_badan} cm / {application.berat_badan} kg
                </Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconUser size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Gender
                </Text>
                <Text fw={500}>{application.jenis_kelamin === 'L' ? 'Male' : 'Female'}</Text>
              </div>
            </Group>
          </Stack>
        </div>

        <Divider />

        {/* Contact Information */}
        <div>
          <Text size="lg" fw={600} mb="sm" c="blue">
            Contact Information
          </Text>
          <Stack gap="xs">
            <Group gap="sm">
              <IconMail size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text fw={500}>{application.email}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconPhone size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  WhatsApp
                </Text>
                <Text fw={500}>{application.nomor_whatsapp}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconMapPin size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Address
                </Text>
                <Text fw={500}>
                  {application.alamat_domisili}, {application.kota_domisili},{' '}
                  {application.daerah_domisili}, {application.provinsi_domisili}
                </Text>
              </div>
            </Group>
          </Stack>
        </div>

        <Divider />

        {/* Education Information */}
        <div>
          <Text size="lg" fw={600} mb="sm" c="blue">
            Education Information
          </Text>
          <Stack gap="xs">
            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Institution
                </Text>
                <Text fw={500}>{application.instansi_pendidikan}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Major
                </Text>
                <Text fw={500}>{application.jurusan_pendidikan}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Education Level
                </Text>
                <Text fw={500}>{application.jenjang_pendidikan}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Student ID
                </Text>
                <Text fw={500}>{application.nim || 'N/A'}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Diploma Status
                </Text>
                <Text fw={500}>{application.status_ijazah}</Text>
              </div>
            </Group>
          </Stack>
        </div>

        <Divider />

        {/* Program Information */}
        <div>
          <Text size="lg" fw={600} mb="sm" c="blue">
            Program Information
          </Text>
          <Stack gap="xs">
            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Selected Program
                </Text>
                <Text fw={500}>{application.program_terpilih}</Text>
              </div>
            </Group>

            {application.batch && (
              <Group gap="sm">
                <IconCalendar size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Batch
                  </Text>
                  <Text fw={500}>
                    {application.batch.number} - {application.batch.location} (
                    {application.batch.year})
                  </Text>
                </div>
              </Group>
            )}
          </Stack>
        </div>

        <Divider />

        {/* Additional Information */}
        <div>
          <Text size="lg" fw={600} mb="sm" c="blue">
            Additional Information
          </Text>
          <Stack gap="xs">
            <Group gap="sm">
              <IconUser size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Marital Status
                </Text>
                <Text fw={500}>{application.status_perkawinan}</Text>
              </div>
            </Group>

            <Group gap="sm">
              <IconSchool size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Continue Education
                </Text>
                <Badge variant="light" color={application.melanjutkan_pendidikan ? 'green' : 'red'}>
                  {application.melanjutkan_pendidikan ? 'Yes' : 'No'}
                </Badge>
              </div>
            </Group>

            <Group gap="sm">
              <IconUser size={16} />
              <div>
                <Text size="sm" c="dimmed">
                  Shirt Size
                </Text>
                <Text fw={500}>{application.ukuran_baju}</Text>
              </div>
            </Group>

            {application.riwayat_penyakit && (
              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Medical History
                  </Text>
                  <Text fw={500}>{application.riwayat_penyakit}</Text>
                </div>
              </Group>
            )}
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
