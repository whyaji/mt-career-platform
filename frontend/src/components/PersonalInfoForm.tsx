import {
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import {
  IconBook,
  IconCalendar,
  IconHome,
  IconMapPin,
  IconRuler,
  IconUser,
  IconWeight,
} from '@tabler/icons-react';
import { type ComponentProps, useEffect } from 'react';

import type { PersonalInfoData } from '../schemas/personalInfoSchema';

interface PersonalInfoFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<PersonalInfoData, any>;
  isMobile?: boolean;
}

const provinsiList = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
];

const uppercaseProvinsiList = provinsiList.map((provinsi) => provinsi.toUpperCase());

const daerahList = [
  'SUMATERA',
  'JAWA',
  'KALIMANTAN',
  'BALI',
  'NTB',
  'NTT',
  'SULAWESI',
  'MALUKU',
  'PAPUA',
];

function TextInputField({ ...props }: ComponentProps<typeof TextInput>) {
  return <TextInput {...props} />;
}

function NumberInputField({ ...props }: ComponentProps<typeof NumberInput>) {
  return <NumberInput {...props} />;
}

function TextAreaField({ ...props }: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}

function SelectField({ ...props }: ComponentProps<typeof Select>) {
  return <Select {...props} />;
}

function DateInputField({ ...props }: ComponentProps<typeof DatePickerInput>) {
  return (
    <DatePickerInput
      {...props}
      valueFormat="DD MMMM YYYY"
      locale="id"
      value={props.value === '' ? null : props.value}
    />
  );
}

export function PersonalInfoForm({ form, isMobile = false }: PersonalInfoFormProps) {
  const birthDateString = form.values.tanggal_lahir;
  // Calculate age when birth date changes
  useEffect(() => {
    if (birthDateString) {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        form.setFieldValue('usia', age - 1);
      } else {
        form.setFieldValue('usia', age);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthDateString]);

  return (
    <Paper
      p={isMobile ? 'sm' : 'xl'}
      pb={isMobile ? 'xl' : undefined}
      radius="lg"
      withBorder={!isMobile}
      shadow={isMobile ? 'none' : undefined}>
      <Stack style={{ gap: '3rem' }}>
        <div>
          <Title order={2} mb="xs" c="blue.8">
            <Group gap="sm">
              <IconUser size={24} />
              DATA DIRI PELAMAR
            </Group>
          </Title>
          <Text size="sm" c="dimmed" mb="xs">
            <Text component="span" c="red" fw={500}>
              * Required
            </Text>
          </Text>
          <Text size="sm" c="dimmed">
            Mohon untuk mengisi biodata sesuai dengan diri anda dan wajib mengisi semua pertanyaan
            isian menggunakan{' '}
            <Text component="span" fw={700} c="dark">
              HURUF KAPITAL
            </Text>
            .
          </Text>
          <Stack gap="lg" mt="lg">
            <TextInputField
              required
              label="NAMA LENGKAP"
              placeholder="Masukkan nama lengkap"
              description="Isi nama lengkap sesuai yang tertera di KTP dengan HURUF KAPITAL"
              {...form.getInputProps('nama_lengkap')}
            />
            <TextInputField
              label="NIK"
              placeholder="Masukkan NIK"
              required
              description="Nomor Induk Kependudukan sesuai yang tertera di KTP (16 digit)"
              {...form.getInputProps('nik')}
            />
            <TextInputField
              label="TEMPAT LAHIR"
              placeholder="Masukkan tempat lahir"
              required
              description="Isi tempat lahir sesuai yang tertera di KTP dengan HURUF KAPITAL"
              {...form.getInputProps('tempat_lahir')}
            />
            <DateInputField
              label="TANGGAL LAHIR"
              required
              placeholder="Pilih tanggal lahir"
              description="Pilih tanggal lahir sesuai yang tertera di KTP"
              leftSection={<IconCalendar size={16} />}
              {...form.getInputProps('tanggal_lahir')}
            />
            <NumberInputField
              label="USIA"
              required
              description="Usia otomatis terhitung berdasarkan tanggal lahir"
              placeholder="Otomatis terisi"
              readOnly
              disabled
              style={{ backgroundColor: '#f8f9fa' }}
              {...form.getInputProps('usia')}
            />
            <SelectField
              required
              label="JENIS KELAMIN"
              placeholder="Pilih jenis kelamin"
              description="Pilih jenis kelamin sesuai yang tertera di KTP"
              data={[
                { value: 'L', label: 'LAKI-LAKI' },
                { value: 'P', label: 'PEREMPUAN' },
              ]}
              {...form.getInputProps('jenis_kelamin')}
            />
          </Stack>
        </div>

        <div>
          <Title order={3} c="blue.8">
            <Group gap="sm">
              <IconMapPin size={20} />
              INFORMASI LOKASI KELAHIRAN
            </Group>
          </Title>
          <Stack gap="lg" mt="lg">
            <SelectField
              searchable
              label="DAERAH LAHIR"
              placeholder="Pilih daerah lahir"
              required
              description="Daerah asal lokasi kelahiran sesuai dengan provinsi tempat lahir"
              data={daerahList}
              {...form.getInputProps('daerah_lahir')}
            />
            <SelectField
              searchable
              label="PROVINSI LAHIR"
              placeholder="Pilih provinsi lahir"
              required
              description="Provinsi tempat kelahiran sesuai yang tertera di KTP"
              data={uppercaseProvinsiList}
              {...form.getInputProps('provinsi_lahir')}
            />
          </Stack>
        </div>

        <div>
          <Title order={3} c="blue.8">
            <Group gap="sm">
              <IconHome size={20} />
              INFORMASI DOMISILI
            </Group>
          </Title>
          <Stack gap="lg" mt="lg">
            <SelectField
              searchable
              label="DAERAH DOMISILI"
              placeholder="Pilih daerah domisili"
              required
              description="Daerah tempat tinggal saat ini sesuai dengan domisili aktual"
              data={daerahList}
              {...form.getInputProps('daerah_domisili')}
            />
            <SelectField
              searchable
              label="PROVINSI DOMISILI"
              placeholder="Pilih provinsi domisili"
              required
              description="Provinsi tempat tinggal saat ini sesuai dengan domisili aktual"
              data={provinsiList.map((provinsi) => provinsi.toUpperCase())}
              {...form.getInputProps('provinsi_domisili')}
            />
            <TextInputField
              required
              label="KOTA DOMISILI"
              placeholder="Masukkan kota domisili"
              description="Kota/kabupaten tempat tinggal saat ini dengan HURUF KAPITAL"
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps('kota_domisili')}
            />
            <TextAreaField
              required
              label="ALAMAT DOMISILI"
              placeholder="Masukkan alamat domisili"
              description="Alamat lengkap tempat tinggal saat ini dengan HURUF KAPITAL (nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan)"
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps('alamat_domisili')}
            />
          </Stack>
        </div>

        {/* Program yang dipilih */}
        <div>
          <Title order={3} c="blue.8">
            <Group gap="sm">
              <IconBook size={20} />
              PROGRAM YANG DIPILIH
            </Group>
          </Title>
          <Stack gap="lg" mt="lg">
            <SelectField
              required
              label="PROGRAM YANG DIPILIH"
              placeholder="Pilih program"
              description="Pilih program magang yang diminati"
              data={[
                {
                  value: 'pkpp-estate',
                  label: 'PKPP ESTATE (Pend. D3-S1 Jurusan Perkebunan, Pertanian dan turunannya)',
                },
                { value: 'pkpp-ktu', label: 'PKPP KTU (Pend. S1 Jurusan Akuntansi & Perpajakan)' },
                {
                  value: 'pkpp-mill',
                  label:
                    'PKPP MILL (Pend. S1 Jurusan Teknik Mesin, Teknik Industri dan Teknik Elektro)',
                },
              ]}
              {...form.getInputProps('program_terpilih')}
            />
          </Stack>
        </div>

        <div>
          <Title order={3} c="blue.8">
            <Group gap="sm">
              <IconRuler size={20} />
              DATA FISIK
            </Group>
          </Title>
          <Stack gap="lg" mt="lg">
            <NumberInputField
              required
              label="TINGGI BADAN (CM)"
              placeholder="Masukkan tinggi badan"
              description="Masukkan tinggi badan dalam satuan centimeter (140-220 cm)"
              min={140}
              max={220}
              leftSection={<IconRuler size={16} />}
              {...form.getInputProps('tinggi_badan')}
            />
            <NumberInputField
              required
              label="BERAT BADAN (KG)"
              placeholder="Masukkan berat badan"
              description="Masukkan berat badan dalam satuan kilogram (40-150 kg)"
              min={40}
              max={150}
              leftSection={<IconWeight size={16} />}
              {...form.getInputProps('berat_badan')}
            />
          </Stack>
        </div>
      </Stack>
    </Paper>
  );
}
