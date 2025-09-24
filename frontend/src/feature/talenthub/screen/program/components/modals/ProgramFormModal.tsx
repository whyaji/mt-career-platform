import {
  Button,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

import { MAJOR_OPTIONS } from '@/constants/majors';
import type { ProgramType } from '@/types/program.type';
import type { ProgramCategoryType } from '@/types/programCategory.type';

interface ProgramFormModalProps {
  opened: boolean;
  onClose: () => void;
  program: ProgramType | null;
  programCategories: ProgramCategoryType[];
  onSubmit: (
    data: Omit<ProgramType, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'program_category'>
  ) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export function ProgramFormModal({
  opened,
  onClose,
  program,
  programCategories,
  onSubmit,
  loading = false,
  title = 'Program',
}: ProgramFormModalProps) {
  const form = useForm({
    initialValues: {
      code: '',
      name: '',
      program_category_id: '',
      description: '',
      min_education: 'D3' as 'D3' | 'S1' | 'S2',
      majors: [] as string[],
      min_gpa: 2.75,
      marital_status: 'single' as 'single' | 'any',
      placement: '',
      training_duration: 3,
      ojt_duration: 6,
      contract_duration: 12,
      status: 1,
    },
    validate: {
      code: (value) => (!value ? 'Code is required' : null),
      name: (value) => (!value ? 'Name is required' : null),
      program_category_id: (value) => (!value ? 'Program category is required' : null),
      placement: (value) => (!value ? 'Placement is required' : null),
      majors: (value) => (value.length === 0 ? 'At least one major is required' : null),
      min_gpa: (value) => (value < 0 || value > 4 ? 'GPA must be between 0 and 4' : null),
      training_duration: (value) => (value < 0 ? 'Training duration must be positive' : null),
      ojt_duration: (value) => (value < 0 ? 'OJT duration must be positive' : null),
    },
  });

  useEffect(() => {
    if (program) {
      form.setValues({
        code: program.code,
        name: program.name,
        program_category_id: program.program_category_id,
        description: program.description || '',
        min_education: program.min_education,
        majors: program.majors,
        min_gpa: program.min_gpa,
        marital_status: program.marital_status,
        placement: program.placement,
        training_duration: program.training_duration,
        ojt_duration: program.ojt_duration,
        contract_duration: program.contract_duration || 12,
        status: program.status,
      });
    } else {
      form.reset();
    }
  }, [program, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
      notifications.show({
        title: 'Success',
        message: `Program ${program ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save program',
        color: 'red',
      });
    }
  };

  const programCategoryOptions = programCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Code"
              placeholder="Enter program code"
              required
              {...form.getInputProps('code')}
            />
            <TextInput
              label="Name"
              placeholder="Enter program name"
              required
              {...form.getInputProps('name')}
            />
          </Group>

          <Select
            label="Program Category"
            placeholder="Select program category"
            required
            data={programCategoryOptions}
            {...form.getInputProps('program_category_id')}
          />

          <Textarea
            label="Description"
            placeholder="Enter program description"
            minRows={3}
            {...form.getInputProps('description')}
          />

          <Group grow>
            <Select
              label="Minimum Education"
              placeholder="Select minimum education"
              required
              data={[
                { value: 'D3', label: 'D3' },
                { value: 'D4', label: 'D4' },
                { value: 'S1', label: 'S1' },
                { value: 'S2', label: 'S2' },
              ]}
              {...form.getInputProps('min_education')}
            />
            <NumberInput
              label="Minimum GPA"
              placeholder="Enter minimum GPA"
              required
              min={0}
              max={4}
              step={0.01}
              decimalScale={2}
              {...form.getInputProps('min_gpa')}
            />
          </Group>

          <MultiSelect
            label="Majors"
            placeholder="Select majors"
            required
            searchable
            data={MAJOR_OPTIONS}
            {...form.getInputProps('majors')}
          />

          <Group grow>
            <Select
              label="Marital Status"
              placeholder="Select marital status"
              required
              data={[
                { value: 'single', label: 'Single (Belum Menikah)' },
                { value: 'any', label: 'Any (Boleh Menikah)' },
              ]}
              {...form.getInputProps('marital_status')}
            />
            <TextInput
              label="Placement"
              placeholder="Enter placement location"
              required
              {...form.getInputProps('placement')}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Training Duration (months)"
              placeholder="Enter training duration"
              required
              min={0}
              {...form.getInputProps('training_duration')}
            />
            <NumberInput
              label="OJT Duration (months)"
              placeholder="Enter OJT duration"
              required
              min={0}
              {...form.getInputProps('ojt_duration')}
            />
            <NumberInput
              label="Contract Duration (months)"
              placeholder="Enter contract duration"
              min={0}
              {...form.getInputProps('contract_duration')}
            />
          </Group>

          <Switch
            label="Active"
            description="Enable or disable this program"
            checked={form.values.status === 1}
            onChange={(event) => form.setFieldValue('status', event.currentTarget.checked ? 1 : 0)}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {program ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
