import { z } from 'zod';

export const personalInfoSchema = z.object({
  // Personal Information
  nama_lengkap: z
    .string()
    .min(1, 'Nama lengkap harus diisi')
    .max(64, 'Nama lengkap maksimal 64 karakter'),
  nik: z
    .string()
    .min(1, 'NIK harus diisi')
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK harus berupa angka'),
  jenis_kelamin: z.enum(['L', 'P'], {
    message: 'Jenis kelamin harus dipilih',
  }),
  tempat_lahir: z
    .string()
    .min(1, 'Tempat lahir harus diisi')
    .max(64, 'Tempat lahir maksimal 64 karakter'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir harus diisi'),
  usia: z.union([
    z.number().min(17, 'Usia minimal 17 tahun').max(30, 'Usia maksimal 30 tahun'),
    z.string().min(1, 'Usia harus diisi'),
  ]),
  daerah_lahir: z
    .string()
    .min(1, 'Daerah lahir harus diisi')
    .max(64, 'Daerah lahir maksimal 64 karakter'),
  provinsi_lahir: z
    .string()
    .min(1, 'Provinsi lahir harus diisi')
    .max(64, 'Provinsi lahir maksimal 64 karakter'),
  tinggi_badan: z.union([
    z.number().min(140, 'Tinggi badan minimal 140 cm').max(220, 'Tinggi badan maksimal 220 cm'),
    z.string().min(1, 'Tinggi badan harus diisi'),
  ]),
  berat_badan: z.union([
    z.number().min(40, 'Berat badan minimal 40 kg').max(150, 'Berat badan maksimal 150 kg'),
    z.string().min(1, 'Berat badan harus diisi'),
  ]),
  daerah_domisili: z
    .string()
    .min(1, 'Daerah domisili harus diisi')
    .max(64, 'Daerah domisili maksimal 64 karakter'),
  provinsi_domisili: z
    .string()
    .min(1, 'Provinsi domisili harus diisi')
    .max(64, 'Provinsi domisili maksimal 64 karakter'),
  kota_domisili: z
    .string()
    .min(1, 'Kota domisili harus diisi')
    .max(64, 'Kota domisili maksimal 64 karakter'),
  alamat_domisili: z
    .string()
    .min(1, 'Alamat domisili harus diisi')
    .max(255, 'Alamat domisili maksimal 255 karakter'),
  program_terpilih: z.enum(['pkpp-estate', 'pkpp-ktu', 'pkpp-mill'], {
    message: 'Program harus dipilih',
  }),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
