import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBell,
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconHome,
  IconLogout,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconSun,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
  };
  onLogout: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: string;
}

const navItems: NavItemProps[] = [
  {
    icon: IconHome,
    label: 'Dashboard',
    href: '/talenthub/dashboard',
  },
  {
    icon: IconUsers,
    label: 'Users',
    href: '/talenthub/users',
    badge: '12',
  },
  {
    icon: IconDatabase,
    label: 'Batches',
    href: '/talenthub/batches',
    badge: '5',
  },
  {
    icon: IconFileText,
    label: 'Applications',
    href: '/talenthub/applications',
    badge: 'New',
  },
  {
    icon: IconChartBar,
    label: 'Analytics',
    href: '/talenthub/analytics',
  },
  {
    icon: IconReportAnalytics,
    label: 'Reports',
    href: '/talenthub/reports',
  },
  {
    icon: IconSettings,
    label: 'Settings',
    href: '/talenthub/settings',
  },
];

function NavItem({ icon: Icon, label, href, badge }: NavItemProps) {
  return (
    <UnstyledButton
      component="a"
      href={href}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'var(--mantine-color-text)',
        transition: 'all 0.2s ease',
        background: 'transparent',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--mantine-color-blue-0)';
        e.currentTarget.style.color = 'var(--mantine-color-blue-6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--mantine-color-text)';
      }}>
      <Group gap="md" justify="space-between">
        <Group gap="md">
          <ThemeIcon size="md" variant="light" color="blue" radius="md">
            <Icon size="1rem" />
          </ThemeIcon>
          <Text size="sm" fw={500}>
            {label}
          </Text>
        </Group>
        {badge && (
          <Badge size="sm" variant="light" color="blue" radius="xl">
            {badge}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}

export function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleToggle = () => setOpened(!opened);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: '100vh',
      }}>
      {/* Header */}
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
        <Group justify="space-between" h="100%" px="md">
          {/* Left Section */}
          <Group gap="md">
            <Burger
              opened={opened}
              onClick={handleToggle}
              size="sm"
              color="var(--mantine-color-gray-6)"
            />

            <Box>
              <Text size="lg" fw={700} c="dark">
                Talent Hub
              </Text>
              <Text size="xs" c="dimmed">
                Admin Dashboard
              </Text>
            </Box>
          </Group>

          {/* Center Section - Search */}
          <Box style={{ flex: 1, maxWidth: 400 }}>
            <TextInput
              placeholder="Search users, batches, applications..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
              leftSection={<IconSearch size="1rem" />}
              size="sm"
              radius="xl"
              style={{
                '& .mantine-TextInput-input': {
                  background: 'var(--mantine-color-gray-0)',
                  border: '1px solid var(--mantine-color-gray-3)',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-blue-4)',
                    background: 'white',
                  },
                },
              }}
            />
          </Box>

          {/* Right Section */}
          <Group gap="sm">
            {/* Theme Toggle */}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              style={{
                background: 'var(--mantine-color-gray-0)',
                border: '1px solid var(--mantine-color-gray-3)',
              }}>
              <IconSun size="1rem" />
            </ActionIcon>

            {/* Notifications */}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              style={{
                background: 'var(--mantine-color-gray-0)',
                border: '1px solid var(--mantine-color-gray-3)',
              }}>
              <IconBell size="1rem" />
              <Badge
                size="xs"
                color="red"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  padding: 0,
                  fontSize: '10px',
                }}>
                3
              </Badge>
            </ActionIcon>

            {/* User Menu */}
            <Menu shadow="md" width={280} position="bottom-end">
              <Menu.Target>
                <Group
                  gap="sm"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'var(--mantine-color-gray-0)',
                    border: '1px solid var(--mantine-color-gray-3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--mantine-color-blue-0)';
                    e.currentTarget.style.borderColor = 'var(--mantine-color-blue-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--mantine-color-gray-0)';
                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)';
                  }}>
                  <Avatar
                    size="md"
                    radius="xl"
                    color="blue"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}>
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                  <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} c="dark" truncate>
                      {user?.name || 'Admin User'}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {user?.email || 'admin@example.com'}
                    </Text>
                  </Stack>
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size="1rem" />}>Profile Settings</Menu.Item>
                <Menu.Item leftSection={<IconSettings size="1rem" />}>Preferences</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size="1rem" />} color="red" onClick={onLogout}>
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          borderRight: '1px solid var(--mantine-color-gray-2)',
        }}>
        <AppShell.Section>
          <Group gap="md" mb="xl" p="md">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}>
              <Text size="lg" fw={700} c="white">
                MT
              </Text>
            </Box>
            <Stack gap={0}>
              <Text size="lg" fw={700} c="dark">
                Talent Hub
              </Text>
              <Text size="xs" c="dimmed">
                Admin Portal
              </Text>
            </Stack>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} p="md">
          <Stack gap="xs">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section p="md">
          <Box
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '8px',
              border: '1px solid var(--mantine-color-gray-2)',
            }}>
            <Text size="xs" c="dimmed" ta="center">
              Talent Hub v1.0.0
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Box
          style={{
            background: 'transparent',
            minHeight: 'calc(100vh - 70px)',
          }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
