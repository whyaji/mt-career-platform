import {
  Badge,
  Box,
  Card,
  Container,
  em,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { ErrorScreenComponent } from '@/components/ErrorScreenComponent';
import { getActiveBatches } from '@/lib/api/batchApi';
import type { BatchType } from '@/types/batch.type';

export default function HomeScreen() {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getActiveBatches(),
  });

  const batches = useMemo(() => {
    if (data?.success && 'data' in data && data.data) {
      return data.data;
    }
    return [];
  }, [data]);

  // Get unique years and locations for filter options
  const uniqueYears = useMemo(() => {
    const years = [...new Set(batches.map((batch: BatchType) => batch.year))];
    return years
      .sort((a, b) => (b as number) - (a as number))
      .map((year) => ({
        value: (year as number).toString(),
        label: (year as number).toString(),
      }));
  }, [batches]);

  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(batches.map((batch: BatchType) => batch.location))];
    return locations.sort().map((location) => ({
      value: location as string,
      label: location as string,
    }));
  }, [batches]);

  // Filter batches based on search term and filters
  const filteredBatches = useMemo(() => {
    return batches.filter((batch: BatchType) => {
      const matchesSearch =
        batch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.number_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.year.toString().includes(searchTerm);

      const matchesYear = yearFilter ? batch.year.toString() === yearFilter : true;
      const matchesLocation = locationFilter ? batch.location === locationFilter : true;

      return matchesSearch && matchesYear && matchesLocation;
    });
  }, [batches, searchTerm, yearFilter, locationFilter]);

  if (isError || data?.success === false) {
    return <ErrorScreenComponent />;
  }

  return (
    <Container
      p={isMobile ? 'sm' : 'xl'}
      size="lg"
      py="xl"
      bg="rgba(0, 0, 0, 0.3)"
      style={{
        backdropFilter: 'blur(5px)',
      }}
      h="100vh">
      <Paper
        radius="md"
        withBorder
        bg="rgba(255, 255, 255, 0.9)"
        style={{ backdropFilter: 'blur(5px)' }}
        h="100%">
        <Stack gap="xl" p="md" h="100%">
          <Box ta="center">
            <Image
              src="/images/ssms-badge-icon.png"
              alt="SSMS Badge"
              w={150}
              h={70}
              fit="cover"
              style={{ margin: '0 auto' }}
            />
          </Box>
          <Text ta="center" c="dark" size={isMobile ? 'lg' : 'xl'} fw={600}>
            MT CBI Career - Program Kepemimpinan Perkebunan Pratama (PKPP)
          </Text>
          {/* Search and Filter Section */}
          <Box>
            <Grid gutter="md">
              <Grid.Col span={isMobile ? 12 : 6}>
                <TextInput
                  placeholder="Cari berdasarkan lokasi, angkatan, atau tahun..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={isMobile ? 6 : 3}>
                <Select
                  placeholder="Filter Tahun"
                  data={uniqueYears}
                  value={yearFilter}
                  onChange={setYearFilter}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={isMobile ? 6 : 3}>
                <Select
                  placeholder="Filter Lokasi"
                  data={uniqueLocations}
                  value={locationFilter}
                  onChange={setLocationFilter}
                  clearable
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* Scrollable Content Area */}
          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Box p="md">
              {/* Loading State */}
              {isPending && (
                <Box ta="center" py="xl">
                  <Loader size="lg" />
                  <Text size="md" c="dimmed" mt="md">
                    Memuat data batch...
                  </Text>
                </Box>
              )}

              {/* Empty State */}
              {!isPending && filteredBatches.length === 0 && (
                <Box ta="center" py="xl">
                  <Text size="lg" c="dimmed">
                    {batches.length === 0
                      ? 'Tidak ada batch yang aktif'
                      : 'Tidak ada batch yang sesuai dengan filter'}
                  </Text>
                </Box>
              )}

              {/* Batch List */}
              {!isPending && filteredBatches.length > 0 && (
                <Grid gutter="md">
                  {filteredBatches.map((batch: BatchType) => (
                    <Grid.Col key={batch.id} span={isMobile ? 12 : 6}>
                      <Link
                        to={`/${batch.location_code}/${batch.number_code}` as never}
                        style={{
                          textDecoration: 'none',
                        }}>
                        <Card
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          styles={{
                            root: {
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}>
                          <Stack gap="sm">
                            <Group justify="space-between">
                              <Text size="lg" fw={600} c="dark">
                                {batch.location}
                              </Text>
                              <Badge color="blue" variant="light">
                                {batch.year}
                              </Badge>
                            </Group>

                            <Text size="md" c="dimmed">
                              Angkatan {batch.number_code}
                            </Text>
                          </Stack>
                        </Card>
                      </Link>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Box>
          </ScrollArea>
        </Stack>
      </Paper>
    </Container>
  );
}
