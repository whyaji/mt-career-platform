import { createFileRoute, notFound } from '@tanstack/react-router';

import { BatchFormQuestionScreen } from '@/feature/talenthub/screen/batches/screen/BatchFormQuestionScreen';
import { getBatchById } from '@/lib/api/batchApi';
import type { BatchType } from '@/types/batch.type';

export const Route = createFileRoute('/talenthub/_authenticated/batches/$batchId/form-question/')({
  loader: async ({ params }) => {
    const { batchId } = params;
    const response = await getBatchById(batchId);
    if (response.success && 'data' in response) {
      return response.data as BatchType;
    } else if ('error' in response && response.error === 'BATCH_NOT_FOUND') {
      throw notFound();
    } else {
      throw new Error();
    }
  },
  component: BatchFormQuestionScreen,
});
