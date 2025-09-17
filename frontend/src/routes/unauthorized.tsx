import { Button, Container, Paper, Text, Title } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { BackgroundLayer } from '@/components/BackgroundLayer';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: '/' });
  };

  return (
    <BackgroundLayer>
      <Container size="sm" py="xl">
        <div className="min-h-screen flex items-center justify-center">
          <Paper withBorder shadow="md" p="xl" radius="md" className="text-center">
            <Title order={1} mb="md" c="red">
              403 - Access Denied
            </Title>
            <Text size="lg" mb="xl" c="dimmed">
              You don't have permission to access this page. Admin privileges are required.
            </Text>
            <Button onClick={handleGoHome} size="lg">
              Go Home
            </Button>
          </Paper>
        </div>
      </Container>
    </BackgroundLayer>
  );
};

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
});
