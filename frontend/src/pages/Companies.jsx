import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    minimumCgpa: '',
    packageDetails: '',
    eligibleDepartments: '',
    recruitmentRounds: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setEditingCompanyId(null);
    setForm({
      name: '',
      description: '',
      minimumCgpa: '',
      packageDetails: '',
      eligibleDepartments: '',
      recruitmentRounds: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      minimumCgpa: form.minimumCgpa ? parseFloat(form.minimumCgpa) : null,
      packageDetails: form.packageDetails ? parseFloat(form.packageDetails) : null,
      eligibleDepartments: form.eligibleDepartments.split(',').map((item) => item.trim()).filter(Boolean),
      recruitmentRounds: form.recruitmentRounds.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editingCompanyId) {
        await axios.put(`/companies/${editingCompanyId}`, payload);
        setMessage('Company updated successfully.');
      } else {
        await axios.post('/companies', payload);
        setMessage('Company added successfully.');
      }
      clearForm();
      fetchCompanies();
    } catch (err) {
      setMessage('Unable to save company.');
    }
  };

  const handleEdit = (company) => {
    setEditingCompanyId(company.id);
    setForm({
      name: company.name || '',
      description: company.description || '',
      minimumCgpa: company.minimumCgpa ?? '',
      packageDetails: company.packageDetails ?? '',
      eligibleDepartments: (company.eligibleDepartments || []).join(', '),
      recruitmentRounds: (company.recruitmentRounds || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/companies/${id}`);
      setMessage('Company deleted successfully.');
      fetchCompanies();
    } catch (err) {
      setMessage('Unable to delete company.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Companies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage employer records, hiring requirements, packages, and recruitment rounds.</p>
        </div>
      </div>

      {message && <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>{message}</div>}

      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h2>{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <input placeholder="Company Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows="3" />
          <input placeholder="Minimum CGPA" type="number" step="0.01" value={form.minimumCgpa} onChange={(e) => handleChange('minimumCgpa', e.target.value)} />
          <input placeholder="Package Details (LPA)" type="number" step="0.01" value={form.packageDetails} onChange={(e) => handleChange('packageDetails', e.target.value)} />
          <input placeholder="Eligible Departments (comma separated)" value={form.eligibleDepartments} onChange={(e) => handleChange('eligibleDepartments', e.target.value)} />
          <input placeholder="Recruitment Rounds (comma separated)" value={form.recruitmentRounds} onChange={(e) => handleChange('recruitmentRounds', e.target.value)} />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn">{editingCompanyId ? 'Update Company' : 'Save Company'}</button>
            {editingCompanyId && <button type="button" className="btn btn-secondary" onClick={clearForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? <p>Loading companies...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Company</th>
                <th style={{ padding: '12px' }}>CGPA</th>
                <th style={{ padding: '12px' }}>Package</th>
                <th style={{ padding: '12px' }}>Departments</th>
                <th style={{ padding: '12px' }}>Rounds</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{company.name}</td>
                  <td style={{ padding: '12px' }}>{company.minimumCgpa ?? '-'}</td>
                  <td style={{ padding: '12px' }}>{company.packageDetails ?? '-'} LPA</td>
                  <td style={{ padding: '12px' }}>{(company.eligibleDepartments || []).join(', ')}</td>
                  <td style={{ padding: '12px' }}>{(company.recruitmentRounds || []).join(', ')}</td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => handleEdit(company)} style={{ marginRight: '8px' }}>Edit</button>
                    <button className="btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => handleDelete(company.id)}>Delete</button>
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

export default Companies;
