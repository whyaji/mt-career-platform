import { Alert, Badge, Box, Divider, Group, ScrollArea, Stack, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconCalendar,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRuler,
  IconSchool,
  IconUser,
} from '@tabler/icons-react';

import { DraggableWindow } from '@/components/DraggableWindow';
import { StatusFilterPills } from '@/components/StatusFilterPills';
import {
  APPLICANT_DATA_GRADUATION_STATUS_LABELS,
  APPLICANT_DATA_REVIEW_STATUS_LABELS,
  APPLICANT_DATA_REVIEW_STATUS_LIST,
  APPLICANT_DATA_SCREENING_STATUS_LABELS,
  getApplicantDataStatusColor,
} from '@/constants/applicantDataStatus.enum';
import { useGetApplicationByIdQuery } from '@/hooks/query/applicant/useGetApplicationByIdQuery';
import { useUpdateApplicationReviewStatusMutation } from '@/hooks/query/applicant/useUpdateApplicationReviewStatusMutation';
import { useUserStore } from '@/lib/store/userStore';
import { formatDefaultDate } from '@/utils/dateTimeFormatter';

interface WindowApplicationDetailModalProps {
  opened: boolean;
  onClose: () => void;
  applicationId: string | null;
  windowId?: string;
  defaultPosition?: { x: number; y: number };
  zIndex?: number;
  onFocus?: () => void;
}

export function WindowApplicationDetailModal({
  opened,
  onClose,
  applicationId,
  windowId,
  defaultPosition = { x: 100, y: 100 },
  zIndex = 1000,
  onFocus,
}: WindowApplicationDetailModalProps) {
  const user = useUserStore((state) => state.user);

  // Fetch application data by ID
  const {
    data: applicationResponse,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useGetApplicationByIdQuery(applicationId || '');

  // Mutation for updating review status
  const updateReviewStatusMutation = useUpdateApplicationReviewStatusMutation();

  // Extract application data from response
  const application =
    applicationResponse?.success && 'data' in applicationResponse ? applicationResponse.data : null;

  // Handler for updating review status
  const handleUpdateReviewStatus = (reviewStatus: number) => {
    if (!application) {
      return;
    }

    const statusLabels = APPLICANT_DATA_REVIEW_STATUS_LABELS;
    const statusLabel = statusLabels[reviewStatus as keyof typeof statusLabels];
    const reviewRemark = `Status updated to "${statusLabel}" by ${user?.name || 'User'}`;

    updateReviewStatusMutation.mutate({
      id: application.id,
      review_status: reviewStatus,
      review_remark: reviewRemark,
    });
  };

  // Handler for status pill selection - prevent deselecting current status
  const handleStatusPillSelect = (status: number | undefined) => {
    // Only update if a status is selected and it's different from current
    if (status !== undefined && status !== application?.review_status) {
      handleUpdateReviewStatus(status);
    }
  };

  // Status badge component
  const StatusBadge = ({
    status,
    type,
  }: {
    status: number;
    type: 'screening' | 'review' | 'graduation';
  }) => {
    const labels =
      type === 'screening'
        ? APPLICANT_DATA_SCREENING_STATUS_LABELS
        : type === 'review'
          ? APPLICANT_DATA_REVIEW_STATUS_LABELS
          : APPLICANT_DATA_GRADUATION_STATUS_LABELS;

    return (
      <Badge
        variant="light"
        size="sm"
        color={getApplicantDataStatusColor(status, type)}
        style={{ textTransform: 'capitalize' }}>
        {labels[status as keyof typeof labels] || 'Unknown'}
      </Badge>
    );
  };

  // Handle loading state
  if (isLoadingApplication) {
    return (
      <DraggableWindow
        opened={opened}
        onClose={onClose}
        windowId={windowId}
        title="Loading Application Details..."
        defaultPosition={defaultPosition}
        zIndex={zIndex}
        width={800}
        height={700}
        resizable
        onFocus={onFocus}>
        <Box
          style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <Text>Loading application details...</Text>
        </Box>
      </DraggableWindow>
    );
  }

  // Handle error state
  if (applicationError || !application) {
    return (
      <DraggableWindow
        opened={opened}
        onClose={onClose}
        windowId={windowId}
        title="Error Loading Application Details"
        defaultPosition={defaultPosition}
        zIndex={zIndex}
        width={800}
        height={700}
        resizable
        onFocus={onFocus}>
        <Box style={{ padding: '16px' }}>
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {applicationError
              ? 'Failed to load application details. Please try again.'
              : 'Application not found.'}
          </Alert>
        </Box>
      </DraggableWindow>
    );
  }

  return (
    <DraggableWindow
      opened={opened}
      onClose={onClose}
      title={`Application Details - ${application.nama_lengkap}`}
      windowId={windowId}
      defaultPosition={defaultPosition}
      zIndex={zIndex}
      width={800}
      height={700}
      onFocus={onFocus}>
      <ScrollArea style={{ height: '100%', padding: '16px' }}>
        <Stack gap="md">
          {/* Status Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Application Status
            </Text>
            <Stack gap="xs">
              <Group gap="sm" justify="space-between">
                <Group gap="sm">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Screening Status
                    </Text>
                    <StatusBadge status={application.screening_status} type="screening" />
                  </div>
                </Group>
                {application.screening_remark && (
                  <Text size="xs" c="dimmed" style={{ maxWidth: '200px', textAlign: 'right' }}>
                    {application.screening_remark}
                  </Text>
                )}
              </Group>

              <Group gap="sm" justify="space-between">
                <Group gap="sm">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Graduation Status
                    </Text>
                    <StatusBadge status={application.graduation_status} type="graduation" />
                  </div>
                </Group>
                {application.graduation_remark && (
                  <Text size="xs" c="dimmed" style={{ maxWidth: '200px', textAlign: 'right' }}>
                    {application.graduation_remark}
                  </Text>
                )}
              </Group>

              <Group gap="sm" justify="space-between">
                <Group gap="sm">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Review Status
                    </Text>
                    <StatusBadge status={application.review_status} type="review" />
                  </div>
                </Group>
                {application.review_remark && (
                  <Text size="xs" c="dimmed" style={{ maxWidth: '200px', textAlign: 'right' }}>
                    {application.review_remark}
                  </Text>
                )}
              </Group>

              {/* Review Status Update Buttons */}
              <div>
                <Text size="sm" c="dimmed" fw={500} mb="xs">
                  Update Review Status:
                </Text>
                <StatusFilterPills
                  statuses={APPLICANT_DATA_REVIEW_STATUS_LIST}
                  selectedStatus={application.review_status}
                  onStatusSelect={handleStatusPillSelect}
                  loading={updateReviewStatusMutation.isPending}
                />
              </div>
            </Stack>
          </div>

          <Divider />

          {/* Personal Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Personal Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Full Name
                  </Text>
                  <Text fw={500}>{application.nama_lengkap}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconId size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    NIK
                  </Text>
                  <Text fw={500}>{application.nik}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Gender
                  </Text>
                  <Badge
                    variant="light"
                    color={application.jenis_kelamin === 'L' ? 'blue' : 'pink'}>
                    {application.jenis_kelamin === 'L' ? 'Male' : 'Female'}
                  </Badge>
                </div>
              </Group>

              <Group gap="sm">
                <IconCalendar size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Date of Birth
                  </Text>
                  <Text fw={500}>
                    {application.tempat_lahir}, {formatDefaultDate(application.tanggal_lahir)}
                  </Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Age
                  </Text>
                  <Text fw={500}>{application.usia} years old</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Birth Region
                  </Text>
                  <Text fw={500}>{application.daerah_lahir}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Birth Province
                  </Text>
                  <Text fw={500}>{application.provinsi_lahir}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconRuler size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Height & Weight
                  </Text>
                  <Text fw={500}>
                    {application.tinggi_badan} cm / {application.berat_badan} kg
                  </Text>
                </div>
              </Group>
            </Stack>
          </div>

          <Divider />

          {/* Contact Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Contact Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconMail size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Email
                  </Text>
                  <Text fw={500}>{application.email}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconPhone size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    WhatsApp
                  </Text>
                  <Text fw={500}>{application.nomor_whatsapp}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Domicile Region
                  </Text>
                  <Text fw={500}>{application.daerah_domisili}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Domicile Province
                  </Text>
                  <Text fw={500}>{application.provinsi_domisili}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Domicile City
                  </Text>
                  <Text fw={500}>{application.kota_domisili}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconMapPin size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Address
                  </Text>
                  <Text fw={500}>{application.alamat_domisili}</Text>
                </div>
              </Group>
            </Stack>
          </div>

          <Divider />

          {/* Education Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Education Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Institution
                  </Text>
                  <Text fw={500}>{application.instansi_pendidikan}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Major
                  </Text>
                  <Text fw={500}>{application.jurusan_pendidikan}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Education Level
                  </Text>
                  <Text fw={500}>{application.jenjang_pendidikan}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Student ID
                  </Text>
                  <Text fw={500}>{application.nim || 'N/A'}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Diploma Status
                  </Text>
                  <Text fw={500}>{application.status_ijazah}</Text>
                </div>
              </Group>
            </Stack>
          </div>

          <Divider />

          {/* Program Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Program Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Selected Program
                  </Text>
                  <Text fw={500}>{application.program_terpilih}</Text>
                </div>
              </Group>

              {application.batch && (
                <Group gap="sm">
                  <IconCalendar size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Batch
                    </Text>
                    <Text fw={500}>
                      {application.batch.number} - {application.batch.location} (
                      {application.batch.year})
                    </Text>
                  </div>
                </Group>
              )}
            </Stack>
          </div>

          <Divider />

          {/* Additional Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              Additional Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Marital Status
                  </Text>
                  <Text fw={500}>{application.status_perkawinan}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconSchool size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Continue Education
                  </Text>
                  <Badge
                    variant="light"
                    color={application.melanjutkan_pendidikan ? 'green' : 'red'}>
                    {application.melanjutkan_pendidikan ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </Group>

              <Group gap="sm">
                <IconUser size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Shirt Size
                  </Text>
                  <Text fw={500}>{application.ukuran_baju}</Text>
                </div>
              </Group>

              {application.riwayat_penyakit && (
                <Group gap="sm">
                  <IconUser size={16} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Medical History
                    </Text>
                    <Text fw={500}>{application.riwayat_penyakit}</Text>
                  </div>
                </Group>
              )}
            </Stack>
          </div>

          <Divider />

          {/* System Information */}
          <div>
            <Text size="lg" fw={600} mb="sm" c="blue">
              System Information
            </Text>
            <Stack gap="xs">
              <Group gap="sm">
                <IconCalendar size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Applied Date
                  </Text>
                  <Text fw={500}>{formatDefaultDate(application.created_at)}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <IconCalendar size={16} />
                <div>
                  <Text size="sm" c="dimmed">
                    Last Updated
                  </Text>
                  <Text fw={500}>{formatDefaultDate(application.updated_at)}</Text>
                </div>
              </Group>
            </Stack>
          </div>
        </Stack>
      </ScrollArea>
    </DraggableWindow>
  );
}
