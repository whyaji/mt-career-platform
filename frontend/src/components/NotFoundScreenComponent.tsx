import {
  Anchor,
  Box,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconHome, IconSearch } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import { useUserStore } from '@/lib/store/userStore';

export function NotFoundScreenComponent() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const handleGoHome = () => {
    navigate({ to: user ? '/talenthub/dashboard' : '/' });
  };

  return (
    <Container
      size="lg"
      py="xl"
      bg="rgba(0, 0, 0, 0.3)"
      style={{ backdropFilter: 'blur(5px)' }}
      h="100vh">
      <Flex justify="center" align="center" h="100%">
        <Paper
          p="xl"
          radius="xl"
          withBorder
          shadow="xl"
          style={{
            background: 'linear-gradient(135deg,rgb(228, 27, 27) 0%,rgb(177, 58, 29) 100%)',
            border: 'none',
            maxWidth: '600px',
            width: '100%',
          }}>
          <Stack gap="xl" align="center">
            {/* Large 404 Number */}
            <Box style={{ position: 'relative' }}>
              <Title
                order={1}
                size="8rem"
                fw={900}
                c="white"
                style={{
                  fontSize: 'clamp(4rem, 15vw, 8rem)',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '-0.05em',
                  opacity: 0.9,
                }}>
                404
              </Title>
              <Box
                style={{
                  top: 5,
                  position: 'absolute',
                  left: '50%',
                  fontSize: '2rem',
                  animation: 'float 3s ease-in-out infinite',
                }}>
                <ThemeIcon
                  size="xl"
                  radius="xl"
                  variant="light"
                  color="yellow"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <IconAlertTriangle size="2rem" />
                </ThemeIcon>
              </Box>
            </Box>

            {/* Main Title */}
            <Title
              order={2}
              ta="center"
              c="white"
              fw={700}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}>
              Halaman Tidak Ditemukan
            </Title>

            {/* Description */}
            <Text size="lg" ta="center" c="rgba(255, 255, 255, 0.9)" maw={400} lh={1.6}>
              Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan
              atau URL yang dimasukkan salah.
            </Text>

            {/* Action Buttons */}
            <Group gap="md" mt="md">
              <Button
                size="lg"
                radius="xl"
                leftSection={<IconHome size="1.2rem" />}
                onClick={handleGoHome}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                }}
                variant="subtle">
                Kembali ke Beranda
              </Button>

              <Button
                size="lg"
                radius="xl"
                leftSection={<IconSearch size="1.2rem" />}
                variant="white"
                color="dark"
                onClick={() => window.history.back()}>
                Kembali
              </Button>
            </Group>

            {/* Help Text */}
            <Text size="sm" ta="center" c="rgba(255, 255, 255, 0.7)" mt="md">
              Jika Anda yakin ini adalah kesalahan, silakan{' '}
              <Anchor c="white" fw={500} style={{ textDecoration: 'underline' }}>
                hubungi dukungan teknis
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Flex>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-10px);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Container>
  );
}
