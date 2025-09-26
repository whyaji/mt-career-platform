import { createFileRoute, notFound } from '@tanstack/react-router';

import { BackgroundLayer } from '@/components/BackgroundLayer';
import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';
import DynamicFormScreen from '@/feature/form/screen/DynamicFormScreen';
import { getVerificationFormPath } from '@/lib/api/verification.api';
import type { BatchType } from '@/types/batch.type';

const RouteComponent = () => {
  return (
    <BackgroundLayer>
      <DynamicFormScreen />
    </BackgroundLayer>
  );
};

export const Route = createFileRoute('/form/$programCode/$batchLocationCode/$batchNumberCode/')({
  loader: async ({ params }) => {
    const { programCode, batchLocationCode, batchNumberCode } = params;
    const response = await getVerificationFormPath(programCode, batchLocationCode, batchNumberCode);
    const responseData = await response.json();
    if (responseData.success && 'data' in responseData) {
      return responseData.data as BatchType;
    } else if ('error' in responseData && responseData.error === 'BATCH_NOT_FOUND') {
      throw notFound();
    } else {
      throw new Error();
    }
  },
  component: RouteComponent,
  notFoundComponent: NotFoundScreenComponent,
});
