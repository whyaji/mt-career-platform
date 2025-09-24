import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Collapse,
  em,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBook,
  IconCategoryFilled,
  IconChevronRight,
  IconDatabase,
  IconFileText,
  IconHome,
  IconLogout,
  IconQuestionMark,
  IconSchool,
  IconSettings,
  IconTable,
  IconUser,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { useUserStore } from '@/lib/store/userStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: string;
  subItems?: NavItemProps[];
}
interface NavItemComponentProps {
  item: NavItemProps;
  onClick?: () => void;
}

const navItems: NavItemProps[] = [
  {
    icon: IconHome,
    label: 'Dashboard',
    href: '/talenthub/dashboard',
  },
  {
    icon: IconTable,
    label: 'Master Data',
    subItems: [
      {
        icon: IconSchool,
        label: 'Educational Institute',
        href: '/talenthub/educational-institution',
      },
      {
        icon: IconQuestionMark,
        label: 'Questions',
        href: '/talenthub/questions',
      },
      {
        icon: IconDatabase,
        label: 'Batches',
        href: '/talenthub/batches',
      },
      {
        icon: IconCategoryFilled,
        label: 'Program Categories',
        href: '/talenthub/program-category',
      },
      {
        icon: IconBook,
        label: 'Programs',
        href: '/talenthub/program',
      },
    ],
  },
  {
    icon: IconFileText,
    label: 'Applications',
    href: '/talenthub/applications',
    // badge: 'New',
  },
  // {
  //   icon: IconChartBar,
  //   label: 'Analytics',
  //   href: '/talenthub/analytics',
  // },
  // {
  //   icon: IconReportAnalytics,
  //   label: 'Reports',
  //   href: '/talenthub/reports',
  // },
  // {
  //   icon: IconSettings,
  //   label: 'Settings',
  //   href: '/talenthub/settings',
  // },
];

function SubNavItem({ item, onClick }: NavItemComponentProps) {
  const { icon: Icon, label, href } = item;
  return (
    <Link
      onClick={onClick}
      to={href}
      style={{
        textDecoration: 'none',
      }}>
      <UnstyledButton
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 16px 8px 48px',
          borderRadius: '6px',
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
        <Group gap="sm">
          <ThemeIcon size="sm" variant="light" color="blue" radius="sm">
            <Icon size="0.875rem" />
          </ThemeIcon>
          <Text size="sm" fw={400}>
            {label}
          </Text>
        </Group>
      </UnstyledButton>
    </Link>
  );
}

function NavItem({ item, onClick }: NavItemComponentProps) {
  const { icon: Icon, label, href, badge, subItems } = item;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (subItems && subItems.length > 0) {
    return (
      <Box>
        <UnstyledButton
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
          onClick={handleToggleExpand}
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
            <Group gap="xs">
              {badge && (
                <Badge size="sm" variant="light" color="blue" radius="xl">
                  {badge}
                </Badge>
              )}
              <Box
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                }}>
                <IconChevronRight size="0.875rem" />
              </Box>
            </Group>
          </Group>
        </UnstyledButton>
        <Collapse in={isExpanded}>
          <Stack gap="xs" mt="xs">
            {subItems.map((subItem, index) => (
              <SubNavItem
                key={index}
                item={subItem}
                onClick={() => {
                  if (onClick) {
                    onClick();
                  }
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>
    );
  }

  return (
    <Link
      onClick={onClick}
      to={href}
      style={{
        textDecoration: 'none',
      }}>
      <UnstyledButton
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
    </Link>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clearUser, user } = useUserStore();

  const onLogout = async () => {
    const { authApi } = await import('@/lib/api/authApi');
    try {
      await authApi.logout();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to logout',
        color: 'red',
      });
    } finally {
      // Clear local storage and user store
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      clearUser();
      navigate({
        to: '/talenthub',
      });
    }
  };

  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const [opened, setOpened] = useState(true);

  const isFirstMobileMount = useRef(true);
  useEffect(() => {
    if (isMobile && isFirstMobileMount.current) {
      setOpened(false);
      isFirstMobileMount.current = false;
    }
  }, [isMobile]);

  const handleToggle = () => setOpened(!opened);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
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

          {/* Right Section */}
          <Group gap="sm">
            {/* Theme Toggle */}
            {/* <ActionIcon
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
            {/* <ActionIcon
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
            </ActionIcon> */}

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
                  {!isMobile && (
                    <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} c="dark" truncate>
                        {user?.name || 'Admin User'}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {user?.email || 'admin@example.com'}
                      </Text>
                    </Stack>
                  )}
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
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
                <Menu.Divider />
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
              <NavItem
                key={index}
                item={item}
                onClick={() => {
                  if (isMobile) {
                    setOpened(false);
                  }
                }}
              />
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
            height: 'calc(100vh - 70px - 32px)', // Account for header + padding (md = 16px top + 16px bottom)
            overflow: 'hidden',
          }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
