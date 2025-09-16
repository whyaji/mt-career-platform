import { z } from 'zod';

export const personalInfoSchema = z.object({
  // Personal Information
  nama_lengkap: z
    .string()
    .min(1, 'Nama lengkap harus diisi')
    .max(64, 'Nama lengkap maksimal 64 karakter'),

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
  nik: z
    .string()
    .min(1, 'NIK harus diisi')
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK harus berupa angka'),
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
  jurusan_pendidikan: z.string().min(1, 'Jurusan pendidikan harus diisi'),
  jenjang_pendidikan: z.enum(['D3', 'D4', 'S1', 'S2'], {
    message: 'Jenjang pendidikan terakhir harus dipilih',
  }),
  instansi_pendidikan: z.string().min(1, 'Instansi pendidikan harus diisi'),
  nim: z.string().optional(),
  status_ijazah: z.enum(['Ada', 'Surat Keterangan Lulus', 'Tidak Ada'], {
    message: 'Status ijazah harus dipilih',
  }),
  nomor_whatsapp: z
    .string()
    .min(1, 'Nomor whatsapp harus diisi')
    .regex(/^\d+$/, 'Nomor whatsapp harus berupa angka'),
  email: z.email('Email tidak valid'),
  status_perkawinan: z.enum(['Lajang', 'Kawin', 'Cerai'], {
    message: 'Status perkawinan harus dipilih',
  }),
  melanjutkan_pendidikan: z.enum(['Ya', 'Tidak'], {
    message: 'Melanjutkan pendidikan harus dipilih',
  }),
  ukuran_baju: z.enum(['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], {
    message: 'Ukuran baju harus dipilih',
  }),
  riwayat_penyakit: z.string().min(1, 'Tulis SEHAT jika tidak ada riwayat penyakit'),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
