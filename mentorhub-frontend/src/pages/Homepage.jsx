// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await apiClient.get('/api/v1/health');
        setHealth(response.data.status);
        setError(null);
      } catch (err) {
        setError(err.message);
        setHealth(null);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MentorHub Frontend</h1>

      {loading && <p>Checking API health...</p>}

      {error && (
        <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
          <strong>API Connection Failed:</strong> {error}
          <br />
          <small>
            Make sure your backend is running on{' '}
            {import.meta.env.VITE_API_BASE_URL}
          </small>
        </div>
      )}

      {health && (
        <div style={{ color: 'green', padding: '1rem', border: '1px solid green' }}>
          <strong>API Connected!</strong>
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}