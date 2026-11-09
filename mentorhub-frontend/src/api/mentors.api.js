import apiClient from './client.js'

/**
 * Fetch paginated, filtered, sorted list of mentors.
 * All params are optional and forwarded as query strings.
 */

export async function fetchMentors(params={}){
    const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  );

  const {data} = await apiClient.get('/api/v1/mentors', {
    params: cleanParams,
    })

    return data
}

/**
 * Fetch a single mentor by ID.
 */
export async function fetchMentor(id) {
  const { data } = await apiClient.get(`/api/v1/mentors/${id}`);
  return data;
}

export async function fetchMyMentorProfile() {
  const { data } = await apiClient.get('/api/v1/mentors/me');
  return data;
}

export async function createMentorProfile(profile) {
  const { data } = await apiClient.post('/api/v1/mentors', profile);
  return data;
}


/**
 * Fetch mentor's hourly rate converted to a target currency.
 */
export async function fetchMentorRate(id, currency = 'USD') {
  const { data } = await apiClient.get(`/api/v1/mentors/${id}/rate`, {
    params: { currency },
  });
  return data;
}