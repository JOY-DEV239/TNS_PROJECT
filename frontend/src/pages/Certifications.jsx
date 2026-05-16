import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Certifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    studentId: '',
    name: '',
    issuingAuthority: '',
    issueDate: '',
    file: null,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCertifications(), fetchStudents(), fetchStats()]);
    setLoading(false);
  };

  const fetchCertifications = async () => {
    try {
      const res = await axios.get('/certifications');
      setCertifications(res.data);
    } catch (err) {
      setCertifications([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/students');
      setStudents(res.data);
    } catch (err) {
      setStudents([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/stats/departments');
      setStats(res.data);
    } catch (err) {
      setStats([]);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    handleChange('file', e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.file) {
      setMessage('Select a student and certificate file before uploading.');
      return;
    }

    const data = new FormData();
    data.append('studentId', form.studentId);
    data.append('name', form.name);
    data.append('issuingAuthority', form.issuingAuthority);
    data.append('issueDate', form.issueDate);
    data.append('file', form.file);

    try {
      await axios.post('/certifications/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Certificate uploaded successfully.');
      setForm({ studentId: '', name: '', issuingAuthority: '', issueDate: '', file: null });
      fetchAll();
    } catch (err) {
      setMessage('Upload failed. Please check the file and try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/certifications/${id}`);
      setMessage('Certificate deleted successfully.');
      fetchAll();
    } catch (err) {
      setMessage('Unable to delete certificate.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Certification Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload, download, and review certificates plus branch-wise placement statistics.</p>
        </div>
      </div>

      {message && <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>{message}</div>}

      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h2>Upload Certification</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <select value={form.studentId} onChange={(e) => handleChange('studentId', e.target.value)} required>
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>{student.fullName} ({student.registerNumber})</option>
            ))}
          </select>
          <input placeholder="Certificate Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          <input placeholder="Issuing Authority" value={form.issuingAuthority} onChange={(e) => handleChange('issuingAuthority', e.target.value)} required />
          <input type="date" value={form.issueDate} onChange={(e) => handleChange('issueDate', e.target.value)} required />
          <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} required />
          <button type="submit" className="btn">Upload Certificate</button>
        </form>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <h2>Certificates</h2>
        {loading ? <p>Loading certifications...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Student</th>
                <th style={{ padding: '12px' }}>Certificate</th>
                <th style={{ padding: '12px' }}>Issued By</th>
                <th style={{ padding: '12px' }}>Issue Date</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{cert.student?.fullName || '-'}</td>
                  <td style={{ padding: '12px' }}>{cert.name}</td>
                  <td style={{ padding: '12px' }}>{cert.issuingAuthority}</td>
                  <td style={{ padding: '12px' }}>{cert.issueDate}</td>
                  <td style={{ padding: '12px' }}>
                    <a href={`${axios.defaults.baseURL}/certifications/download/${cert.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ marginRight: '8px' }}>Download</a>
                    <button className="btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => handleDelete(cert.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-card">
        <h2>Department-wise Statistics</h2>
        {stats.length === 0 ? (
          <p>No department statistics available yet.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>Total Students</th>
                <th style={{ padding: '12px' }}>Placed Students</th>
                <th style={{ padding: '12px' }}>Certification Count</th>
                <th style={{ padding: '12px' }}>Placement %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item) => (
                <tr key={item.department} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{item.department}</td>
                  <td style={{ padding: '12px' }}>{item.totalStudents}</td>
                  <td style={{ padding: '12px' }}>{item.placedStudents}</td>
                  <td style={{ padding: '12px' }}>{item.certificationCount}</td>
                  <td style={{ padding: '12px' }}>{item.placementPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Certifications;
