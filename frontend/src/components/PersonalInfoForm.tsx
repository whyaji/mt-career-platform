import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar, IconMapPin, IconRuler, IconUser, IconWeight } from '@tabler/icons-react';
import { useEffect } from 'react';

import type { BatchType } from '@/types/batch.type';

import type { PersonalInfoData } from '../schemas/personalInfoSchema';
import { FormField, type FormFieldProps } from './FormField';

interface PersonalInfoFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<PersonalInfoData, any>;
  isMobile?: boolean;
  batch: BatchType;
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

export function PersonalInfoForm({ form, isMobile = false, batch }: PersonalInfoFormProps) {
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

  const selectedProgram = form.values.program_terpilih;

  useEffect(() => {
    if (selectedProgram) {
      form.setFieldValue('jurusan_pendidikan', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgram]);

  const selectedInstitution = form.values.instansi_pendidikan;

  useEffect(() => {
    if (selectedInstitution) {
      form.setFieldValue('nim', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstitution]);

  const getListMajorBasedOnProgram = (program: string) => {
    switch (program) {
      case 'pkpp-estate':
        return ['Pertanian', 'Perkebunan', 'Agribisnis', 'Agroteknologi', 'Agroekoteknologi'];
      case 'pkpp-ktu':
        return ['Akuntansi', 'Perpajakan'];
      case 'pkpp-mill':
        return ['Teknik Mesin', 'Teknik Industri', 'Teknik Elektro', 'Teknik Kimia'];
      default:
        return [];
    }
  };

  const selectedListMajor = getListMajorBasedOnProgram(selectedProgram);

  const listEduacationInstitution = batch.institutes ?? [];

  const questions: FormFieldProps[] = [
    {
      key: 'nama_lengkap',
      textInputProps: {
        label: 'NAMA LENGKAP',
        placeholder: 'Masukkan nama lengkap',
        required: true,
        description: 'Isi nama lengkap sesuai yang tertera di KTP dengan HURUF KAPITAL',
        ...form.getInputProps('nama_lengkap'),
      },
    },
    {
      key: 'jenis_kelamin',
      selectProps: {
        required: true,
        label: 'JENIS KELAMIN',
        placeholder: 'Pilih jenis kelamin',
        description: 'Pilih jenis kelamin sesuai yang tertera di KTP',
        data: [
          { value: 'L', label: 'LAKI-LAKI' },
          { value: 'P', label: 'PEREMPUAN' },
        ],
        ...form.getInputProps('jenis_kelamin'),
      },
    },
    {
      key: 'tempat_lahir',
      textInputProps: {
        label: 'TEMPAT LAHIR',
        placeholder: 'Masukkan tempat lahir',
        required: true,
        description: 'Isi tempat lahir sesuai yang tertera di KTP dengan HURUF KAPITAL',
        ...form.getInputProps('tempat_lahir'),
      },
    },
    {
      key: 'tanggal_lahir',
      dateInputProps: {
        label: 'TANGGAL LAHIR',
        required: true,
        placeholder: 'Pilih tanggal lahir',
        description: 'Pilih tanggal lahir sesuai yang tertera di KTP',
        leftSection: <IconCalendar size={16} />,
        ...form.getInputProps('tanggal_lahir'),
      },
    },
    {
      key: 'usia',
      numberInputProps: {
        label: 'USIA',
        required: true,
        description: 'Usia otomatis terhitung berdasarkan tanggal lahir',
        placeholder: 'Otomatis terisi',
        readOnly: true,
        disabled: true,
        style: { backgroundColor: '#f8f9fa' },
        ...form.getInputProps('usia'),
      },
    },
    {
      key: 'daerah_lahir',
      selectProps: {
        searchable: true,
        label: 'DAERAH LAHIR',
        placeholder: 'Pilih daerah lahir',
        required: true,
        description: 'Daerah asal lokasi kelahiran sesuai dengan provinsi tempat lahir',
        data: daerahList,
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('daerah_lahir'),
      },
    },
    {
      key: 'provinsi_lahir',
      selectProps: {
        searchable: true,
        label: 'PROVINSI LAHIR',
        placeholder: 'Pilih provinsi lahir',
        required: true,
        description: 'Provinsi tempat kelahiran anda',
        data: uppercaseProvinsiList,
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('provinsi_lahir'),
      },
    },
    {
      key: 'tinggi_badan',
      numberInputProps: {
        required: true,
        label: 'TINGGI BADAN (CM)',
        placeholder: 'Masukkan tinggi badan',
        description: 'Masukkan tinggi badan dalam satuan centimeter (140-220 cm)',
        min: 140,
        max: 220,
        leftSection: <IconRuler size={16} />,
        ...form.getInputProps('tinggi_badan'),
      },
    },
    {
      key: 'berat_badan',
      numberInputProps: {
        required: true,
        label: 'BERAT BADAN (KG)',
        placeholder: 'Masukkan berat badan',
        description: 'Masukkan berat badan dalam satuan kilogram (40-150 kg)',
        min: 40,
        max: 150,
        leftSection: <IconWeight size={16} />,
        ...form.getInputProps('berat_badan'),
      },
    },
    {
      key: 'nik',
      textInputProps: {
        label: 'NIK',
        placeholder: 'Masukkan NIK',
        required: true,
        description: 'Nomor Induk Kependudukan sesuai yang tertera di KTP (16 digit)',
        ...form.getInputProps('nik'),
      },
    },
    {
      key: 'daerah_domisili',
      selectProps: {
        searchable: true,
        label: 'DAERAH DOMISILI',
        placeholder: 'Pilih daerah domisili',
        required: true,
        description: 'Daerah tempat tinggal saat ini sesuai dengan domisili aktual',
        data: daerahList,
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('daerah_domisili'),
      },
    },
    {
      key: 'provinsi_domisili',
      selectProps: {
        searchable: true,
        label: 'PROVINSI DOMISILI',
        placeholder: 'Pilih provinsi domisili',
        required: true,
        description: 'Provinsi tempat tinggal saat ini sesuai dengan domisili aktual',
        data: provinsiList.map((provinsi) => provinsi.toUpperCase()),
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('provinsi_domisili'),
      },
    },
    {
      key: 'kota_domisili',
      textInputProps: {
        required: true,
        label: 'KOTA DOMISILI',
        placeholder: 'Masukkan kota domisili',
        description: 'Kota/kabupaten tempat tinggal saat ini dengan HURUF KAPITAL',
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('kota_domisili'),
      },
    },
    {
      key: 'alamat_domisili',
      textAreaProps: {
        required: true,
        label: 'ALAMAT DOMISILI',
        placeholder: 'Masukkan alamat domisili',
        description:
          'Alamat lengkap tempat tinggal saat ini dengan HURUF KAPITAL (nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan)',
        leftSection: <IconMapPin size={16} />,
        ...form.getInputProps('alamat_domisili'),
      },
    },
    {
      key: 'program_terpilih',
      radioGroupProps: {
        required: true,
        label: 'PROGRAM YANG DIPILIH',
        description: 'Pilih program magang yang diminati',
        data: [
          {
            value: 'pkpp-estate',
            label: 'PKPP ESTATE (Pend. D3-S1 Jurusan Perkebunan, Pertanian dan turunannya)',
          },
          {
            value: 'pkpp-ktu',
            label: 'PKPP KTU (Pend. S1 Jurusan Akuntansi & Perpajakan)',
          },
          {
            value: 'pkpp-mill',
            label: 'PKPP MILL (Pend. S1 Jurusan Teknik Mesin, Teknik Industri dan Teknik Elektro)',
          },
        ],
        value: form.values.program_terpilih,
        error: form.errors.program_terpilih,
        onChange: (value) => {
          if (['pkpp-estate', 'pkpp-ktu', 'pkpp-mill'].includes(value)) {
            form.setFieldValue(
              'program_terpilih',
              value as 'pkpp-estate' | 'pkpp-ktu' | 'pkpp-mill'
            );
          }
        },
      },
    },
    ...(selectedProgram
      ? [
          {
            key: 'jurusan_pendidikan',
            radioGroupProps: {
              required: true,
              label: 'JURUSAN PENDIDIKAN',
              description: 'Pilih jurusan pendidikan anda',
              data: selectedListMajor.map((major) => ({
                value: major,
                label: major,
              })),
              withOther: true,
              value: form.values.jurusan_pendidikan,
              error: form.errors.jurusan_pendidikan,
              onChange: (value: string) => {
                form.setFieldValue('jurusan_pendidikan', value);
              },
            },
          },
          {
            key: 'jenjang_pendidikan',
            radioGroupProps: {
              required: true,
              label: 'JENJANG PENDIDIKAN',
              description: 'Pilih jenjang pendidikan anda',
              data: ['D3', 'D4', 'S1', 'S2'].map((jenjang) => ({
                value: jenjang,
                label: jenjang,
              })),
              value: form.values.jenjang_pendidikan,
              error: form.errors.jenjang_pendidikan,
              onChange: (value: string) => {
                if (['D3', 'D4', 'S1', 'S2'].includes(value)) {
                  form.setFieldValue('jenjang_pendidikan', value as 'D3' | 'D4' | 'S1' | 'S2');
                }
              },
            },
          },
          listEduacationInstitution.length > 0
            ? {
                key: 'instansi_pendidikan',
                radioGroupProps: {
                  required: true,
                  label: 'INSTANSI PENDIDIKAN',
                  description: 'Pilih instansi pendidikan anda',
                  data: listEduacationInstitution.map((instansi) => ({
                    value: instansi,
                    label: instansi,
                  })),
                  value: form.values.instansi_pendidikan,
                  error: form.errors.instansi_pendidikan,
                  onChange: (value: string) => {
                    form.setFieldValue('instansi_pendidikan', value);
                  },
                  withOther: true,
                },
              }
            : {
                key: 'instansi_pendidikan',
                textInputProps: {
                  required: true,
                  label: 'INSTANSI PENDIDIKAN',
                  placeholder: 'Masukkan instansi pendidikan',
                  description: 'Masukkan instansi pendidikan anda',
                  ...form.getInputProps('instansi_pendidikan'),
                },
              },
          ...(listEduacationInstitution.includes(form.values.instansi_pendidikan)
            ? [
                {
                  key: 'nim',
                  textInputProps: {
                    required: true,
                    label: 'Nomor Induk Mahasiswa (NIM)',
                    placeholder: 'Masukkan NIM',
                    description: 'Masukkan NIM dari instansi pendidikan anda',
                    ...form.getInputProps('nim'),
                  },
                },
              ]
            : []),
          ...(form.values.instansi_pendidikan
            ? [
                {
                  key: 'status_ijazah',
                  radioGroupProps: {
                    required: true,
                    label: 'STATUS IJAZAH',
                    description: 'Pilih status ijazah anda',
                    data: ['Ada', 'Surat Keterangan Lulus', 'Tidak Ada'].map((status) => ({
                      value: status,
                      label: status,
                    })),
                    value: form.values.status_ijazah,
                    error: form.errors.status_ijazah,
                    onChange: (value: string) => {
                      if (['Ada', 'Surat Keterangan Lulus', 'Tidak Ada'].includes(value)) {
                        form.setFieldValue(
                          'status_ijazah',
                          value as 'Ada' | 'Surat Keterangan Lulus' | 'Tidak Ada'
                        );
                      }
                    },
                  },
                },
                {
                  key: 'nomor_whatsapp',
                  textInputProps: {
                    required: true,
                    label: 'NOMOR WHATSAPP',
                    placeholder: 'Masukkan nomor whatsapp',
                    description: 'Isikan nomor WhatsApp aktif anda.',
                    ...form.getInputProps('nomor_whatsapp'),
                  },
                },
                {
                  key: 'email',
                  textInputProps: {
                    required: true,
                    label: 'EMAIL',
                    placeholder: 'Masukkan email',
                    description: 'Isikan email aktif anda.',
                    ...form.getInputProps('email'),
                  },
                },
                {
                  key: 'status_perkawinan',
                  radioGroupProps: {
                    required: true,
                    label: 'STATUS PERKAWINAN',
                    description: 'Pilih status perkawinan saat ini',
                    data: ['Lajang', 'Kawin', 'Cerai'].map((status) => ({
                      value: status,
                      label: status,
                    })),
                    value: form.values.status_perkawinan,
                    error: form.errors.status_perkawinan,
                    onChange: (value: string) => {
                      if (['Lajang', 'Kawin', 'Cerai'].includes(value)) {
                        form.setFieldValue(
                          'status_perkawinan',
                          value as 'Lajang' | 'Kawin' | 'Cerai'
                        );
                      }
                    },
                  },
                },
                {
                  key: 'melanjutkan_pendidikan',
                  radioGroupProps: {
                    required: true,
                    label: 'APAKAH SAAT INI SEDANG MELANJUTKAN PENDIDIKAN?',
                    description:
                      'Melanjutkan pendidikan ke Universitas / Politeknik, atau Sertifikasi Profesi lainnya.',
                    data: ['Ya', 'Tidak'].map((status) => ({
                      value: status,
                      label: status,
                    })),
                    value: form.values.melanjutkan_pendidikan,
                    error: form.errors.melanjutkan_pendidikan,
                    onChange: (value: string) => {
                      if (['Ya', 'Tidak'].includes(value)) {
                        form.setFieldValue('melanjutkan_pendidikan', value as 'Ya' | 'Tidak');
                      }
                    },
                  },
                },
                {
                  key: 'ukuran_baju',
                  radioGroupProps: {
                    required: true,
                    label: 'UKURAN BAJU',
                    description: 'Pilih ukuran baju anda',
                    data: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'].map((ukuran) => ({
                      value: ukuran,
                      label: ukuran,
                    })),
                    value: form.values.ukuran_baju,
                    error: form.errors.ukuran_baju,
                    onChange: (value: string) => {
                      if (['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'].includes(value)) {
                        form.setFieldValue(
                          'ukuran_baju',
                          value as 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'XXXXL'
                        );
                      }
                    },
                  },
                },
                {
                  key: 'riwayat_penyakit',
                  textAreaProps: {
                    required: true,
                    label: 'RIWAYAT PENYAKIT',
                    placeholder: 'Masukkan riwayat penyakit',
                    description:
                      'Tuliskan riwayat penyakit dalam yang pernah diderita.\nContoh: TBC atau JANTUNG atau PATAH TULANG, dsb\nTulis SEHAT jika tidak ada riwayat penyakit dalam.',
                    ...form.getInputProps('riwayat_penyakit'),
                  },
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <Paper
      p={isMobile ? 'sm' : 'xl'}
      pb={isMobile ? 'xl' : undefined}
      radius="lg"
      withBorder={!isMobile}
      shadow={isMobile ? 'none' : undefined}>
      <Stack style={{ gap: '3rem' }}>
        <div>
          <Title order={2} mb="xs" c="orange">
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
          <Stack gap="xl" my="xl">
            {questions.map((question, index) => {
              return <FormField {...question} number={index + 4} />;
            })}
          </Stack>
        </div>
      </Stack>
    </Paper>
  );
}
