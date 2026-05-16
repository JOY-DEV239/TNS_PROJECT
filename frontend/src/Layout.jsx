import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building, Calendar, Settings, LogOut, Moon, Sun, Award } from 'lucide-react';
import Cookies from 'js-cookie';

const Layout = ({ setAuth }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    setAuth(false);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 style={{ padding: '0 10px', color: 'var(--accent)', marginBottom: '20px' }}>TNS Placement</h2>
        
        <NavLink to="/" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/students" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <Users size={20} /> Students
        </NavLink>
        <NavLink to="/companies" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <Building size={20} /> Companies
        </NavLink>
        <NavLink to="/drives" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <Calendar size={20} /> Schedules
        </NavLink>
        <NavLink to="/certifications" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <Award size={20} /> Certifications
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `btn ${!isActive ? 'btn-secondary' : ''}`} style={{justifyContent: 'flex-start'}}>
          <Settings size={20} /> Settings
        </NavLink>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={toggleTheme}>
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>} {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="btn" style={{backgroundColor: 'var(--danger)'}} onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
