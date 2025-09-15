import { createFileRoute, notFound } from '@tanstack/react-router';

import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import FormScreen from '@/feature/form/screen/FormScreen';
import { getVerificationPath } from '@/lib/api/verification.api';
import type { BatchType } from '@/types/batch.type';

export const Route = createFileRoute('/$location/$batch/')({
  loader: async ({ params }) => {
    const { location, batch } = params;
    const response = await getVerificationPath(location, batch);
    const responseData = await response.json();
    if (responseData.success && 'data' in responseData) {
      return responseData.data as BatchType;
    } else if ('error' in responseData && responseData.error === 'BATCH_NOT_FOUND') {
      throw notFound();
    } else {
      throw new Error();
    }
  },
  component: FormScreen,
  notFoundComponent: NotFoundScreenComponent,
});
