'use client';

import {
  Stack,
  TextInput,
  Paper,
  Text,
  Group,
  Button,
  Badge,
  Box,
  Divider
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconSearch } from '@tabler/icons-react';

interface Person {
  did: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface VolunteerResponse {
  id: number;
  rid: number;
  did: string;
  response: number;
}

interface VolunteerSearchProps {
  reachId: number;
}

export default function VolunteerSearch({ reachId }: VolunteerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [responses, setResponses] = useState<Map<string, VolunteerResponse>>(new Map());
  const [loading, setLoading] = useState(false);

  // Fetch existing responses for this reach
  useEffect(() => {
    fetchResponses();
  }, [reachId]);

  const fetchResponses = async () => {
    try {
      const response = await fetch(`/api/volunteer-responses/by-reach/${reachId}/`);
      const data = await response.json();

      const responsesMap = new Map<string, VolunteerResponse>();
      data.forEach((resp: VolunteerResponse) => {
        responsesMap.set(resp.did, resp);
      });
      setResponses(responsesMap);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/people/search/?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetResponse = async (person: Person, responseValue: number) => {
    const existingResponse = responses.get(person.did);

    try {
      if (existingResponse && existingResponse.did && existingResponse.rid === reachId) {
        // Update existing response using composite key
        const response = await fetch('/api/volunteer-responses/update-by-keys/', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rid: reachId,
            did: person.did,
            response: responseValue
          })
        });
        const data = await response.json();

        if (!response.ok) {
          console.error('Failed to update response:', data);
          alert(`Error updating: ${JSON.stringify(data)}`);
          return;
        }

        // Update local state
        const newResponses = new Map(responses);
        newResponses.set(person.did, data);
        setResponses(newResponses);
      } else {
        // Create new response
        const payload = {
          rid: reachId,
          did: person.did,
          response: responseValue
        };
        console.log('Creating response with payload:', payload);

        const response = await fetch('/api/volunteer-responses/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response status:', response.status, 'Data:', data);

        if (!response.ok) {
          console.error('Failed to create response:', data);
          alert(`Error: ${JSON.stringify(data)}`);
          return;
        }

        // Update local state
        const newResponses = new Map(responses);
        newResponses.set(person.did, data);
        setResponses(newResponses);
      }
    } catch (error) {
      console.error('Error setting response:', error);
    }
  };

  const getResponseBadge = (person: Person) => {
    const response = responses.get(person.did);
    if (!response) return null;

    if (response.response === 1) {
      return <Badge color="green">Accepted</Badge>;
    } else if (response.response === 2) {
      return <Badge color="red">Rejected</Badge>;
    }
    return null;
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={500}>Volunteer Responses To Reach</Text>

        <TextInput
          placeholder="Search volunteers by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          leftSection={<IconSearch size={16} />}
        />

        {searchResults.length > 0 && (
          <Stack gap="xs">
            {searchResults.map((person) => {
              const currentResponse = responses.get(person.did);
              return (
                <Paper key={person.did} p="sm" withBorder bg="gray.0">
                  <Group justify="space-between" wrap="nowrap">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>{person.name}</Text>
                      <Text size="xs" c="dimmed" truncate>
                        {person.email || person.did}
                      </Text>
                    </Box>

                    <Group gap="xs" wrap="nowrap">
                      {getResponseBadge(person)}
                      <Button
                        size="xs"
                        color="green"
                        variant={currentResponse?.response === 1 ? 'filled' : 'light'}
                        onClick={() => handleSetResponse(person, 1)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant={currentResponse?.response === 0 ? 'filled' : 'light'}
                        onClick={() => handleSetResponse(person, 0)}
                      >
                        Reject
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
