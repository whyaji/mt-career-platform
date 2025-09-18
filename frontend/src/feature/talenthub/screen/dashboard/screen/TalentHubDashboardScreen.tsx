import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconForms,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

const TalentHubDashboardScreen = () => {
  const dashboardCards = [
    {
      title: 'Users',
      description: 'Manage system users',
      icon: IconUsers,
      color: 'blue',
      count: '1,234',
      trend: '+12%',
    },
    {
      title: 'Batches',
      description: 'Manage application batches',
      icon: IconDatabase,
      color: 'green',
      count: '45',
      trend: '+8%',
    },
    {
      title: 'Applications',
      description: 'Review applications',
      icon: IconFileText,
      color: 'orange',
      count: '2,567',
      trend: '+15%',
    },
    {
      title: 'Analytics',
      description: 'View system analytics',
      icon: IconChartBar,
      color: 'purple',
      count: '98.5%',
      trend: '+2.1%',
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: IconSettings,
      color: 'gray',
      count: 'Active',
      trend: 'Updated',
    },
    {
      title: 'Reports',
      description: 'Generate reports',
      icon: IconReportAnalytics,
      color: 'teal',
      count: '24',
      trend: 'This week',
    },
  ];

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
                  <Badge color={card.color} variant="light" size="sm">
                    {card.trend}
                  </Badge>
                </Group>

                <Stack gap="xs">
                  <Title order={3} size="h4" c="dark">
                    {card.title}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {card.description}
                  </Text>
                  <Text size="xl" fw={700} c={card.color}>
                    {card.count}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper withBorder shadow="sm" p="xl" radius="lg" mt="xl" style={{ background: 'white' }}>
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
      </Paper>
    </Container>
  );
};

export default TalentHubDashboardScreen;
