import { Alert, Box, Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEye, IconEyeOff, IconLock, IconMail, IconShield } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRef, useState } from 'react';
import { z } from 'zod';

import TurnstileWidget, { type TurnstileWidgetRef } from '@/components/TurnstileWidget';
import { ENV_TYPE } from '@/constants/env';
import { authApi } from '@/lib/api/authApi';
import { useUserStore } from '@/lib/store/userStore';
import { Route } from '@/routes/talenthub/login';

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const searchParam = Route.useSearch();
  const setUser = useUserStore((state) => state.setUser);
  const { redirect } = 'redirect' in searchParam ? searchParam : { redirect: null };
  const navigate = useNavigate();
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

  const { mutateAsync: login, isPending: isLoading } = useMutation({
    mutationFn: authApi.login,
  });

  const handleSubmit = async (values: LoginFormData) => {
    if (!turnstileToken && ENV_TYPE !== 'development') {
      notifications.show({
        title: 'Error',
        message: 'Please verify you are human',
        color: 'red',
      });
      return;
    }
    try {
      setError(null);
      const result = await login({
        email: values.email,
        password: values.password,
        turnstileToken: turnstileToken ?? 'pass',
      });
      if (result.success && 'data' in result && result.data) {
        localStorage.setItem('access_token', result.data.tokens.access_token.token);
        localStorage.setItem('refresh_token', result.data.tokens.refresh_token.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setUser(result.data.user);
        navigate({ to: redirect ? (redirect as never) : '/talenthub/dashboard' });
      } else {
        setError(result.message);
        notifications.show({
          title: 'Error',
          message: result.message,
          color: 'red',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Login failed',
        color: 'red',
      });
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      {/* Background Pattern */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        }}
      />

      <Container size="sm" style={{ position: 'relative', zIndex: 1 }}>
        <Paper
          withBorder
          shadow="xl"
          p={40}
          radius="lg"
          style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
          <Stack align="center" gap="xl">
            {/* Logo/Header Section */}
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                }}>
                <Text size="2rem" fw={700} c="white">
                  MT
                </Text>
              </Box>
              <Stack align="center" gap="xs">
                <Title order={1} size="h2" c="dark" ta="center">
                  Talent Hub
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Admin Portal Access
                </Text>
              </Stack>
            </Stack>

            <Box w="100%">
              {error && (
                <Alert
                  color="red"
                  mb="lg"
                  icon={<IconShield size="1rem" />}
                  radius="md"
                  variant="light">
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

                  {ENV_TYPE !== 'development' && (
                    <TurnstileWidget
                      ref={turnstileRef}
                      onSuccess={setTurnstileToken}
                      onError={() => {
                        setTurnstileToken(null);
                      }}
                    />
                  )}

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
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
