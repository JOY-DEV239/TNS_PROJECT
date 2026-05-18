import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Drives from './pages/Drives';
import Certifications from './pages/Certifications';
import Settings from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('jwt_token'));

  const handleAuth = (value) => {
    setIsAuthenticated(value);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setAuth={handleAuth} /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout setAuth={handleAuth} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/drives" element={<Drives />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
