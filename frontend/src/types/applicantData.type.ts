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
  batch_id: string;
  jurusan_pendidikan: string;
  jenjang_pendidikan: string;
  instansi_pendidikan: string;
  nim: string | null;
  status_ijazah: string;
  nomor_whatsapp: string;
  email: string;
  status_perkawinan: string;
  melanjutkan_pendidikan: string;
  ukuran_baju: string;
  riwayat_penyakit: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ApplicantDataPostType = Omit<
  ApplicantDataType,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & { agreement1: string; agreement2: string; agreement3: string; turnstileToken: string };

export type ApplicantDataSubmitType = {
  answers: {
    question_id: string;
    question_code: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answer: any;
  }[];
  agreement1: string;
  agreement2: string;
  agreement3: string;
  turnstileToken: string;
};
