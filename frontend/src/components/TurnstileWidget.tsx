import { notifications } from '@mantine/notifications';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { TURNSTILE_SITE_KEY } from '../constants/env';

interface TurnstileWidgetProps {
  onSuccess?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export interface TurnstileWidgetRef {
  reset: () => void;
  getToken: () => string | null;
}

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const tokenRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        tokenRef.current = null;
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      },
      getToken: () => tokenRef.current,
    }));

    const handleSuccess = (token: string) => {
      tokenRef.current = token;
      onSuccess?.(token);
    };

    const handleError = () => {
      tokenRef.current = null;
      onError?.();
    };

    const handleExpire = () => {
      tokenRef.current = null;
      onExpire?.();
    };

    if (!TURNSTILE_SITE_KEY) {
      notifications.show({
        title: 'Turnstile Site Key Not Configured',
        message: 'Please configure the Turnstile site key in the environment variables.',
        color: 'red',
      });
      return null;
    }

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
