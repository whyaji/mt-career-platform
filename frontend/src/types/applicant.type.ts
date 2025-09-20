export type ApplicantDataType = {
  id: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  usia: number;
  daerah_lahir: string;
  provinsi_lahir: string;
  tinggi_badan: number;
  berat_badan: number;
  nik: string;
  daerah_domisili: string;
  provinsi_domisili: string;
  kota_domisili: string;
  alamat_domisili: string;
  program_terpilih: string;
  jurusan_pendidikan: string;
  jenjang_pendidikan: string;
  instansi_pendidikan: string;
  nim: string | null;
  status_ijazah: string;
  nomor_whatsapp: string;
  email: string;
  status_perkawinan: string;
  melanjutkan_pendidikan: boolean;
  ukuran_baju: string;
  riwayat_penyakit: string | null;
  batch_id: string;
  created_at: string;
  updated_at: string;
  batch?: {
    id: string;
    number: number;
    number_code: string;
    location: string;
    location_code: string;
    year: number;
    institutes: string[] | null;
    status: number;
  };
};

export type ApplicantDataFormType = Omit<
  ApplicantDataType,
  'id' | 'created_at' | 'updated_at' | 'batch'
>;
