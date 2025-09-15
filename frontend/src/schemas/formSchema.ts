import { z } from 'zod';

export const formSchema = z.object({
  // Agreements (Page 1)
  agreement1: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 1 harus dipilih',
  }),
  agreement2: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 2 harus dipilih',
  }),
  agreement3: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 3 harus dipilih',
  }),

  // Personal Information (Page 2)
  fullName: z.string().min(1, 'Nama lengkap harus diisi'),
  nik: z
    .string()
    .min(1, 'NIK harus diisi')
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK harus berupa angka'),
  email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
  phone: z
    .string()
    .min(1, 'No. telepon harus diisi')
    .regex(/^08\d{8,11}$/, 'Format nomor telepon tidak valid (contoh: 08123456789)'),
  birthDate: z.date({
    message: 'Tanggal lahir harus diisi',
  }),
  gender: z.enum(['male', 'female'], {
    message: 'Jenis kelamin harus dipilih',
  }),
  address: z.string().min(1, 'Alamat harus diisi'),
  city: z.string().min(1, 'Kota/kabupaten harus dipilih'),
  postalCode: z
    .string()
    .min(1, 'Kode pos harus diisi')
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit'),

  // Education Information
  selectedProgram: z.enum(['pkpp-estate', 'pkpp-ktu', 'pkpp-mill'], {
    message: 'Program harus dipilih',
  }),
  educationLevel: z.enum(['d3', 's1'], {
    message: 'Jenjang pendidikan harus dipilih',
  }),
  university: z.string().min(1, 'Nama universitas harus diisi'),
  major: z.string().min(1, 'Jurusan harus diisi'),
  gpa: z
    .number()
    .min(0, 'IPK tidak boleh negatif')
    .max(4, 'IPK tidak boleh lebih dari 4')
    .refine((val) => val >= 2.75, 'IPK minimal 2.75'),
  graduationYear: z
    .number()
    .min(2020, 'Tahun lulus tidak valid')
    .max(new Date().getFullYear() + 1, 'Tahun lulus tidak valid'),
  maritalStatus: z.enum(['single', 'married'], {
    message: 'Status perkawinan harus dipilih',
  }),
});

export type FormData = z.infer<typeof formSchema>;
