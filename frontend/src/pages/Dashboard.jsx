import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from '../axiosConfig';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalStudents: 0, placedStudents: 0, activeDrives: 0, topPackage: '0' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/stats/departments');
      setStats(res.data);
      const totalStudents = res.data.reduce((sum, item) => sum + item.totalStudents, 0);
      const placedStudents = res.data.reduce((sum, item) => sum + item.placedStudents, 0);
      setSummary({
        totalStudents,
        placedStudents,
        activeDrives: '—',
        topPackage: '—',
      });
    } catch (err) {
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats.length ? stats.map((item) => ({ name: item.department, placed: item.placedStudents, total: item.totalStudents })) : [
    { name: 'CS', placed: 0, total: 0 },
    { name: 'EC', placed: 0, total: 0 },
    { name: 'MECH', placed: 0, total: 0 },
    { name: 'AIML', placed: 0, total: 0 },
    { name: 'OTHER', placed: 0, total: 0 },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Dashboard Overview</h1>
      <div className="dashboard-grid">
        <div className="glass-card metric-card">
          <span className="metric-label">Total Students</span>
          <span className="metric-value">{summary.totalStudents}</span>
        </div>
        <div className="glass-card metric-card">
          <span className="metric-label">Placed Students</span>
          <span className="metric-value" style={{ color: 'var(--success)' }}>{summary.placedStudents}</span>
        </div>
        <div className="glass-card metric-card">
          <span className="metric-label">Active Drives</span>
          <span className="metric-value">{summary.activeDrives}</span>
        </div>
        <div className="glass-card metric-card">
          <span className="metric-label">Top Package</span>
          <span className="metric-value">{summary.topPackage} LPA</span>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '30px', height: '400px' }}>
        <h3 style={{ marginBottom: '20px' }}>Department-wise Placement Trends</h3>
        {loading ? (
          <p>Loading department statistics...</p>
        ) : (
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="placed" name="Placed" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (<Cell key={`placed-${index}`} fill="var(--success)" />))}
              </Bar>
              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (<Cell key={`total-${index}`} fill="var(--accent)" />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
