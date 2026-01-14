'use client';

import {
    Title,
    Text,
    Group,
    Stack,
    Paper,
    Badge,
    Timeline,
    LoadingOverlay,
    Box,
    Button
} from "@mantine/core";
import { useState, useEffect, use } from 'react';
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ContactActivity {
    id: number;
    contact: number;
    activity_type: number;
    activity_type_display: string;
    data: { [key: string]: string };
    activity_date: string;
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [activities, setActivities] = useState<ContactActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactName, setContactName] = useState('');

    useEffect(() => {
        fetchContactDetails();
        fetchActivities();
    }, [id]);

    const fetchContactDetails = async () => {
        try {
            const response = await fetch(`/api/contacts/${id}/`);
            const data = await response.json();
            setContactName(data.full_name || data.discord_id || `Contact #${id}`);
        } catch (error) {
            console.error('Error fetching contact details:', error);
        }
    };

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/contacts/${id}/activities/`);
            const data = await response.json();
            setActivities(data);
        } catch (error) {
            console.error('Error fetching contact activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const mapDataToDetailType = (data: { [key: string]: string }) => {
        return (
            <>
                {data.content && (
                    <Text size="sm" mt={4}>Details: {data.content}</Text>
                )}
                {Object.entries(data).map(([key, value]) => {
                    if (key !== 'content' && value) {
                        return (
                            <Text size="sm" mt={4} key={key}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                            </Text>
                        );
                    }
                    return null;
                })}
            </>
        );
    }

    const getActivityIcon = (activityType: number) => {
        switch (activityType) {
            case 0: // ACCOMPLISHMENT
                return <IconCheck size={16} />;
            case 1: // SUSPICION
                return <IconAlertTriangle size={16} />;
            default: // MISC
                return <IconInfoCircle size={16} />;
        }
    };



    return (
        <Stack gap="md" p="xl">
            <Button
                leftSection={<IconArrowLeft size={16} />}
                variant="subtle"
                onClick={() => router.back()}
                style={{ alignSelf: 'flex-start' }}
            >
                Back to Contacts
            </Button>

            <Title order={2}>{contactName}</Title>
            <Text size="sm" c="dimmed">ID: {id}</Text>

            <Group align="stretch" gap="md" style={{ alignItems: 'stretch' }}>
                <Paper withBorder p="md" style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                    <Box pos="relative" style={{ flex: 1 }}>
                        <LoadingOverlay visible={loading} />
                        <Title order={4} mb="md">Contact Activities</Title>
                        {activities.length === 0 && !loading ? (
                            <Text c="dimmed" size="sm">No activities recorded for this contact.</Text>
                        ) : (
                            <Timeline active={-1} bulletSize={24} lineWidth={2}>
                                {activities.map((activity) => (
                                    <Timeline.Item
                                        key={activity.id}
                                        bullet={getActivityIcon(activity.activity_type)}
                                        title={
                                            <Group gap="xs">
                                                <Badge size="sm">
                                                    {activity.activity_type_display}
                                                </Badge>
                                                <Text size="xs" c="dimmed">
                                                    {new Date(activity.activity_date).toLocaleString()}
                                                </Text>
                                            </Group>
                                        }
                                    >
                                        {mapDataToDetailType(activity.data)}
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        )}
                    </Box>
                </Paper>

                <Paper withBorder p="md" style={{ flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                    <Title order={4} mb="md">Response Rate</Title>
                    <Text c="dimmed" size="sm">Coming soon...</Text>
                </Paper>
            </Group>
        </Stack>
    );
}
