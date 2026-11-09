// src/pages/MentorDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMentor, fetchMentorRate } from '../api/mentors.api';
import { fetchMentorSessions } from '../api/sessions.api';
import { getErrorMessage } from '../utils/handleApiError';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function MentorDetailPage() {
  const { id } = useParams();

  const [mentor, setMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Currency conversion state
  const [currency, setCurrency] = useState('USD');
  const [convertedRate, setConvertedRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    async function loadMentor() {
      try {
        const [mentorRes, sessionsRes] = await Promise.all([
          fetchMentor(id),
          fetchMentorSessions(id, { limit: 5 }),
        ]);

        setMentor(mentorRes.data);
        setSessions(sessionsRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadMentor();
  }, [id]);

  // Fetch converted rate when currency changes
  useEffect(() => {
    if (!mentor) return;

    async function loadRate() {
      setRateLoading(true);
      try {
        const data = await fetchMentorRate(id, currency);
        setConvertedRate(data.data);
      } catch {
        setConvertedRate(null);
      } finally {
        setRateLoading(false);
      }
    }

    loadRate();
  }, [id, currency, mentor]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading mentor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="general-error">{error}</div>
        <Link to="/mentors">← Back to mentors</Link>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/mentors" style={{ color: '#4f46e5', display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to mentors
      </Link>

      {/* Profile Card */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: 4 }}>{mentor.user?.name || 'Anonymous Mentor'}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{mentor.headline}</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {mentor.skills.map((skill) => (
            <span key={skill} style={{
              background: '#eef2ff',
              color: '#4f46e5',
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: '0.85rem',
            }}>
              {skill}
            </span>
          ))}
        </div>

        <p style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>{mentor.bio}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: 6 }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{mentor.yearsOfExperience}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Years Exp</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>⭐ {mentor.ratingAverage.toFixed(1)}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{mentor.ratingCount} reviews</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${mentor.hourlyRate}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>per hour (USD)</div>
          </div>
        </div>
      </div>

      {/* Currency Converter */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>💱 Rate in Your Currency</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 600 }}>Convert to:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {rateLoading && <span style={{ color: '#999' }}>Converting...</span>}

          {convertedRate && !rateLoading && (
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {currency === 'USD' ? '$' : ''}
              {convertedRate.hourlyRateConverted?.toFixed(2) ?? convertedRate.hourlyRate}{' '}
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#666' }}>
                {convertedRate.to}/hr
              </span>
              {convertedRate.source !== 'local' && (
                <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: 8 }}>
                  (rate: {convertedRate.rate?.toFixed(4)}, {convertedRate.date})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginBottom: '1rem' }}>📅 Recent Sessions</h3>

        {sessions.length === 0 ? (
          <p style={{ color: '#999' }}>No sessions yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Mentee</th>
                <th style={{ padding: '0.5rem' }}>Date</th>
                <th style={{ padding: '0.5rem' }}>Duration</th>
                <th style={{ padding: '0.5rem' }}>Price</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.5rem' }}>{s.menteeName}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(s.scheduledAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{s.durationMinutes} min</td>
                  <td style={{ padding: '0.5rem' }}>${s.totalPrice}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background:
                        s.status === 'completed' ? '#dcfce7' :
                        s.status === 'cancelled' ? '#fee2e2' :
                        '#fef9c3',
                      color:
                        s.status === 'completed' ? '#166534' :
                        s.status === 'cancelled' ? '#991b1b' :
                        '#854d0e',
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}