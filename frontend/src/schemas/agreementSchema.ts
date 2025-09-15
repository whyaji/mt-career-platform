import { z } from 'zod';

export const agreementSchema = z.object({
  agreement1: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 1 harus dipilih',
  }),
  agreement2: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 2 harus dipilih',
  }),
  agreement3: z.enum(['agree', 'disagree'], {
    message: 'Persetujuan 3 harus dipilih',
  }),
});

export type AgreementData = z.infer<typeof agreementSchema>;
