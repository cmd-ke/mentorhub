// src/api/sessions.api.js
import apiClient from './client';

/**
 * Fetch sessions for a specific mentor.
 */
export async function fetchMentorSessions(mentorId, params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries({ ...params, mentor: mentorId }).filter(
      ([, v]) => v !== undefined && v !== ''
    )
  );

  const { data } = await apiClient.get('/api/v1/sessions', {
    params: cleanParams,
  });
  return data;
}