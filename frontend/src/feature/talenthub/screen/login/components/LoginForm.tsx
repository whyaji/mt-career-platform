import { Alert, Box, Button, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEye, IconEyeOff, IconLock, IconMail, IconShield } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import React, { useRef, useState } from 'react';
import { z } from 'zod';

import TurnstileWidget, { type TurnstileWidgetRef } from '@/components/TurnstileWidget';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const form = useForm<LoginFormData>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginFormData) => {
    if (!turnstileToken) {
      notifications.show({
        title: 'Error',
        message: 'Please verify you are human',
        color: 'red',
      });
      return;
    }
    try {
      setError(null);
      await login(values.email, values.password, turnstileToken);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Box w="100%">
      {error && (
        <Alert color="red" mb="lg" icon={<IconShield size="1rem" />} radius="md" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            {...form.getInputProps('email')}
            label="Email Address"
            placeholder="admin@example.com"
            required
            leftSection={<IconMail size="1rem" />}
            size="md"
            radius="md"
            styles={{
              input: {
                border: '2px solid #e9ecef',
                '&:focus': {
                  borderColor: '#667eea',
                },
              },
            }}
          />

          <TextInput
            {...form.getInputProps('password')}
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            required
            leftSection={<IconLock size="1rem" />}
            rightSection={
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: 'none', background: 'transparent' }}
                p={0}>
                {showPassword ? <IconEyeOff size="1rem" /> : <IconEye size="1rem" />}
              </Button>
            }
            size="md"
            radius="md"
            styles={{
              input: {
                border: '2px solid #e9ecef',
                '&:focus': {
                  borderColor: '#667eea',
                },
              },
            }}
          />

          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={setTurnstileToken}
            onError={() => {
              setTurnstileToken(null);
            }}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            radius="md"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
            }}
            leftSection={!isLoading && <IconShield size="1rem" />}>
            {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
          </Button>
        </Stack>
      </form>

      <Text size="xs" c="dimmed" ta="center" mt="md">
        Secure admin access to Talent Hub management system
      </Text>
    </Box>
  );
};
