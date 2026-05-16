import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingDriveId, setEditingDriveId] = useState(null);
  const [form, setForm] = useState({
    companyId: '',
    companyName: '',
    driveDate: '',
    venue: '',
    eligibilityCriteria: '',
    interviewRounds: '',
    status: 'UPCOMING',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchDrives(), fetchCompanies()]);
    setLoading(false);
  };

  const fetchDrives = async () => {
    try {
      const res = await axios.get('/drives');
      setDrives(res.data);
    } catch (err) {
      setDrives([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      setCompanies([]);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm({ companyId: '', companyName: '', driveDate: '', venue: '', eligibilityCriteria: '', interviewRounds: '', status: 'UPCOMING' });
    setEditingDriveId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        driveDate: form.driveDate ? form.driveDate : null,
        venue: form.venue,
        eligibilityCriteria: form.eligibilityCriteria,
        interviewRounds: form.interviewRounds.split(',').map((item) => item.trim()).filter(Boolean),
        status: form.status,
      };

      if (form.companyId) {
        payload.company = { id: parseInt(form.companyId, 10) };
      } else if (form.companyName.trim()) {
        payload.company = { name: form.companyName.trim() };
      }

      if (editingDriveId) {
        await axios.put(`/drives/${editingDriveId}`, payload);
        setMessage('Placement drive updated successfully.');
      } else {
        await axios.post('/drives', payload);
        setMessage('Placement drive added successfully.');
      }

      clearForm();
      fetchAll();
    } catch (err) {
      setMessage('Unable to save placement drive.');
    }
  };

  const handleEdit = (drive) => {
    setEditingDriveId(drive.id);
    setForm({
      companyId: drive.company?.id || '',
      companyName: drive.company?.name || '',
      driveDate: drive.driveDate ? drive.driveDate.slice(0, 16) : '',
      venue: drive.venue || '',
      eligibilityCriteria: drive.eligibilityCriteria || '',
      interviewRounds: (drive.interviewRounds || []).join(', '),
      status: drive.status || 'UPCOMING',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/drives/${id}`);
      setMessage('Placement drive deleted successfully.');
      fetchAll();
    } catch (err) {
      setMessage('Unable to delete placement drive.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Placement Drives</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create, update, delete, and review placement schedules with eligibility and interview rounds.</p>
        </div>
      </div>

      {message && <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>{message}</div>}

      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h2>{editingDriveId ? 'Edit Placement Drive' : 'Add Placement Drive'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <select value={form.companyId} onChange={(e) => handleChange('companyId', e.target.value)}>
            <option value="">Select Existing Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          <input placeholder="Or enter company name" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
          <input type="datetime-local" value={form.driveDate} onChange={(e) => handleChange('driveDate', e.target.value)} required />
          <input placeholder="Venue" value={form.venue} onChange={(e) => handleChange('venue', e.target.value)} required />
          <input placeholder="Eligibility Criteria" value={form.eligibilityCriteria} onChange={(e) => handleChange('eligibilityCriteria', e.target.value)} />
          <input placeholder="Interview Rounds (comma separated)" value={form.interviewRounds} onChange={(e) => handleChange('interviewRounds', e.target.value)} />
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn">{editingDriveId ? 'Update Drive' : 'Save Drive'}</button>
            {editingDriveId && <button type="button" className="btn btn-secondary" onClick={clearForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? <p>Loading drives...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Company</th>
                <th style={{ padding: '12px' }}>Schedule</th>
                <th style={{ padding: '12px' }}>Venue</th>
                <th style={{ padding: '12px' }}>Eligibility</th>
                <th style={{ padding: '12px' }}>Rounds</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive) => (
                <tr key={drive.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{drive.company?.name || '-'}</td>
                  <td style={{ padding: '12px' }}>{drive.driveDate ? new Date(drive.driveDate).toLocaleString() : '-'}</td>
                  <td style={{ padding: '12px' }}>{drive.venue}</td>
                  <td style={{ padding: '12px' }}>{drive.eligibilityCriteria}</td>
                  <td style={{ padding: '12px' }}>{(drive.interviewRounds || []).join(', ') || '-'}</td>
                  <td style={{ padding: '12px' }}>{drive.status}</td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => handleEdit(drive)} style={{ marginRight: '8px' }}>Edit</button>
                    <button className="btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => handleDelete(drive.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Drives;
