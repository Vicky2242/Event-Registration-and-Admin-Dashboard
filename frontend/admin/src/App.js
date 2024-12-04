import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Registration';
import Admin from './components/Admin';
import AdminLogin from './components/AdminLogin';
import AdminSignup from './components/AdminSignup';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } 
        />
        {/* Redirect all non-existent routes to /register */}
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
