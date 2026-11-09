// src/pages/MentorListPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMentors } from '../api/mentors.api';
import { getErrorMessage } from '../utils/handleApiError';

export default function MentorListPage() {
  // Read query params from URL so filters are shareable/bookmarkable
  const [searchParams, setSearchParams] = useSearchParams();

  const [mentors, setMentors] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state (initialized from URL)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [skills, setSkills] = useState(searchParams.get('skills') || '');
  const [minRate, setMinRate] = useState(searchParams.get('minRate') || '');
  const [maxRate, setMaxRate] = useState(searchParams.get('maxRate') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 6;

  const loadMentors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchMentors({
        search: search || undefined,
        skills: skills || undefined,
        minRate: minRate || undefined,
        maxRate: maxRate || undefined,
        sort,
        page,
        limit,
      });

      setMentors(data.data);
      setPageInfo(data.pageInfo);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, skills, minRate, maxRate, sort, page]);

  // Fetch whenever filters change
  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (skills) params.set('skills', skills);
    if (minRate) params.set('minRate', minRate);
    if (maxRate) params.set('maxRate', maxRate);
    if (sort !== '-createdAt') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, skills, minRate, maxRate, sort, page, setSearchParams]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  }

  function handleClearFilters() {
    setSearch('');
    setSkills('');
    setMinRate('');
    setMaxRate('');
    setSort('-createdAt');
    setPage(1);
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Find a Mentor</h1>
        <Link to="/dashboard" style={{ color: '#4f46e5' }}>← Dashboard</Link>
      </div>

      {/* Search & Filters */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, bio, headline..."
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>Skills (comma-separated)</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Node.js, React, Python"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>Min Rate ($)</label>
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>Max Rate ($)</label>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>Sort By</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-ratingAverage">Highest Rated</option>
                <option value="hourlyRate">Lowest Price</option>
                <option value="-hourlyRate">Highest Price</option>
                <option value="-yearsOfExperience">Most Experienced</option>
              </select>
            </div>
            <button type="submit" className="btn" style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: 0 }}>
              Search
            </button>
            <button type="button" onClick={handleClearFilters} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', marginTop: 0 }}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && <div className="general-error">{error}</div>}

      {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading mentors...</p>}

      {!loading && mentors.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No mentors found. Try adjusting your filters.
        </p>
      )}

      {!loading && mentors.length > 0 && (
        <>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Showing {mentors.length} of {pageInfo?.totalDocs || mentors.length} mentors
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
            {mentors.map((mentor) => (
              <Link
                key={mentor._id}
                to={`/mentors/${mentor._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.2s',
                  height: '100%',
                }}>
                  <h3 style={{ marginBottom: 4 }}>{mentor.user?.name || 'Anonymous Mentor'}</h3>
                  <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 8 }}>
                    {mentor.headline}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {mentor.skills.slice(0, 3).map((skill) => (
                      <span key={skill} style={{
                        background: '#eef2ff',
                        color: '#4f46e5',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                      }}>
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>
                        +{mentor.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#555' }}>
                    <span>${mentor.hourlyRate}/hr</span>
                    <span>{mentor.yearsOfExperience} yrs exp</span>
                    <span>⭐ {mentor.ratingAverage.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pageInfo && pageInfo.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                className="btn"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span style={{ padding: '0.5rem 1rem', alignSelf: 'center' }}>
                Page {pageInfo.page} of {pageInfo.totalPages}
              </span>
              <button
                className="btn"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
                disabled={page >= pageInfo.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}