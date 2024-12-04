// src/routes/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth'; // Ensure this path is correct

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Use the hook

  // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children; // Render the protected route
};

export default PrivateRoute;
