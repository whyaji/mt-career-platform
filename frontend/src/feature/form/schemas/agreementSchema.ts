import { z } from 'zod';

export const agreementSchema = z.object({
  agreement1: z.string().refine((val) => val === 'agree', {
    message: 'Persetujuan 1 harus dipilih dan disetujui',
  }),
  agreement2: z.string().refine((val) => val === 'agree', {
    message: 'Persetujuan 2 harus dipilih dan disetujui',
  }),
  agreement3: z.string().refine((val) => val === 'agree', {
    message: 'Persetujuan 3 harus dipilih dan disetujui',
  }),
});

export type AgreementData = z.infer<typeof agreementSchema>;
