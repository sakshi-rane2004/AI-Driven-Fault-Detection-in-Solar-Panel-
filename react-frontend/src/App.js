import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Panels from './pages/Panels';
import Alerts from './pages/Alerts';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminUserManagement from './pages/AdminUserManagement';
import PlantManagement from './pages/PlantManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import ApiTest from './components/ApiTest';
import './App.css';

/* Redirect to /login if not authenticated */
const ProtectedLayout = ({ sidebarCollapsed, toggleSidebar }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0d9488',
        borderRadius: '50%', animation: 'spin 1s linear infinite'
      }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/panels" element={<Panels />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/history" element={<History />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/plants" element={<PlantManagement />} />
              <Route path="/test" element={<ApiTest />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <ProtectedLayout
                  sidebarCollapsed={sidebarCollapsed}
                  toggleSidebar={() => setSidebarCollapsed(s => !s)}
                />
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;