import { Box, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { LoginForm } from '../components/LoginForm';

export const LoginScreen = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/talenthub/dashboard' });
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

            {/* Login Form */}
            <LoginForm onSuccess={handleLoginSuccess} />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
