import { Badge, Divider, Group, Modal, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconCode,
  IconInfoCircle,
  IconMapPin,
  IconSchool,
} from '@tabler/icons-react';

import type { ProgramType } from '@/types/program.type';

interface ProgramDetailModalProps {
  opened: boolean;
  onClose: () => void;
  program: ProgramType | null;
  loading?: boolean;
}

export function ProgramDetailModal({
  opened,
  onClose,
  program,
  loading: _loading = false,
}: ProgramDetailModalProps) {
  if (!program) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Program Details" size="lg" centered>
      <Stack gap="md">
        <Group>
          <IconCode size={20} />
          <Title order={4}>{program.name}</Title>
        </Group>

        <Stack gap="sm">
          <Group>
            <Text fw={500} size="sm">
              Code:
            </Text>
            <Badge variant="light">{program.code}</Badge>
          </Group>

          <Group>
            <Text fw={500} size="sm">
              Status:
            </Text>
            <Badge color={program.status === 1 ? 'green' : 'red'}>
              {program.status === 1 ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          {program.program_category && (
            <Group>
              <Text fw={500} size="sm">
                Category:
              </Text>
              <Badge variant="outline">{program.program_category.name}</Badge>
            </Group>
          )}

          {program.description && (
            <Stack gap="xs">
              <Group>
                <IconInfoCircle size={16} />
                <Text fw={500} size="sm">
                  Description:
                </Text>
              </Group>
              <Text size="sm" c="dimmed" pl="lg">
                {program.description}
              </Text>
            </Stack>
          )}

          <Divider />

          <Group>
            <IconSchool size={16} />
            <Text fw={500} size="sm">
              Education Requirements:
            </Text>
          </Group>
          <Stack gap="xs" pl="lg">
            <Group>
              <Text size="sm">Minimum Education:</Text>
              <Badge variant="light">{program.min_education}</Badge>
            </Group>
            <Group>
              <Text size="sm">Minimum GPA:</Text>
              <Badge variant="light">{program.min_gpa}</Badge>
            </Group>
            <Group>
              <Text size="sm">Marital Status:</Text>
              <Badge variant="light">
                {program.marital_status === 'single'
                  ? 'Single (Belum Menikah)'
                  : 'Any (Boleh Menikah)'}
              </Badge>
            </Group>
            <Stack gap="xs">
              <Text size="sm">Majors:</Text>
              <Group gap="xs">
                {program.majors.map((major, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {major}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Stack>

          <Divider />

          <Group>
            <IconMapPin size={16} />
            <Text fw={500} size="sm">
              Placement:
            </Text>
          </Group>
          <Text size="sm" c="dimmed" pl="lg">
            {program.placement}
          </Text>

          <Divider />

          <Group>
            <IconClock size={16} />
            <Text fw={500} size="sm">
              Duration:
            </Text>
          </Group>
          <Stack gap="xs" pl="lg">
            <Group>
              <Text size="sm">Training:</Text>
              <Badge variant="light">{program.training_duration} months</Badge>
            </Group>
            <Group>
              <Text size="sm">OJT:</Text>
              <Badge variant="light">{program.ojt_duration} months</Badge>
            </Group>
            {program.contract_duration && (
              <Group>
                <Text size="sm">Contract:</Text>
                <Badge variant="light">{program.contract_duration} months</Badge>
              </Group>
            )}
          </Stack>

          <Divider />

          <Group>
            <IconCalendar size={16} />
            <Text fw={500} size="sm">
              Created:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(program.created_at).toLocaleDateString()}
            </Text>
          </Group>

          <Group>
            <IconCalendar size={16} />
            <Text fw={500} size="sm">
              Updated:
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(program.updated_at).toLocaleDateString()}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
