import { Box, Container, Flex, Loader, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconClock, IconLoader } from '@tabler/icons-react';

export function PendingScreenComponent() {
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
            background: 'linear-gradient(135deg,rgb(34, 139, 34) 0%,rgb(25, 113, 25) 100%)',
            border: 'none',
            maxWidth: '600px',
            width: '100%',
          }}>
          <Stack gap="xl" align="center">
            {/* Large Loading Icon */}
            <Box style={{ position: 'relative' }}>
              <ThemeIcon
                size="8rem"
                radius="xl"
                variant="light"
                color="white"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                <IconLoader size="4rem" />
              </ThemeIcon>
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
                  <IconClock size="2rem" />
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
              Memproses Data
            </Title>

            {/* Description */}
            <Text size="lg" ta="center" c="rgba(255, 255, 255, 0.9)" maw={400} lh={1.6}>
              Mohon tunggu sebentar, sistem sedang memproses data Anda. Proses ini mungkin memakan
              waktu beberapa saat.
            </Text>

            {/* Mantine Loader */}
            <Box mt="md">
              <Loader
                size="lg"
                color="white"
                type="dots"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              />
            </Box>

            {/* Loading Text */}
            <Text size="md" ta="center" c="rgba(255, 255, 255, 0.8)" fw={500}>
              Harap jangan tutup halaman ini...
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
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
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
