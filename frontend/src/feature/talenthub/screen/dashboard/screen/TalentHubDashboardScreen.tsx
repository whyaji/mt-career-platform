import {
  Alert,
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconDatabase, IconFileText, IconForms } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

import { useGetDashboardCountQuery } from '@/hooks/query/dashboard/useGetDashboardCountQuery';

const TalentHubDashboardScreen = () => {
  const { data: dashboardData, isLoading, error } = useGetDashboardCountQuery();

  const dashboardCards = [
    {
      title: 'Batches',
      description: 'Manage application batches',
      icon: IconDatabase,
      color: 'green',
      count: isLoading
        ? '...'
        : dashboardData && 'data' in dashboardData
          ? dashboardData.data?.total_batches?.toLocaleString() || '0'
          : '0',
      trend: '+8%',
    },
    {
      title: 'Applications',
      description: 'Review applications',
      icon: IconFileText,
      color: 'orange',
      count: isLoading
        ? '...'
        : dashboardData && 'data' in dashboardData
          ? dashboardData.data?.total_applicants?.toLocaleString() || '0'
          : '0',
      trend: '+15%',
    },
    {
      title: 'Institutions',
      description: 'Educational institutions',
      icon: IconDatabase,
      color: 'blue',
      count: isLoading
        ? '...'
        : dashboardData && 'data' in dashboardData
          ? dashboardData.data?.total_institutions?.toLocaleString() || '0'
          : '0',
      trend: '+5%',
    },
  ];

  // Handle error state
  if (error) {
    return (
      <Container size="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error loading dashboard data"
          color="red"
          variant="light">
          Unable to fetch dashboard statistics. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      {/* Welcome Section */}
      <Paper
        withBorder
        shadow="sm"
        p="xl"
        radius="lg"
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
        }}>
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1} c="white" size="h2">
              Welcome to Talent Hub - MT Dashboard
            </Title>
            <Text c="rgba(255, 255, 255, 0.8)" size="lg">
              Manage your talent acquisition process efficiently
            </Text>
          </Stack>
          {/* button to candidate form */}
          <Link to="/">
            <Button leftSection={<IconForms size="1rem" />} variant="light" color="white" size="md">
              Applicant Form
            </Button>
          </Link>
        </Group>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Group justify="center" mb="xl">
          <Loader size="lg" />
          <Text size="lg">Loading dashboard data...</Text>
        </Group>
      )}

      {/* Dashboard Cards */}
      <Grid gutter="xl">
        {dashboardCards.map((card, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
            <Paper
              withBorder
              shadow="sm"
              p="xl"
              radius="lg"
              style={{
                height: '100%',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                background: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <ThemeIcon
                    size="xl"
                    radius="lg"
                    variant="light"
                    color={card.color}
                    style={{
                      background: `linear-gradient(135deg, var(--mantine-color-${card.color}-1) 0%, var(--mantine-color-${card.color}-3) 100%)`,
                    }}>
                    <card.icon size="1.5rem" />
                  </ThemeIcon>
                  {/* <Badge color={card.color} variant="light" size="sm">
                    {card.trend}
                  </Badge> */}
                </Group>

                <Stack gap="xs">
                  <Title order={3} size="h4" c="dark">
                    {card.title}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {card.description}
                  </Text>
                  <Group align="center" gap="xs">
                    <Text size="xl" fw={700} c={card.color}>
                      {card.count}
                    </Text>
                    {isLoading && <Loader size="sm" />}
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      {/* Quick Actions */}
      {/* <Paper withBorder shadow="sm" p="xl" radius="lg" mt="xl" style={{ background: 'white' }}>
        <Title order={3} mb="lg" c="dark">
          Quick Actions
        </Title>
        <Group gap="md">
          <Button leftSection={<IconUsers size="1rem" />} variant="light" color="blue" size="md">
            Add New User
          </Button>
          <Button
            leftSection={<IconDatabase size="1rem" />}
            variant="light"
            color="green"
            size="md">
            Create Batch
          </Button>
          <Button
            leftSection={<IconFileText size="1rem" />}
            variant="light"
            color="orange"
            size="md">
            Review Applications
          </Button>
          <Button
            leftSection={<IconReportAnalytics size="1rem" />}
            variant="light"
            color="teal"
            size="md">
            Generate Report
          </Button>
        </Group>
      </Paper> */}
    </Container>
  );
};

export default TalentHubDashboardScreen;
