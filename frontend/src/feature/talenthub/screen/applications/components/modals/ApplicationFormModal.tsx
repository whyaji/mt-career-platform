import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';

import { useBatchesQuery } from '@/hooks/query/batch/useBatchesQuery';
import type { ApplicantDataFormType, ApplicantDataType } from '@/types/applicantData.type';

interface ApplicationFormModalProps {
  opened: boolean;
  onClose: () => void;
  application: ApplicantDataType | null;
  onSubmit: (data: Partial<ApplicantDataFormType>) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export function ApplicationFormModal({
  opened,
  onClose,
  application,
  onSubmit,
  loading = false,
  title = 'Edit Application',
}: ApplicationFormModalProps) {
  const { data: batchesData } = useBatchesQuery({ limit: 1000 });

  const form = useForm<Partial<ApplicantDataFormType>>({
    initialValues: {
      nama_lengkap: '',
      jenis_kelamin: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      usia: 0,
      daerah_lahir: '',
      provinsi_lahir: '',
      tinggi_badan: 0,
      berat_badan: 0,
      nik: '',
      daerah_domisili: '',
      provinsi_domisili: '',
      kota_domisili: '',
      alamat_domisili: '',
      program_terpilih: '',
      jurusan_pendidikan: '',
      jenjang_pendidikan: '',
      instansi_pendidikan: '',
      nim: '',
      status_ijazah: '',
      nomor_whatsapp: '',
      email: '',
      status_perkawinan: '',
      melanjutkan_pendidikan: '',
      ukuran_baju: '',
      riwayat_penyakit: '',
      batch_id: '',
    },
    validate: {
      nama_lengkap: (value) => (!value ? 'Full name is required' : null),
      email: (value) =>
        !value ? 'Email is required' : /^\S+@\S+$/.test(value) ? null : 'Invalid email',
      nomor_whatsapp: (value) => (!value ? 'WhatsApp number is required' : null),
      nik: (value) => (!value ? 'NIK is required' : null),
      program_terpilih: (value) => (!value ? 'Selected program is required' : null),
      batch_id: (value) => (!value ? 'Batch is required' : null),
    },
  });

  useEffect(() => {
    if (application) {
      form.setValues({
        nama_lengkap: application.nama_lengkap,
        jenis_kelamin: application.jenis_kelamin,
        tempat_lahir: application.tempat_lahir,
        tanggal_lahir: application.tanggal_lahir,
        usia: application.usia,
        daerah_lahir: application.daerah_lahir,
        provinsi_lahir: application.provinsi_lahir,
        tinggi_badan: application.tinggi_badan,
        berat_badan: application.berat_badan,
        nik: application.nik,
        daerah_domisili: application.daerah_domisili,
        provinsi_domisili: application.provinsi_domisili,
        kota_domisili: application.kota_domisili,
        alamat_domisili: application.alamat_domisili,
        program_terpilih: application.program_terpilih,
        jurusan_pendidikan: application.jurusan_pendidikan,
        jenjang_pendidikan: application.jenjang_pendidikan,
        instansi_pendidikan: application.instansi_pendidikan,
        nim: application.nim || '',
        status_ijazah: application.status_ijazah,
        nomor_whatsapp: application.nomor_whatsapp,
        email: application.email,
        status_perkawinan: application.status_perkawinan,
        melanjutkan_pendidikan: application.melanjutkan_pendidikan,
        ukuran_baju: application.ukuran_baju,
        riwayat_penyakit: application.riwayat_penyakit || '',
        batch_id: application.batch_id,
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application, opened]);

  const handleSubmit = async (values: Partial<ApplicantDataFormType>) => {
    try {
      await onSubmit(values);
      notifications.show({
        title: 'Success',
        message: 'Application updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update application',
        color: 'red',
      });
    }
  };

  const batchOptions =
    batchesData?.data?.map((batch) => ({
      value: batch.id,
      label: `${batch.number} - ${batch.location} (${batch.year})`,
    })) || [];

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="xl" radius="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Personal Information */}
          <div>
            <TextInput
              label="Full Name"
              placeholder="Enter full name"
              {...form.getInputProps('nama_lengkap')}
              required
            />
          </div>

          <Group grow>
            <Select
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: 'L', label: 'Male' },
                { value: 'P', label: 'Female' },
              ]}
              {...form.getInputProps('jenis_kelamin')}
              required
            />
            <TextInput
              label="Place of Birth"
              placeholder="Enter place of birth"
              {...form.getInputProps('tempat_lahir')}
              required
            />
            <TextInput
              label="Date of Birth"
              type="date"
              {...form.getInputProps('tanggal_lahir')}
              required
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Age"
              placeholder="Enter age"
              min={1}
              max={100}
              {...form.getInputProps('usia')}
              required
            />
            <TextInput
              label="Region of Birth"
              placeholder="Enter region of birth"
              {...form.getInputProps('daerah_lahir')}
              required
            />
            <TextInput
              label="Province of Birth"
              placeholder="Enter province of birth"
              {...form.getInputProps('provinsi_lahir')}
              required
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Height (cm)"
              placeholder="Enter height"
              min={100}
              max={250}
              {...form.getInputProps('tinggi_badan')}
              required
            />
            <NumberInput
              label="Weight (kg)"
              placeholder="Enter weight"
              min={30}
              max={200}
              {...form.getInputProps('berat_badan')}
              required
            />
            <TextInput
              label="NIK"
              placeholder="Enter NIK"
              {...form.getInputProps('nik')}
              required
            />
          </Group>

          {/* Contact Information */}
          <div>
            <TextInput
              label="Email"
              placeholder="Enter email"
              type="email"
              {...form.getInputProps('email')}
              required
            />
          </div>

          <Group grow>
            <TextInput
              label="WhatsApp Number"
              placeholder="Enter WhatsApp number"
              {...form.getInputProps('nomor_whatsapp')}
              required
            />
            <TextInput
              label="Shirt Size"
              placeholder="Enter shirt size"
              {...form.getInputProps('ukuran_baju')}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="City of Residence"
              placeholder="Enter city of residence"
              {...form.getInputProps('kota_domisili')}
              required
            />
            <TextInput
              label="Region of Residence"
              placeholder="Enter region of residence"
              {...form.getInputProps('daerah_domisili')}
              required
            />
            <TextInput
              label="Province of Residence"
              placeholder="Enter province of residence"
              {...form.getInputProps('provinsi_domisili')}
              required
            />
          </Group>

          <Textarea
            label="Address"
            placeholder="Enter full address"
            rows={3}
            {...form.getInputProps('alamat_domisili')}
            required
          />

          {/* Education Information */}
          <Group grow>
            <TextInput
              label="Institution"
              placeholder="Enter institution name"
              {...form.getInputProps('instansi_pendidikan')}
              required
            />
            <TextInput
              label="Major"
              placeholder="Enter major"
              {...form.getInputProps('jurusan_pendidikan')}
              required
            />
            <TextInput
              label="Education Level"
              placeholder="Enter education level"
              {...form.getInputProps('jenjang_pendidikan')}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="Student ID"
              placeholder="Enter student ID"
              {...form.getInputProps('nim')}
            />
            <TextInput
              label="Diploma Status"
              placeholder="Enter diploma status"
              {...form.getInputProps('status_ijazah')}
              required
            />
            <Select
              label="Marital Status"
              placeholder="Select marital status"
              data={[
                { value: 'Single', label: 'Single' },
                { value: 'Married', label: 'Married' },
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Widowed', label: 'Widowed' },
              ]}
              {...form.getInputProps('status_perkawinan')}
              required
            />
          </Group>

          {/* Program Information */}
          <Group grow>
            <TextInput
              label="Selected Program"
              placeholder="Enter selected program"
              {...form.getInputProps('program_terpilih')}
              required
            />
            <Select
              label="Batch"
              placeholder="Select batch"
              data={batchOptions}
              searchable
              {...form.getInputProps('batch_id')}
              required
            />
          </Group>

          <Switch
            label="Continue Education"
            {...form.getInputProps('melanjutkan_pendidikan', { type: 'checkbox' })}
          />

          <Textarea
            label="Medical History"
            placeholder="Enter medical history (optional)"
            rows={3}
            {...form.getInputProps('riwayat_penyakit')}
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Application
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
