import apiClient from "./client";

export async function registerUser({name, email, password, role}){
    const {data} = await apiClient.post('/api/v1/auth/register', {
        name, 
        email,
        password,
        role,
    })
    return data
}

export async function loginUser({ email, password }) {
  const { data } = await apiClient.post('/api/v1/auth/login', {
    email,
    password,
  });
  return data;
}

export async function logoutUser() {
  const { data } = await apiClient.post('/api/v1/auth/logout');
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get('/api/v1/auth/me');
  return data;
}