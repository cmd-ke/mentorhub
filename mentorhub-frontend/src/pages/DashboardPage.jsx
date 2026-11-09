// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMe, logoutUser } from '../api/auth.api';
import {
  createMentorProfile,
  fetchMyMentorProfile,
} from '../api/mentors.api';
import { getErrorMessage } from '../utils/handleApiError';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    headline: '',
    bio: '',
    skills: '',
    hourlyRate: '',
    yearsOfExperience: '',
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchMe();
        setUser(data.data);
        if (data.data.role === 'mentor') {
          try {
            const profileData = await fetchMyMentorProfile();
            setMentorProfile(profileData.data);
          } catch (err) {
            if (err.response?.status !== 404) throw err;
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [navigate]);

  async function handleCreateProfile(e) {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const { data } = await createMentorProfile({
        headline: profileForm.headline,
        bio: profileForm.bio,
        skills: profileForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        hourlyRate: Number(profileForm.hourlyRate),
        yearsOfExperience: Number(profileForm.yearsOfExperience),
      });
      setMentorProfile(data);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    navigate('/login');
  }

  if (loading) {
    return <div className="container"><p>Loading your profile...</p></div>;
  }

  if (error) {
    return <div className="container"><div className="general-error">{error}</div></div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      {user && (
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      {user?.role === 'mentor' && !mentorProfile && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3>Create your mentor profile</h3>
          <p>Complete this profile to appear in mentor search results.</p>
          {profileError && <div className="general-error">{profileError}</div>}
          <form onSubmit={handleCreateProfile}>
            <div className="form-group">
              <label htmlFor="headline">Professional headline</label>
              <input
                id="headline"
                required
                maxLength={120}
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                placeholder="Senior software engineer"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                required
                maxLength={2000}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <input
                id="skills"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                placeholder="React, Node.js, mentoring"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly rate (USD)</label>
              <input
                id="hourlyRate"
                type="number"
                required
                min="0"
                step="0.01"
                value={profileForm.hourlyRate}
                onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="yearsOfExperience">Years of experience</label>
              <input
                id="yearsOfExperience"
                type="number"
                required
                min="0"
                max="60"
                value={profileForm.yearsOfExperience}
                onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: e.target.value })}
              />
            </div>
            <button className="btn" type="submit" disabled={profileLoading}>
              {profileLoading ? 'Saving profile...' : 'Create mentor profile'}
            </button>
          </form>
        </section>
      )}

      {mentorProfile && (
        <div className="general-success" style={{ marginTop: '1.5rem' }}>
          Your mentor profile is active.{' '}
          <Link to={`/mentors/${mentorProfile._id}`}>View your profile</Link>
        </div>
      )}

      <div className="general-success">
        ✅ You are authenticated! The session cookie is working cross-origin.
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link
          to="/mentors"
          className="btn"
          style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '0.7rem 2rem' }}
        >
          Browse Mentors →
        </Link>
      </div>
    </div>
  );
}