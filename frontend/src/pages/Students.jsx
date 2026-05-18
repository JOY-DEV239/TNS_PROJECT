import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    registerNumber: '',
    department: '',
    cgpa: '',
    technicalSkills: '',
    resumeUrl: '',
    placementStatus: 'UNPLACED',
    selectedCompanyName: '',
    salaryPackage: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchCompanies()]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/students');
      setStudents(res.data);
    } catch (err) {
      setStudents([]);
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
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setForm({
      fullName: '',
      registerNumber: '',
      department: '',
      cgpa: '',
      technicalSkills: '',
      resumeUrl: '',
      placementStatus: 'UNPLACED',
      selectedCompanyName: '',
      salaryPackage: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cgpa = parseFloat(form.cgpa);
    if (cgpa < 0 || cgpa > 10) {
      setMessage('CGPA must be between 0 and 10.');
      return;
    }
    try {
      const payload = {
        fullName: form.fullName,
        registerNumber: form.registerNumber,
        department: form.department,
        cgpa: cgpa,
        technicalSkills: form.technicalSkills.split(',').map(skill => skill.trim()).filter(Boolean),
        resumeUrl: form.resumeUrl,
        placementStatus: form.placementStatus,
        salaryPackage: form.salaryPackage ? parseFloat(form.salaryPackage) : null,
        interviewsAttended: form.placementStatus === 'PLACED' ? 3 : 0,
      };
      if (form.selectedCompanyName.trim()) {
        payload.selectedCompany = { name: form.selectedCompanyName.trim() };
      }
      
      if (editingId) {
        await axios.put(`/students/${editingId}`, payload);
        setMessage('Student updated successfully.');
      } else {
        await axios.post('/students', payload);
        setMessage('Student added successfully.');
      }
      
      clearForm();
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setMessage(editingId ? 'Unable to update student.' : 'Unable to add student.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Student Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add and manage students, including placement data and employer assignment.</p>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Hide Form' : '+ Add Student'}</button>
      </div>

      {message && <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>{message}</div>}

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '20px' }}>
          <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <input placeholder="Full Name" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
            <input placeholder="Register Number" value={form.registerNumber} onChange={(e) => handleChange('registerNumber', e.target.value)} required />
            <input placeholder="Department" value={form.department} onChange={(e) => handleChange('department', e.target.value)} required />
            <input placeholder="CGPA" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(e) => handleChange('cgpa', e.target.value)} required />
            <input placeholder="Technical Skills (comma separated)" value={form.technicalSkills} onChange={(e) => handleChange('technicalSkills', e.target.value)} />
            <input placeholder="Resume URL" value={form.resumeUrl} onChange={(e) => handleChange('resumeUrl', e.target.value)} />
            <input placeholder="Company Name" value={form.selectedCompanyName} onChange={(e) => handleChange('selectedCompanyName', e.target.value)} />
            <input placeholder="Salary Package" type="number" step="0.01" value={form.salaryPackage} onChange={(e) => handleChange('salaryPackage', e.target.value)} />
            <select value={form.placementStatus} onChange={(e) => handleChange('placementStatus', e.target.value)}>
              <option value="UNPLACED">UNPLACED</option>
              <option value="PLACED">PLACED</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn">{editingId ? 'Update Student' : 'Save Student'}</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={() => { clearForm(); setShowForm(false); }}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? <p>Loading students...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Reg. Number</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>CGPA</th>
                <th style={{ padding: '12px' }}>Company</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{s.registerNumber}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{s.fullName}</td>
                  <td style={{ padding: '12px' }}>{s.department}</td>
                  <td style={{ padding: '12px' }}>{s.cgpa}</td>
                  <td style={{ padding: '12px' }}>{s.selectedCompany?.name || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                      backgroundColor: s.placementStatus === 'PLACED' ? 'var(--success)' : 'var(--danger)', color: '#fff'
                    }}>
                      {s.placementStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn-secondary" style={{ padding: '4px 8px', borderRadius: '4px' }} onClick={() => {
                      setShowForm(true);
                      setEditingId(s.id);
                      setForm({
                        fullName: s.fullName || '',
                        registerNumber: s.registerNumber || '',
                        department: s.department || '',
                        cgpa: s.cgpa || '',
                        technicalSkills: (s.technicalSkills || []).join(', '),
                        resumeUrl: s.resumeUrl || '',
                        placementStatus: s.placementStatus || 'UNPLACED',
                        selectedCompanyName: s.selectedCompany?.name || '',
                        salaryPackage: s.salaryPackage || '',
                      });
                    }}>Edit</button>
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

export default Students;
