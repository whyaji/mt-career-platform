import { Accordion, Badge, Divider, Group, Modal, Stack, Text } from '@mantine/core';
import { IconCalendar, IconMapPin, IconNumber } from '@tabler/icons-react';

import type { BatchType } from '@/types/batch.type';

interface BatchDetailModalProps {
  opened: boolean;
  onClose: () => void;
  batch: BatchType | null;
  loading?: boolean;
}

export function BatchDetailModal({
  opened,
  onClose,
  batch,
  loading: _loading = false,
}: BatchDetailModalProps) {
  if (!batch) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Batch Details" size="lg" radius="md" centered>
      <Stack gap="md">
        <Group gap="sm">
          <IconNumber size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Batch Number
            </Text>
            <Text fw={500}>{batch.number}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconNumber size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Batch Code
            </Text>
            <Text fw={500}>{batch.number_code}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconMapPin size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Location
            </Text>
            <Text fw={500}>{batch.location}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconMapPin size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Location Code
            </Text>
            <Text fw={500}>{batch.location_code}</Text>
          </div>
        </Group>

        <Group gap="sm">
          <IconCalendar size={16} />
          <div>
            <Text size="sm" c="dimmed">
              Year
            </Text>
            <Text fw={500}>{batch.year}</Text>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed" mb="xs">
            Status
          </Text>
          <Badge variant="light" size="sm" color={batch.status === 1 ? 'green' : 'red'}>
            {batch.status === 1 ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {batch.institutes && batch.institutes.length > 0 && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              Institutes
            </Text>
            <Group gap="xs">
              {batch.institutes.map((institute, index) => (
                <Badge key={index} variant="light" size="sm">
                  {institute}
                </Badge>
              ))}
            </Group>
          </div>
        )}

        {batch.screening_config && (
          <>
            <Divider my="sm" />
            <div>
              <Text size="sm" fw={500} mb="xs">
                Screening Configuration
              </Text>
              <Accordion variant="separated">
                {batch.screening_config.age && (
                  <Accordion.Item value="age">
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Text size="sm">Age Requirements</Text>
                        <Badge
                          size="xs"
                          color={batch.screening_config.age.enabled ? 'green' : 'gray'}>
                          {batch.screening_config.age.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm">
                        Min Age: {batch.screening_config.age.min_age ?? 18} | Max Age:{' '}
                        {batch.screening_config.age.max_age ?? 30}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                )}

                {batch.screening_config.physical && (
                  <Accordion.Item value="physical">
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Text size="sm">Physical Attributes</Text>
                        <Badge
                          size="xs"
                          color={batch.screening_config.physical.enabled ? 'green' : 'gray'}>
                          {batch.screening_config.physical.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm">
                        Min Height: {batch.screening_config.physical.min_height ?? 150}cm | Weight
                        Range: {batch.screening_config.physical.min_weight ?? 40}-
                        {batch.screening_config.physical.max_weight ?? 100}kg
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                )}

                {batch.screening_config.marital && (
                  <Accordion.Item value="marital">
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Text size="sm">Marital Status</Text>
                        <Badge
                          size="xs"
                          color={batch.screening_config.marital.enabled ? 'green' : 'gray'}>
                          {batch.screening_config.marital.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Group gap="xs">
                        {batch.screening_config.marital.valid_statuses?.map((status, idx) => (
                          <Badge key={idx} size="sm" variant="light">
                            {status}
                          </Badge>
                        ))}
                      </Group>
                    </Accordion.Panel>
                  </Accordion.Item>
                )}
              </Accordion>
            </div>
          </>
        )}
      </Stack>
    </Modal>
  );
}
